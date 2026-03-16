/**
 * Custom Swagger plugin options.
 * Controls which plugins are enabled in the Swagger UI.
 */
export interface SwaggerLibPluginOptions {
  /**
   * Enable the auth plugin for quick user authentication in development.
   * Shows buttons to authenticate as any user in the database.
   *
   * **⚠️ Security Warning:** Only enabled in non-production environments.
   * Automatically disabled when NODE_ENV is 'production'.
   *
   * @default false
   */
  authPlugin: boolean;

  /**
   * Enable the collapse plugin for collapsing/expanding all endpoints.
   * Adds "Collapse All" and "Expand All" buttons to the UI.
   *
   * Note: This plugin is automatically included when authPlugin is enabled.
   *
   * @default false
   */
  collapsePlugin: boolean;
}

/**
 * Custom Swagger short-hand options.
 * Provides a simplified interface for configuring Swagger documentation.
 *
 * @example
 * ```typescript
 * const options: SwaggerLibOptions = {
 *   title: 'My API',
 *   description: 'API documentation',
 *   endpoint: 'api-docs',
 *   plugins: {
 *     authPlugin: true,
 *     collapsePlugin: true
 *   }
 * };
 * ```
 */
export interface SwaggerLibOptions {
  /**
   * Title displayed in the Swagger UI header.
   * @default 'Swagger Docs'
   */
  title?: string;

  /**
   * Description displayed in the Swagger UI header.
   * @default 'Swagger Docs'
   */
  description?: string;

  /**
   * URL endpoint where Swagger UI will be served.
   * Leading slashes are automatically removed.
   * @default 'docs'
   * @example 'api-docs' -> accessible at http://localhost:3000/api-docs
   */
  endpoint?: string;

  /**
   * Plugin configuration options.
   * Controls which Swagger UI plugins are enabled.
   */
  plugins: SwaggerLibPluginOptions;
}
