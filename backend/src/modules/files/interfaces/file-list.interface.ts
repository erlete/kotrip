/**
 * Interfaz que define la estructura de un elemento del listado de archivos en MinIO.
 *
 * Representa tanto archivos como directorios, incluyendo identificador,
 * nombre, fecha de subida, tamano y ruta completa.


 */
export interface FileListInterface {
  id: string; // ID normalmente auto-asignada por el back-end
  file_name: null | string; // Nombre del fichero
  upload_date: Date | null; // Fecha en que se subió el archivo a minio (null para directorios)
  size: number; // Tamaño del archivo
  path: string; // Ruta completa del archivo o fichero
  isDirectory: boolean; // Si es un directorio o no
}
