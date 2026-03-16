/**
 * Utilidades cliente para la descarga de tickets.
 *
 * Solo contiene la lógica de descarga en el navegador.
 * La obtención de URLs pre-firmadas se realiza mediante
 * la acción de servidor `getTicketDownloadUrl` en `trips-api.ts`.
 */

/**
 * Desencadena la descarga de un archivo en el navegador.
 *
 * @param url URL del archivo a descargar.
 * @param fileName Nombre sugerido para el archivo descargado.
 */
export function triggerBrowserDownload(url: string, fileName: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
