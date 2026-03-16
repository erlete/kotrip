import { Readable } from 'node:stream';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { KOTRIP_BUCKET, Role } from '@kotrip/data';
import { Controller, Get, Query, StreamableFile } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileOutputDto } from './dto-outputs/file-list.output.dto';
import { FileListInterface } from './interfaces/file-list.interface';
import FileService from './services/file-service.service';

/**
 * ### FileExplorerLogsController
 *
 * Controller con los endpoints para recuperar los logs de la plataforma.
 *
 * @version     1.0.0a




 */
/**
 * Controller for audit log file operations.
 * SECURITY: Admin-only access (ADMIN).
 * All operations use the bucket unificado (KOTRIP_BUCKET) con paths de audit logs.
 */
@Controller('logs')
@ApiTags('logs - Explorar los archivos de logs')
@ApiBearerAuth()
@Auth(Role.ADMIN)
export default class FileExplorerLogsController {
  constructor(private readonly fileService: FileService) {}

  /**
   * Método para obtener una lista de directorios y archivos del apartado de logs
   * @param path Ruta de los logs a listar
   * @returns Lista de directorios y archivos de logs
   */
  @Get('retrieve-dir-logs')
  @ApiOperation({
    summary: 'Lista ficheros y carpetas de una ruta de logs',
  })
  @ApiResponse({
    description: 'Lista de directorios y archivos recuperada exitosamente',
    isArray: true,
    status: 200,
    type: FileOutputDto,
  })
  @ApiQuery({
    description: 'Ruta a la que acceder',
    example: '2025/04/22',
    name: 'path',
    required: false,
    type: String,
  })
  async retrieveDirLogs(
    @Query('path') path?: string,
  ): Promise<FileListInterface[]> {
    const logsBucket = KOTRIP_BUCKET;
    const slicedPath = path ? path.split('/') : [];
    return await this.fileService.getAllListRecursive(logsBucket, slicedPath);
  }

  /**
   * Método para obtener un archivo de log
   *
   */
  @Get('retrieve-log')
  @ApiOperation({
    summary: 'Devuelve un archivo de log',
  })
  @ApiResponse({
    description: 'Log descargado exitosamente',
    status: 200,
    type: StreamableFile,
  })
  @ApiResponse({ description: 'Archivo no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiQuery({
    description: 'Ruta y nombre del archivo de log que descargar',
    example: '2025/04/22/2025-04-22T08:18:00.007Z.txt',
    name: 'full_path',
    type: String,
  })
  async retrieveLog(@Query('full_path') fullPath: string) {
    const logsBucket = KOTRIP_BUCKET;
    const pathArr = fullPath.split('/');

    const decryptLogs = process.env.ENCRYPT_LOGS === 'true';
    const streamableFile = await this.fileService.retrieveFileByPath(
      logsBucket,
      pathArr,
      decryptLogs,
    ); // de-encrypt
    // De-comprimimir filestream y enviar de nuevo
    const decompressBuffer = await FileService.decompressBuffer(
      await FileService.streamToBuffer(streamableFile),
    ); // de-compress

    // Cambia filename a .txt (ya que no esta comprimido y tampoco es un json como tal, sino una coleccion de json obj)
    let filename = pathArr[pathArr.length - 1];
    filename = filename.replace('.gz', '.txt');

    const fileStream = new StreamableFile(Readable.from(decompressBuffer), {
      disposition: `attachment; filename=${filename}`,
      type: 'text/plain',
    });
    return fileStream;
  }
}
