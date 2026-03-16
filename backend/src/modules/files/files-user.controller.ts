import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { KOTRIP_BUCKET, Role } from '@kotrip/data';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Auth } from '../auth/decorators/auth.decorator';
import { BucketInfoDto } from './dto-outputs/bucket-info.dto';
import { DeleteFileOutputDto } from './dto-outputs/delete-file.output.dto';
import { FileOutputDto } from './dto-outputs/file-list.output.dto';
import { FileUrlOut } from './dto-outputs/file-url.outout';
import { UploadFileOutputDto } from './dto-outputs/upload-file.output.dto';
import { FileListInterface } from './interfaces/file-list.interface';
import { FileUrl } from './interfaces/file-url.interface';
import FileService from './services/file-service.service';

/**
 * ### FileController
 *
 * Controller con los endpoints para tratar los archivos de la plataforma.
 *
 * @version     1.1.0a






 */
@Controller('files')
@ApiTags('files - Almacenar y gestionar archivos')
@ApiBearerAuth()
@Auth(Role.USER, Role.ADMIN)
export default class FileUserController {
  /**
   * Clase para definir ejemplos de SECTION para los end-points
   */
  static readonly BUCKETS_PARAM: ApiParamOptions = {
    description: 'Nombre del bucket sobre la que ejecutar el end-point',
    examples: {
      'Bucket unificado de la plataforma': {
        value: 'kotrip',
      },
    },
    name: 'bucket',
    type: 'string',
  };

  /**
   * El constructor del controlador solo tiene dentro el servicio del modulo, no tiene dependencias externas.
   *
   * @param fileService   Servicio del mismo módulo que el controlador
   */
  constructor(private readonly fileService: FileService) {}

