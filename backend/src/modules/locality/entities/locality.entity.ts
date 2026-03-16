import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad Locality (Localidad).
 *
 * Tabla de referencia con los municipios de España, pre-cargada a partir
 * de los datos oficiales del INE (Instituto Nacional de Estadística).
 *
 * @remarks
 * Naturaleza de la tabla:
 * - Es una tabla de referencia de solo lectura (no extiende `CUDTzEntity`).
 * - Utiliza clave primaria auto-incremental (no UUID) por ser datos de referencia.
 * - Contiene aproximadamente 8.131 municipios.
 *
 * Uso:
 * - Se utiliza para asociar viajes a un destino concreto mediante autocompletado.
 * - Cargada al inicio por el seeder de localidades.
 *
 * Fuente de datos:
 * - INE: Relación de municipios y sus códigos.
 * - Los datos se actualizan anualmente con cada publicación del INE.
 *
 * @see Trip Entidad que referencia opcionalmente a una localidad.
 */
@Entity({
  comment: 'Municipios de España (datos de referencia del INE)',
  name: 'locality',
})
@Index('idx_locality_name', ['name'])
@Index('idx_locality_province', ['province'])
export class Locality {
  // #region Primary Key

  /**
   * Identificador auto-incremental del municipio.
   *
   * @remarks
   * No se usa UUID por tratarse de datos de referencia estáticos.
   */
  @PrimaryGeneratedColumn('increment', {
    comment: 'Identificador auto-incremental del municipio',
    name: 'id',
  })
  id: number;

  // #endregion

  // #region Columns

  /**
   * Nombre del municipio.
   *
   * @remarks Ej. "Vigo", "Madrid", "Ourense".
   */
  @Column({
    comment: 'Nombre del municipio',
    length: 200,
    name: 'name',
    type: 'varchar',
  })
  name: string;

  /**
   * Nombre de la provincia a la que pertenece el municipio.
   *
   * @remarks Ej. "Pontevedra", "Madrid", "Ourense".
   */
  @Column({
    comment: 'Provincia a la que pertenece el municipio',
    length: 100,
    name: 'province',
    type: 'varchar',
  })
  province: string;

  /**
   * Nombre de la comunidad autónoma a la que pertenece el municipio.
   *
   * @remarks Ej. "Galicia", "Comunidad de Madrid", "Castilla y León".
   */
  @Column({
    comment: 'Comunidad autónoma a la que pertenece el municipio',
    length: 100,
    name: 'autonomous_community',
    type: 'varchar',
  })
  autonomousCommunity: string;

  // #endregion
}
