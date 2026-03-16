import { PartialType } from '@nestjs/swagger';
import { CreateTripMemberDto } from './create-trip-member.dto';

/**
 * DTO para la actualizaci\u00f3n de un miembro de viaje existente.
 *
 * @remarks
 * Extiende `CreateTripMemberDto` con `PartialType`, haciendo todos los campos opcionales.
 * Permite actualizar permisos individuales y el rol decorativo.
 */
export class UpdateTripMemberDto extends PartialType(CreateTripMemberDto) {}
