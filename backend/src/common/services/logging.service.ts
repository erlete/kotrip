import * as pathLib from 'node:path';
import FileService from '@/modules/files/services/file-service.service';
import { KOTRIP_BUCKET } from '@kotrip/data';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import AsyncLock from 'async-lock';
import { CronJob } from 'cron';
import { BucketItem } from 'minio';
import { LogAudit } from '../interfaces/logger.interface';

/**
 * ### AuditLogService
 *
 * Servicio que guarda los logs en un array.
 * Y a cada cierto tiempo intenta guardarlos en el almacenamiento de archivos.
 *
 * @version     1.0.0




 */
@Injectable()
export class AuditLogService implements OnModuleInit {
  private readonly ENCRYPT_LOGS: boolean;

  private logger = new Logger(AuditLogService.name);
  private logs: Map<string, LogAudit[]> = new Map(); // Mapa con el nombre del archivo asignado y un array con los logs, usado para mappear logs del mismo usuario
  private readonly MAX_LOG_SIZE: number;

  private saveFlushLogsLock = new AsyncLock();
  private updateLogsLock = new AsyncLock({ maxPending: 10000 });

  // Los dos tipos de
  private readonly filenamePropStartIdx = 2; // Inicio de nombre del archivo (en este caso a partir de 'username')
  private readonly LOG_KEY_SEPARATOR: string = '\\|\\';

  private readonly propertiesName = ['company', 'username', 'role', 'userId'];

  private readonly propertiesToFilter = [
    'companyId',
    'username',
    'role',
    'userId',
  ];

  constructor(
    private readonly fileService: FileService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService,
  ) {
    this.MAX_LOG_SIZE = parseInt(
      this.configService.get<string>('MAX_LOG_FILE_SIZE') ?? '1000',
    );
    this.ENCRYPT_LOGS = this.configService.get('ENCRYPT_LOGS') === 'true';
  }

  /**
   * Crea una key consistente
   * @param log
   * @returns
   */
  buildLogKey(log: LogAudit): string {
    let key: string[] = [];
    if (log.isValidJWT && log.JWTInfo) {
      // const environment = log.JWTInfo.environmentId ? `${log.JWTInfo.environmentId}` : '';
      // key.push(environment);
      let company = '';
      if (log.JWTInfo.companiesIds?.length === 1) {
        company = String(log.JWTInfo.companiesIds[0]);
      }
      key.push(company);
      const username = log.JWTInfo.name;
      if (username) key.push(username);
      const role = log.JWTInfo.role;
      if (role) key.push(role);
      const userId = log.JWTInfo.id;
      if (userId) key.push(userId.toString());
    }

    if (key.length === 0) key = ['unregistered'];
    return key.join(this.LOG_KEY_SEPARATOR);
  }

  /**
   * Parsea una key de log
   * @param key
   * @returns
   */
  parseLogKeys(key: string): null | string[] {
    const splitted = key.split(this.LOG_KEY_SEPARATOR);
    if (splitted.length === 1) return null; // Usuario sin registrar
    return splitted;
  }

  /**
   * Loggea el mensaje en un mapa. Siendo la key de esta formada por el entorno, compania y nombre de usuario del log (si existe).
   * Se asegura que el array es accesible con un lock
   * @param log   Mensaje de log
   */
  async flushLogs() {
    await this.updateLogsLock.acquire('log', async () => {
      // Guarda solo si existen
      if ((await this.logs.size) > 0) {
        // Consigue dia, mes y año
        const date = new Date();
        const day: string = String(date.getDate()).padStart(2, '0');
        const month: string = String(date.getMonth() + 1).padStart(2, '0');
        const year: string = String(date.getFullYear());

        this.logger.debug('Trying to save logs to minio...');

        for (const [key, logs] of this.logs) {
          // Extrae el entorno, compañia y nombre de usuario de la key

          const keyInter = this.parseLogKeys(key);

          const path = [year, month, day];
          let filename = 'unregistered';

          if (keyInter) {
            // Construye path del log con las propiedades hasta filenamePropStartIdx
            for (let i = 0; i < this.filenamePropStartIdx; i++) {
              path.push(`${this.propertiesName[i]}-${keyInter[i]}`);
            }
            // Construye archivo "...json"
            const filenameArr: string[] = [];
            for (
              let i = this.filenamePropStartIdx;
              i < this.propertiesToFilter.length;
              i++
            ) {
              const k = keyInter[i];
              if (k) filenameArr.push(k);
            }
            filename = filenameArr.join();
          }

          // Guardar logs
          await this.saveLogs(path, filename, logs);
        }

        // Flush logs
        this.logs.clear();

        this.logger.debug('Saved logs to minio');
      }
    });
  }

