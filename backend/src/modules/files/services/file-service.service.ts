import * as crypto from 'node:crypto';
import * as pathLib from 'node:path';
import * as stream from 'node:stream';
import { Readable } from 'node:stream';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';
import { ErrorManager } from '@/common/error-handling/error.manager';
import { EncryptFunctions } from '@/common/functions/encrypt-functions';
import { KOTRIP_BUCKET } from '@kotrip/data';
import { Injectable, Logger, StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import NodeClam from 'clamscan';
import { BucketItem, BucketItemStat } from 'minio';
import { I18nService } from 'nestjs-i18n';
import { NestMinioService } from 'nestjs-minio';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { DeleteFileInterface as DeletedFileInterface } from '../interfaces/delete-file.interface';
import { FileListInterface } from '../interfaces/file-list.interface';
import { FileUrl } from '../interfaces/file-url.interface';
import { UploadFileInterface } from '../interfaces/upload-file.interface';

// Use promise based functions
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

/**
 * ### FileService
 *
 * Servicio encargado de la gestión de archivos en MinIO. Todos los archivos
 * se almacenan en un único bucket (`kotrip`) con paths jerárquicos que reflejan
 * la estructura lógica de los recursos de la plataforma.
 *
 * @see {@link KOTRIP_BUCKET} Nombre del bucket unificado.
 * @see {@link @kotrip/data} Path builders centralizados.
 */
@Injectable()
export default class FileService {
  private clamService: NodeClam | null = null;
  private readonly logger = new Logger(FileService.name);

  /**
   * Constructor que inicializa el servicio de MinIO para la gestión de archivos.
   *
   * @param minioService      Servicio inyectado para gestionar las operaciones con MinIO.
   * @param i18n              Servicio multilenguaje (principalmente para errores).
   * @param configService     Servicio de configuración de NestJS.
   */
  constructor(
    private readonly minioService: NestMinioService,
    private readonly i18n: I18nService<I18nTranslations>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Conecta con ClamAV al inicio del servicio e inicializa el bucket unificado.
   */
  async onModuleInit() {
    const clamavPort = this.configService.get<string>('CLAMAV_PORT');
    const enableClamscan = !!clamavPort;
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (enableClamscan) {
      try {
        const clam = new NodeClam();
        this.clamService = await clam.init({
          clamdscan: {
            host: this.configService.get<string>('CLAMAV_HOST', 'localhost'),
            port: parseInt(clamavPort),
            timeout: parseInt(
              this.configService.get<string>('CLAMAV_TIMEOUT', '30000'),
            ),
          },
        });

        this.logger.log('ClamAV service connected successfully');
      } catch (err: unknown) {
        this.logger.error('Error al conectar con servicio ClamAV', err);

        if (nodeEnv === 'production') {
          throw new Error('ClamAV connection failed during startup');
        } else {
          this.logger.warn(
            'ClamAV connection failed in development mode. File scanning will be disabled.',
          );
        }
      }
    } else {
      this.logger.warn(
        'ClamAV ha sido deshabilitado por .env. No se comprobaran archivos',
      );
    }
    await this.initBucket();
  }

  /**
   * Crea y configura el bucket unificado de la plataforma al arrancar.
   * El bucket recibe una política de lectura pública para permitir el acceso
   * directo a pósters y avatares.
   */
  private async initBucket(): Promise<void> {
    try {
      const exists = await this.withMinioRetry(
        () => this.minioService.getMinio().bucketExists(KOTRIP_BUCKET),
        `bucketExists(${KOTRIP_BUCKET})`,
      );

      if (!exists) {
        await this.withMinioRetry(
          () => this.minioService.getMinio().makeBucket(KOTRIP_BUCKET),
          `makeBucket(${KOTRIP_BUCKET})`,
        );
        this.logger.log(`MINIO: Created unified bucket: ${KOTRIP_BUCKET}`);
      }

      await this.makeBucketPublic(KOTRIP_BUCKET);
      this.logger.debug(
        `MINIO: Ensured public policy for bucket: ${KOTRIP_BUCKET}`,
      );
    } catch (err) {
      this.logger.error(
        `MINIO: Failed to init unified bucket ${KOTRIP_BUCKET}`,
        err,
      );
    }
  }

  // ========== Análisis de malware ==========

  /**
   * Analiza el buffer del contenido de un archivo en busca de malware
   * enviando el contenido a la instancia de ClamAV.
   *
   * @param file            El buffer o archivo a analizar.
   * @returns               `true` si el archivo contiene malware.
   * @throws                INTERNAL_SERVER_ERROR si no es posible analizar el archivo.
   */
  public async analyzeFile(file: Buffer | Express.Multer.File) {
    const rs = new stream.Readable();
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else {
      buffer = Buffer.from(file.buffer as Buffer);
    }
    rs._read = () => {};
    rs.push(buffer);
    rs.push(null);

    let hasMalware = false;
    try {
      if (!this.clamService) {
        throw new ErrorManager(
          'INTERNAL_SERVER_ERROR',
          this.i18n.t('error.FILE.FILE_UPLOAD_FAILED'),
        );
      }
      const res = await this.clamService.scanStream(rs);
      hasMalware = res.isInfected;
    } catch (err: unknown) {
      this.logger.error('ClamAV analysis error', err);
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.FILE.FILE_UPLOAD_FAILED'),
      );
    }
    return hasMalware;
  }

  // ========== URLs públicas y presigned ==========

  /**
   * Retorna la URL pública de un objeto en el bucket unificado.
   *
   * @param objectKey Path completo del objeto dentro del bucket (ej. `courses/123/posters/img.jpg`).
   * @returns URL pública del recurso en MinIO.
   */
  static getPublicURL(objectKey: string): string {
    const endpoint =
      process.env.MINIO_SHARE_BASE_URL ??
      `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${endpoint}/${KOTRIP_BUCKET}/${objectKey}`;
  }

  /**
   * Genera una URL prefirmada para acceder a un objeto del bucket unificado.
   * Crea una URL temporal autenticada válida durante el tiempo configurado.
   *
   * @param objectKey Path completo del objeto dentro del bucket.
   * @returns URL prefirmada reescrita con MINIO_SHARE_BASE_URL.
   * @throws ErrorManager con NOT_FOUND si no se puede generar la URL.
   */
  async getPresignedUrl(objectKey: string): Promise<string> {
    try {
      let presignedUrl = await this.minioService
        .getMinio()
        .presignedUrl(
          'GET',
          KOTRIP_BUCKET,
          objectKey,
          parseInt(
            this.configService.getOrThrow<string>(
              'MINIO_SHARE_EXPIRATION_SECONDS',
            ),
          ),
        );

      presignedUrl = presignedUrl.replace(
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
        this.configService.getOrThrow<string>('MINIO_SHARE_BASE_URL'),
      );

      return presignedUrl;
    } catch (error) {
      this.logger.error(`Error generating presigned URL for: ${objectKey}`);
      this.logger.error(error);
      throw new ErrorManager(
        'NOT_FOUND',
        this.i18n.t('error.FILE.FILE_NOT_FOUND'),
      );
    }
  }

  // ========== Operaciones de bucket ==========

  /**
   * Crea un bucket en MinIO si no existe.
   *
   * @param bucketName    Nombre del bucket a crear.
   * @throws              INTERNAL_SERVER_ERROR si no es posible crear el bucket.
   */
  async createBucket(bucketName: string) {
    try {
      const bucketExists = await this.withMinioRetry(
        () => this.minioService.getMinio().bucketExists(bucketName),
        `bucketExists(bucketName)`,
      );

      if (!bucketExists) {
        await this.withMinioRetry(
          () => this.minioService.getMinio().makeBucket(bucketName),
          `makeBucket(bucketName)`,
        );

        this.logger.debug(`MINIO: Created template bucket: ${bucketName}`);
      }
    } catch (err) {
      this.logger.error(`MINIO: Failed to create bucket ${bucketName}`);
      this.logger.error(err);
      ErrorManager.normalizeRestrictive(err, 'Error creating bucket');
    }
  }

  // ========== Operaciones de paths y archivos ==========

  /**
   * Crea un directorio (path) dentro de un bucket de MinIO.
   *
   * @param bucketName    Nombre del bucket.
   * @param path          Array con los segmentos del path a crear.
   */
  async createPath(bucketName: string, path: string[]) {
    const bucketExists = await this.withMinioRetry(
      () => this.minioService.getMinio().bucketExists(bucketName),
      `bucketExists(bucketName)`,
    );

    if (!bucketExists) {
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.FILE.BUCKET_NOT_FOUND'),
      );
    }

    const fullPath = path.join('/');

    try {
      const existingBucketObjects = await this.listFiles(bucketName, []);
      const foundExisting = existingBucketObjects.find(
        (el) => el.prefix == `${fullPath}/`,
      );

      if (foundExisting == undefined) {
        await this.minioService
          .getMinio()
          .putObject(bucketName, `${fullPath}/`, '');
        this.logger.debug(
          `MINIO: Created section: ${fullPath}/ in bucket: ${bucketName}`,
        );
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Elimina un directorio y su contenido dentro del bucket unificado.
   *
   * @param path Segmentos del path a eliminar.
   */
  async deletePath(path: string[]): Promise<void> {
    await this.deletePathInBucket(KOTRIP_BUCKET, path);
  }

  /**
   * Elimina un directorio y su contenido dentro de un bucket específico.
   *
   * @param bucket Nombre del bucket.
   * @param path   Segmentos del path a eliminar.
   */
  async deletePathInBucket(bucket: string, path: string[]) {
    const fullPath = path.join('/');

    const bucketStream = await this.listFiles(bucket, [`${fullPath}/`]);
    try {
      for (const obj of bucketStream) {
        if (!obj.name) continue;
        await this.minioService.getMinio().removeObject(bucket, obj.name);
      }
      this.logger.debug(
        `MINIO: Section: ${fullPath} from bucket: ${bucket} removed successfully.`,
      );
    } catch (error) {
      this.logger.error(
        `MINIO: Error removing section: ${fullPath} from bucket ${bucket}`,
        error,
      );
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.FILE.ERROR_REMOVING_SECTION'),
      );
    }
  }

  /**
   * Lista los archivos almacenados en una dirección de un bucket.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Segmentos del path a listar.
   * @returns             Lista de objetos BucketItem.
   */
  async listFiles(bucket: string, path: string[]): Promise<BucketItem[]> {
    let fullpath = path.length > 0 ? path.join('/') : '';
    if (fullpath.length > 0 && fullpath[fullpath.length - 1] !== '/')
      fullpath += '/';

    return await new Promise<BucketItem[]>((resolve, reject) => {
      const stream = this.minioService
        .getMinio()
        .listObjectsV2(bucket, `${fullpath}`);

      const list: BucketItem[] = [];

      stream.on('data', (item) => {
        list.push(item);
      });

      stream.on('error', (err) => {
        reject(err);
      });

      stream.on('end', () => {
        resolve(list);
      });
    });
  }

  /**
   * Elimina todos los archivos y directorios en una ruta específica del bucket unificado.
   *
   * @param path          Ruta a limpiar. Si está vacía, elimina todo el contenido.
   */
  async deleteAllInPath(path: string[] = []): Promise<void> {
    await this.deleteAllInBucketPath(KOTRIP_BUCKET, path);
  }

  /**
   * Elimina todos los archivos y directorios en una ruta específica de un bucket.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Ruta a limpiar.
   */
  async deleteAllInBucketPath(
    bucket: string,
    path: string[] = [],
  ): Promise<void> {
    let prefix = path.length > 0 ? path.join('/') : '';
    if (prefix.length > 0 && prefix[prefix.length - 1] !== '/') prefix += '/';

    try {
      const objectsList = await this.listFiles(bucket, path);

      if (objectsList.length === 0) {
        this.logger.debug(
          `MINIO: No files found in path: ${prefix} in bucket: ${bucket}`,
        );
        return;
      }

      const removeObjects: string[] = objectsList
        .map((obj) => obj.name)
        .filter((name): name is string => name != null);
      const directories = objectsList.filter((o) => o.prefix);

      for (let i = 0; i < removeObjects.length; i += 1000) {
        const batch = removeObjects.slice(i, i + 1000);
        await this.withMinioRetry(
          () => this.minioService.getMinio().removeObjects(bucket, batch),
          `removeObjects(bucket, batch)`,
        );
      }

      for (const dir of directories) {
        if (!dir.prefix) continue;
        const dirPath = dir.prefix.split('/').filter((p) => p !== '');
        await this.deleteAllInBucketPath(bucket, dirPath);
      }

      this.logger.debug(
        `MINIO: Successfully deleted all files in path: ${prefix || 'root'} from bucket: ${bucket}`,
      );
    } catch (error) {
      this.logger.error(
        `MINIO: Error deleting files in path: ${prefix || 'root'} from bucket: ${bucket}`,
        error,
      );
      throw new ErrorManager(
        'INTERNAL_SERVER_ERROR',
        this.i18n.t('error.FILE.ERROR_REMOVING_SECTION'),
      );
    }
  }

  /**
   * Comprueba si un item de un bucket es una carpeta.
   *
   * @param item Bucket item a comprobar.
   * @returns `true` si es una carpeta.
   */
  isBucketItemDirectory(item: BucketItem) {
    if (item.size === 0 && item.prefix) return true;
    return false;
  }

  /**
   * Verifica si una dirección específica existe dentro de un bucket.
   *
   * @param bucket    Nombre del bucket a verificar.
   * @param path      Segmentos del path a buscar.
   * @returns         `true` si la dirección existe.
   */
  async pathExists(bucket: string, path: string[]): Promise<boolean> {
    const fullpath = path.join('/');

    const files = await this.listFiles(bucket, path);
    const sectionFound = files.find((el) => el.prefix == `${fullpath}/`);
    return sectionFound != undefined;
  }

  // ========== Operaciones de descarga ==========

  /**
   * Genera una URL de descarga para un archivo específico a partir de su ID.
   *
   * @param fileId            ID (etag) del archivo a descargar.
   * @param bucket            Nombre del bucket.
   * @param path              Segmentos del path donde se encuentra el archivo.
   * @returns                 URL de descarga del archivo.
   */
  async generateDownloadUrl(
    fileId: string,
    bucket: string,
    path: string[],
  ): Promise<FileUrl> {
    const files = await this.listFiles(bucket, path);
    if (files.length === 0) {
      throw new ErrorManager(
        'NOT_FOUND',
        this.i18n.t('error.FILE.SECTION_NOT_FOUND'),
      );
    }

    const file = files.find((el) => el.etag == fileId);

    if (file?.name) {
      let presignedUrl = await this.minioService
        .getMinio()
        .presignedUrl(
          'GET',
          bucket,
          file.name,
          parseInt(
            this.configService.getOrThrow<string>(
              'MINIO_SHARE_EXPIRATION_SECONDS',
            ),
          ),
        );

      presignedUrl = presignedUrl.replace(
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
        this.configService.getOrThrow<string>('MINIO_SHARE_BASE_URL'),
      );

      const fileUrl: FileUrl = {
        url: presignedUrl,
      };

      return fileUrl;
    } else {
      throw new ErrorManager(
        'NOT_FOUND',
        this.i18n.t('error.FILE.FILE_NOT_FOUND'),
      );
    }
  }

  // ========== Operaciones de subida ==========

  /**
   * Almacena un archivo en MinIO dentro de un bucket y path determinados.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Path completo incluyendo el nombre del archivo.
   * @param fileBuffer    Buffer del archivo a subir.
   * @param contentType   Tipo MIME del archivo.
   * @param encrypt       Encriptar el archivo con la clave del sistema.
   */
  async uploadFile(
    bucket: string,
    path: string[],
    fileBuffer: Buffer,
    contentType: string = 'application/octet-stream',
    encrypt: boolean = true,
  ): Promise<UploadFileInterface> {
    if (fileBuffer.length === 0)
      throw new ErrorManager(
        'NOT_ACCEPTABLE',
        this.i18n.t('error.FILE.FILE_IS_EMPTY'),
      );

    if (path.length < 1)
      throw new ErrorManager(
        'NOT_ACCEPTABLE',
        this.i18n.t('error.FILE.FILE_PATH_EMPTY'),
      );
    const lastPathElement = path[path.length - 1];
    if (!lastPathElement)
      throw new ErrorManager(
        'NOT_ACCEPTABLE',
        this.i18n.t('error.FILE.FILE_PATH_EMPTY'),
      );
    const fileName = encodeURI(lastPathElement);

    let isInfected = false;
    const enableClamscan = !!this.configService.get<string>('CLAMAV_PORT');
    if (enableClamscan) {
      isInfected = await this.analyzeFile(fileBuffer);
    }

    if (isInfected) {
      throw new ErrorManager(
        'BAD_REQUEST',
        this.i18n.t('error.FILE.INVALID_FILE_TYPE'),
      );
    }

    try {
      const fullPath = path.join('/');
      const rs = new stream.Readable();
      let buffer: Buffer = Buffer.from(fileBuffer);

      if (encrypt) {
        buffer = EncryptFunctions.encryptBuffer(
          buffer,
          this.configService.getOrThrow<string>('ENCRYPTION_KEY'),
        );
      }

      rs._read = () => {};
      rs.push(buffer);
      rs.push(null);

      const res = await this.withMinioRetry(
        () =>
          this.minioService
            .getMinio()
            .putObject(bucket, `${fullPath}`, rs, buffer.length, {
              'Content-Type': contentType,
            }),
        `putObject(...)`,
      );

      if (!res) {
        throw new ErrorManager(
          'INTERNAL_SERVER_ERROR',
          this.i18n.t('error.FILE.FILE_UPLOAD_FAILED'),
        );
      }

      const uploadCheck: UploadFileInterface = {
        file_name: fileName,
        id: res.etag,
        status: true,
      };

      return uploadCheck;
    } catch (error) {
      const fullPath = path.join('/');
      this.logger.error(`Error uploading file to ${bucket}/${fullPath}`);
      this.logger.error(error);
      ErrorManager.normalizeRestrictive(error, 'Error uploading files');
    }
  }

  // ========== Operaciones de eliminación ==========

  /**
   * Elimina un archivo por su ID (etag) dentro de un bucket.
   *
   * @param bucket        Nombre del bucket.
   * @param fileId        ID (etag) del archivo.
   * @param path          Segmentos del path donde se encuentra.
   * @returns             Objeto con el estado de la eliminación.
   */
  async deleteFile(bucket: string, fileId: string, path: string[]) {
    try {
      const files = await this.listFiles(bucket, path);

      const selectedFile = files.find((el) => el.etag == fileId);

      if (selectedFile?.name) {
        await this.withMinioRetry(
          () =>
            this.minioService
              .getMinio()
              .removeObject(bucket, selectedFile.name),
          `removeObject(bucket, selectedFile.name)`,
        );
      } else {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.FILE.FILE_NOT_FOUND'),
        );
      }

      const deleteCheck: DeletedFileInterface = {
        id: selectedFile.etag,
        status: true,
      };

      return deleteCheck;
    } catch {
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.FILE.FILE_DELETE_FAILED'),
      );
    }
  }

  /**
   * Elimina un archivo por su path completo dentro de un bucket.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Path completo del archivo.
   * @returns             Objeto con el estado de la eliminación.
   */
  async deleteFileByName(
    bucket: string,
    path: string[],
  ): Promise<DeletedFileInterface> {
    try {
      const fullPath = path.join('/');

      const fileId = await this.fileExists(bucket, path);

      if (fileId) {
        await this.withMinioRetry(
          () => this.minioService.getMinio().removeObject(bucket, fullPath),
          `removeObject(bucket, fullPath)`,
        );
      } else {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.FILE.FILE_NOT_FOUND'),
        );
      }

      const deleteCheck: DeletedFileInterface = {
        id: fileId,
        status: true,
      };

      return deleteCheck;
    } catch {
      throw new ErrorManager(
        'CONFLICT',
        this.i18n.t('error.FILE.FILE_DELETE_FAILED'),
      );
    }
  }

  // ========== Operaciones de recuperación ==========

  /**
   * Obtiene un stream con la descarga de un fichero usando su ID (etag).
   *
   * @param id            ID (etag) del archivo.
   * @param bucket        Nombre del bucket.
   * @param path          Segmentos del path donde se encuentra.
   * @param decrypt       Desencriptar el archivo con la clave del sistema.
   * @returns             StreamableFile con el archivo.
   */
  async retrieveFile(
    id: string,
    bucket: string,
    path: string[],
    decrypt: boolean = true,
  ): Promise<StreamableFile> {
    try {
      const files = await this.listFiles(bucket, path);
      const file = files.find((el) => el.etag == id);

      if (file?.name) {
        const filename = file.name.split('/')[1];
        const fileContent = await this.withMinioRetry(
          () => this.minioService.getMinio().getObject(bucket, file.name),
          `getObject(bucket, file.name)`,
        );

        if (!fileContent) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.FILE.FILE_NOT_FOUND'),
          );
        }

        if (decrypt) {
          return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            fileContent
              .on('data', (chunk: Buffer<ArrayBufferLike>) =>
                chunks.push(chunk),
              )
              .on('error', reject)
              .on('end', () => {
                try {
                  const completeBuffer = Buffer.concat(chunks);
                  const decryptedBuffer = EncryptFunctions.decryptBuffer(
                    completeBuffer,
                    this.configService.getOrThrow<string>('ENCRYPTION_KEY'),
                  );

                  const fileAttachment = new StreamableFile(decryptedBuffer, {
                    disposition: `attachment; filename=${filename}`,
                  });
                  resolve(fileAttachment);
                } catch (error) {
                  reject(
                    error instanceof Error ? error : new Error(String(error)),
                  );
                }
              });
          });
        } else {
          const fileAttachment = new StreamableFile(
            Readable.from(fileContent),
            {
              disposition: `attachment; filename=${filename}`,
            },
          );

          return fileAttachment;
        }
      } else {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.FILE.FILE_NOT_FOUND'),
        );
      }
    } catch (error) {
      this.logger.error(
        `Error retrieving file: ${bucket}/${path.join('/')} with ID: ${id}`,
      );
      this.logger.error(error);
      ErrorManager.normalizeRestrictive(error, 'Error retriving file');
    }
  }

  /**
   * Obtiene un stream de descarga del archivo en un path específico.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Path completo del archivo.
   * @param decrypt       Desencriptar el archivo con la clave del sistema.
   * @returns             StreamableFile con el archivo.
   */
  async retrieveFileByPath(
    bucket: string,
    path: string[],
    decrypt: boolean = true,
  ): Promise<StreamableFile> {
    const fullPath = path.join('/');
    if (fullPath.length === 0) {
      throw new ErrorManager(
        'BAD_REQUEST',
        this.i18n.t('error.FILE.FILE_PATH_EMPTY'),
      );
    }
    const filename = path[path.length - 1];
    try {
      if (await this.fileExists(bucket, path)) {
        const fileContent = await this.withMinioRetry(
          () => this.minioService.getMinio().getObject(bucket, fullPath),
          `.getObject(bucket, fullPath)`,
        );

        if (!fileContent) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.FILE.FILE_NOT_FOUND'),
          );
        }

        if (decrypt) {
          return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            fileContent
              .on('data', (chunk: Buffer<ArrayBufferLike>) =>
                chunks.push(chunk),
              )
              .on('error', reject)
              .on('end', () => {
                try {
                  const completeBuffer = Buffer.concat(chunks);
                  const decryptedBuffer = EncryptFunctions.decryptBuffer(
                    completeBuffer,
                    this.configService.getOrThrow<string>('ENCRYPTION_KEY'),
                  );

                  const fileAttachment = new StreamableFile(decryptedBuffer, {
                    disposition: `attachment; filename=${filename}`,
                  });
                  resolve(fileAttachment);
                } catch (error) {
                  reject(
                    error instanceof Error ? error : new Error(String(error)),
                  );
                }
              });
          });
        } else {
          const fileAttachment = new StreamableFile(
            Readable.from(fileContent),
            {
              disposition: `attachment; filename=${filename}`,
            },
          );

          return fileAttachment;
        }
      } else {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.FILE.FILE_NOT_FOUND'),
        );
      }
    } catch (error) {
      ErrorManager.normalizeRestrictive(error, 'Error retrieving file');
    }
  }

  // ========== Listado recursivo ==========

  /**
   * Obtiene una lista recursiva de todos los archivos y directorios.
   *
   * @param bucket        Nombre del bucket.
   * @param path          Segmentos del path desde donde empezar.
   * @returns             Lista recursiva de archivos y directorios.
   */
  async getAllListRecursive(
    bucket: string,
    path: string[],
  ): Promise<FileListInterface[]> {
    const result: FileListInterface[] = [];

    const listItemsRecursive = async (currentPath: string[]): Promise<void> => {
      const items = await this.listFilesWithFolders(bucket, currentPath);

      for (const item of items) {
        result.push(item);

        if (item.isDirectory) {
          const nestedPath = item.path.split('/').filter((p) => p);
          await listItemsRecursive(nestedPath);
        }
      }
    };

    try {
      await listItemsRecursive(path);
      return result;
    } catch (error) {
      this.logger.debug(
        `ERROR while getting full recursive file list in bucket: ${bucket} from path: ${path.join('/')}`,
      );
      ErrorManager.normalizeRestrictive(
        error,
        'Error getting files recursively',
      );
    }
  }

  /**
   * Lista todos los archivos y carpetas bajo una ruta de forma no recursiva.
   *
   * @param bucket    Nombre del bucket.
   * @param path      Segmentos del path.
   * @returns         Lista de archivos y directorios.
   */
  async listFilesWithFolders(
    bucket: string,
    path: string[],
  ): Promise<FileListInterface[]> {
    let fullpath = path.length > 0 ? path.join('/') : '';
    if (fullpath.length > 0 && fullpath[fullpath.length - 1] !== '/')
      fullpath += '/';

    return await new Promise<FileListInterface[]>((resolve, reject) => {
      const stream = this.minioService
        .getMinio()
        .listObjectsV2(bucket, `${fullpath}`, false);

      const list: FileListInterface[] = [];

      stream.on('data', (item) => {
        if (item.prefix) {
          list.push({
            file_name: null,
            id: '',
            isDirectory: true,
            path: item.prefix,
            size: 0,
            upload_date: null as unknown as Date,
          });
        }

        if (item.name && !item.name.endsWith('/')) {
          list.push({
            file_name: pathLib.basename(item.name),
            id: item.etag,
            isDirectory: false,
            path: item.name,
            size: item.size,
            upload_date: new Date(item.lastModified),
          });
        }
      });

      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(list));
    });
  }

  /**
   * Mueve los archivos de una dirección a otra dentro del mismo bucket.
   *
   * @param bucket    Nombre del bucket.
   * @param oldPath   Segmentos de la dirección original.
   * @param newPath   Segmentos de la dirección destino.
   */
  public async moveSection(
    bucket: string,
    oldPath: string[],
    newPath: string[],
  ) {
    try {
      const files = await this.listFiles(bucket, oldPath);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        if (file.name == undefined) {
          continue;
        }

        await this.withMinioRetry(
          () =>
            this.minioService
              .getMinio()
              .copyObject(
                bucket,
                file.name,
                `${newPath.join('/')}/${file.name}`,
              ),
          `copyObject(...)`,
        );
        await this.withMinioRetry(
          () => this.minioService.getMinio().removeObject(bucket, file.name),
          `removeObject(...)`,
        );
      }
    } catch (error) {
      ErrorManager.normalizeRestrictive(error, 'Error moving files');
    }
  }

  /**
   * Comprueba si un archivo existe en un bucket y devuelve su ID (etag).
   *
   * @param bucket    Nombre del bucket.
   * @param path      Path completo del archivo.
   * @returns         Etag del archivo o `undefined` si no existe.
   */
  async fileExists(
    bucket: string,
    path: string[],
  ): Promise<string | undefined> {
    const fullPath = path.join('/');

    try {
      const stats = await this.withMinioRetry<BucketItemStat>(
        () => {
          const stats = this.minioService
            .getMinio()
            .statObject(bucket, fullPath);
          return stats;
        },
        `bucket: ${bucket}, path: ${fullPath}`,
        5,
        500,
      );
      return stats?.etag;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'name' in err &&
        'code' in err &&
        (err as Record<string, unknown>)['name'] === 'S3Error' &&
        (err as Record<string, unknown>)['code'] === 'NotFound'
      ) {
        return undefined;
      }
      throw err;
    }
  }

  // ========== Utilidades internas ==========

  /**
   * Ejecuta una operación de MinIO con reintentos automáticos en caso de errores de conexión.
   *
   * @param operation     Función que ejecuta la operación de MinIO.
   * @param logContext    Información contextual para logs.
   * @param maxRetries    Número máximo de reintentos.
   * @param backoffTime   Tiempo inicial de espera en ms.
   */
  private async withMinioRetry<T>(
    operation: () => Promise<T>,
    logContext: string,
    maxRetries = 5,
    backoffTime = 500,
  ) {
    let attempts = 0;

    while (attempts <= maxRetries) {
      try {
        return await operation();
      } catch (err: unknown) {
        attempts++;
        const isConnectionError =
          typeof err === 'object' &&
          err !== null &&
          'code' in err &&
          err.code === 'ECONNRESET';
        if (isConnectionError && attempts <= maxRetries) {
          this.logger.warn(
            `MINIO: Error de conexión en ${logContext}. Reintento ${attempts}/${maxRetries} después de ${backoffTime}ms...`,
          );

          await new Promise((resolve) => setTimeout(resolve, backoffTime));
          continue;
        }

        throw err;
      }
    }
  }

  /**
   * Recupera la información y metadatos de un archivo.
   *
   * @param fileId    ID (etag) del archivo.
   * @param bucket    Nombre del bucket.
   * @param path      Segmentos del path.
   * @returns         Información del archivo o `null`.
   */
  async getFileInfo(
    fileId: string,
    bucket: string,
    path: string[],
  ): Promise<BucketItemStat | null> {
    try {
      const files = await this.listFiles(bucket, path);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        if (file.etag === fileId) {
          const fullpath = path.join('/');
          return (
            (await this.withMinioRetry(
              () =>
                this.minioService
                  .getMinio()
                  .statObject(bucket, `${fullpath}/${file.name}`),
              `statObject(...)`,
            )) ?? null
          );
        }
      }
      return null;
    } catch (error) {
      ErrorManager.normalizeRestrictive(error, 'Error getting file info');
    }
  }

  /**
   * Cambia la política del bucket para hacerlo público (lectura).
   *
   * @param bucket Nombre del bucket.
   */
  async makeBucketPublic(bucket: string) {
    const policy = `{
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": "s3:GetObject",
                    "Resource": "arn:aws:s3:::${bucket}/*"
                }
            ],
            "Version": "2012-10-17"
        }`;

    this.logger.debug(`Setting public access for bucket ${bucket}`);
    await this.withMinioRetry(
      () => this.minioService.getMinio().setBucketPolicy(bucket, policy),
      `setBucketPolicy(bucket, policy)`,
    );
  }

  /**
   * Obtiene la política de un bucket.
   *
   * @param bucket Nombre del bucket.
   * @returns      Política del bucket parseada como JSON.
   */
  async getBucketPolicy(bucket: string): Promise<any> {
    try {
      const policy = await this.withMinioRetry(
        () => this.minioService.getMinio().getBucketPolicy(bucket),
        `getBucketPolicy(bucket)`,
      );
      return policy ? JSON.parse(policy) : null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Error getting bucket policy: ${errorMessage}`, err);
    }
  }

  // ========== Utilidades estáticas ==========

  /**
   * Genera un hash SHA-256 a partir de un buffer.
   *
   * @param buffer Buffer del archivo.
   * @returns Hash SHA-256 del buffer.
   */
  static generateFileHash(buffer: Buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Convierte un StreamableFile a Buffer.
   *
   * @param stream StreamableFile a convertir.
   * @returns Buffer con los datos del stream.
   */
  static async streamToBuffer(stream: StreamableFile): Promise<Buffer> {
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      const readableStream = stream.getStream();

      readableStream.on('data', (chunk: Buffer) => chunks.push(chunk));
      readableStream.on('end', () => resolve(Buffer.concat(chunks)));
      readableStream.on('error', reject);
    });
  }

  /**
   * Comprime un buffer en gzip.
   *
   * @param buffer Buffer a comprimir.
   * @returns Buffer comprimido.
   */
  static async compressBuffer(buffer: zlib.InputType) {
    const compressed = await gzip(buffer);
    return Buffer.from(compressed);
  }

  /**
   * Descomprime un buffer en gzip.
   *
   * @param buffer Buffer comprimido.
   * @returns Buffer descomprimido.
   */
  static async decompressBuffer(buffer: zlib.InputType) {
    return await gunzip(buffer);
  }
}
