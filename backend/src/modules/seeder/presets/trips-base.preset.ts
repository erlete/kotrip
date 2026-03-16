import { TravelMethod, TripStatus } from '@kotrip/data';
import type { SeederContext } from '../seeder.context';
import type { SeederPresetFn } from '../seeder.types';

/**
 * Preset de viajes base del sistema.
 *
 * Define un conjunto variado de viajes de ejemplo para desarrollo y pruebas.
 * Todos los viajes son accesibles para los cinco usuarios estándar con
 * distintos roles y permisos. El superadmin no participa en viajes.
 *
 * @remarks
 * Viajes creados (4):
 * - "Ruta por Galicia" - viaje activo, 4 paradas, 3 gastos, 2 tickets
 * - "Fin de semana en Madrid" - viaje planificado, 3 paradas, 2 gastos
 * - "Aventura en Asturias" - viaje finalizado, 3 paradas, 2 gastos, 1 ticket
 * - "Costa Brava en verano" - viaje cancelado, 3 paradas, 1 gasto
 *
 * Paradas totales: 13 con coordenadas reales y variación de métodos de viaje.
 *
 * Dependencias: Requiere que los usuarios de `users-base.preset.ts`
 * estén creados previamente.
 */
export const tripsBase: SeederPresetFn = (ctx: SeederContext): void => {
  // ═══════════════════════════════════════════════════════════════════════
  // Viaje 1: Ruta por Galicia (ACTIVE)
  // ═══════════════════════════════════════════════════════════════════════
  ctx.trip('sonia@kotrip.local', {
    name: 'Ruta por Galicia',
    description:
      'Recorrido por las Rías Baixas y Santiago de Compostela. Visita a bodegas, playas y monasterios.',
    startDate: new Date('2026-04-15'),
    endDate: new Date('2026-04-22'),
    budget: 1800,
    localityName: 'Vigo',
    status: TripStatus.ACTIVE,
  });

  ctx.tripMember('Ruta por Galicia', {
    userEmail: 'ainhoa@kotrip.local',
    canEditDetails: true,
    canInviteMembers: true,
    decorativeRole: 'Fotógrafa',
  });

  ctx.tripMember('Ruta por Galicia', {
    userEmail: 'diego@kotrip.local',
    canEditBudget: true,
    decorativeRole: 'Tesorero',
  });

  ctx.tripMember('Ruta por Galicia', {
    userEmail: 'ismael@kotrip.local',
    canEditDetails: true,
    canEditTrip: true,
    decorativeRole: 'Navegante',
  });

  ctx.tripMember('Ruta por Galicia', {
    userEmail: 'paulo@kotrip.local',
    canManageTickets: true,
    decorativeRole: 'Guía local',
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Viaje 2: Fin de semana en Madrid (PLANNED)
  // ═══════════════════════════════════════════════════════════════════════
  ctx.trip('ainhoa@kotrip.local', {
    name: 'Fin de semana en Madrid',
    description:
      'Escapada cultural: museos, tapas y espectáculos en la capital.',
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-05-12'),
    budget: 750,
    localityName: 'Madrid',
    status: TripStatus.PLANNED,
  });

  ctx.tripMember('Fin de semana en Madrid', {
    userEmail: 'sonia@kotrip.local',
    canEditDetails: true,
    canEditTrip: true,
    canManageTickets: true,
  });

  ctx.tripMember('Fin de semana en Madrid', {
    userEmail: 'diego@kotrip.local',
    canEditBudget: true,
  });

  ctx.tripMember('Fin de semana en Madrid', {
    userEmail: 'ismael@kotrip.local',
    canInviteMembers: true,
  });

  ctx.tripMember('Fin de semana en Madrid', {
    userEmail: 'paulo@kotrip.local',
    canEditDetails: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Viaje 3: Aventura en Asturias (FINISHED)
  // ═══════════════════════════════════════════════════════════════════════
  ctx.trip('diego@kotrip.local', {
    name: 'Aventura en Asturias',
    description:
      'Senderismo por los Picos de Europa, playas secretas y gastronomía asturiana.',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-07'),
    budget: 1100,
    localityName: 'Oviedo',
    status: TripStatus.FINISHED,
    rating: 9,
  });

  ctx.tripMember('Aventura en Asturias', {
    userEmail: 'sonia@kotrip.local',
    canEditBudget: true,
    canEditDetails: true,
    decorativeRole: 'Co-organizadora',
  });

  ctx.tripMember('Aventura en Asturias', {
    userEmail: 'ainhoa@kotrip.local',
    canEditDetails: true,
    decorativeRole: 'Fotógrafa',
  });

  ctx.tripMember('Aventura en Asturias', {
    userEmail: 'ismael@kotrip.local',
    canEditTrip: true,
    canInviteMembers: true,
    canModifyMembers: true,
    decorativeRole: 'Coordinador',
  });

  ctx.tripMember('Aventura en Asturias', {
    userEmail: 'paulo@kotrip.local',
    canManageTickets: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Viaje 4: Costa Brava en verano (CANCELLED)
  // ═══════════════════════════════════════════════════════════════════════
  ctx.trip('paulo@kotrip.local', {
    name: 'Costa Brava en verano',
    description:
      'Ruta por calas y pueblos costeros de la Costa Brava. Cancelado por conflicto de fechas.',
    startDate: new Date('2026-07-20'),
    endDate: new Date('2026-07-27'),
    budget: 2000,
    localityName: 'Girona',
    status: TripStatus.CANCELLED,
  });

  ctx.tripMember('Costa Brava en verano', {
    userEmail: 'sonia@kotrip.local',
    canEditDetails: true,
  });

  ctx.tripMember('Costa Brava en verano', {
    userEmail: 'ainhoa@kotrip.local',
    canEditBudget: true,
  });

  ctx.tripMember('Costa Brava en verano', {
    userEmail: 'diego@kotrip.local',
    canInviteMembers: true,
  });

  ctx.tripMember('Costa Brava en verano', {
    userEmail: 'ismael@kotrip.local',
    canEditTrip: true,
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Paradas de itinerario (13 total)
  // Cada viaje tiene paradas dentro de la misma ciudad/zona para
  // garantizar coherencia geográfica en el mapa.
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Ruta por Galicia - 4 paradas (zona Vigo / Rías Baixas) ──────
  ctx.itineraryStop('Ruta por Galicia', {
    name: 'Casco Vello de Vigo',
    latitude: 42.2372,
    longitude: -8.7263,
    arriveAt: new Date('2026-04-15T10:00:00Z'),
  });

  ctx.itineraryStop('Ruta por Galicia', {
    name: 'Parque del Castro',
    latitude: 42.2318,
    longitude: -8.7295,
    travelTime: 900,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-04-16T11:00:00Z'),
  });

  ctx.itineraryStop('Ruta por Galicia', {
    name: 'Mercado da Pedra',
    latitude: 42.2365,
    longitude: -8.7248,
    travelTime: 600,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-04-18T12:00:00Z'),
  });

  ctx.itineraryStop('Ruta por Galicia', {
    name: 'Playa de Samil',
    latitude: 42.2134,
    longitude: -8.7614,
    travelTime: 900,
    travelMethod: TravelMethod.CAR,
    arriveAt: new Date('2026-04-20T09:00:00Z'),
  });

  // ─── Fin de semana en Madrid - 3 paradas (centro de Madrid) ───────
  ctx.itineraryStop('Fin de semana en Madrid', {
    name: 'Museo del Prado',
    latitude: 40.4138,
    longitude: -3.6921,
    arriveAt: new Date('2026-05-10T10:00:00Z'),
  });

  ctx.itineraryStop('Fin de semana en Madrid', {
    name: 'Mercado de San Miguel',
    latitude: 40.4154,
    longitude: -3.7089,
    travelTime: 1200,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-05-10T14:00:00Z'),
  });

  ctx.itineraryStop('Fin de semana en Madrid', {
    name: 'Parque del Retiro',
    latitude: 40.4153,
    longitude: -3.6845,
    travelTime: 1800,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-05-11T10:00:00Z'),
  });

  // ─── Aventura en Asturias - 3 paradas (centro de Oviedo) ─────────
  ctx.itineraryStop('Aventura en Asturias', {
    name: 'Catedral de San Salvador',
    latitude: 43.3625,
    longitude: -5.8435,
    arriveAt: new Date('2026-02-02T09:00:00Z'),
  });

  ctx.itineraryStop('Aventura en Asturias', {
    name: 'Plaza del Fontán',
    latitude: 43.3608,
    longitude: -5.8454,
    travelTime: 600,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-02-04T11:00:00Z'),
  });

  ctx.itineraryStop('Aventura en Asturias', {
    name: 'Parque de San Francisco',
    latitude: 43.3633,
    longitude: -5.8497,
    travelTime: 600,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-02-06T10:00:00Z'),
  });

  // ─── Costa Brava en verano - 3 paradas (centro de Girona) ─────────
  ctx.itineraryStop('Costa Brava en verano', {
    name: 'Catedral de Girona',
    latitude: 41.9876,
    longitude: 2.8256,
    arriveAt: new Date('2026-07-20T12:00:00Z'),
  });

  ctx.itineraryStop('Costa Brava en verano', {
    name: 'Barri Vell (Casas del Onyar)',
    latitude: 41.9863,
    longitude: 2.8243,
    travelTime: 600,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-07-22T10:00:00Z'),
  });

  ctx.itineraryStop('Costa Brava en verano', {
    name: 'Parc de la Devesa',
    latitude: 41.9891,
    longitude: 2.8189,
    travelTime: 900,
    travelMethod: TravelMethod.WALKING,
    arriveAt: new Date('2026-07-24T11:00:00Z'),
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Gastos (8 total)
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Ruta por Galicia - 3 gastos ───────────────────────────────────
  ctx.expense('Ruta por Galicia', {
    paidAt: new Date('2026-04-15T13:00:00Z'),
    quantity: 85.5,
    payerEmail: 'sonia@kotrip.local',
    payeeEmails: [
      'sonia@kotrip.local',
      'ainhoa@kotrip.local',
      'diego@kotrip.local',
      'ismael@kotrip.local',
      'paulo@kotrip.local',
    ],
    stopName: 'Casco Vello de Vigo',
  });

  ctx.expense('Ruta por Galicia', {
    paidAt: new Date('2026-04-16T20:00:00Z'),
    quantity: 150.0,
    payerEmail: 'ainhoa@kotrip.local',
    payeeEmails: [
      'sonia@kotrip.local',
      'ainhoa@kotrip.local',
      'diego@kotrip.local',
      'ismael@kotrip.local',
      'paulo@kotrip.local',
    ],
  });

  ctx.expense('Ruta por Galicia', {
    paidAt: new Date('2026-04-18T14:00:00Z'),
    quantity: 60.0,
    payerEmail: 'diego@kotrip.local',
    payeeEmails: ['diego@kotrip.local', 'paulo@kotrip.local'],
    stopName: 'Mercado da Pedra',
  });

  // ─── Fin de semana en Madrid - 2 gastos ────────────────────────────
  ctx.expense('Fin de semana en Madrid', {
    paidAt: new Date('2026-05-10T15:00:00Z'),
    quantity: 95.0,
    payerEmail: 'ainhoa@kotrip.local',
    payeeEmails: [
      'ainhoa@kotrip.local',
      'sonia@kotrip.local',
      'diego@kotrip.local',
      'ismael@kotrip.local',
      'paulo@kotrip.local',
    ],
    stopName: 'Museo del Prado',
  });

  ctx.expense('Fin de semana en Madrid', {
    paidAt: new Date('2026-05-11T12:00:00Z'),
    quantity: 40.0,
    payerEmail: 'ismael@kotrip.local',
    payeeEmails: ['ismael@kotrip.local', 'sonia@kotrip.local'],
  });

  // ─── Aventura en Asturias - 2 gastos ──────────────────────────────
  ctx.expense('Aventura en Asturias', {
    paidAt: new Date('2026-02-02T13:00:00Z'),
    quantity: 70.0,
    payerEmail: 'diego@kotrip.local',
    payeeEmails: [
      'diego@kotrip.local',
      'sonia@kotrip.local',
      'ainhoa@kotrip.local',
      'ismael@kotrip.local',
      'paulo@kotrip.local',
    ],
    stopName: 'Catedral de San Salvador',
  });

  ctx.expense('Aventura en Asturias', {
    paidAt: new Date('2026-02-05T19:30:00Z'),
    quantity: 110.0,
    payerEmail: 'ismael@kotrip.local',
    payeeEmails: [
      'diego@kotrip.local',
      'sonia@kotrip.local',
      'ismael@kotrip.local',
    ],
  });

  // ─── Costa Brava en verano - 1 gasto ──────────────────────────────
  ctx.expense('Costa Brava en verano', {
    paidAt: new Date('2026-07-20T14:00:00Z'),
    quantity: 200.0,
    payerEmail: 'paulo@kotrip.local',
    payeeEmails: [
      'paulo@kotrip.local',
      'sonia@kotrip.local',
      'ainhoa@kotrip.local',
      'diego@kotrip.local',
      'ismael@kotrip.local',
    ],
    stopName: 'Catedral de Girona',
  });

  // ═══════════════════════════════════════════════════════════════════════
  // Tickets (4 total)
  // ═══════════════════════════════════════════════════════════════════════

  // ─── Ruta por Galicia - 2 tickets ──────────────────────────────────
  ctx.ticket('Ruta por Galicia', 'Casco Vello de Vigo', {
    name: 'Guía turística Vigo',
    description: 'Folleto digital con ruta guiada por el casco histórico',
  });

  ctx.ticket('Ruta por Galicia', 'Mercado da Pedra', {
    name: 'Reserva degustación',
    description: 'Reserva para degustación de ostras en el Mercado da Pedra',
  });

  // ─── Aventura en Asturias - 1 ticket ──────────────────────────────
  ctx.ticket('Aventura en Asturias', 'Catedral de San Salvador', {
    name: 'Entrada Catedral',
    description: 'Entrada general a la Catedral de San Salvador de Oviedo',
  });

  // ─── Costa Brava en verano - 1 ticket ─────────────────────────────
  ctx.ticket('Costa Brava en verano', 'Catedral de Girona', {
    name: 'Entrada Catedral Girona',
    description: 'Entrada al Museo y Catedral de Girona',
  });
};