  /**
   * Método para subir un fichero al bucket de minio de un usuario con sesión iniciada
   * (usando UserActiveInterface) a la sección del usuario que realiza la llamada. El método asignara una ID
   * auto-númerica en función de la cantidad de archivos en el bucket.
   *
   * @param user      Objeto de tipo UserActiveInterface con los datos del usuario
   * @param file      Archivo para ser tratado por Express.Multer.File y subirse
   * @param bucket    Bucket al que subir el fichero
   * @param encrypt   Encriptar archivo con la clave del sistema
   * @returns
   */
  @Post('upload/:bucket')
  @ApiOperation({
    summary: 'Subir un fichero a la sección del usuario con sesión iniciada',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: {
        file: {
          format: 'binary',
          type: 'string',
        },
      },
      type: 'object',
    },
  })
  @ApiResponse({
    description: 'Archivo subido exitosamente',
    status: 201,
    type: UploadFileOutputDto,
  })
  @ApiResponse({ description: 'Solicitud incorrecta', status: 400 })
  @ApiResponse({ description: 'Error, el archivo está vacío', status: 406 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiParam(FileUserController.BUCKETS_PARAM)
  @ApiQuery({
    example: true,
    name: 'encrypt',
    type: Boolean,
  })
  async uploadFile(
    @ActiveUser() user: UserActiveInterface,
    @Req() req: FastifyRequest,
    @Param('bucket') bucket: string,
    @Query('encrypt') encrypt: boolean,
  ) {
    const fileData = await req.file();
    if (!fileData) {
      throw new ErrorManager(
        'BAD_REQUEST',
        'No se ha proporcionado un archivo',
      );
    }

    const buffer = await fileData.toBuffer();

    return await this.fileService.uploadFile(
      KOTRIP_BUCKET,
      [fileData.filename],
      buffer,
      'application/octet-stream',
      encrypt,
    );
  }

  /**
   * Método para borrar un archivo del bucket del usuario activo que hace la llamada
   *
   * @param user          Objeto de tipo UserActiveInterface para la información del usuario
   * @param bucket        bucket del que borrar el archivo
   * @param id            ID del archivo
   * @returns             Objeto de tipo DeleteFileInterface o errores
   */
  @Delete('delete/:bucket/:id')
  @ApiOperation({
    summary:
      'Eliminar un fichero del bucket indicado del usuario con sesión iniciada',
  })
  @ApiParam(FileUserController.BUCKETS_PARAM)
  @ApiParam({
    description: 'ID del fichero a borrar',
    example: '1',
    name: 'id',
    type: 'string',
  })
  @ApiResponse({
    description: 'Archivo eliminado exitosamente',
    status: 200,
    type: DeleteFileOutputDto,
  })
  async deleteFile(
    @ActiveUser() user: UserActiveInterface,
    @Param('bucket') bucket: string,
    @Param('id') id: string,
  ) {
    return this.fileService.deleteFile(KOTRIP_BUCKET, id, []);
  }

  /**
   * Método para descargar un fichero usando su ID de un bucket en especifico para el usuario
   * que se encuentra con la sesión iniciada. El formato del archivo que sale debe ser gestionado
   * por el front-end. En caso de lanzarlo desde Swagger, se puede descargar directamente.
   *
   * @param id            ID del archivo a descargar
   * @param bucket        Bucket en la que se encuentra el archivo
   * @param user          Objeto de tipo UserActiveInterface con los datos del usuario
   * @param decrypt       Desencriptar el archivo con la clave del sistema
   * @returns             Objeto de tipo StreamableFile con el fichero
   */
  @Get('download/:bucket/:id')
  @ApiOperation({
    summary:
      'Descargar un fichero (por ID) de un bucket del usuario con sesión iniciada',
  })
  @ApiResponse({
    description: 'Archivo descargado exitosamente',
    status: 200,
    type: StreamableFile,
  })
  @ApiResponse({ description: 'Archivo no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiParam(FileUserController.BUCKETS_PARAM)
  @ApiParam({
    description: 'ID del fichero a descargar',
    example: '1',
    name: 'id',
    type: 'string',
  })
  @ApiQuery({
    example: true,
    name: 'decrypt',
    type: Boolean,
  })
  async downloadFile(
    @Param('id') id: string,
    @Param('bucket') bucket: string,
    @Query('decrypt') decrypt: boolean,
    @ActiveUser() user: UserActiveInterface,
  ) {
    return await this.fileService.retrieveFile(id, KOTRIP_BUCKET, [], decrypt);
  }

  /**
   * Método para generar una URL única de descarga para un archivo.
   * IMPORTANTE: LA URL DE DESCARGA ES ACCESIBLE SIN NECESIDAD DE AUTENTICACIÓN,
   * DEBE ESTAR ENFOCADA A ARCHIVOS PÚBLICOS QUE NO CONTENGAN INFORMACIÓN SENSIBLE.
   * @param id            ID del archivo a crear la URL.
   * @param bucket        Bucker en el que se encuentra el archivo.
   * @param user          Objeto de tipo UserActiveInterface con los datos del usuario que realiza la llamada.
   * @returns
   */
  @Get('file-url/:bucket/:id')
  @ApiOperation({
    summary:
      'Genera una URL única para descargar un archivo del bucket de un usuario',
  })
  @ApiResponse({
    description: 'URL generada exitosamente',
    status: 200,
    type: FileUrlOut,
  })
  @ApiResponse({ description: 'Archivo no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiParam({
    description: 'ID del fichero a descargar',
    example: '1',
    name: 'id',
    type: 'string',
  })
  @ApiParam(FileUserController.BUCKETS_PARAM)
  async generateUrlFile(
    @Param('id') id: string,
    @Param('bucket') bucket: string,
    @ActiveUser() user: UserActiveInterface,
  ): Promise<FileUrl> {
    return await this.fileService.generateDownloadUrl(id, KOTRIP_BUCKET, []);
  }

  /**
   * Método para obtener información de todos los ficheros que ha subido un usuario a
   * un bucket dado como parámetro de entrada.
   *
   * @param bucket        Bucket en la que consultar
   * @param user          Objeto de tipo UserActiveInterface con los datos del usuario
   * @param res           Objeto para encapsular la información de salida
   * @returns             Un objeto de tipo FileOutputDto o un error de los listados
   */
  @Get('get-all/:bucket')
  @ApiOperation({
    summary:
      'Lista con todos los ficheros de un bucket del usuario con sesión iniciada',
  })
  @ApiResponse({
    description: 'Archivos recuperados exitosamente',
    isArray: true,
    status: 200,
    type: FileOutputDto,
  })
  @ApiResponse({ description: 'Solicitud incorrecta', status: 400 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiParam(FileUserController.BUCKETS_PARAM)
  async getAll(
    @Param('bucket') bucket: string,
    @ActiveUser() user: UserActiveInterface,
  ): Promise<FileListInterface[]> {
    return await this.fileService.getAllListRecursive(KOTRIP_BUCKET, []);
  }

  /**
   * Devuelve todos los buckets disponibles en el gestor de ficheros.
   *
   * @returns     Array con información de los buckets disponibles.
   */
  @Get('enums/buckets')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Devuelve todos los posibles buckets del gestor de ficheros.',
  })
  @ApiResponse({
    description: 'Lista de buckets disponibles',
    isArray: true,
    status: 200,
    type: BucketInfoDto,
  })
  async getBucketsValues(): Promise<BucketInfoDto[]> {
    return [{ id: 0, name: KOTRIP_BUCKET }];
  }
}
