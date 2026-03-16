/**
 * @file navigationRoute.ts
 * @description
 * Utilidad para determinar si una ruta de navegacion coincide
 * con la ruta actual o es una subruta de esta.
 */

/**
 * Determina si la ruta actual coincide exactamente con la ruta objetivo
 * o si es una subruta de esta.
 *
 * @param currentPath - Ruta actual del navegador.
 * @param targetPath - Ruta objetivo contra la que se compara.
 * @returns `true` si la ruta actual coincide o es una subruta de la objetivo.
 */
export const isActiveRoute = (currentPath: string, targetPath: string) => {
  // Eliminar posibles trailing slashes
  const normalizedCurrent = currentPath.replace(/\/$/, '');
  const normalizedTarget = targetPath.replace(/\/$/, '');

  // Caso para la ruta raíz
  if (normalizedTarget === '') return normalizedCurrent === '';

  // Verificar coincidencia exacta o subrutas
  return (
    normalizedCurrent === normalizedTarget ||
    normalizedCurrent.startsWith(`${normalizedTarget}/`)
  );
};
