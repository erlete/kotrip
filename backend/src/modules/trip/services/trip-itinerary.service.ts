import { ErrorManager } from '@/common/error-handling/error.manager';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { DataSource, Repository } from 'typeorm';
import { ItineraryOutputDto } from '../dto-outputs/itinerary.output.dto';
import { CreateItineraryStopDto } from '../dto/create-itinerary-stop.dto';
import { UpdateItineraryStopDto } from '../dto/update-itinerary-stop.dto';
import { TripItinerary } from '../entities/trip-itinerary.entity';

/**
 * Servicio para la gesti\u00f3n del itinerario de un viaje.
 *
 * @remarks
 * Gestiona las paradas del itinerario como una lista doblemente enlazada
 * con un campo `order` desnormalizado para facilitar la ordenaci\u00f3n.
 * Las operaciones de inserci\u00f3n, eliminaci\u00f3n y reordenamiento se ejecutan
 * dentro de transacciones para garantizar la consistencia.
 */
@Injectable()
export class TripItineraryService {
  /**
   * @param itineraryRepository Repositorio de paradas del itinerario.
   * @param dataSource Fuente de datos de TypeORM para transacciones.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(TripItinerary)
    private readonly itineraryRepository: Repository<TripItinerary>,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * A\u00f1ade una nueva parada al itinerario de un viaje.
   *
   * @remarks
   * Si se proporciona `afterStopId`, la parada se inserta despu\u00e9s de la indicada.
   * En caso contrario, se a\u00f1ade al final del itinerario. Actualiza los punteros
   * de la lista enlazada y los \u00edndices de orden.
   *
   * @param tripId Identificador del viaje.
   * @param dto Datos de la nueva parada.
   * @returns Informaci\u00f3n de la parada creada.
   */
  async addStop(
    tripId: string,
    dto: CreateItineraryStopDto,
  ): Promise<ItineraryOutputDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repo = queryRunner.manager.getRepository(TripItinerary);

      const existingStops = await repo.find({
        where: { trip: { id: tripId } },
        relations: ['nextDestination', 'previousDestination'],
        order: { order: 'ASC' },
      });

      let insertOrder: number;
      let previousStop: TripItinerary | null = null;
      let nextStop: TripItinerary | null = null;

