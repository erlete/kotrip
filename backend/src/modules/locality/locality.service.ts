import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Locality } from './entities/locality.entity';

/**
 * Servicio de localidades.
 *
 * Proporciona operaciones de solo lectura sobre la tabla de municipios
 * de Espana, cargada a partir de los datos oficiales del INE.
 *
 * @remarks
 * Este servicio se utiliza principalmente para alimentar el autocompletado
 * de localidades en el frontend.
 */
@Injectable()
export class LocalityService {
  constructor(
    @InjectRepository(Locality)
    private readonly localityRepository: Repository<Locality>,
  ) {}

  /**
   * Busca localidades cuyo nombre comience por el prefijo indicado.
   *
   * La busqueda es insensible a mayusculas/minusculas y se ordena
   * alfabeticamente por nombre.
   *
   * @param search  Prefijo por el que filtrar el nombre del municipio.
   * @param limit   Numero maximo de resultados a devolver (por defecto 10, maximo 50).
   * @returns       Lista de localidades que coinciden con el prefijo.
   */
  async findByNamePrefix(
    search: string,
    limit: number = 10,
  ): Promise<Locality[]> {
    const effectiveLimit = Math.min(Math.max(limit, 1), 50);

    return this.localityRepository.find({
      where: { name: ILike(`${search}%`) },
      order: { name: 'ASC' },
      take: effectiveLimit,
    });
  }
}
