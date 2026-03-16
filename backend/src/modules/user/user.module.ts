import FilesModule from '@/modules/files/files.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEmailVerification } from '../auth/entities/user-email-verification.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

/**
 * Modulo de gestion de usuarios.
 *
 * Gestiona el CRUD de usuarios: consulta, actualizacion, eliminacion y gestion
 * de avatares. La creacion de usuarios se realiza desde el modulo de autenticacion.
 *
 * @see AuthModule Modulo encargado del registro de nuevos usuarios.
 */
@Module({
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, UserEmailVerification]),
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
    forwardRef(() => FilesModule),
  ],
  providers: [UserService],
})
export class UserModule {}
