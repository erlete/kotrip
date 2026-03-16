import { EndpointLogInterceptor } from '@/common/interceptors/endpoints-log.interceptor';
import type { UserActiveInterface } from '@/common/interfaces/user-active.interface';
import { User as UserEntity } from '@/user/entities/user.entity';
import type { Role } from '@kotrip/data';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestApplication } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { DocumentBuilder } from '@nestjs/swagger';
import type { SwaggerUiOptions } from '@nestjs/swagger/dist/interfaces/swagger-ui-options.interface';
import type { Repository } from 'typeorm';
import { CollapsePlugin } from './collapse.plugin';

/**
 * Estructura de datos inmutable tipo mapa utilizada por Swagger UI.
 * Proporciona acceso tipado a valores de configuracion.
 */
interface ImmutableMapLike {
  /**
   * Obtiene un valor del mapa por su clave.
   * @template T - Tipo esperado del valor.
   * @param {string} key - Clave a buscar.
   * @returns {T} Valor asociado a la clave.
   */
  get<T = unknown>(key: string): T;
}

/**
 * Estructura de datos inmutable tipo lista utilizada por Swagger UI.
 * @template T - Tipo de los elementos de la lista.
 */
interface ImmutableListLike<T extends ImmutableMapLike = ImmutableMapLike> {
  /**
   * Convierte la lista a un array estandar de JavaScript.
   * @returns {T[]} Array de elementos.
   */
  toArray(): T[];
  /**
   * Itera sobre cada elemento de la lista.
   * @param {Function} callback - Funcion a ejecutar por cada elemento.
   */
  forEach(callback: (value: T, key: string) => void): void;
}

/**
 * Coleccion inmutable tipo mapa utilizada por Swagger UI.
 * Combina funcionalidad de lista y de mapa.
 * @template T - Tipo de los elementos de la coleccion.
 */
interface ImmutableMapCollection<
  T extends ImmutableMapLike = ImmutableMapLike,
> extends ImmutableListLike<T> {
  /**
   * Obtiene un elemento de la coleccion por su clave.
   * @param {string} key - Clave a buscar.
   * @returns {T} Elemento asociado a la clave.
   */
  get(key: string): T;
}

/**
 * Interfaz similar a React proporcionada por Swagger UI para crear elementos de interfaz.
 * Replica un subconjunto de la API de React para el desarrollo de plugins.
 */
interface ReactLike {
  /**
   * Crea un elemento React (similar a React.createElement).
   * @param {...unknown[]} args - Tipo de elemento, props e hijos.
   * @returns {unknown} Un elemento React.
   */
  createElement: (...args: unknown[]) => unknown;
  /**
   * Hook useState de React para gestionar el estado del componente.
   * @template T - Tipo del valor del estado.
   * @param {T} initial - Valor inicial del estado.
   * @returns {[T, Function]} Tupla con el estado actual y la funcion setter.
   */
  useState<T>(initial: T): [T, (value: ((previous: T) => T) | T) => void];
}

/**
 * Representa una funcion componente de Swagger UI.
 */
type SwaggerComponent = (props: Record<string, unknown>) => unknown;

/**
 * Objeto del sistema de Swagger UI que se pasa a los plugins.
 * Proporciona acceso a selectores, acciones y React para construir interfaz personalizada.
 */
interface SwaggerSystem {
  /** Selectores para acceder a datos de la especificacion Swagger. */
  specSelectors: {
    /**
     * Recupera los tokens personalizados de la especificacion Swagger.
     * @returns {ImmutableListLike | undefined} Lista de tokens o undefined.
     */
    customTokens(): ImmutableListLike | undefined;
    /**
     * Recupera las definiciones de seguridad de la especificacion Swagger.
     * @returns {ImmutableMapCollection} Coleccion de definiciones de seguridad.
     */
    securityDefinitions(): ImmutableMapCollection;
  };
  /** Selectores para acceder al estado de autorizacion. */
  authSelectors: {
    /**
     * Recupera los esquemas de autorizacion actuales.
     * @returns {ImmutableMapCollection} Coleccion de esquemas autorizados.
     */
    authorized(): ImmutableMapCollection;
  };
  /** Acciones para gestionar la autorizacion. */
  authActions: {
    /**
     * Autoriza con la configuracion proporcionada y la persiste.
     * @param auth - Configuracion de autorizacion.
     */
    authorizeWithPersistOption(
      auth: Record<string, { schema: unknown; value: string }>,
    ): void;
    /**
     * Configura la autorizacion sin persistirla.
     * @param auth - Configuracion de autorizacion.
     */
    configureAuth(
      auth: Record<string, { schema: unknown; value: string }>,
    ): void;
  };
  /** Interfaz tipo React para crear elementos de interfaz. */
  React: ReactLike;
}

