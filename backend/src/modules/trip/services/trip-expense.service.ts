import { ErrorManager } from '@/common/error-handling/error.manager';
import { User } from '@/modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from 'src/i18n/generated/i18n.generated';
import { In, Repository } from 'typeorm';
import { ExpenseOutputDto } from '../dto-outputs/expense.output.dto';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { Expense } from '../entities/expense.entity';
import { TripItinerary } from '../entities/trip-itinerary.entity';
import { TripMember } from '../entities/trip-member.entity';

/**
 * Servicio para la gesti\u00f3n de gastos de un viaje.
 *
 * @remarks
 * Proporciona operaciones CRUD sobre la entidad `Expense`, gestionando
 * las relaciones con el pagador (`payer`) y los beneficiarios (`payees`).
 * El pagador es siempre el usuario autenticado que crea el gasto.
 */
@Injectable()
export class TripExpenseService {
  /**
   * @param expenseRepository Repositorio de gastos.
   * @param userRepository Repositorio de usuarios.
   * @param memberRepository Repositorio de miembros de viaje.
   * @param i18n Servicio de internacionalizaci\u00f3n.
   */
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TripMember)
    private readonly memberRepository: Repository<TripMember>,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {}

  /**
   * Crea un nuevo gasto dentro de un viaje.
   *
   * @remarks
   * El pagador se indica mediante `dto.payerId`.
   *
   * @param tripId Identificador del viaje.
   * @param dto Datos del gasto a crear (incluye `payerId`).
   * @returns Informaci\u00f3n del gasto creado.
   */
  async create(
    tripId: string,
    dto: CreateExpenseDto,
  ): Promise<ExpenseOutputDto> {
    try {
      const payerMember = await this.memberRepository.findOne({
        where: { trip: { id: tripId }, user: { id: dto.payerId } },
        relations: ['user'],
      });

      if (!payerMember) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
        );
      }

      const payees = await this.userRepository.find({
        where: { id: In(dto.payeeIds) },
      });

      if (payees.length !== dto.payeeIds.length) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
        );
      }

      const expense = this.expenseRepository.create({
        paidAt: new Date(dto.paidAt),
        quantity: dto.quantity,
        payer: { id: dto.payerId },
        payees,
        trip: { id: tripId },
        tripItinerary: dto.tripItineraryId ? { id: dto.tripItineraryId } : null,
      });

      const saved = await this.expenseRepository.save(expense);
      const loaded = await this.expenseRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ['payer', 'payees', 'tripItinerary'],
      });

      return this.mapToOutput(loaded);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Obtiene todos los gastos de un viaje.
   *
   * @param tripId Identificador del viaje.
   * @returns Lista de gastos del viaje.
   */
  async findAllByTrip(tripId: string): Promise<ExpenseOutputDto[]> {
    try {
      const expenses = await this.expenseRepository.find({
        where: { trip: { id: tripId } },
        relations: ['payer', 'payees', 'tripItinerary'],
        order: { paidAt: 'DESC' },
      });

      return expenses.map((e) => this.mapToOutput(e));
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Actualiza los datos de un gasto existente.
   *
   * @param expenseId Identificador del gasto a actualizar.
   * @param dto Campos a actualizar.
   * @returns Informaci\u00f3n actualizada del gasto.
   */
  async update(
    expenseId: string,
    dto: UpdateExpenseDto,
  ): Promise<ExpenseOutputDto> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: expenseId },
        relations: ['payer', 'payees', 'tripItinerary', 'trip'],
      });

      if (!expense) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.EXPENSE_NOT_FOUND' as any),
        );
      }

      if (dto.paidAt !== undefined) expense.paidAt = new Date(dto.paidAt);
      if (dto.quantity !== undefined) expense.quantity = dto.quantity;

      if (dto.payerId !== undefined) {
        const payerMember = await this.memberRepository.findOne({
          where: {
            trip: { id: expense.trip?.id },
            user: { id: dto.payerId },
          },
          relations: ['user'],
        });

        if (!payerMember) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
          );
        }

        expense.payer = payerMember.user;
      }

      if (dto.tripItineraryId !== undefined) {
        expense.tripItinerary = dto.tripItineraryId
          ? ({ id: dto.tripItineraryId } as TripItinerary)
          : null;
      }

      if (dto.payeeIds !== undefined) {
        const payees = await this.userRepository.find({
          where: { id: In(dto.payeeIds) },
        });

        if (payees.length !== dto.payeeIds.length) {
          throw new ErrorManager(
            'NOT_FOUND',
            this.i18n.t('error.TRIP.USER_NOT_FOUND' as any),
          );
        }

        expense.payees = payees;
      }

      const saved = await this.expenseRepository.save(expense);
      const loaded = await this.expenseRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ['payer', 'payees', 'tripItinerary'],
      });

      return this.mapToOutput(loaded);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Elimina un gasto de forma l\u00f3gica (soft-delete).
   *
   * @param expenseId Identificador del gasto a eliminar.
   */
  async remove(expenseId: string): Promise<void> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: expenseId },
      });

      if (!expense) {
        throw new ErrorManager(
          'NOT_FOUND',
          this.i18n.t('error.TRIP.EXPENSE_NOT_FOUND' as any),
        );
      }

      await this.expenseRepository.softRemove(expense);
    } catch (error) {
      ErrorManager.normalize(error);
    }
  }

  /**
   * Mapea una entidad `Expense` al DTO de salida.
   *
   * @param expense Entidad del gasto.
   * @returns DTO de salida del gasto.
   */
  private mapToOutput(expense: Expense): ExpenseOutputDto {
    return {
      id: expense.id,
      paidAt: expense.paidAt,
      quantity: expense.quantity,
      payer: {
        id: expense.payer.id,
        firstName: expense.payer.firstName,
        lastName: expense.payer.lastName,
        email: expense.payer.email,
      },
      payees: expense.payees.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
      })),
      tripItineraryId: expense.tripItinerary?.id ?? null,
      createdAt: expense.createdAt,
    };
  }
}
