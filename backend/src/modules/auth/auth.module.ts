import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { UserEmailVerification } from './entities/user-email-verification.entity';
import { AuthService } from './services/auth.service';

/**
 * Modulo de autenticacion de la aplicacion.
 *
 * Gestiona la configuracion de JWT, TypeORM para la entidad de verificacion de email
 * y ThrottlerModule para limitar intentos de acceso repetidos.
 *
 * @see AuthService Servicio de autenticacion.
 * @see {@link https://docs.nestjs.com/security/rate-limiting | ThrottlerModule}
 */
@Module({
  controllers: [AuthController],
  exports: [JwtModule, TypeOrmModule, AuthService],
  imports: [
    ConfigModule,
    forwardRef(() => UserModule),
    TypeOrmModule.forFeature([UserEmailVerification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: configService.getOrThrow<boolean>('JWT_GLOBAL'), // Valor del .env
        secret: configService.getOrThrow<string>('JWT_SECRET'), // Valor del .env
        signOptions: {
          // Nota: 'as any' necesario porque JWT module espera el tipo branded 'StringValue'
          // pero ConfigService retorna 'string'. El valor es correcto (ej: '15m').
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRATION') as any,
        }, // Valor del .env
      }),
    }),
    ThrottlerModule.forRoot([
      {
        limit: 10, // Cantidad de accesos asignados. Recomendado: 10 cada 1 minuto (60.000ms)
        ttl: 60000, // Valor en MS, 60.000 es 1 minuto
      },
    ]),
  ],
  providers: [AuthService],
})
export class AuthModule {}
