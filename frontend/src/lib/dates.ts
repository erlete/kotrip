/**
 * Formatea un objeto Date al string esperado por input[type="datetime-local"]
 * usando la hora local del navegador (YYYY-MM-DDTHH:mm).
 *
 * @param date - Fecha a formatear.
 * @returns Cadena en formato datetime-local o cadena vacía si la fecha es inválida.
 */
export function toDatetimeLocalString(date: Date): string {
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
