/**
 * Interfaz de respuesta para la eliminacion de un archivo de MinIO.
 *
 * Contiene el identificador del archivo eliminado y el estado de la operacion.


 */
export interface DeleteFileInterface {
  id: string; // ID del fichero borrado
  status: boolean; // True si se logra borrar, False si no
}
