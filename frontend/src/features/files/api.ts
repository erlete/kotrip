'use server';

import { authenticatedClient } from '@/lib/backend/client';
import { handleApiRequest } from '@/lib/fetch';

// ─────────────────────────────────────────────────────────────────────────────
// Subida de archivos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube un archivo al bucket especificado.
 *
 * @param bucket - Nombre del bucket donde subir el archivo.
 * @param file - Archivo a subir.
 * @param encrypt - Si se debe encriptar el archivo (por defecto false).
 * @returns Resultado con información del archivo subido o error.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  encrypt: boolean = false,
) {
  const formData = new FormData();
  formData.append('file', file);

  return handleApiRequest(() =>
    authenticatedClient.POST('/files/upload/{bucket}', {
      params: {
        path: { bucket },
        query: { encrypt },
      },
      body: { file: file.name },
      bodySerializer: () => formData as BodyInit,
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Descarga de archivos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Descarga un archivo por su ID de un bucket específico.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo a descargar.
 * @param decrypt - Si se debe desencriptar el archivo (por defecto false).
 * @returns Resultado con el archivo o error.
 */
export async function downloadFile(
  bucket: string,
  fileId: string,
  decrypt: boolean = false,
) {
  return handleApiRequest(() =>
    authenticatedClient.GET('/files/download/{bucket}/{id}', {
      params: {
        path: { bucket, id: fileId },
        query: { decrypt },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Eliminación de archivos
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elimina un archivo por su ID de un bucket específico.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo a eliminar.
 * @returns Confirmación de eliminación.
 */
export async function deleteFile(bucket: string, fileId: string) {
  return handleApiRequest(() =>
    authenticatedClient.DELETE('/files/delete/{bucket}/{id}', {
      params: {
        path: { bucket, id: fileId },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Listado y URLs
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lista todos los archivos del usuario en un bucket específico.
 *
 * @param bucket - Nombre del bucket.
 * @returns Lista de archivos.
 */
export async function listFiles(bucket: string) {
  return handleApiRequest(() =>
    authenticatedClient.GET('/files/get-all/{bucket}', {
      params: {
        path: { bucket },
      },
    }),
  );
}

/**
 * Genera una URL pública de descarga para un archivo.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo.
 * @returns URL de descarga.
 */
export async function generateFileUrl(bucket: string, fileId: string) {
  return handleApiRequest(() =>
    authenticatedClient.GET('/files/file-url/{bucket}/{id}', {
      params: {
        path: { bucket, id: fileId },
      },
    }),
  );
}

/**
 * Obtiene la lista de buckets disponibles.
 *
 * @returns Lista de buckets.
 */
export async function getAvailableBuckets() {
  return handleApiRequest(() =>
    authenticatedClient.GET('/files/enums/buckets', {}),
  );
}
