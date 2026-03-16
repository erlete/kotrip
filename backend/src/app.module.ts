import { join } from 'node:path';
import { BullModule } from '@nestjs/bull';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { JwtLanguageResolver } from './common/services/jwt-language-solver';
import { AuthModule } from './modules/auth/auth.module';
import FilesModule from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { I18nValidatorModule } from './modules/i18n-validator/i18n-validator.module';
import { LocalityModule } from './modules/locality/locality.module';
import { SeederModule } from './modules/seeder/seeder.module';
import { TripModule } from './modules/trip/trip.module';
import { UserModule } from './modules/user/user.module';

const logger = new Logger('AppModule');

/**
 * Modulo raiz de la aplicacion Kotrip.
 *
 * Integra todos los modulos del proyecto y configura la conexion a la base de datos
 * PostgreSQL con TypeORM, la cola de trabajos con Bull/Redis y la internacionalizacion
 * con nestjs-i18n. Los parametros de conexion se leen del fichero .env correspondiente
 * al entorno de despliegue.
 *
 * @see {@link https://docs.nestjs.com/techniques/database | TypeOrmModule}
 * @see {@link https://nestjs-i18n.com/quick-start | I18nModule}
 */
@Module({
  imports: [
    // region Config

    ConfigModule.forRoot({
      envFilePath: join('..', '.env'),
      expandVariables: true,
      ignoreEnvFile: false,
      isGlobal: true,
    }),

    EventEmitterModule.forRoot(),

    // region Redis/Bull

    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.getOrThrow<string>('BACKEND_REDIS_HOST'),
          password: configService.getOrThrow<string>('BACKEND_REDIS_PASSWORD'),
          port: configService.getOrThrow<number>('BACKEND_REDIS_PORT'),
        },
      }),
    }),

    // region TypeORM

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const NODE_ENV = configService.getOrThrow<string>('NODE_ENV');

        const dbConfig: TypeOrmModuleOptions = {
          autoLoadEntities: true,
          database: configService.getOrThrow<string>('POSTGRES_DB'),
          host: configService.getOrThrow<string>('POSTGRES_HOST'),
          password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
          port: configService.getOrThrow<number>('POSTGRES_PORT'),
          ssl: false,
          type: 'postgres',
          username: configService.getOrThrow<string>('POSTGRES_USER'),

          // Sincronizacion automatica del esquema a partir de las entidades.
          // Apto para desarrollo; en produccion se debera migrar a migraciones.
          synchronize: true,

          // Logging configuration
          logging:
            NODE_ENV === 'production'
              ? ['error', 'warn']
              : ['error', 'warn', 'schema'],
        };

        logger.log('TypeORM configured with synchronize: true');

        return dbConfig;
      },
    }),

    // region I18n

    I18nModule.forRootAsync({
      imports: [JwtModule],
      inject: [ConfigService],
      resolvers: [
        JwtLanguageResolver,
        { options: ['lang'], use: QueryResolver },
        AcceptLanguageResolver,
        new HeaderResolver(['x-lang']),
      ],
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'), // Valor en el .env
        loaderOptions: {
          path: join(__dirname, '/i18n/'), // Carpeta de idiomas
          watch: true,
        },
        // En producción no existe el directorio src/, por lo que la
        // generación de tipos se omite para evitar un error ENOENT.
        ...(process.env.NODE_ENV !== 'production' && {
          typesOutputPath: join(
            process.cwd(),
            './src/i18n/generated/i18n.generated.ts',
          ),
        }),
      }),
    }),

    // region App

    FilesModule,
    AuthModule,
    HealthModule,
    LocalityModule,
    TripModule,
    UserModule,
    SeederModule,
    I18nValidatorModule,
  ],
  providers: [Reflector, JwtLanguageResolver],
})
export class AppModule {}
