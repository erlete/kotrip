/**
 * ### DeleteFileInterface
 *
 * Interfaz para definir los datos que se devuelven al front-end a la hora de borrar
 * un fichero de minio
 *
 * @version     1.0.1a





 */
export interface DeleteFileInterface {
  id: string; // ID del fichero borrado
  status: boolean; // True si se logra borrar, False si no
}
