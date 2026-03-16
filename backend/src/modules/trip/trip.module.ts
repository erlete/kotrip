import { Locality } from '@/modules/locality/entities/locality.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { TripItineraryTicket } from './entities/trip-itinerary-ticket.entity';
import { TripItinerary } from './entities/trip-itinerary.entity';
import { TripMemberInvitation } from './entities/trip-member-invitation.entity';
import { TripMember } from './entities/trip-member.entity';
import { Trip } from './entities/trip.entity';
import { TripMemberGuard } from './guard/trip-member.guard';
import { TripPermissionGuard } from './guard/trip-permission.guard';
import { TripExpenseService } from './services/trip-expense.service';
import { TripInvitationService } from './services/trip-invitation.service';
import { TripItineraryService } from './services/trip-itinerary.service';
import { TripMemberService } from './services/trip-member.service';
import { TripTicketService } from './services/trip-ticket.service';
import { TripService } from './services/trip.service';
import { TripController } from './trip.controller';

/**
 * M\u00f3dulo principal de gesti\u00f3n de viajes.
 *
 * @remarks
 * Registra todas las entidades, servicios, guards y el controlador
 * necesarios para la gesti\u00f3n completa de viajes: CRUD de viajes,
 * miembros, invitaciones, itinerario, tickets y gastos.
 *
 * @see TripController Controlador con todos los endpoints del m\u00f3dulo.
 * @see TripService Servicio principal de gesti\u00f3n de viajes.
 */
@Module({
  controllers: [TripController],
  exports: [TypeOrmModule],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: configService.getOrThrow<boolean>('JWT_GLOBAL'),
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRATION') as any,
        },
      }),
    }),
    TypeOrmModule.forFeature([
      Trip,
      TripMember,
      TripMemberInvitation,
      TripItinerary,
      TripItineraryTicket,
      Expense,
      User,
      Locality,
    ]),
  ],
  providers: [
    TripService,
    TripMemberService,
    TripInvitationService,
    TripItineraryService,
    TripTicketService,
    TripExpenseService,
    TripMemberGuard,
    TripPermissionGuard,
  ],
})
export class TripModule {}
