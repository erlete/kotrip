import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { OrderDTO } from '@/common/dtos/order.dto';
import { PaginatedResponse } from '@/common/dtos/paginated.dto';
import { SuccessResponseDto } from '@/common/dtos/success-response.dto';
import { ErrorManager } from '@/common/error-handling/error.manager';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { OrderPipe } from '@/common/pipes/order.pipe';
import { Role, UserStatus } from '@kotrip/data';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Auth } from '../auth/decorators/auth.decorator';
import {
  AllUsersOutputDto,
  UserInfoDTO,
} from './dto-outputs/all-users.output.dto';
import { AvatarOutputDTO } from './dto-outputs/avatar.output.dto';
import { UserOutputDto } from './dto-outputs/user.output.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { MailDto } from './dto/mail.dto';
import { UpdatePasswordDto } from './dto/update-pass.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OrderUsers } from './enums/order-user.enum';
import { UserService } from './user.service';

/**
 * ### UserController
 *
 * Controlador para el módulo de gestión de usuarios. Los end-points aquí declarados son para
 * una gestión superficial del usuario, consulta y borrado de datos. La parte de creación del
 * CRUD se hace desde el módulo Auth.
 *
 * @version     1.0.1a








 * @see         [AuthModule](../auth/auth.module.ts)
 * @see         [ApiBearerAuth](https://docs.nestjs.com/openapi/security)
 */
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized.' })
@ApiTags('users - Consulta de información y borrado de usuarios')
@Controller('user')
export class UserController {
  /**
   * El constructor del controlador necesita el servicio de usuarios para lanzar los
   * métodos de consulta y CRUD.
   *
   * @param usersService  Servicio de usuarios
   */
  constructor(private readonly usersService: UserService) {}