/**
 * Estructura de informacion de token utilizada por el plugin de autenticacion.
 */
type TokenInfo = {
  /** Nombre a mostrar en el boton del token. */
  name: string;
  /** Rol del usuario asociado al token. */
  role: Role;
  /** Cadena del token JWT. */
  token: string;
};

/**
 * Payload JWT decodificado con propiedades calculadas adicionales.
 */
type DecodedTokenPayload = Record<string, unknown> & {
  /** Timestamp de expiracion del token (Unix time). */
  exp?: number;
  /** Segundos restantes hasta la expiracion del token. */
  expiresIn?: number;
  /** Timestamp de emision del token (Unix time). */
  iat?: number;
  /** Indica si el token ha expirado. */
  isExpired?: boolean;
  /** Cadena ISO de cuando fue emitido el token. */
  issuedAt?: string;
};

/**
 * Plugin de Swagger para autorizacion JWT mediante botones de usuario.
 *
 * Toma los tokens de la extension `x-custom-tokens` de la especificacion Swagger
 * y genera botones de autenticacion rapida para cada usuario disponible.
 * La funcion `buildAuthTokensSwagger` define la estructura de los tokens.




 * @see         [pluginApi](https://swagger.io/docs/open-source-tools/swagger-ui/customization/plugin-api/)
 */
