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
 * App Module.
 *
 * Clase que contiene el módulo general de la aplicación. Desde este módulo gestionamos la integración con el
 * resto de módulos del proyecto y, por defecto, generamos la base de datos al levantar la aplicación. Los
 * datos para la base de datos están declarados en el fichero .env que corresponda al tipo de despliegue que
 * se haga de la aplicación. También se configura el módulo de internacionalización para multiples idiomas.
 *
 * @version     2.0.0




 * @see         [TypeOrmModule](https://docs.nestjs.com/techniques/database)
 * @see         [AuthModule](./auth/auth.module.ts)
 * @see         [SeederModule](./seeder/seeder.module.ts)
 * @see         [UserModule](./user/user.module.ts)
 * @see         [I18nModule](https://nestjs-i18n.com/quick-start)
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