  /**
   * Busca usuarios por nombre o correo electrónico.
   *
   * @param query Término de búsqueda (mínimo 2 caracteres).
   * @returns Lista de usuarios que coincidan con el término.
   */
  @Get('search')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Buscar usuarios por nombre o email.' })
  @ApiQuery({
    description: 'Término de búsqueda',
    name: 'q',
    required: true,
  })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: UserInfoDTO,
  })
  async searchUsers(@Query('q') query: string): Promise<UserInfoDTO[]> {
    if (!query || query.trim().length < 2) return [];
    return this.usersService.searchUsers(query.trim());
  }

  // @TODO: In the future, this needs multitenant-aware logic
  /**
   * Método para listar usuarios paginados desde la base de datos.
   * Devuelve una estructura con los usuarios, página actual, tamaño y total de elementos.
   *
   * @param page       Página solicitada (por defecto 1)
   * @param pageSize   Tamaño de página (por defecto 10)
   * @returns          Estructura paginada con los usuarios
   */
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Devuelve todos los usuarios paginados',
  })
  @ApiResponse({
    description: 'Consulta exitosa',
    status: 200,
    type: AllUsersOutputDto,
  })
  @ApiResponse({ description: 'Parámetros de consulta inválidos', status: 400 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  @ApiQuery({
    description: 'Correo del usuario a buscar',
    name: 'mail',
    required: false,
  })
  @ApiQuery({
    description: 'Nombre del usuario a buscar',
    name: 'firstName',
    required: false,
  })
  @ApiQuery({
    description: 'Apellidos del usuario a buscar',
    name: 'lastName',
    required: false,
  })
  @ApiQuery({
    description: 'Rol del usuario a filtrar',
    enum: Role,
    name: 'role',
    required: false,
  })
  @ApiQuery({
    description: 'Estado del usuario a filtrar',
    enum: UserStatus,
    name: 'status',
    required: false,
  })
  @ApiQuery({
    description: 'Número de página',
    example: 1,
    name: 'page',
    required: false,
  })
  @ApiQuery({
    description: 'Cantidad de elementos por página',
    example: 10,
    name: 'pageSize',
    required: false,
  })
  @ApiQuery({
    description: 'Orden, formato: campo:direccion. Ej: createdAt:desc',
    example: ['mail:desc'],
    isArray: true,
    name: 'sort',
    required: false,
    type: String,
  })
  @Get('all-users-pagination')
  async getPaginatedUsers(
    @ActiveUser() activeUser: UserActiveInterface,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('sort', new OrderPipe(OrderUsers)) order: OrderDTO<OrderUsers>[],
    @Query('mail') mail?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ): Promise<PaginatedResponse<UserInfoDTO>> {
    return await this.usersService.findAllPaginated(
      page,
      pageSize,
      order,
      activeUser,
      mail,
      firstName,
      lastName,
      role,
      status,
    );
  }

  /**
   * Método para devolver la información del usuario activo, esto permite recuperar información
   * usando el UserActiveInterface, sin necesidad de parámetros de entrada. Este método debe llevar
   * Auth() y roles para funcionar.
   *
   * @param user  Objeto de tipo UserActiveInterface con la información del usuario
   * @param res   Objeto para encapsular la información de salida
   * @returns     Un objeto interface del tipo UserOutput
   */
  @Get('profile-info')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary:
      'Obtiene la información del perfil del usuario que tiene la sesión iniciada',
  })
  @ApiResponse({
    description: 'Consulta exitosa',
    status: 200,
    type: UserOutputDto,
  })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async profile(@ActiveUser() user: UserActiveInterface) {
    return await this.usersService.profile(user.email);
  }

  /**
   * Método que vale tanto para Post como para Patch del avatar del usuario. Subirá la foto
   * al índice del usuario y, en caso de ya existir, borrará la anterior.
   *
   * @param user  Objeto de tipo UserActiveInterface con los datos del usuario
   * @param file  Objeto recibido en el body con la información del archivo
   * @param res   Objeto para encapsular la información de salida
   * @returns     Objeto de tipo AvatarOutputDTO o un error de diferentes tipos
   */
  @Post('upload-profile-pic')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary:
      'Sube la foto de perfil del usuario. Si ya existe foto, la modifica',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      properties: {
        file: {
          format: 'binary',
          type: 'string',
        },
      },
      type: 'object',
    },
  })
  @ApiResponse({
    description: 'Foto de perfil subida exitosamente',
    status: 201,
    type: undefined,
  })
  @ApiResponse({ description: 'Solicitud incorrecta', status: 400 })
  @ApiResponse({
    description: 'Error interno del servidor',
    status: 500,
    type: AvatarOutputDTO,
  })
  async uploadProfilePic(
    @ActiveUser() user: UserActiveInterface,
    @Req() req: FastifyRequest,
  ) {
    const fileData = await req.file();
    if (!fileData) {
      throw new ErrorManager(
        'BAD_REQUEST',
        'No se ha proporcionado un archivo',
      );
    }

    const buffer = await fileData.toBuffer();
    const file = {
      fieldname: fileData.fieldname,
      originalname: fileData.filename,
      encoding: fileData.encoding,
      mimetype: fileData.mimetype,
      buffer,
      size: buffer.length,
    } as Express.Multer.File;

    return await this.usersService.uploadProfilePic(user, file);
  }

  /**
   * Método para descargar la imagen de usuario, en caso de no existir imagen, dará
   * un error
   *
   * @param user  Objeto de tipo UserActiveInterface con la información del usuario
   * @returns     Objeto de tipo StreamableFile con el fichero
   */
  @Get('download-profile-pic')
  @ApiOperation({
    summary: 'Descargar el avatar del usuario',
  })
  @Auth(Role.USER, Role.ADMIN)
  @ApiResponse({
    description: 'Foto de perfil descargada exitosamente',
    status: 200,
    type: StreamableFile,
  })
  @ApiResponse({ description: 'Archivo no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async downloadProfilePic(@ActiveUser() user: UserActiveInterface) {
    return await this.usersService.getProfilePic(user);
  }

  /**
   * Método para ADMIN que permite cambiar el valor de 2FA de otro usuario
   *
   * @param id        ID en base de datos del usuario al que cambiar el valor del 2FA
   * @returns         Mensaje de confirmación en caso de poder cambiarlo, diferentes errores si no
   */
  @Put('update-2FA/:id')
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Cambia el valor de 2FA de otro usuario',
  })
  @ApiResponse({
    description: '2FA actualizado exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  // @TODO añadir con ApiParam los ejemplos por defecto del seeder
  async updateTwoFA(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.updateOther2FA(id);
    return { success: true };
  }

  /**
   * Método para que el ADMIN pueda actualizar cualquier usuario de la base de datos
   * mediante su ID. Permite actualizar cualquier campo del usuario.
   *
   * @param id                    ID en base de datos del usuario a actualizar
   * @param updateUserDto         Objeto con nuevos datos
   * @param ActiveUser            Usuario que lanza la petición
   * @returns                     Mensaje de confirmación
   */
  @Put('update-user-admin/:id')
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Actualiza cualquier usuario por su ID',
  })
  @ApiParam({
    description: 'ID del usuario a actualizar',
    example: 1,
    name: 'id',
    required: true,
    schema: { minimum: 1, type: 'integer' },
  })
  @ApiResponse({ description: 'Usuario actualizado exitosamente', status: 200 })
  @ApiResponse({ description: 'Permiso denegado', status: 403 })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async updateAnyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @ActiveUser() activeUser: UserActiveInterface,
  ) {
    return await this.usersService.updateUserByAdmin(
      id,
      updateUserDto,
      activeUser,
    );
  }

  /**
   * Método para actualizar la contraseña del usuario con la sesión iniciada
   *
   * @param user                  Objeto de tipo UserActiveInterface para obtener la información del usuario
   * @param updatePasswordDto     Objeto con nuevos datos
   * @returns                     Objeto con información actualizada o diferentes tipos de errores
   */
  @Put('update-password')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Actualiza la contraseña del usuario',
  })
  @ApiResponse({
    description: 'Contraseña actualizada exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({ description: 'Contraseña anterior inválida', status: 400 })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async updatePassword(
    @ActiveUser() user: UserActiveInterface,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(user.email, updatePasswordDto);
    return { success: true };
  }

  /**
   * Actualiza el estado de un usuario en la plataforma. Solo accesible por
   * ADMIN. La operación queda registrada en auditoría.
   *
   * @param id          ID (UUID) del usuario a actualizar
   * @param body        Objeto con el nuevo estado
   * @param activeUser  Administrador que ejecuta la operación
   * @returns           Objeto de confirmación
   */
  @Put('update-status/:id')
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Actualiza el estado de un usuario en la plataforma',
  })
  @ApiParam({
    description: 'ID del usuario a actualizar',
    name: 'id',
    required: true,
  })
  @ApiBody({
    schema: {
      properties: {
        status: {
          description: 'Nuevo estado del usuario',
          enum: Object.values(UserStatus),
          example: UserStatus.BLOCKED,
          type: 'string',
        },
      },
      required: ['status'],
      type: 'object',
    },
  })
  @ApiResponse({
    description: 'Estado del usuario actualizado exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({
    description: 'No se puede modificar el estado del propio usuario',
    status: 409,
  })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: UserStatus },
    @ActiveUser() activeUser: UserActiveInterface,
  ): Promise<SuccessResponseDto> {
    return await this.usersService.updateUserStatus(
      id,
      body.status,
      activeUser,
    );
  }

  /**
   * Reinicia la contraseña de un usuario por parte de un administrador.
   * No requiere la contraseña anterior del usuario objetivo. La operación
   * queda registrada en la tabla de auditoría.
   *
   * @param id                          ID (UUID) del usuario al que reiniciar la contraseña
   * @param adminResetPasswordDto       Objeto con la nueva contraseña
   * @param activeUser                  Administrador que ejecuta la operación
   * @returns                           Objeto de confirmación
   */
  @Put('admin-reset-password/:id')
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary:
      'Reinicia la contraseña de un usuario por parte de un administrador',
  })
  @ApiParam({
    description: 'ID del usuario al que reiniciar la contraseña',
    name: 'id',
    required: true,
  })
  @ApiResponse({
    description: 'Contraseña reiniciada exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({
    description: 'No se puede cambiar la propia contraseña',
    status: 409,
  })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async adminResetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() adminResetPasswordDto: AdminResetPasswordDto,
    @ActiveUser() activeUser: UserActiveInterface,
  ): Promise<SuccessResponseDto> {
    return await this.usersService.adminResetPassword(
      id,
      adminResetPasswordDto.password,
      activeUser,
    );
  }

  /**
   * Método para eliminar la foto de perfil del usuario activo.
   * Borra el archivo del bucket y limpia la referencia en la base de datos.
   *
   * @param user  Objeto de tipo UserActiveInterface con los datos del usuario
   * @returns     Objeto de confirmación con el resultado de la operación
   */
  @Delete('delete-profile-pic')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Elimina la foto de perfil del usuario autenticado',
  })
  @ApiResponse({
    description: 'Foto de perfil eliminada exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({ description: 'Foto de perfil no encontrada', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async deleteProfilePic(
    @ActiveUser() user: UserActiveInterface,
  ): Promise<SuccessResponseDto> {
    return await this.usersService.deleteProfilePic(user);
  }

  /**
   * Método para borrar usuarios. Solo para ADMIN. Mediante un email, borra todos los
   * registros en la base de datos del usuario.
   *
   * @param mail  Interfaz de tipo MailDto con la información del usuario
   * @param res   Objeto para encapsular la información de salida
   * @returns     Código 200 y mensaje de confirmación o mensajes de error
   */
  @Delete('delete-user')
  @Auth(Role.ADMIN)
  @ApiOperation({
    summary: 'Borra un usuario de la base de datos',
  })
  @ApiResponse({
    description: 'Usuario eliminado exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({ description: 'Permiso denegado', status: 403 })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async deleteUser(@Body() mail: MailDto): Promise<SuccessResponseDto> {
    await this.usersService.deleteUser(mail.mail);
    return { success: true };
  }

  /**
   * Método para borrar al usuario que lanza el método. Esté método no es igual que deleteUser(),
   * este método controla que el borrado se ejecute sobre el usuario que lo lanza, deleteUser() te
   * pide un correo.
   *
   * @param user  Objeto UserActiveInterface con la información del usuario
   * @param res   Objeto para encapsular la información de salida
   * @returns     Código 200 y mensaje de confirmación o mensajes de error
   */
  @Delete('desactivate-user')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary:
      'Desactiva la cuenta del usuario que lanza el end-point. CUIDADO: No pide confirmación',
  })
  @ApiResponse({
    description: 'Usuario eliminado exitosamente',
    status: 200,
    type: SuccessResponseDto,
  })
  @ApiResponse({ description: 'Permiso denegado', status: 403 })
  @ApiResponse({ description: 'Usuario no encontrado', status: 404 })
  @ApiResponse({ description: 'Error interno del servidor', status: 500 })
  async desactivateUser(
    @ActiveUser() user: UserActiveInterface,
  ): Promise<SuccessResponseDto> {
    await this.usersService.deleteUser(user.email);
    return { success: true };
  }
}