export const AuthPlugin = {
  statePlugins: {
    spec: {
      selectors: {
        customTokens: (state: ImmutableMapLike) => {
          const spec = state.get<ImmutableMapLike | undefined>('json');
          if (!spec) {
            return undefined;
          }
          return spec.get<ImmutableListLike | undefined>('x-custom-tokens');
        },
      },
    },
  },
  wrapComponents: {
    authorizeBtn:
      (Original: SwaggerComponent, system: SwaggerSystem) =>
      (props: Record<string, unknown>) => {
        const decodeJWT = (token: string): DecodedTokenPayload | null => {
          try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;

            const base64Url = parts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(
              window.atob(base64),
            ) as DecodedTokenPayload;

            const currentTime = Math.floor(Date.now() / 1000);

            if (typeof payload.exp === 'number') {
              payload.isExpired = payload.exp < currentTime;
              payload.expiresIn = payload.isExpired
                ? 0
                : payload.exp - currentTime;
            }

            if (typeof payload.iat === 'number') {
              payload.issuedAt = new Date(payload.iat * 1000).toISOString();
            }

            return payload;
          } catch {
            return null;
          }
        };

        const tokensCollection = system.specSelectors.customTokens();
        const tokensArray = tokensCollection?.toArray?.() ?? [];
        const tokensParsed = tokensArray.reduce<TokenInfo[]>(
          (acc, tokenMap) => {
            const name = tokenMap.get<string>('name');
            const tokenValue = tokenMap.get<string>('token');

            if (typeof name === 'string' && typeof tokenValue === 'string') {
              acc.push({
                name,
                role: tokenMap.get<Role>('role'),
                token: tokenValue,
              });
            }

            return acc;
          },
          [],
        );

        const authorizedDefinitions = system.authSelectors.authorized();
        let currentToken: null | string = null;
        authorizedDefinitions.forEach(
          (definition: ImmutableMapLike, key: string) => {
            if (key === 'bearer') {
              const value = definition.get<string>('value');
              if (typeof value === 'string') {
                currentToken = value;
              }
            }
          },
        );

        const decodedToken = currentToken ? decodeJWT(currentToken) : null;

        const buildAuthPayload = (
          tokenValue: string,
        ): null | Record<string, { schema: unknown; value: string }> => {
          const definitions = system.specSelectors.securityDefinitions();
          let bearerAuthKey: null | string = null;

          definitions.forEach((definition: ImmutableMapLike, key: string) => {
            const type = definition.get<string>('type');
            const scheme = definition.get<string>('scheme');
            if (
              type === 'http' &&
              typeof scheme === 'string' &&
              scheme.toLowerCase() === 'bearer'
            ) {
              bearerAuthKey = key;
            }
          });

          if (!bearerAuthKey) {
            return null;
          }

          const schema = definitions.get(bearerAuthKey);

          return {
            [bearerAuthKey]: {
              schema,
              value: tokenValue,
            },
          };
        };

        const elements = tokensParsed.map((tokenInfo) => {
          const isCurrentToken = currentToken === tokenInfo.token;

          return system.React.createElement(
            'button',
            {
              className: isCurrentToken ? 'btn authorize' : 'btn',
              onClick: () => {
                const authPayload = buildAuthPayload(tokenInfo.token);
                if (!authPayload) {
                  return;
                }

                system.authActions.configureAuth(authPayload);
                system.authActions.authorizeWithPersistOption(authPayload);
              },
              style: { marginBottom: '10px', marginRight: '10px' },
            },
            `${tokenInfo.name} (${tokenInfo.role})`,
          );
        });

        const [isUserButtonsVisible, setUserButtonsVisible] =
          system.React.useState<boolean>(true);

        const toggleButton = system.React.createElement(
          'button',
          {
            className: 'btn',
            onClick: () => setUserButtonsVisible((previous) => !previous),
            style: { cursor: 'pointer' },
          },
          isUserButtonsVisible ? '^' : 'v',
        );

        const buttonsWrapper = isUserButtonsVisible
          ? system.React.createElement(
              'div',
              {
                style: {
                  display: 'block',
                  marginTop: '5px',
                },
              },
              elements,
            )
          : null;

        const userButtonsContainer = system.React.createElement(
          'div',
          { style: { marginBottom: '1em' } },
          toggleButton,
          buttonsWrapper,
        );

        const excludedKeys = new Set([
          'iat',
          'exp',
          'expiresIn',
          'isExpired',
          'issuedAt',
        ]);
        const parsedToken = decodedToken
          ? Object.entries(decodedToken)
              .filter(([key]) => !excludedKeys.has(key))
              .map(([key, value]) => `${key}:${String(value)}`)
              .join(', ')
          : '';

        const parsedTokenElement = decodedToken
          ? system.React.createElement(
              'div',
              {
                className: decodedToken.isExpired
                  ? 'swagger-ui opblock opblock-delete opblock-summary'
                  : 'swagger-ui opblock opblock-post opblock-summary',
                style: { padding: '5px' },
              },
              parsedToken,
            )
          : null;

        const infoExp = `Expiration time: ${decodedToken?.expiresIn ?? 'N/A'}, isExpired: ${decodedToken?.isExpired ?? 'N/A'}, issuedAt: ${decodedToken?.issuedAt ?? 'N/A'}`;

        const tokenExpirationCont = system.React.createElement(
          'div',
          { className: '', style: { padding: '5px' } },
          infoExp,
        );

        const uiElements = [
          system.React.createElement(
            'div',
            { style: { marginBottom: '1em' } },
            system.React.createElement(Original, props),
          ),
          userButtonsContainer,
          ...(parsedTokenElement ? [parsedTokenElement] : []),
          tokenExpirationCont,
        ];

        return system.React.createElement(
          'div',
          { style: { width: '100%' } },
          ...uiElements,
        );
      },
  },
};

