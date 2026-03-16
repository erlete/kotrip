/**
 * Re-exportación de la constante del bucket unificado de almacenamiento.
 *
 * Toda la plataforma utiliza un único bucket (`kotrip`) con paths jerárquicos
 * para organizar los archivos. Las funciones de construcción de paths se
 * encuentran centralizadas en el paquete `@kotrip/data`.
 *
 * @see {@link @kotrip/data} Paquete con constantes y path builders.
 */
export { KOTRIP_BUCKET } from '@kotrip/data';
