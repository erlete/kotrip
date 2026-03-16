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
 * ### UserModule
 *
 * Clase que tiene el módulo gestor de usuarios. Este módulo gestiona todo el CRUD de
 * usuarios. Aún así, el módulo que se encarga de crear usuarios nuevos mediante
 * end-points será el AuthModule.
 *
 * @version     2.0.0




 * @see         [AuthModule](../auth/auth.module.ts)
 * @see         [TypeOrmModule](https://docs.nestjs.com/techniques/database)
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
