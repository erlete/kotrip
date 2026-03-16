import { ErrorManager } from '@/common/error-handling/error.manager';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Repository } from 'typeorm';
import { TicketOutputDto } from '../dto-outputs/ticket.output.dto';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { TripItineraryTicket } from '../entities/trip-itinerary-ticket.entity';
import { TripItinerary } from '../entities/trip-itinerary.entity';

/**
 * Servicio para la gesti\u00f3n de tickets del itinerario de un viaje.
 *
 * @remarks
 * Proporciona operaciones CRUD para los tickets asociados a paradas
 * del itinerario, con soporte para vincular gastos y URLs de objetos.
 */
@Injectable()
export class TripTicketService {
  /**
   * @param ticketRepository Repositorio de tickets.
   * @param itineraryRepository Repositorio de paradas del itinerario.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(TripItineraryTicket)
    private readonly ticketRepository: Repository<TripItineraryTicket>,
    @InjectRepository(TripItinerary)
    private readonly itineraryRepository: Repository<TripItinerary>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Crea un nuevo ticket asociado a una parada del itinerario.
   *
   * @param tripId Identificador del viaje.
   * @param dto Datos del ticket a crear.
   * @returns Informaci\u00f3n del ticket creado.
   */
  async create(tripId: string, dto: CreateTicketDto): Promise<TicketOutputDto> {
    try {
      const itinerary = await this.itineraryRepository.findOne({
        where: { id: dto.tripItineraryId, trip: { id: tripId } },
      });

      if (!itinerary) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.STOP_NOT_FOUND' as any),
        );
      }

      const ticket = this.ticketRepository.create({
        name: dto.name,
        description: dto.description ?? null,
        objectUrl: dto.objectUrl ?? null,
        trip: { id: tripId },
        tripItinerary: { id: dto.tripItineraryId },
        expense: dto.expenseId ? { id: dto.expenseId } : null,
      });

      const saved = await this.ticketRepository.save(ticket);

      return this.mapToOutput(
        saved,
        dto.tripItineraryId,
        dto.expenseId ?? null,
      );
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene todos los tickets de un viaje.
   *
   * @param tripId Identificador del viaje.
   * @returns Lista de tickets del viaje.
   */
  async findAllByTrip(tripId: string): Promise<TicketOutputDto[]> {
    try {
      const tickets = await this.ticketRepository.find({
        where: { trip: { id: tripId } },
        relations: ['tripItinerary', 'expense'],
        order: { createdAt: 'ASC' },
      });

      return tickets.map((t) =>
        this.mapToOutput(t, t.tripItinerary?.id ?? null, t.expense?.id ?? null),
      );
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Actualiza los datos de un ticket existente.
   *
   * @param ticketId Identificador del ticket a actualizar.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del ticket.
   */
  async update(
    ticketId: string,
    dto: UpdateTicketDto,
  ): Promise<TicketOutputDto> {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
        relations: ['tripItinerary', 'expense'],
      });

      if (!ticket) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.TICKET_NOT_FOUND' as any),
        );
      }

      if (dto.name !== undefined) ticket.name = dto.name;
      if (dto.description !== undefined)
        ticket.description = dto.description ?? null;
      if (dto.objectUrl !== undefined) ticket.objectUrl = dto.objectUrl ?? null;
      if (dto.tripItineraryId !== undefined)
        ticket.tripItinerary = { id: dto.tripItineraryId } as TripItinerary;
      if (dto.expenseId !== undefined)
        ticket.expense = dto.expenseId ? ({ id: dto.expenseId } as any) : null;

      const saved = await this.ticketRepository.save(ticket);

      return this.mapToOutput(
        saved,
        saved.tripItinerary?.id ?? ticket.tripItinerary?.id ?? null,
        saved.expense?.id ?? null,
      );
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Elimina un ticket de forma l\u00f3gica (soft-delete).
   *
   * @param ticketId Identificador del ticket a eliminar.
   */
  async remove(ticketId: string): Promise<void> {
    try {
      const ticket = await this.ticketRepository.findOne({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.TICKET_NOT_FOUND' as any),
        );
      }

      await this.ticketRepository.softRemove(ticket);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Mapea una entidad `TripItineraryTicket` al DTO de salida.
   *
   * @param ticket Entidad del ticket.
   * @param tripItineraryId UUID de la parada del itinerario.
   * @param expenseId UUID del gasto asociado, o null.
   * @returns DTO de salida del ticket.
   */
  private mapToOutput(
    ticket: TripItineraryTicket,
    tripItineraryId: string | null,
    expenseId: string | null,
  ): TicketOutputDto {
    return {
      id: ticket.id,
      name: ticket.name,
      description: ticket.description,
      objectUrl: ticket.objectUrl,
      tripItineraryId,
      expenseId,
      createdAt: ticket.createdAt,
    };
  }
}
