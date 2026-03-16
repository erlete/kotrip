/**
 * Modulo de la libreria Swagger de Kotrip.
 *
 * Proporciona una solucion para configurar la documentacion Swagger en la aplicacion NestJS.
 *
 * Funcionalidades principales:
 * - Configuracion sencilla con valores por defecto razonables.
 * - Autenticacion por token Bearer.
 * - Soporte de tema oscuro mediante CSS personalizado.
 * - Escaneo profundo de rutas para documentacion completa.
 *
 * Plugins:
 * - Auth Plugin: Botones de autenticacion rapida (solo en desarrollo).
 * - Collapse Plugin: Colapsar/expandir todos los endpoints.
 *
 * Seguridad:
 * - El plugin de autenticacion se desactiva automaticamente en produccion.
 *
 * @module @/lib/swagger
 *
 * @see {@link setup} Funcion principal de configuracion.
 * @see {@link SwaggerLibOptions} Opciones de configuracion.
 */

export * from './interfaces';
export * from './functions';
