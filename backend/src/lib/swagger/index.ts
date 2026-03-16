/**
 * Swagger Library Module
 *
 * This library provides a comprehensive solution for setting up and configuring
 * Swagger documentation in NestJS applications. It includes:
 *
 * **Core Features:**
 * - Easy setup with sensible defaults
 * - Bearer token authentication
 * - Custom styling with dark theme support
 * - Deep route scanning for complete documentation
 *
 * **Plugins:**
 * - **Auth Plugin**: Quick user authentication buttons (development only)
 * - **Collapse Plugin**: Collapse/expand all endpoints
 *
 * **Security:**
 * - Auth plugin automatically disabled in production
 * - Only exposes user credentials in non-production environments
 *
 * @module @/lib/swagger
 * @version 1.0.0




 *
 * @example
 * ```typescript
 * import { setup } from '@/lib/swagger';
 *
 * // In your main.ts or bootstrap function
 * await setup(app, {
 *   title: 'My API',
 *   description: 'API Documentation',
 *   endpoint: 'docs',
 *   plugins: {
 *     authPlugin: true,
 *     collapsePlugin: true
 *   }
 * });
 *
 * // Access at: http://localhost:3000/docs
 * ```
 *
 * @see {@link setup} for main configuration function
 * @see {@link SwaggerLibOptions} for configuration options
 * @see {@link ./plugins/auth.plugin.ts} for auth plugin details
 * @see {@link ./plugins/collapse.plugin.ts} for collapse plugin details
 */

export * from './interfaces';
export * from './functions';
