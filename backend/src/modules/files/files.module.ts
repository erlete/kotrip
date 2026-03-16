import { AuthModule } from '@/modules/auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';
import FileExplorerLogsController from './files-logs.controller';
import FileUserController from './files-user.controller';
import FileService from './services/file-service.service';
import { StorageProxyController } from './storage-proxy.controller';

/**
 * Files Module.
 *
 * Clase con el módulo de gestión de archivos. Gestiona tanto la subida como la descarga
 * y almacenamiento de los archivos. Como método de almacenamiento se hace uso de buckets
 * en minio. Estos buckets contienen conjuntos de carpetas y archivos que permiten
 * almacenar información acerca de usuarios individuales y organizaciones.
 *
 * @version     1.0.2a




 * @see         [NestMinioModule](https://github.com/NestCrafts/nestjs-minio)
 */
@Module({
  imports: [
    forwardRef(() => AuthModule),
    NestMinioModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        accessKey: configService.getOrThrow<string>('MINIO_ROOT_USER'),
        endPoint: configService.get<string>('MINIO_ENDPOINT', 'localhost'),
        isGlobal: true,
        port: parseInt(configService.get<string>('MINIO_PORT', '9000')),
        secretKey: configService.getOrThrow<string>('MINIO_ROOT_PASSWORD'),
        useSSL: false,
      }),
    }),
  ],
  /**
   * El servicio de FileInitService se encarga de inciar la estructura de archivos
   * en minio cuando no está creada
   */
  controllers: [
    FileUserController,
    FileExplorerLogsController,
    StorageProxyController,
  ],
  exports: [FileService, NestMinioModule],
  providers: [FileService],
})
export default class FilesModule {}