/**
 * Genera tokens JWT de autenticacion para Swagger UI a partir de la informacion de usuarios.
 *
 * Crea un token firmado por cada usuario para poder autenticarse rapidamente
 * como distintos usuarios durante el desarrollo.
 *
 * @param jwtService - Servicio JWT de NestJS para la generacion de tokens.
 * @param jwtSecret - Clave secreta para firmar los tokens JWT.
 * @param usersInfo - Array de informacion de usuarios para generar tokens.
 * @returns Array de objetos con nombre del usuario, rol y token JWT.
 */
export function buildAuthTokensSwagger(
  jwtService: JwtService,
  jwtSecret: string,
  usersInfo: UserActiveInterface[],
): Array<{ name: string; role: Role; token: string }> {
  const customTokens = usersInfo
    .filter((user) => user.firstName !== null || user.lastName !== null)
    .map((user) => {
      const displayName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ');
      const token = {
        name: displayName || user.email,
        role: user.role,
        token: jwtService.sign(user, { secret: jwtSecret }),
      };
      return token;
    });
  return customTokens;
}

/**
 * Configura el plugin de autenticacion de Swagger para entornos de desarrollo.
 *
 * Muestra botones de autenticacion rapida en Swagger UI para cada usuario
 * de la base de datos. Se desactiva automaticamente en produccion por seguridad.
 *
 * Aviso de seguridad: Este plugin expone credenciales de usuario y solo debe
 * usarse en entornos de desarrollo. Se desactiva cuando NODE_ENV es 'production'.
 *
 * @param app - Instancia de la aplicacion NestJS.
 * @param docBuilder - Builder del documento Swagger.
 * @param uiOptions - Opciones de configuracion de Swagger UI.
 */
export async function setup(
  app: NestApplication | NestFastifyApplication,
  docBuilder: DocumentBuilder,
  uiOptions: SwaggerUiOptions,
) {
  const logger = new Logger('SwaggerLibAuthPlugin');
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV');

  // Only disable in production environments
  if (nodeEnv === 'production') {
    logger.log('Auth plugin disabled in production environment');
    return;
  }

  logger.warn(
    `Auth plugin enabled (NODE_ENV: ${nodeEnv}). ⚠️  Only use in non-production environments - exposes user credentials in Swagger UI`,
  );

  try {
    const userRepo = app.get<Repository<UserEntity>>(
      `${UserEntity.name}Repository`,
    );
    const users: UserEntity[] = await userRepo.find();

    if (users.length === 0) {
      logger.warn(
        'No users found in database. Auth plugin buttons will not be displayed.',
      );
      return;
    }

    logger.log(
      `Found ${users.length} user(s) in database. Generating auth tokens...`,
    );

    const loginPayloads = users.map((user) => {
      const userActive: UserActiveInterface = {
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        status: user.status,
        language: user.language,
        lastName: user.lastName,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        validated: true, // Users from DB are assumed validated for auth plugin
      };
      return userActive;
    });

    const customTokens = buildAuthTokensSwagger(
      app.get(JwtService),
      configService.getOrThrow<string>('JWT_SECRET'),
      loginPayloads,
    );

    if (customTokens.length === 0) {
      logger.warn(
        'No valid tokens generated (users may have null names). Auth plugin buttons will not be displayed.',
      );
      return;
    }

    logger.log(`Generated ${customTokens.length} auth token(s) for Swagger UI`);

    // Add custom tokens extension to Swagger spec
    docBuilder.addExtension('x-custom-tokens', customTokens);

    // Add theme switcher extension
    docBuilder.addExtension('x-themes', [
      {
        css: `body { background-color: white; color: black; }`,
        name: 'Light',
      },
      {
        css: `body { background-color: #121212; color: #eee; }`,
        name: 'Dark',
      },
    ]);

    // Register plugins
    uiOptions['plugins'] = [AuthPlugin, CollapsePlugin];
    uiOptions['persistAuthorization'] = true;

    // Enable endpoint logging in development
    app.useGlobalInterceptors(new EndpointLogInterceptor());

    logger.log('Auth plugin successfully configured');
  } catch (error) {
    logger.error('Failed to set up auth plugin:', error);
    // Don't throw - allow Swagger to work without the plugin
  }
}
