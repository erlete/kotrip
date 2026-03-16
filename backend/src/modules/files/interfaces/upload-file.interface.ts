/**
 * Interfaz de respuesta para la subida de un archivo a MinIO.
 *
 * Contiene el identificador del archivo, su nombre y el estado de la operacion.


 */
export interface UploadFileInterface {
  id: string; // ID normalmente auto-asignada por el back-end
  file_name: string; // Nombre del fichero
  status: boolean; // Valor para definir si se ha podido subir bien el fichero o no
}