  async flushLogsInitCron() {
    try {
      await this.saveFlushLogsLock.acquire('flush', async () => {
        await this.flushLogs();
      });
    } catch (err) {
      this.logger.error('Error while trying to save logs', err);
    }
  }

  async log(log: LogAudit): Promise<void> {
    try {
      await this.updateLogsLock.acquire('log', async () => {
        const key = this.buildLogKey(log);
        const existingLogs = this.logs.get(key);
        if (existingLogs) {
          existingLogs.push(log);
        } else {
          this.logs.set(key, [log]);
        }
      });
    } catch (err) {
      this.logger.error('Error while trying push a log in the list', err);
    }
  }

  onModuleInit() {
    // Cron guardar los logs y borrarlos de la memoria
    const crontimeSaveFlush =
      this.configService.get<string>('SAVE_FLUSH_LOGS_CRON') ?? '0 */5 * * * *'; // Por defecto cada 5 minutos
    const saveFlushLogsCron = new CronJob(
      crontimeSaveFlush,
      this.flushLogsInitCron.bind(this),
    );
    this.schedulerRegistry.addCronJob(
      'SAVE_&_FLUSH_LOGS',
      saveFlushLogsCron as any,
    );
    saveFlushLogsCron.start();
  }

  async saveLogs(path: string[], filename: string, logs: LogAudit[]) {
    const bucket = KOTRIP_BUCKET;

    try {
      // Stringify todos los logs
      const logsStr: string[] = logs.map((log) => JSON.stringify(log));

      let logFiles = await this.fileService.listFiles(bucket, path);
      // Filtramos los elementos listados por carpetas.
      logFiles = this.removeDirObj(logFiles);

      // De los archivos restantes, filtramos por el nombre.
      logFiles = logFiles.filter((file) => {
        if (!file.name) return false;
        return pathLib.basename(file.name).startsWith(filename);
      });

      if (logFiles.length === 0) {
        // Añade los logs a uno o varios archivos
        await this.addToNewLogFiles(logsStr, bucket, path, filename, 0);
        return;
      }

      // Se dividen los logs por tamaño. Y si los logs a introducir son demasiados pesados se dividen en diferentes archivos
      const lastLog = logFiles.reduce(
        (latest, current) => {
          // Si el actual no tiene lastModified, lo ignoramos
          if (!current.lastModified) return latest;
          if (!latest?.lastModified) return current;
          return current.lastModified > latest.lastModified ? current : latest;
        },
        null as BucketItem | null,
      );
      if (lastLog && lastLog.size < this.MAX_LOG_SIZE) {
        if (!lastLog.etag) return;

        // Intenta añadir en el log existente
        // Dividiendo los logs de los que quepan en el archivo de los que no
        const logsToAdd = AuditLogService.divideUntilNoFit(
          logsStr,
          this.MAX_LOG_SIZE - lastLog.size,
        );
        // Recoge el archivo, desencriptandolo (si activado)
        const file = await this.fileService.retrieveFile(
          lastLog.etag,
          bucket,
          path,
          this.ENCRYPT_LOGS,
        );

        const buffer = await FileService.streamToBuffer(file);
        const decompressedBuffer = await FileService.decompressBuffer(buffer); // Descomprime el archivo de logs
        const currentLogs = decompressedBuffer.toString();
        const updatedContent = currentLogs + logsToAdd.div.join('\n') + '\n';

        // Borrar archivo de logs
        await this.fileService.deleteFile(bucket, lastLog.etag, path);

        // Comprime el buffer
        const bufferGzip = await FileService.compressBuffer(
          Buffer.from(updatedContent, 'utf-8'),
        ); // Vuelve a comprimirlo

        // Subir archivo cambiado encriptandolo (si activado)
        await this.fileService.uploadFile(
          bucket,
          [...path, pathLib.basename(lastLog.name)],
          bufferGzip,
          'application/gzip',
          this.ENCRYPT_LOGS,
        );

        // Añade los logs sobrantes a otros archivos
        if (logsToAdd.rest.length > 0) {
          await this.addToNewLogFiles(
            logsToAdd.rest,
            bucket,
            path,
            filename,
            logFiles.length,
          );
        }
      } else {
        // Añade un o varios nuevos archivos de logs
        await this.addToNewLogFiles(
          logsStr,
          bucket,
          path,
          filename,
          logFiles.length,
        );
      }
    } catch (err) {
      this.logger.error('Error while saving logs in middleware');
      this.logger.error(err);
    }
  }

