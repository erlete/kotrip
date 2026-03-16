import { ActiveUser } from '@/common/decorators/active-user.decorator';
import { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { Auth } from '@/modules/auth/decorators/auth.decorator';
import { Role } from '@kotrip/data';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TripAuth } from './decorators/trip-auth.decorator';
import { ExpenseOutputDto } from './dto-outputs/expense.output.dto';
import { InvitationOutputDto } from './dto-outputs/invitation.output.dto';
import { ItineraryOutputDto } from './dto-outputs/itinerary.output.dto';
import { TicketOutputDto } from './dto-outputs/ticket.output.dto';
import { TripListOutputDto } from './dto-outputs/trip-list.output.dto';
import { TripMemberOutputDto } from './dto-outputs/trip-member.output.dto';
import { TripOutputDto } from './dto-outputs/trip.output.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { CreateItineraryStopDto } from './dto/create-itinerary-stop.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { CreateTripMemberDto } from './dto/create-trip-member.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { ReorderItineraryDto } from './dto/reorder-itinerary.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { UpdateItineraryStopDto } from './dto/update-itinerary-stop.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UpdateTripMemberDto } from './dto/update-trip-member.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripExpenseService } from './services/trip-expense.service';
import { TripInvitationService } from './services/trip-invitation.service';
import { TripItineraryService } from './services/trip-itinerary.service';
import { TripMemberService } from './services/trip-member.service';
import { TripTicketService } from './services/trip-ticket.service';
import { TripService } from './services/trip.service';

