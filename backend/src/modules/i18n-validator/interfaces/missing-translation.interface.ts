/**
 * Interfaz que define la estructura de una traducción faltante
 * Contiene información sobre dónde se encontró la clave y qué idiomas no la tienen
 */
interface MissingTranslation {
  key: string; // La clave de traducción faltante (ej: 'error.USER.NOT_FOUND')
  file: string; // El archivo donde se encontró la llamada
  line: number; // El número de línea donde aparece la llamada
  missingLanguages: string[]; // Array de idiomas que no tienen esta traducción
}