  /**
   * Filtra carpetas de un array de BucketItem
   * @param items BucketItem a filtrar
   * @returns {BucketItem[]} Nuevo BucketItem array sin carpetas
   */
  removeDirObj(items: BucketItem[]): BucketItem[] {
    return items.filter(
      (item) => !this.fileService.isBucketItemDirectory(item),
    );
  }

  /**
   * Divide un array de string en diferentes arrays,
   * Que pesen menos que el tamaño máximo del chunk pasado como parámetro
   * @param strs
   * @param maxChunkSize
   * @returns
   */
  static divideToChunks(
    strs: string[],
    maxChunkSize: number = 1024 * 1024 * 4,
  ) {
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentChunkSize = 0;
    const textEncoder = new TextEncoder();

    for (const str of strs) {
      const strByteLength = textEncoder.encode(str).length; // Conseguir tamaño de cadena con textEncoder

      if (currentChunkSize + strByteLength > maxChunkSize) {
        chunks.push(currentChunk);
        currentChunk = [];
        currentChunkSize = 0;
      }

      currentChunk.push(str);
      currentChunkSize += strByteLength;
    }

    if (currentChunk.length > 0) chunks.push(currentChunk); // Añade el ultimo chunk a la lista

    return chunks;
  }

  static divideUntilNoFit(strs: string[], maxSize: number) {
    const textEncoder = new TextEncoder();
    let divSize = 0;
    const div: string[] = [];
    const rest: string[] = [];

    for (const str of strs) {
      const strByteLength = textEncoder.encode(str).length; // Conseguir tamaño de cadena con textEncoder
      if (divSize + strByteLength < maxSize) {
        div.push(str);
        divSize += strByteLength;
      } else {
        rest.push(str);
      }
    }

    return { div: div, rest: rest };
  }

  /**
   * Sube los logs a uno o varios archivos. Sube tantos archivos como sea necesario para subir todos los logs
   * y que estos nunca ocupen más del tamaño fijado en el .env
   * @param logs
   * @param bucket
   * @param path
   * @param fileName
   * @param nameOffset
   */
  async addToNewLogFiles(
    logs: string[],
    bucket: string,
    path: string[],
    fileName: string,
    nameOffset: number,
  ) {
    // Añade los logs a uno o varios archivos
    const logChunks = AuditLogService.divideToChunks(logs, this.MAX_LOG_SIZE);
    for (let i = 0; i < logChunks.length; i++) {
      const chunk = logChunks[i];
      if (!chunk || chunk.length === 0) continue;

      let logStr = chunk.join('\n');
      logStr += '\n'; // add a last new line char so next logs are added after it
      let buffer = Buffer.from(logStr, 'utf-8');
      const fileNumberSuffix =
        i + nameOffset > 0 ? '-' + String(i + nameOffset) : '';

      // Comprime el buffer
      const compressed = await FileService.compressBuffer(buffer);
      buffer = compressed;

      await this.fileService.uploadFile(
        bucket,
        [...path, `${fileName}${fileNumberSuffix}.gz`],
        buffer,
        'application/gzip',
        this.ENCRYPT_LOGS,
      );
    }
  }
}
