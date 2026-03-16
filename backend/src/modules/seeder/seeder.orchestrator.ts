/**
 * Orquestador del sistema de seeding basado en presets.
 *
 * Ejecuta presets secuencialmente, instanciando un {@link SeederContext} por cada uno
 * y materializando las entidades acumuladas en la base de datos.
 *
 * @module seeder.orchestrator
 */
import * as fs from 'fs';
import * as path from 'path';
import { getUserAvatarPath, KOTRIP_BUCKET } from '@kotrip/data';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { DataSource, ILike } from 'typeorm';
import FileService from '../files/services/file-service.service';
import { Locality } from '../locality/entities/locality.entity';
import { Expense } from '../trip/entities/expense.entity';
import { TripItineraryTicket } from '../trip/entities/trip-itinerary-ticket.entity';
import { TripItinerary } from '../trip/entities/trip-itinerary.entity';
import { TripMember } from '../trip/entities/trip-member.entity';
import { Trip } from '../trip/entities/trip.entity';
import { User } from '../user/entities/user.entity';
import { flushLocalities } from './presets/localities-base.preset';
import { SeederContext } from './seeder.context';
import type {
  AccumulatedExpense,
  AccumulatedItineraryStop,
  AccumulatedTicket,
  AccumulatedTrip,
  AccumulatedTripMember,
  AccumulatedUser,
  SeederPresetEntry,
} from './seeder.types';

/** Cantidad de imagenes de muestra disponibles para avatares. */
const SAMPLE_IMAGES_COUNT = 5;

/**
 * Orquestador del sistema de seeding.
 *
 * Coordina la ejecucion de presets y la materializacion de entidades en la base
 * de datos. Gestiona los mapas de resolucion de IDs para permitir referencias
 * cruzadas entre presets.
 */
@Injectable()
export class SeederOrchestrator {
  private readonly logger = new Logger(SeederOrchestrator.name);

  /** Mapa de resolucion de emails a UUIDs compartido entre presets. */
  private readonly userEmailToId = new Map<string, string>();

  /** Mapa de resolucion de nombres de viaje a UUIDs compartido entre presets. */
  private readonly tripNameToId = new Map<string, string>();

