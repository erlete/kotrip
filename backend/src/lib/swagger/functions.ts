import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Logger } from '@nestjs/common';
import type { NestApplication } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';
import type { SwaggerLibOptions } from './interfaces';
import { setup as authPluginSetup } from './plugins/auth.plugin';
import { CollapsePlugin } from './plugins/collapse.plugin';

const logger = new Logger('SwaggerLib');

/**
 * Set up Swagger documentation for a NestJS application.
 *
 * This function configures and initializes Swagger UI with customizable options including:
 * - Custom title and description
 * - Bearer token authentication
 * - Custom plugins (auth and collapse)
 * - Dark theme CSS styling
 * - Custom endpoint path
 *
 * The function automatically applies:
 * - Alphabetical sorting for operations and tags
 * - Bearer authentication scheme
 * - Custom CSS styles if available
 * - Deep route scanning for comprehensive documentation
 *
 * @param {NestApplication | NestFastifyApplication} app - The NestJS application instance to configure
 * @param {SwaggerLibOptions} [options] - Configuration options for Swagger setup
 * @param {string} [options.title='Swagger Docs'] - Title for the API documentation
 * @param {string} [options.description='Swagger Docs'] - Description for the API documentation
 * @param {string} [options.endpoint='docs'] - URL path where Swagger UI will be accessible
 * @param {SwaggerLibPluginOptions} options.plugins - Plugin configuration
 * @param {boolean} options.plugins.authPlugin - Enable auth plugin (auto-disabled in production)
 * @param {boolean} options.plugins.collapsePlugin - Enable collapse/expand all buttons
 * @returns {Promise<void>} Resolves when Swagger setup is complete
 *
 * @example
 * ```typescript
 * import { setup } from '@/lib/swagger';
 *
 * // Basic setup with defaults
 * await setup(app);
 *
 * // Custom configuration
 * await setup(app, {
 *   title: 'My API Documentation',
 *   description: 'Comprehensive API docs for My Application',
 *   endpoint: 'api-docs',
 *   plugins: {
 *     authPlugin: true,  // Shows auth buttons in dev/staging
 *     collapsePlugin: true  // Shows collapse/expand buttons
 *   }
 * });
 * ```
 *
 * @throws {Error} If CSS file path is invalid (logs warning instead of throwing)
 */
export async function setup(
  app: NestApplication | NestFastifyApplication,
  options?: SwaggerLibOptions,
): Promise<void> {
  // Document build and options:
  const docBuilder = new DocumentBuilder()
    .setTitle(options?.title ?? 'Swagger Docs')
    .setDescription(options?.description ?? 'Swagger Docs')
    .addBearerAuth({
      bearerFormat: 'Bearer',
      in: 'Header',
      name: 'Authorization',
      scheme: 'Bearer',
      type: 'http',
    });
  const docConfig = docBuilder.build();
  const uiOptions: SwaggerUiOptions = {
    operationsSorter: 'alpha',
    tagsSorter: 'alpha',
  };

  // Initialize plugins array
  const pluginsArray: unknown[] = [];

  // Plugins application (MUST be done before creating the document):
  if (options?.plugins?.authPlugin) {
    await authPluginSetup(app, docBuilder, uiOptions);
  }

  // Add collapse plugin if enabled (independently or will be added by auth plugin)
  if (options?.plugins?.collapsePlugin && !options?.plugins?.authPlugin) {
    pluginsArray.push(CollapsePlugin);
    uiOptions['plugins'] = pluginsArray;
  }

  // CSS styles application:
  const cssPath = resolve('src/lib/swagger/css/swagger-dark.css');
  let customCss = undefined;
  if (existsSync(cssPath)) {
    customCss = readFileSync(cssPath, 'utf8');
  } else {
    logger.warn(
      `The provided CSS path for Swagger UI was not found at "${cssPath}"`,
    );
  }

  // Document build (MUST be done AFTER plugins to include extensions):
  const document = SwaggerModule.createDocument(app, docBuilder.build(), {
    deepScanRoutes: true,
  });

  // Sanitize and safeguard endpoint:
  let endpoint = options?.endpoint ?? 'docs';
  endpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  SwaggerModule.setup(endpoint, app, document, {
    ...(customCss ? { customCss: customCss } : {}),
    swaggerOptions: uiOptions,
  });
}
