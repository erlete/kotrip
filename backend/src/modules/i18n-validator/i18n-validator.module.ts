import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nValidatorController } from './i18n-validator.controller';
import { I18nValidatorService } from './i18n-validator.service';

/**
 * Modulo de validacion de traducciones i18n.
 *
 * Registra el controlador y servicio necesarios para analizar la cobertura
 * de traducciones en el codigo fuente del proyecto.
 */
@Module({
  controllers: [I18nValidatorController],
  providers: [JwtService, I18nValidatorService],
})
export class I18nValidatorModule {}
