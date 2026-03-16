/**
 * Modulo de semillado (Seeder) de la base de datos.
 *
 * Gestiona la carga automatica de datos iniciales al arrancar la aplicacion
 * mediante presets TypeScript declarativos. Los presets se ejecutan
 * secuencialmente a traves del {@link SeederOrchestrator}.
 *
 * @remarks
 * Configuracion:
 * - `ENABLE_SEEDING=false` deshabilita el seeding completamente.
 *
 * @see presets/index.ts Lista de presets activos.
 * @see SeederOrchestrator Logica de materializacion.
 */
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import FilesModule from '../files/files.module';
import { Locality } from '../locality/entities/locality.entity';
import { Expense } from '../trip/entities/expense.entity';
import { TripItineraryTicket } from '../trip/entities/trip-itinerary-ticket.entity';
import { TripItinerary } from '../trip/entities/trip-itinerary.entity';
import { TripMember } from '../trip/entities/trip-member.entity';
import { Trip } from '../trip/entities/trip.entity';
import { User } from '../user/entities/user.entity';
import { ACTIVE_PRESETS } from './presets';
import { SeederOrchestrator } from './seeder.orchestrator';
import { UsersSeeder } from './seeders/users.seeder';

@Module({
  exports: [],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Locality,
      Trip,
      TripMember,
      TripItinerary,
      Expense,
      TripItineraryTicket,
    ]),
    FilesModule,
  ],
  providers: [UsersSeeder, SeederOrchestrator],
})
export class SeederModule implements OnModuleInit {
  private readonly logger = new Logger(SeederModule.name);

  constructor(private readonly orchestrator: SeederOrchestrator) {}

  /**
   * Ejecuta los presets de seeding al inicializar el modulo.
   *
   * El seeding se lanza en modo fire-and-forget para no bloquear el arranque
   * de la aplicacion. Los errores se capturan y registran sin propagar.
   */
  async onModuleInit(): Promise<void> {
    const seedingEnabled = process.env.ENABLE_SEEDING !== 'false';

    if (!seedingEnabled) {
      this.logger.debug('Seeding deshabilitado via ENABLE_SEEDING');
      return;
    }

    void this.orchestrator
      .run(ACTIVE_PRESETS)
      .then(() => this.logger.log('Seeding completado exitosamente'))
      .catch((err) =>
        this.logger.error(
          'Seeding fallo',
          err instanceof Error ? err.stack : String(err),
        ),
      );
  }
}
