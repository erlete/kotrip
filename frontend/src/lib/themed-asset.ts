/**
 * Recurso visual con variantes para tema claro y oscuro.
 */
export type ThemedAsset = {
  light: string;
  dark: string;
};

/**
 * Opciones para construir un recurso tematico.
 *
 * Se puede especificar directamente las rutas light/dark,
 * o proporcionar un path base y un nombre de archivo para
 * generar las rutas automaticamente.
 */
type ThemedAssetOptions =
  | {
      light: string;
      dark?: string;
    }
  | {
      path: string;
      filename: string;
      extension?: string;
      darkFilename?: string;
      hasDarkVariant?: boolean;
    };

/**
 * Construye un objeto ThemedAsset con rutas para tema claro y oscuro.
 *
 * Si se pasan rutas directas (light/dark), las devuelve tal cual.
 * Si se pasa un path base con filename, genera las rutas siguiendo
 * la convencion `{path}/{filename}.{ext}` para claro y
 * `{path}/{filename}-dark.{ext}` para oscuro.
 *
 * @param options - Opciones de configuracion del recurso tematico.
 * @returns Objeto con rutas resuelta para cada tema.
 */
export function themedAsset(options: ThemedAssetOptions): ThemedAsset {
  if ('light' in options) {
    return {
      light: options.light,
      dark: options.dark ?? options.light,
    };
  }

  const {
    path,
    filename,
    extension = 'png',
    darkFilename,
    hasDarkVariant = true,
  } = options;

  const basePath = `/assets/${path}`;
  const light = `${basePath}/${filename}.${extension}`;
  const dark = hasDarkVariant
    ? `${basePath}/${darkFilename ?? `${filename}-dark`}.${extension}`
    : light;

  return { light, dark };
}
