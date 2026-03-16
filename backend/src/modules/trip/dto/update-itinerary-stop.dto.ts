import { PartialType } from '@nestjs/swagger';
import { CreateItineraryStopDto } from './create-itinerary-stop.dto';

/**
 * DTO para la actualizaci\u00f3n de una parada del itinerario existente.
 *
 * @remarks
 * Extiende `CreateItineraryStopDto` con `PartialType`, haciendo todos los campos opcionales.
 */
export class UpdateItineraryStopDto extends PartialType(
  CreateItineraryStopDto,
) {}
