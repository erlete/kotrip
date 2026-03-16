import fastifyHelmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import type { ValidationError } from 'class-validator';
import type { FastifyInstance } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { AppModule } from './app.module';
import { ErrorManager } from './common/error-handling/error.manager';
import { GlobalErrorInterceptor } from './common/error-handling/global-error.interceptor';
import { EndpointLogInterceptor } from './common/interceptors/endpoints-log.interceptor';
import { setup } from './lib/swagger';
import FileService from './modules/files/services/file-service.service';

const logger = new Logger('Bootstrap');

// @TODO: REVIEW if this is extractable
const isProd = process.env.NODE_ENV === 'production';

/**
 * Punto de entrada de la aplicacion Kotrip.
 *
 * Gestiona el lanzamiento del proyecto. El comportamiento varia segun el modo de arranque
 * (development, production o test) en funcion del archivo .env cargado.
 * Desde aqui se configura Swagger, los interceptores globales, CORS, multipart y Helmet.
 *
 * @see {@link https://docs.nestjs.com/techniques/database | TypeOrmModule}
 * @see AppModule Modulo raiz de la aplicacion.
 */
async function bootstrap() {
  // Se crea el adaptador antes de pasarlo a NestFactory para poder registrar
  // el hook onRoute y silenciar el logging del endpoint de health check,
  // evitando así que las comprobaciones periódicas de Docker contaminen los logs.
  const fastifyAdapter = new FastifyAdapter({
    bodyLimit: 10 * 1024 * 1024, // 10 MB - necesario para subida de archivos e imágenes
    logger: isProd
      ? {
          level: 'info',
        }
      : {
          level: 'debug',
          transport: {
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              translateTime: 'SYS:HH:MM:ss.l',
            },
            target: 'pino-pretty',
          },
        },
  });

  fastifyAdapter.getInstance<FastifyInstance>().addHook('onRoute', (route) => {
    if (route.url === '/health') {
      route.logLevel = 'silent';
    }
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Registrar el plugin de multipart para permitir la subida de archivos en Fastify
  await app.register(multipart as never);

  const configService = app.get(ConfigService);

  app.useGlobalInterceptors(new GlobalErrorInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      //personalizar el mensaje de error que lanza la validación
      exceptionFactory: (errors: ValidationError[]) => {
        const i18n: I18nService = app.get(I18nService);
        const messages = errors.map((err) => {
          // se obtiene cada mensaje fallido
          const constraints = Object.values(err.constraints ?? {}).map(
            (msg) => {
              if (typeof msg === 'string') {
                const [i18nKey, rawArgs] = msg.split('|');

                if (i18nKey?.includes('.')) {
                  try {
                    const args = rawArgs ? JSON.parse(rawArgs) : {};

                    return i18n.t(i18nKey, { args: args });
                  } catch (err) {
                    logger.error(
                      'Error while trying to translate error message',
                      err,
                    );
                    return i18nKey;
                  }
                }
              }

              return msg;
            },
          );

          return constraints.join(', ');
        });

        // Devolvemos un error usando tu clase personalizada ErrorManager
        return new ErrorManager('BAD_REQUEST', messages.join('; '));
      },
    }),
  );
  await app.register(fastifyHelmet as never, {
    contentSecurityPolicy: false,
  });
  app.enableCors(); // Activar Cors

  // Ñapa para construir la conexion de clamAV antes de llamar al seeder
  const fileService = app.get(FileService);
  await fileService.onModuleInit();

  // TODO: Re-enable when SeederModule is available
  // Construimos el objeto del Seeder y lanzamos el método para poblar de datos la BD
  // const seeder: SeederService = app.get(SeederService);
  // await seeder.seed();

  // Opciones de desarrollo:
  if (configService.get<string>('NODE_ENV') === 'development') {
    app.useGlobalInterceptors(new EndpointLogInterceptor());
  }

  await setup(app, {
    description: 'Documentation for the Kotrip private API',
    endpoint: 'docs',
    plugins: {
      authPlugin: true,
      collapsePlugin: true,
    },
    title: 'Kotrip Docs',
  });

  logger.log(
    `Application setup completed. Starting server on http://0.0.0.0:3000...`,
  );
  logger.log(
    'Note that 0.0.0.0 makes the server publicly available. This should only be set for internal Docker usage.',
  );

  await app.listen(3000, '0.0.0.0');
}

bootstrap().catch((err) => {
  logger.error('Error during app bootstrap: ', err);
});
