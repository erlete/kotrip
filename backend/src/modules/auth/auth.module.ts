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
 * ### AuthModule
 *
 * Clase que tiene el módulo gestor de autentificaciones. Se controla la entrada del módulo JWT y la gestión del
 * ORM para la entidad de Verification. También tiene configurado el ThrottlerModule para gestión de excepciones
 * en caso de intentos reiterados en aquellas secciones del controlador que se designe.
 *
 * @version     2.0.0




 * @see         [AuthService](../auth/auth.service.ts)
 * @see         [ThrottlerGuard](https://docs.nestjs.com/security/rate-limiting#throttler-module)
 * @see         [TypeOrmModule](https://docs.nestjs.com/techniques/database)
 * @see         [JwtService](https://github.com/nestjs/jwt)
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
