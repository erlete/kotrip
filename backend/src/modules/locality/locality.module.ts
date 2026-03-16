import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locality } from './entities/locality.entity';
import { LocalityController } from './locality.controller';
import { LocalityService } from './locality.service';

/**
 * Modulo de localidades.
 *
 * Modulo ligero de solo lectura que expone los datos de municipios de Espana
 * provenientes del INE (Instituto Nacional de Estadistica). Se utiliza
 * principalmente para el autocompletado de destinos en la creacion de viajes.
 *
 * @remarks
 * No incluye operaciones de escritura; la tabla se alimenta exclusivamente
 * mediante el seeder de localidades.
 */
@Module({
  controllers: [LocalityController],
  exports: [TypeOrmModule],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: configService.getOrThrow<boolean>('JWT_GLOBAL'),
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRATION') as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([Locality]),
  ],
  providers: [LocalityService],
})
export class LocalityModule {}
