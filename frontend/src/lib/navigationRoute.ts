/**
 * @file navigationRoute.ts
 * @description
 * -----------------------------------------------------
 * Archivo que contiene la función para comparar rutas y subrutas
 * -----------------------------------------------------
 * @version 0.0.1a
 * @created 2024-12-19



 * */

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
