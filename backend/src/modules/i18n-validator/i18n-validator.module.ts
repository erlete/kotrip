import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nValidatorController } from './i18n-validator.controller';
import { I18nValidatorService } from './i18n-validator.service';

@Module({
  controllers: [I18nValidatorController],
  providers: [JwtService, I18nValidatorService],
})
export class I18nValidatorModule {}