      if (dto.afterStopId) {
        previousStop =
          existingStops.find((s) => s.id === dto.afterStopId) ?? null;
        if (!previousStop) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.TRIP.STOP_NOT_FOUND' as any),
          );
        }
        insertOrder = previousStop.order + 1;
        nextStop =
          existingStops.find(
            (s) =>
              s.previousDestination?.id === previousStop!.id &&
              s.id !== previousStop!.id,
          ) ?? null;

        // Buscar el next del previousStop directamente
        if (previousStop.nextDestination) {
          nextStop =
            existingStops.find(
              (s) => s.id === previousStop!.nextDestination?.id,
            ) ?? null;
        } else {
          nextStop = null;
        }

        // Desplazar los \u00f3rdenes de las paradas siguientes
        for (const stop of existingStops) {
          if (stop.order >= insertOrder) {
            stop.order += 1;
            await repo.save(stop);
          }
        }
      } else {
        insertOrder = existingStops.length;
        previousStop =
          existingStops.length > 0
            ? existingStops[existingStops.length - 1]
            : null;
        nextStop = null;
      }

      const newStop = repo.create({
        name: dto.name,
        latitude: dto.latitude,
        longitude: dto.longitude,
        travelTime: dto.travelTime ?? null,
        travelMethod: dto.travelMethod ?? null,
        arriveAt: dto.arriveAt ? new Date(dto.arriveAt) : null,
        order: insertOrder,
        trip: { id: tripId },
        previousDestination: previousStop ? { id: previousStop.id } : null,
        nextDestination: nextStop ? { id: nextStop.id } : null,
      });

      const saved = await repo.save(newStop);

      // Actualizar punteros de los vecinos
      if (previousStop) {
        previousStop.nextDestination = { id: saved.id } as TripItinerary;
        await repo.save(previousStop);
      }

      if (nextStop) {
        nextStop.previousDestination = { id: saved.id } as TripItinerary;
        await repo.save(nextStop);
      }

      await queryRunner.commitTransaction();

      return this.mapToOutput(saved);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      ErrorManager.normalize(error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene todas las paradas del itinerario de un viaje ordenadas.
   *
   * @param tripId Identificador del viaje.
   * @returns Lista de paradas ordenadas por posici\u00f3n.
   */
  async findAllByTrip(tripId: string): Promise<ItineraryOutputDto[]> {
    try {
      const stops = await this.itineraryRepository.find({
        where: { trip: { id: tripId } },
        relations: ['nextDestination', 'previousDestination'],
        order: { order: 'ASC' },
      });

      return stops.map((s) => this.mapToOutput(s));
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Actualiza los datos de una parada del itinerario.
   *
   * @param stopId Identificador de la parada a actualizar.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada de la parada.
   */
  async updateStop(
    stopId: string,
    dto: UpdateItineraryStopDto,
  ): Promise<ItineraryOutputDto> {
    try {
      const stop = await this.itineraryRepository.findOne({
        where: { id: stopId },
        relations: ['nextDestination', 'previousDestination'],
      });

      if (!stop) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.STOP_NOT_FOUND' as any),
        );
      }

      if (dto.name !== undefined) stop.name = dto.name;
      if (dto.latitude !== undefined) stop.latitude = dto.latitude;
      if (dto.longitude !== undefined) stop.longitude = dto.longitude;
      if (dto.travelTime !== undefined)
        stop.travelTime = dto.travelTime ?? null;
      if (dto.travelMethod !== undefined)
        stop.travelMethod = dto.travelMethod ?? null;
      if (dto.arriveAt !== undefined)
        stop.arriveAt = dto.arriveAt ? new Date(dto.arriveAt) : null;

      const saved = await this.itineraryRepository.save(stop);

      return this.mapToOutput(saved);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Elimina una parada del itinerario y actualiza la lista enlazada.
   *
   * @param stopId Identificador de la parada a eliminar.
   */
  async removeStop(stopId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repo = queryRunner.manager.getRepository(TripItinerary);

      const stop = await repo.findOne({
        where: { id: stopId },
        relations: ['nextDestination', 'previousDestination', 'trip'],
      });

      if (!stop) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.STOP_NOT_FOUND' as any),
        );
      }

      // Actualizar punteros de los vecinos
      if (stop.previousDestination) {
        const prev = await repo.findOne({
          where: { id: stop.previousDestination.id },
        });
        if (prev) {
          prev.nextDestination = stop.nextDestination;
          await repo.save(prev);
        }
      }

      if (stop.nextDestination) {
        const next = await repo.findOne({
          where: { id: stop.nextDestination.id },
        });
        if (next) {
          next.previousDestination = stop.previousDestination;
          await repo.save(next);
        }
      }

      // Desplazar \u00f3rdenes
      const allStops = await repo.find({
        where: { trip: { id: stop.trip.id } },
        order: { order: 'ASC' },
      });

      for (const s of allStops) {
        if (s.order > stop.order) {
          s.order -= 1;
          await repo.save(s);
        }
      }

      await repo.softRemove(stop);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      ErrorManager.normalize(error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reordena completamente las paradas del itinerario de un viaje.
   *
   * @remarks
   * Actualiza tanto el campo `order` como los punteros de la lista enlazada
   * dentro de una transacci\u00f3n.
   *
   * @param tripId Identificador del viaje.
   * @param stopIds Array de UUIDs en el nuevo orden deseado.
   */
  async reorder(tripId: string, stopIds: string[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repo = queryRunner.manager.getRepository(TripItinerary);

      const stops = await repo.find({
        where: { trip: { id: tripId } },
      });

      if (stops.length !== stopIds.length) {
        throw new ErrorManager(
          'BAD_REQUEST',
          this.i18n.t('error.TRIP.INVALID_REORDER' as any),
        );
      }

      const stopMap = new Map(stops.map((s) => [s.id, s]));

      for (const id of stopIds) {
        if (!stopMap.has(id)) {
          throw new ErrorManager(
            'BAD_REQUEST',
            this.i18n.t('error.TRIP.INVALID_REORDER' as any),
          );
        }
      }

      // Primero, limpiar todos los punteros para evitar conflictos de FK
      for (const stop of stops) {
        stop.nextDestination = null;
        stop.previousDestination = null;
        await repo.save(stop);
      }

      // Actualizar orden y punteros
      for (let i = 0; i < stopIds.length; i++) {
        const stop = stopMap.get(stopIds[i])!;
        stop.order = i;
        stop.previousDestination =
          i > 0 ? ({ id: stopIds[i - 1] } as TripItinerary) : null;
        stop.nextDestination =
          i < stopIds.length - 1
            ? ({ id: stopIds[i + 1] } as TripItinerary)
            : null;
        await repo.save(stop);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      ErrorManager.normalize(error);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mapea una entidad `TripItinerary` al DTO de salida.
   *
   * @param stop Entidad de la parada.
   * @returns DTO de salida de la parada.
   */
  private mapToOutput(stop: TripItinerary): ItineraryOutputDto {
    return {
      id: stop.id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
      travelTime: stop.travelTime,
      travelMethod: stop.travelMethod,
      arriveAt: stop.arriveAt,
      order: stop.order,
      nextDestinationId: stop.nextDestination?.id ?? null,
      previousDestinationId: stop.previousDestination?.id ?? null,
      createdAt: stop.createdAt,
    };
  }
}