/**
 * Controlador principal del m\u00f3dulo de viajes.
 *
 * @remarks
 * Gestiona todos los endpoints relacionados con viajes, miembros,
 * invitaciones, itinerario, tickets y gastos.
 * Los endpoints est\u00e1n protegidos con autenticaci\u00f3n JWT y guards
 * espec\u00edficos de membres\u00eda y permisos del viaje.
 */
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'No autorizado.' })
@ApiTags('trip - Gesti\u00f3n de viajes')
@Controller('trip')
export class TripController {
  /**
   * @param tripService Servicio de gesti\u00f3n de viajes.
   * @param tripMemberService Servicio de gesti\u00f3n de miembros.
   * @param tripInvitationService Servicio de gesti\u00f3n de invitaciones.
   * @param tripItineraryService Servicio de gesti\u00f3n del itinerario.
   * @param tripTicketService Servicio de gesti\u00f3n de tickets.
   * @param tripExpenseService Servicio de gesti\u00f3n de gastos.
   */
  constructor(
    private readonly tripService: TripService,
    private readonly tripMemberService: TripMemberService,
    private readonly tripInvitationService: TripInvitationService,
    private readonly tripItineraryService: TripItineraryService,
    private readonly tripTicketService: TripTicketService,
    private readonly tripExpenseService: TripExpenseService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // region Trips
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea un nuevo viaje. El usuario autenticado se registra autom\u00e1ticamente como
   * miembro con todos los permisos.
   *
   * @param user Usuario autenticado.
   * @param dto Datos del viaje a crear.
   * @returns Detalle completo del viaje creado.
   */
  @Post()
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo viaje' })
  @ApiResponse({
    description: 'Viaje creado exitosamente',
    status: 201,
    type: TripOutputDto,
  })
  @ApiResponse({ description: 'Datos inv\u00e1lidos', status: 400 })
  async createTrip(
    @ActiveUser() user: UserActiveInterface,
    @Body() dto: CreateTripDto,
  ): Promise<TripOutputDto> {
    return await this.tripService.create(user.id, dto);
  }

  /**
   * Obtiene la lista de viajes del usuario autenticado.
   *
   * @param user Usuario autenticado.
   * @returns Lista simplificada de viajes.
   */
  @Get()
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Listar viajes del usuario autenticado' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: TripListOutputDto,
  })
  async findAllTrips(
    @ActiveUser() user: UserActiveInterface,
  ): Promise<TripListOutputDto[]> {
    return await this.tripService.findAllForUser(user.id);
  }

  // IMPORTANT: Static routes like /trip/invitation/mine MUST come BEFORE
  // parameterized routes like /trip/:id to avoid "invitation" being parsed as a UUID.

  // ─────────────────────────────────────────────────────────────────────────
  // region Invitations (static routes)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene las invitaciones pendientes del usuario autenticado.
   *
   * @param user Usuario autenticado.
   * @returns Lista de invitaciones pendientes.
   */
  @Get('invitation/mine')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Obtener mis invitaciones pendientes' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: InvitationOutputDto,
  })
  async findMyInvitations(
    @ActiveUser() user: UserActiveInterface,
  ): Promise<InvitationOutputDto[]> {
    return await this.tripInvitationService.findMyPending(user.id);
  }

  /**
   * Responde a una invitaci\u00f3n (aceptar o rechazar).
   *
   * @param invitationId Identificador de la invitaci\u00f3n.
   * @param user Usuario autenticado.
   * @param dto Respuesta a la invitaci\u00f3n.
   * @returns Detalle actualizado de la invitaci\u00f3n.
   */
  @Put('invitation/:invitationId')
  @Auth(Role.USER, Role.ADMIN)
  @ApiOperation({
    summary: 'Responder a una invitaci\u00f3n (aceptar/rechazar)',
  })
  @ApiParam({ description: 'UUID de la invitaci\u00f3n', name: 'invitationId' })
  @ApiResponse({
    description: 'Respuesta procesada exitosamente',
    status: 200,
    type: InvitationOutputDto,
  })
  @ApiResponse({ description: 'Invitaci\u00f3n no encontrada', status: 404 })
  @ApiResponse({ description: 'No autorizado para responder', status: 403 })
  async respondInvitation(
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @ActiveUser() user: UserActiveInterface,
    @Body() dto: RespondInvitationDto,
  ): Promise<InvitationOutputDto> {
    return await this.tripInvitationService.respond(
      invitationId,
      user.id,
      dto.accept,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Trip detail (parameterized :id routes)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene el detalle completo de un viaje.
   *
   * @param id Identificador del viaje.
   * @returns Detalle completo del viaje.
   */
  @Get(':id')
  @TripAuth()
  @ApiOperation({ summary: 'Obtener detalle de un viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    status: 200,
    type: TripOutputDto,
  })
  @ApiResponse({ description: 'No es miembro del viaje', status: 403 })
  async findOneTrip(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TripOutputDto> {
    return await this.tripService.findOne(id);
  }

  /**
   * Actualiza los datos de un viaje. Requiere permiso `canEditTrip`.
   *
   * @param id Identificador del viaje.
   * @param dto Campos a actualizar.
   * @returns Detalle actualizado del viaje.
   */
  @Put(':id')
  @TripAuth('canEditTrip')
  @ApiOperation({ summary: 'Actualizar un viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Viaje actualizado exitosamente',
    status: 200,
    type: TripOutputDto,
  })
  @ApiResponse({ description: 'Permiso denegado', status: 403 })
  async updateTrip(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
  ): Promise<TripOutputDto> {
    return await this.tripService.update(id, dto);
  }

  /**
   * Elimina un viaje de forma l\u00f3gica. Requiere permiso `canEditTrip`.
   *
   * @param id Identificador del viaje.
   */
  @Delete(':id')
  @TripAuth('canEditTrip')
  @ApiOperation({ summary: 'Eliminar un viaje (soft-delete)' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({ description: 'Viaje eliminado exitosamente', status: 200 })
  @ApiResponse({ description: 'Permiso denegado', status: 403 })
  async removeTrip(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.tripService.remove(id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Members
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene la lista de miembros de un viaje.
   *
   * @param id Identificador del viaje.
   * @returns Lista de miembros del viaje.
   */
  @Get(':id/member')
  @TripAuth()
  @ApiOperation({ summary: 'Listar miembros de un viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: TripMemberOutputDto,
  })
  async findAllMembers(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TripMemberOutputDto[]> {
    return await this.tripMemberService.findAllByTrip(id);
  }

  /**
   * A\u00f1ade un nuevo miembro a un viaje. Requiere permiso `canModifyMembers`.
   *
   * @param id Identificador del viaje.
   * @param dto Datos del miembro a a\u00f1adir.
   * @returns Informaci\u00f3n del miembro creado.
   */
  @Post(':id/member')
  @TripAuth('canModifyMembers')
  @ApiOperation({ summary: 'A\u00f1adir un miembro al viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Miembro a\u00f1adido exitosamente',
    status: 201,
    type: TripMemberOutputDto,
  })
  @ApiResponse({ description: 'Usuario ya es miembro', status: 409 })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTripMemberDto,
  ): Promise<TripMemberOutputDto> {
    return await this.tripMemberService.addMember(id, dto);
  }

  /**
   * Actualiza los permisos y/o rol de un miembro. Requiere permiso `canModifyMembers`.
   *
   * @param id Identificador del viaje.
   * @param memberId Identificador del miembro.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del miembro.
   */
  @Put(':id/member/:memberId')
  @TripAuth('canModifyMembers')
  @ApiOperation({ summary: 'Actualizar un miembro del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del miembro', name: 'memberId' })
  @ApiResponse({
    description: 'Miembro actualizado exitosamente',
    status: 200,
    type: TripMemberOutputDto,
  })
  async updateMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateTripMemberDto,
  ): Promise<TripMemberOutputDto> {
    return await this.tripMemberService.updateMember(memberId, dto);
  }

  /**
   * Elimina un miembro de un viaje. Requiere permiso `canModifyMembers`.
   *
   * @param id Identificador del viaje.
   * @param memberId Identificador del miembro.
   */
  @Delete(':id/member/:memberId')
  @TripAuth('canModifyMembers')
  @ApiOperation({ summary: 'Eliminar un miembro del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del miembro', name: 'memberId' })
  @ApiResponse({ description: 'Miembro eliminado exitosamente', status: 200 })
  async removeMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ): Promise<void> {
    return await this.tripMemberService.removeMember(memberId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Invitations (trip-scoped)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Env\u00eda una invitaci\u00f3n para unirse al viaje. Requiere permiso `canInviteMembers`.
   *
   * @param id Identificador del viaje.
   * @param user Usuario autenticado (emisor).
   * @param dto Datos de la invitaci\u00f3n.
   * @returns Detalle de la invitaci\u00f3n creada.
   */
  @Post(':id/invitation')
  @TripAuth('canInviteMembers')
  @ApiOperation({ summary: 'Enviar invitaci\u00f3n para unirse al viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Invitaci\u00f3n enviada exitosamente',
    status: 201,
    type: InvitationOutputDto,
  })
  @ApiResponse({
    description: 'No se puede invitar a s\u00ed mismo',
    status: 400,
  })
  @ApiResponse({
    description: 'Ya es miembro o invitaci\u00f3n pendiente',
    status: 409,
  })
  async createInvitation(
    @Param('id', ParseUUIDPipe) id: string,
    @ActiveUser() user: UserActiveInterface,
    @Body() dto: InviteMemberDto,
  ): Promise<InvitationOutputDto> {
    return await this.tripInvitationService.create(id, user.id, dto);
  }

  /**
   * Obtiene las invitaciones de un viaje.
   *
   * @param id Identificador del viaje.
   * @returns Lista de invitaciones del viaje.
   */
  @Get(':id/invitation')
  @TripAuth()
  @ApiOperation({ summary: 'Listar invitaciones del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: InvitationOutputDto,
  })
  async findAllInvitations(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InvitationOutputDto[]> {
    return await this.tripInvitationService.findAllByTrip(id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Itinerary
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * A\u00f1ade una nueva parada al itinerario. Requiere permiso `canEditDetails`.
   *
   * @param id Identificador del viaje.
   * @param dto Datos de la parada.
   * @returns Informaci\u00f3n de la parada creada.
   */
  @Post(':id/itinerary')
  @TripAuth('canEditDetails')
  @ApiOperation({ summary: 'A\u00f1adir parada al itinerario' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Parada creada exitosamente',
    status: 201,
    type: ItineraryOutputDto,
  })
  async addItineraryStop(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateItineraryStopDto,
  ): Promise<ItineraryOutputDto> {
    return await this.tripItineraryService.addStop(id, dto);
  }

  /**
   * Obtiene las paradas del itinerario de un viaje ordenadas.
   *
   * @param id Identificador del viaje.
   * @returns Lista de paradas ordenadas.
   */
  @Get(':id/itinerary')
  @TripAuth()
  @ApiOperation({ summary: 'Listar paradas del itinerario' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: ItineraryOutputDto,
  })
  async findAllItineraryStops(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ItineraryOutputDto[]> {
    return await this.tripItineraryService.findAllByTrip(id);
  }

  /**
   * Reordena las paradas del itinerario. Requiere permiso `canEditDetails`.
   *
   * @remarks
   * Esta ruta debe definirse ANTES de `:id/itinerary/:stopId` para evitar
   * que "reorder" se interprete como un UUID.
   *
   * @param id Identificador del viaje.
   * @param dto Array de UUIDs en el nuevo orden.
   */
  @Put(':id/itinerary/reorder')
  @TripAuth('canEditDetails')
  @ApiOperation({ summary: 'Reordenar paradas del itinerario' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Itinerario reordenado exitosamente',
    status: 200,
  })
  @ApiResponse({ description: 'Datos de reorden inv\u00e1lidos', status: 400 })
  async reorderItinerary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderItineraryDto,
  ): Promise<void> {
    return await this.tripItineraryService.reorder(id, dto.stopIds);
  }

  /**
   * Actualiza una parada del itinerario. Requiere permiso `canEditDetails`.
   *
   * @param id Identificador del viaje.
   * @param stopId Identificador de la parada.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada de la parada.
   */
  @Put(':id/itinerary/:stopId')
  @TripAuth('canEditDetails')
  @ApiOperation({ summary: 'Actualizar una parada del itinerario' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID de la parada', name: 'stopId' })
  @ApiResponse({
    description: 'Parada actualizada exitosamente',
    status: 200,
    type: ItineraryOutputDto,
  })
  async updateItineraryStop(
    @Param('stopId', ParseUUIDPipe) stopId: string,
    @Body() dto: UpdateItineraryStopDto,
  ): Promise<ItineraryOutputDto> {
    return await this.tripItineraryService.updateStop(stopId, dto);
  }

  /**
   * Elimina una parada del itinerario. Requiere permiso `canEditDetails`.
   *
   * @param id Identificador del viaje.
   * @param stopId Identificador de la parada.
   */
  @Delete(':id/itinerary/:stopId')
  @TripAuth('canEditDetails')
  @ApiOperation({ summary: 'Eliminar una parada del itinerario' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID de la parada', name: 'stopId' })
  @ApiResponse({ description: 'Parada eliminada exitosamente', status: 200 })
  async removeItineraryStop(
    @Param('stopId', ParseUUIDPipe) stopId: string,
  ): Promise<void> {
    return await this.tripItineraryService.removeStop(stopId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Tickets
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea un nuevo ticket asociado al viaje. Requiere permiso `canManageTickets`.
   *
   * @param id Identificador del viaje.
   * @param dto Datos del ticket.
   * @returns Informaci\u00f3n del ticket creado.
   */
  @Post(':id/ticket')
  @TripAuth('canManageTickets')
  @ApiOperation({ summary: 'Crear un ticket para el viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Ticket creado exitosamente',
    status: 201,
    type: TicketOutputDto,
  })
  async createTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTicketDto,
  ): Promise<TicketOutputDto> {
    return await this.tripTicketService.create(id, dto);
  }

  /**
   * Obtiene los tickets de un viaje.
   *
   * @param id Identificador del viaje.
   * @returns Lista de tickets del viaje.
   */
  @Get(':id/ticket')
  @TripAuth()
  @ApiOperation({ summary: 'Listar tickets del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: TicketOutputDto,
  })
  async findAllTickets(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TicketOutputDto[]> {
    return await this.tripTicketService.findAllByTrip(id);
  }

  /**
   * Actualiza un ticket existente. Requiere permiso `canManageTickets`.
   *
   * @param id Identificador del viaje.
   * @param ticketId Identificador del ticket.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del ticket.
   */
  @Put(':id/ticket/:ticketId')
  @TripAuth('canManageTickets')
  @ApiOperation({ summary: 'Actualizar un ticket del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del ticket', name: 'ticketId' })
  @ApiResponse({
    description: 'Ticket actualizado exitosamente',
    status: 200,
    type: TicketOutputDto,
  })
  async updateTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<TicketOutputDto> {
    return await this.tripTicketService.update(ticketId, dto);
  }

  /**
   * Elimina un ticket del viaje. Requiere permiso `canManageTickets`.
   *
   * @param id Identificador del viaje.
   * @param ticketId Identificador del ticket.
   */
  @Delete(':id/ticket/:ticketId')
  @TripAuth('canManageTickets')
  @ApiOperation({ summary: 'Eliminar un ticket del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del ticket', name: 'ticketId' })
  @ApiResponse({ description: 'Ticket eliminado exitosamente', status: 200 })
  async removeTicket(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
  ): Promise<void> {
    return await this.tripTicketService.remove(ticketId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // region Expenses
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea un nuevo gasto en el viaje. Requiere permiso `canEditBudget`.
   * El pagador se indica mediante `payerId` en el cuerpo de la petici\u00f3n.
   *
   * @param id Identificador del viaje.
   * @param dto Datos del gasto (incluye `payerId`).
   * @returns Informaci\u00f3n del gasto creado.
   */
  @Post(':id/expense')
  @TripAuth('canEditBudget')
  @ApiOperation({ summary: 'Crear un gasto en el viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Gasto creado exitosamente',
    status: 201,
    type: ExpenseOutputDto,
  })
  async createExpense(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateExpenseDto,
  ): Promise<ExpenseOutputDto> {
    return await this.tripExpenseService.create(id, dto);
  }

  /**
   * Obtiene los gastos de un viaje.
   *
   * @param id Identificador del viaje.
   * @returns Lista de gastos del viaje.
   */
  @Get(':id/expense')
  @TripAuth()
  @ApiOperation({ summary: 'Listar gastos del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiResponse({
    description: 'Consulta exitosa',
    isArray: true,
    status: 200,
    type: ExpenseOutputDto,
  })
  async findAllExpenses(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ExpenseOutputDto[]> {
    return await this.tripExpenseService.findAllByTrip(id);
  }

  /**
   * Actualiza un gasto existente. Requiere permiso `canEditBudget`.
   *
   * @param id Identificador del viaje.
   * @param expenseId Identificador del gasto.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del gasto.
   */
  @Put(':id/expense/:expenseId')
  @TripAuth('canEditBudget')
  @ApiOperation({ summary: 'Actualizar un gasto del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del gasto', name: 'expenseId' })
  @ApiResponse({
    description: 'Gasto actualizado exitosamente',
    status: 200,
    type: ExpenseOutputDto,
  })
  async updateExpense(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
    @Body() dto: UpdateExpenseDto,
  ): Promise<ExpenseOutputDto> {
    return await this.tripExpenseService.update(expenseId, dto);
  }

  /**
   * Elimina un gasto del viaje. Requiere permiso `canEditBudget`.
   *
   * @param id Identificador del viaje.
   * @param expenseId Identificador del gasto.
   */
  @Delete(':id/expense/:expenseId')
  @TripAuth('canEditBudget')
  @ApiOperation({ summary: 'Eliminar un gasto del viaje' })
  @ApiParam({ description: 'UUID del viaje', name: 'id' })
  @ApiParam({ description: 'UUID del gasto', name: 'expenseId' })
  @ApiResponse({ description: 'Gasto eliminado exitosamente', status: 200 })
  async removeExpense(
    @Param('expenseId', ParseUUIDPipe) expenseId: string,
  ): Promise<void> {
    return await this.tripExpenseService.remove(expenseId);
  }
}
