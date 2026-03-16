'use server';

import { revalidatePath } from 'next/cache';
import {
  deleteFile,
  downloadFile,
  generateFileUrl,
  getAvailableBuckets,
  listFiles,
  uploadFile,
} from './api';

// ─────────────────────────────────────────────────────────────────────────────
// Acciones de lectura
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene la lista de archivos del usuario en un bucket.
 *
 * @param bucket - Nombre del bucket.
 */
export async function getFiles(bucket: string) {
  return listFiles(bucket);
}

/**
 * Obtiene la lista de buckets disponibles.
 */
export async function getBuckets() {
  return getAvailableBuckets();
}

// ─────────────────────────────────────────────────────────────────────────────
// Acciones de subida
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interfaz de estado para formularios de subida.
 */
export interface FileUploadState {
  error?: string;
  success?: boolean;
  fileId?: string;
  bucket?: string;
}

/**
 * Server Action para subir un archivo.
 *
 * @param bucket - Nombre del bucket donde subir.
 * @param file - Archivo a subir.
 * @param encrypt - Si se debe encriptar el archivo.
 * @returns Resultado de la operación.
 */
export async function uploadFileAction(
  bucket: string,
  file: File,
  encrypt?: boolean,
) {
  const result = await uploadFile(bucket, file, encrypt);

  if (result.success) {
    revalidatePath('/files');
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Acciones de descarga
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server Action para descargar un archivo.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo.
 * @param decrypt - Si se debe desencriptar el archivo.
 * @returns Resultado con el archivo o error.
 */
export async function downloadFileAction(
  bucket: string,
  fileId: string,
  decrypt?: boolean,
) {
  return downloadFile(bucket, fileId, decrypt);
}

/**
 * Server Action para generar una URL pública de descarga.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo.
 * @returns Resultado con la URL o error.
 */
export async function generateFileUrlAction(bucket: string, fileId: string) {
  return generateFileUrl(bucket, fileId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Acciones de eliminación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server Action para eliminar un archivo.
 *
 * @param bucket - Nombre del bucket.
 * @param fileId - ID del archivo a eliminar.
 * @returns Resultado de la operación.
 */
export async function deleteFileAction(bucket: string, fileId: string) {
  const result = await deleteFile(bucket, fileId);

  if (result.success) {
    revalidatePath('/files');
  }

  return result;
}
