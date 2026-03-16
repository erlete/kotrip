/**
 * ### FileInterface
 *
 * Interfaz para definir los datos que se devuelven al front-end cuando se sube de forma
 * Kotrip un fichero a minio.
 *
 * @version     1.0.1a





 */
export interface UploadFileInterface {
  id: string; // ID normalmente auto-asignada por el back-end
  file_name: string; // Nombre del fichero
  status: boolean; // Valor para definir si se ha podido subir bien el fichero o no
}