  /** Mapa de resolucion de claves compuestas "tripName::stopName" a UUIDs de paradas. */
  private readonly stopKeyToId = new Map<string, string>();

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly fileService: FileService,
  ) {}

  /**
   * Ejecuta una lista de presets secuencialmente.
   *
   * Para cada preset, crea un nuevo {@link SeederContext}, invoca la funcion de
   * configuracion del preset y luego materializa todas las entidades acumuladas
   * en la base de datos.
   *
   * @param presets - Lista de presets a ejecutar en orden.
   */
  async run(presets: SeederPresetEntry[]): Promise<void> {
    const startTime = Date.now();
    this.logger.log('Iniciando seeding de base de datos...');

    // Cargar datos de referencia (localidades) antes de los presets del DSL.
    try {
      await flushLocalities(this.dataSource);
    } catch (error) {
      this.logger.error(
        `Error al cargar localidades: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    for (const preset of presets) {
      const presetStart = Date.now();
      this.logger.log(`Ejecutando preset: ${preset.name}`);

      try {
        const ctx = new SeederContext({
          stopKeyToId: this.stopKeyToId,
          tripNameToId: this.tripNameToId,
          userEmailToId: this.userEmailToId,
        });
        await preset.fn(ctx);
        await this.flushUsers(ctx.getUsers());
        await this.flushTrips(ctx.getTrips());
        await this.flushTripMembers(ctx.getTripMembers());
        await this.flushItineraryStops(ctx.getItineraryStops());
        await this.flushExpenses(ctx.getExpenses());
        await this.flushTickets(ctx.getTickets());

        const duration = Date.now() - presetStart;
        this.logger.log(`Preset "${preset.name}" completado en ${duration}ms`);
      } catch (error) {
        this.logger.error(
          `Preset "${preset.name}" fallo: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    const totalDuration = Date.now() - startTime;
    this.logger.log(`Seeding completado en ${totalDuration}ms`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de usuarios
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea usuarios en la base de datos, hashea contrasenas, crea buckets de
   * MinIO y sube avatares aleatorios.
   *
   * @param users - Lista de usuarios acumulados a crear.
   */
  private async flushUsers(users: AccumulatedUser[]): Promise<void> {
    if (users.length === 0) return;

    const repo = this.dataSource.getRepository(User);
    let created = 0;
    let skipped = 0;

    for (const userData of users) {
      try {
        // Verificar duplicado por email
        const existing = await repo.findOne({
          where: { email: userData.email },
        });

        if (existing) {
          this.userEmailToId.set(userData.email, existing.id);
          skipped++;
          continue;
        }

        // Hashear contrasena
        const hashedPassword = await hash(userData.password, 10);

        // Crear entidad de usuario
        const user = repo.create({
          email: userData.email,
          firstName: userData.firstName,
          language: userData.language,
          lastName: userData.lastName,
          password: hashedPassword,
          role: userData.role,
        });

        const saved = await repo.save(user);
        this.userEmailToId.set(userData.email, saved.id);

        // Subir avatar aleatorio al bucket unico
        try {
          const avatarFileName = await this.uploadRandomAvatar(
            saved.id,
            userData.email,
          );
          if (avatarFileName) {
            saved.avatarFileName = avatarFileName;
            await repo.save(saved);
          }
        } catch (bucketError) {
          this.logger.warn(
            `Error al crear bucket o avatar para ${userData.email}: ${String(bucketError)}`,
          );
        }

        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear usuario ${userData.email}: ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(`Usuarios: ${created} creados, ${skipped} omitidos`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de viajes
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea viajes en la base de datos y registra al propietario como miembro
   * con todos los permisos activados.
   *
   * @param trips - Lista de viajes acumulados a crear.
   */
  private async flushTrips(trips: AccumulatedTrip[]): Promise<void> {
    if (trips.length === 0) return;

    const tripRepo = this.dataSource.getRepository(Trip);
    const memberRepo = this.dataSource.getRepository(TripMember);
    const localityRepo = this.dataSource.getRepository(Locality);
    let created = 0;
    let skipped = 0;

    for (const tripData of trips) {
      try {
        // Verificar duplicado por nombre
        const existing = await tripRepo.findOne({
          where: { name: tripData.name },
        });

        if (existing) {
          this.tripNameToId.set(tripData.name, existing.id);
          skipped++;
          continue;
        }

        // Resolver localidad si se proporcionó
        let locality: Locality | null = null;
        if (tripData.localityName) {
          locality = await localityRepo.findOne({
            where: { name: ILike(tripData.localityName) },
          });
        }

        // Resolver propietario
        const ownerId = this.userEmailToId.get(tripData.ownerEmail);
        if (!ownerId) {
          this.logger.warn(
            `Viaje "${tripData.name}": propietario ${tripData.ownerEmail} no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        // Crear viaje
        const trip = tripRepo.create({
          budget: tripData.budget ?? null,
          description: tripData.description ?? null,
          endDate: tripData.endDate,
          locality,
          name: tripData.name,
          rating: tripData.rating ?? null,
          startDate: tripData.startDate,
          status: tripData.status,
        });

        const saved = await tripRepo.save(trip);
        this.tripNameToId.set(tripData.name, saved.id);

        // Crear miembro propietario con todos los permisos
        const ownerMember = memberRepo.create({
          canEditBudget: true,
          canEditDetails: true,
          canEditTrip: true,
          canInviteMembers: true,
          canManageTickets: true,
          canModifyMembers: true,
          isCreator: true,
          trip: saved,
          user: { id: ownerId } as User,
        });
        await memberRepo.save(ownerMember);

        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear viaje "${tripData.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(`Viajes: ${created} creados, ${skipped} omitidos`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de miembros de viaje
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea miembros adicionales de viaje en la base de datos.
   *
   * @param members - Lista de miembros acumulados a crear.
   */
  private async flushTripMembers(
    members: AccumulatedTripMember[],
  ): Promise<void> {
    if (members.length === 0) return;

    const memberRepo = this.dataSource.getRepository(TripMember);
    let created = 0;
    let skipped = 0;

    for (const memberData of members) {
      try {
        const tripId = this.tripNameToId.get(memberData.tripName);
        const userId = this.userEmailToId.get(memberData.userEmail);

        if (!tripId) {
          this.logger.warn(
            `Miembro: viaje "${memberData.tripName}" no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        if (!userId) {
          this.logger.warn(
            `Miembro: usuario ${memberData.userEmail} no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        // Verificar duplicado
        const existing = await memberRepo.findOne({
          where: {
            trip: { id: tripId },
            user: { id: userId },
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const member = memberRepo.create({
          canEditBudget: memberData.canEditBudget ?? false,
          canEditDetails: memberData.canEditDetails ?? false,
          canEditTrip: memberData.canEditTrip ?? false,
          canInviteMembers: memberData.canInviteMembers ?? false,
          canManageTickets: memberData.canManageTickets ?? false,
          canModifyMembers: memberData.canModifyMembers ?? false,
          decorativeRole: memberData.decorativeRole ?? null,
          trip: { id: tripId } as Trip,
          user: { id: userId } as User,
        });

        await memberRepo.save(member);
        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear miembro de viaje: ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(
      `Miembros de viaje: ${created} creados, ${skipped} omitidos`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de paradas de itinerario
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea paradas de itinerario en la base de datos.
   *
   * @param stops - Lista de paradas acumuladas a crear.
   */
  private async flushItineraryStops(
    stops: AccumulatedItineraryStop[],
  ): Promise<void> {
    if (stops.length === 0) return;

    const repo = this.dataSource.getRepository(TripItinerary);
    let created = 0;
    let skipped = 0;

    for (const stopData of stops) {
      try {
        const tripId = this.tripNameToId.get(stopData.tripName);
        if (!tripId) {
          this.logger.warn(
            `Parada "${stopData.name}": viaje "${stopData.tripName}" no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        const stop = repo.create({
          arriveAt: stopData.arriveAt ?? null,
          latitude: stopData.latitude,
          longitude: stopData.longitude,
          name: stopData.name,
          order: stopData.order,
          travelMethod: stopData.travelMethod ?? null,
          travelTime: stopData.travelTime ?? null,
          trip: { id: tripId } as Trip,
        });

        const saved = await repo.save(stop);
        this.stopKeyToId.set(
          `${stopData.tripName}::${stopData.name}`,
          saved.id,
        );
        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear parada "${stopData.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(
      `Paradas de itinerario: ${created} creadas, ${skipped} omitidas`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de gastos
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea gastos en la base de datos con sus relaciones de pagador y beneficiarios.
   *
   * @param expenses - Lista de gastos acumulados a crear.
   */
  private async flushExpenses(expenses: AccumulatedExpense[]): Promise<void> {
    if (expenses.length === 0) return;

    const repo = this.dataSource.getRepository(Expense);
    let created = 0;
    let skipped = 0;

    for (const expenseData of expenses) {
      try {
        const tripId = this.tripNameToId.get(expenseData.tripName);
        if (!tripId) {
          this.logger.warn(
            `Gasto: viaje "${expenseData.tripName}" no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        const payerId = this.userEmailToId.get(expenseData.payerEmail);
        if (!payerId) {
          this.logger.warn(
            `Gasto: pagador ${expenseData.payerEmail} no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        const payeeIds = expenseData.payeeEmails.map((email) =>
          this.userEmailToId.get(email),
        );
        if (payeeIds.some((id) => !id)) {
          this.logger.warn(
            `Gasto: algún beneficiario no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        // Resolver parada de itinerario si se proporcionó
        let tripItinerary: { id: string } | null = null;
        if (expenseData.stopName) {
          const stopId = this.stopKeyToId.get(
            `${expenseData.tripName}::${expenseData.stopName}`,
          );
          if (stopId) {
            tripItinerary = { id: stopId } as TripItinerary;
          }
        }

        const expense = repo.create({
          paidAt: expenseData.paidAt,
          payer: { id: payerId } as User,
          payees: payeeIds.map((id) => ({ id }) as User),
          quantity: expenseData.quantity,
          trip: { id: tripId } as Trip,
          tripItinerary,
        });

        await repo.save(expense);
        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear gasto: ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(`Gastos: ${created} creados, ${skipped} omitidos`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Flush de tickets
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea tickets de itinerario en la base de datos.
   *
   * @param tickets - Lista de tickets acumulados a crear.
   */
  private async flushTickets(tickets: AccumulatedTicket[]): Promise<void> {
    if (tickets.length === 0) return;

    const repo = this.dataSource.getRepository(TripItineraryTicket);
    let created = 0;
    let skipped = 0;

    for (const ticketData of tickets) {
      try {
        const tripId = this.tripNameToId.get(ticketData.tripName);
        if (!tripId) {
          this.logger.warn(
            `Ticket "${ticketData.name}": viaje "${ticketData.tripName}" no encontrado, omitiendo`,
          );
          skipped++;
          continue;
        }

        const stopId = this.stopKeyToId.get(
          `${ticketData.tripName}::${ticketData.stopName}`,
        );
        if (!stopId) {
          this.logger.warn(
            `Ticket "${ticketData.name}": parada "${ticketData.stopName}" no encontrada, omitiendo`,
          );
          skipped++;
          continue;
        }

        const ticket = repo.create({
          description: ticketData.description ?? null,
          name: ticketData.name,
          objectUrl: ticketData.objectUrl ?? null,
          trip: { id: tripId } as Trip,
          tripItinerary: { id: stopId } as TripItinerary,
        });

        await repo.save(ticket);
        created++;
      } catch (error) {
        this.logger.error(
          `Error al crear ticket "${ticketData.name}": ${error instanceof Error ? error.message : String(error)}`,
        );
        skipped++;
      }
    }

    this.logger.debug(`Tickets: ${created} creados, ${skipped} omitidos`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Utilidades privadas
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Genera y sube un avatar aleatorio para el usuario a partir de imagenes de muestra locales.
   *
   * @param userId - UUID del usuario al que se le asigna el avatar.
   * @param _email - Email del usuario (reservado para uso futuro).
   * @returns Nombre del archivo subido o null si falla.
   */
  private async uploadRandomAvatar(
    userId: string,
    _email: string,
  ): Promise<string | null> {
    try {
      const imageIndex = Math.floor(Math.random() * SAMPLE_IMAGES_COUNT) + 1;
      const imageName = `sample-image-${imageIndex}.png`;

      const inputsBasePath = path.join(__dirname, 'inputs');
      const imagePath = path.join(inputsBasePath, 'files', imageName);

      if (!fs.existsSync(imagePath)) {
        this.logger.warn(`Imagen de muestra no encontrada: ${imagePath}`);
        return null;
      }

      const fileBuffer = fs.readFileSync(imagePath);
      const fileHash = FileService.generateFileHash(fileBuffer);
      const fileName = `${fileHash}.png`;

      await this.fileService.uploadFile(
        KOTRIP_BUCKET,
        [getUserAvatarPath(userId, fileName)],
        fileBuffer,
        'image/png',
        false,
      );

      return fileName;
    } catch (error) {
      this.logger.warn(
        `Error al subir avatar para usuario ${userId}: ${String(error)}`,
      );
      return null;
    }
  }
}
