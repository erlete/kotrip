import { PartialType } from '@nestjs/swagger';
import { CreateExpenseDto } from './create-expense.dto';

/**
 * DTO para la actualizaci\u00f3n de un gasto existente.
 *
 * @remarks
 * Extiende `CreateExpenseDto` con `PartialType`, haciendo todos los campos opcionales.
 */
export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {}
