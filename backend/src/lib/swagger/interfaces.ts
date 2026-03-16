/**
 * Opciones de plugins personalizados de Swagger.
 * Controla que plugins se habilitan en la interfaz de Swagger UI.
 */
export interface SwaggerLibPluginOptions {
  /**
   * Habilita el plugin de autenticacion rapida en desarrollo.
   * Muestra botones para autenticarse como cualquier usuario de la base de datos.
   *
   * Aviso de seguridad: Solo se habilita en entornos no productivos.
   * Se desactiva automaticamente cuando NODE_ENV es 'production'.
   *
   * @default false
   */
  authPlugin: boolean;

  /**
   * Habilita el plugin de colapsar/expandir todos los endpoints.
   * Anade botones "Collapse All" y "Expand All" a la interfaz.
   *
   * Este plugin se incluye automaticamente cuando authPlugin esta habilitado.
   *
   * @default false
   */
  collapsePlugin: boolean;
}

/**
 * Opciones simplificadas para la configuracion de Swagger.
 *
 * Proporciona una interfaz abreviada para configurar la documentacion Swagger
 * de la aplicacion, incluyendo titulo, descripcion, ruta y plugins.
 */
export interface SwaggerLibOptions {
  /**
   * Titulo mostrado en la cabecera de Swagger UI.
   * @default 'Swagger Docs'
   */
  title?: string;

  /**
   * Descripcion mostrada en la cabecera de Swagger UI.
   * @default 'Swagger Docs'
   */
  description?: string;

  /**
   * Ruta del endpoint donde se sirve Swagger UI.
   * Las barras iniciales se eliminan automaticamente.
   * @default 'docs'
   */
  endpoint?: string;

  /**
   * Opciones de configuracion de plugins.
   * Controla que plugins de Swagger UI se habilitan.
   */
  plugins: SwaggerLibPluginOptions;
}
