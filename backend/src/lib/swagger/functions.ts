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
 * Configura la documentacion Swagger para la aplicacion NestJS.
 *
 * Inicializa Swagger UI con opciones personalizables: titulo, descripcion,
 * autenticacion Bearer, plugins (auth y collapse), tema oscuro CSS y ruta del endpoint.
 *
 * Aplica automaticamente ordenacion alfabetica de operaciones y tags,
 * esquema de autenticacion Bearer y escaneo profundo de rutas.
 *
 * @param app - Instancia de la aplicacion NestJS a configurar.
 * @param options - Opciones de configuracion de Swagger.
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
