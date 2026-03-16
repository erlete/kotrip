import { PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';

/**
 * DTO para la actualizaci\u00f3n de un ticket existente.
 *
 * @remarks
 * Extiende `CreateTicketDto` con `PartialType`, haciendo todos los campos opcionales.
 */
export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
