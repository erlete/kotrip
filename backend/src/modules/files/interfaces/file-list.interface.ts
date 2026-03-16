/**
 * ### FileInterface
 *
 * Interfaz para definir los datos que se devuelven al front-end y ocultar o encapsular datos de la
 * lista de ficheros que tiene un usuario almacenados en minio dentro de un bucket. Estos datos
 * están relacionados con los datos que tienen los archivos, si se modifican dichos datos, se debe
 * modificar esta interfaz para devolverlos.
 *
 * @version     1.0.1a





 */
export interface FileListInterface {
  id: string; // ID normalmente auto-asignada por el back-end
  file_name: null | string; // Nombre del fichero
  upload_date: Date | null; // Fecha en que se subió el archivo a minio (null para directorios)
  size: number; // Tamaño del archivo
  path: string; // Ruta completa del archivo o fichero
  isDirectory: boolean; // Si es un directorio o no
}
