import { ErrorManager } from '@/common/error-handling/error.manager';
import { Locality } from '@/modules/locality/entities/locality.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { Repository } from 'typeorm';
import { TripListOutputDto } from '../dto-outputs/trip-list.output.dto';
import { TripOutputDto } from '../dto-outputs/trip.output.dto';
import { CreateTripDto } from '../dto/create-trip.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import { TripMember } from '../entities/trip-member.entity';
import { Trip } from '../entities/trip.entity';

/**
 * Servicio para la gesti\u00f3n de viajes.
 *
 * @remarks
 * Proporciona operaciones CRUD sobre la entidad `Trip`, incluyendo
 * la creaci\u00f3n autom\u00e1tica del miembro creador con todos los permisos.
 */
@Injectable()
export class TripService {
  /**
   * @param tripRepository Repositorio de viajes.
   * @param tripMemberRepository Repositorio de miembros de viaje.
   * @param localityRepository Repositorio de localidades.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMemberRepository: Repository<TripMember>,
    @InjectRepository(Locality)
    private readonly localityRepository: Repository<Locality>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Crea un nuevo viaje y registra al creador como miembro con todos los permisos.
   *
   * @param userId Identificador del usuario creador.
   * @param dto Datos del viaje a crear.
   * @returns Detalle completo del viaje creado.
   */
  async create(userId: string, dto: CreateTripDto): Promise<TripOutputDto> {
    try {
      let locality: Locality | null = null;
      if (dto.localityId) {
        locality = await this.localityRepository.findOne({
          where: { id: dto.localityId },
        });
        if (!locality) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.TRIP.LOCALITY_NOT_FOUND' as any),
          );
        }
      }

      const trip = this.tripRepository.create({
        name: dto.name,
        description: dto.description ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        budget: dto.budget ?? null,
        locality,
      });

      const savedTrip = await this.tripRepository.save(trip);

      const member = this.tripMemberRepository.create({
        user: { id: userId },
        trip: { id: savedTrip.id },
        isCreator: true,
        canEditBudget: true,
        canEditTrip: true,
        canEditDetails: true,
        canModifyMembers: true,
        canInviteMembers: true,
        canManageTickets: true,
      });

      await this.tripMemberRepository.save(member);

      return this.mapToOutput(savedTrip, 1);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene todos los viajes en los que el usuario es miembro.
   *
   * @param userId Identificador del usuario.
   * @returns Lista simplificada de viajes.
   */
  async findAllForUser(userId: string): Promise<TripListOutputDto[]> {
    try {
      const members = await this.tripMemberRepository.find({
        where: { user: { id: userId } },
        relations: ['trip', 'trip.locality'],
      });

      const tripIds = members.map((m) => m.trip.id);
      if (tripIds.length === 0) return [];

      const trips = members.map((m) => m.trip);
      const result: TripListOutputDto[] = [];

      for (const trip of trips) {
        const memberCount = await this.tripMemberRepository.count({
          where: { trip: { id: trip.id } },
        });

        result.push({
          id: trip.id,
          name: trip.name,
          description: trip.description,
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status,
          memberCount,
          localityName: trip.locality?.name ?? null,
        });
      }

      return result;
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene el detalle completo de un viaje por su identificador.
   *
   * @param tripId Identificador del viaje.
   * @returns Detalle completo del viaje.
   */
  async findOne(tripId: string): Promise<TripOutputDto> {
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
        relations: ['locality'],
      });

      if (!trip) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.NOT_FOUND' as any),
        );
      }

      const memberCount = await this.tripMemberRepository.count({
        where: { trip: { id: tripId } },
      });

      return this.mapToOutput(trip, memberCount);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Actualiza los datos de un viaje existente.
   *
   * @param tripId Identificador del viaje a actualizar.
   * @param dto Campos a actualizar.
   * @returns Detalle actualizado del viaje.
   */
  async update(tripId: string, dto: UpdateTripDto): Promise<TripOutputDto> {
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
        relations: ['locality'],
      });

      if (!trip) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.NOT_FOUND' as any),
        );
      }

      if (dto.name !== undefined) trip.name = dto.name;
      if (dto.description !== undefined)
        trip.description = dto.description ?? null;
      if (dto.startDate !== undefined) trip.startDate = new Date(dto.startDate);
      if (dto.endDate !== undefined) trip.endDate = new Date(dto.endDate);
      if (dto.budget !== undefined) trip.budget = dto.budget ?? null;
      if (dto.rating !== undefined) trip.rating = dto.rating ?? null;
      if (dto.status !== undefined) trip.status = dto.status;

      if (dto.localityId !== undefined) {
        if (dto.localityId === null) {
          trip.locality = null;
        } else {
          const locality = await this.localityRepository.findOne({
            where: { id: dto.localityId },
          });
          if (!locality) {
            throw new ErrorManager(
              'NOT_FOUND',
              this.i18n.t('error.TRIP.LOCALITY_NOT_FOUND' as any),
            );
          }
          trip.locality = locality;
        }
      }

      const saved = await this.tripRepository.save(trip);

      const memberCount = await this.tripMemberRepository.count({
        where: { trip: { id: tripId } },
      });

      return this.mapToOutput(saved, memberCount);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Elimina un viaje de forma l\u00f3gica (soft-delete).
   *
   * @param tripId Identificador del viaje a eliminar.
   */
  async remove(tripId: string): Promise<void> {
    try {
      const trip = await this.tripRepository.findOne({
        where: { id: tripId },
      });

      if (!trip) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.NOT_FOUND' as any),
        );
      }

      await this.tripRepository.softRemove(trip);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Mapea una entidad `Trip` al DTO de salida con detalle completo.
   *
   * @param trip Entidad del viaje.
   * @param memberCount N\u00famero de miembros del viaje.
   * @returns DTO de salida del viaje.
   */
  private mapToOutput(trip: Trip, memberCount: number): TripOutputDto {
    return {
      id: trip.id,
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      rating: trip.rating,
      budget: trip.budget,
      status: trip.status,
      locality: trip.locality
        ? {
            id: trip.locality.id,
            name: trip.locality.name,
            province: trip.locality.province,
            autonomousCommunity: trip.locality.autonomousCommunity,
          }
        : null,
      memberCount,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }
}
