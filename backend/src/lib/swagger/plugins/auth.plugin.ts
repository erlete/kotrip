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
 * Represents an immutable map-like data structure used by Swagger UI.
 * Provides type-safe access to configuration values.
 */
interface ImmutableMapLike {
  /**
   * Retrieves a value from the map by key.
   * @template T - The expected type of the value
   * @param {string} key - The key to look up
   * @returns {T} The value associated with the key
   */
  get<T = unknown>(key: string): T;
}

/**
 * Represents an immutable list-like data structure used by Swagger UI.
 * @template T - The type of elements in the list
 */
interface ImmutableListLike<T extends ImmutableMapLike = ImmutableMapLike> {
  /**
   * Converts the list to a standard JavaScript array.
   * @returns {T[]} Array of elements
   */
  toArray(): T[];
  /**
   * Iterates over each element in the list.
   * @param {Function} callback - Function to call for each element
   */
  forEach(callback: (value: T, key: string) => void): void;
}

/**
 * Represents an immutable map collection used by Swagger UI.
 * Combines list and map-like functionality.
 * @template T - The type of elements in the collection
 */
interface ImmutableMapCollection<
  T extends ImmutableMapLike = ImmutableMapLike,
> extends ImmutableListLike<T> {
  /**
   * Retrieves an element from the collection by key.
   * @param {string} key - The key to look up
   * @returns {T} The element associated with the key
   */
  get(key: string): T;
}

/**
 * React-like interface provided by Swagger UI for creating UI elements.
 * Mimics a subset of React's API for plugin development.
 */
interface ReactLike {
  /**
   * Creates a React element (similar to React.createElement).
   * @param {...unknown[]} args - Element type, props, and children
   * @returns {unknown} A React element
   */
  createElement: (...args: unknown[]) => unknown;
  /**
   * React useState hook for managing component state.
   * @template T - The type of the state value
   * @param {T} initial - Initial state value
   * @returns {[T, Function]} Tuple of current state and setter function
   */
  useState<T>(initial: T): [T, (value: ((previous: T) => T) | T) => void];
}

/**
 * Represents a Swagger UI component function.
 */
type SwaggerComponent = (props: Record<string, unknown>) => unknown;

/**
 * Represents the Swagger UI system object passed to plugins.
 * Provides access to selectors, actions, and React for building custom UI.
 */
interface SwaggerSystem {
  /** Selectors for accessing Swagger specification data */
  specSelectors: {
    /**
     * Retrieves custom tokens from the Swagger specification.
     * @returns {ImmutableListLike | undefined} List of custom tokens or undefined
     */
    customTokens(): ImmutableListLike | undefined;
    /**
     * Retrieves security definitions from the Swagger specification.
     * @returns {ImmutableMapCollection} Collection of security definitions
     */
    securityDefinitions(): ImmutableMapCollection;
  };
  /** Selectors for accessing authorization state */
  authSelectors: {
    /**
     * Retrieves currently authorized schemes.
     * @returns {ImmutableMapCollection} Collection of authorized schemes
     */
    authorized(): ImmutableMapCollection;
  };
  /** Actions for managing authorization */
  authActions: {
    /**
     * Authorizes with the given auth configuration and persists it.
     * @param {Record<string, { schema: unknown; value: string }>} auth - Authorization configuration
     */
    authorizeWithPersistOption(
      auth: Record<string, { schema: unknown; value: string }>,
    ): void;
    /**
     * Configures authorization without persisting.
     * @param {Record<string, { schema: unknown; value: string }>} auth - Authorization configuration
     */
    configureAuth(
      auth: Record<string, { schema: unknown; value: string }>,
    ): void;
  };
  /** React-like interface for creating UI elements */
  React: ReactLike;
}

/**
 * Token information structure used by the auth plugin.
 */
type TokenInfo = {
  /** Display name for the token button */
  name: string;
  /** User role associated with the token */
  role: Role;
  /** JWT token string */
  token: string;
};

/**
 * Decoded JWT payload with additional computed properties.
 */
type DecodedTokenPayload = Record<string, unknown> & {
  /** Token expiration timestamp (Unix time) */
  exp?: number;
  /** Seconds until token expires */
  expiresIn?: number;
  /** Token issued at timestamp (Unix time) */
  iat?: number;
  /** Whether the token has expired */
  isExpired?: boolean;
  /** ISO string of when token was issued */
  issuedAt?: string;
};

/**
 * ### AuthPlugin
 *
 * Plugin de swagger para autorizar por JWT usuarios clicando en un botón.
 * El plugin toma los tokens de los usuarios de la extension llamada custom-tokens,
 * y a partir de ahi genera botones por cada token.
 *
 * La estructura de estos tokens debe ser un array con un objeto que contenga el nombre del token (para el boton)
 * y el token JWT:
 * ```
 * [
 *      {
 *          name: 'Usuario admin',
 *          token: 'eyHJTHFK...'
 *      }
 * ]
 * ```
 *
 * La función `buildAuthTokensSwagger` es la que define la estructura del token a usar
 * Dependiendo de lo que se quiera guardar en la autorización este método tiene que ser cambiado con la información que se necesite
 *
 * @version     1.0.0a




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
 * Builds authentication tokens for Swagger UI from user information.
 *
 * This function generates JWT tokens for each user that can be used in the
 * Swagger UI auth plugin to quickly authenticate as different users during development.
 *
 * @param {JwtService} jwtService - NestJS JWT service for token generation
 * @param {string} jwtSecret - Secret key for signing JWT tokens
 * @param {UserActiveInterface[]} usersInfo - Array of user information to generate tokens for
 * @returns {Array<{ name: string; token: string }>} Array of token objects with user names and JWT tokens
 *
 * @example
 * ```typescript
 * const tokens = buildAuthTokensSwagger(
 *   jwtService,
 *   'secret-key',
 *   [{ id: 1, name: 'Admin User', email: 'admin@example.com', role: Role.ADMIN, ... }]
 * );
 * // Returns: [{ name: 'Admin User', token: 'eyJhbGc...' }]
 * ```
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
 * Sets up the Swagger auth plugin for development environments.
 *
 * This function configures the auth plugin to display user authentication buttons in Swagger UI.
 * The plugin is automatically disabled in production environments for security.
 *
 * **⚠️ Security Warning:** This plugin exposes user credentials and should only be used in
 * development environments. It is automatically disabled when NODE_ENV is 'production'.
 *
 * @param {NestApplication | NestFastifyApplication} app - The NestJS application instance
 * @param {DocumentBuilder} docBuilder - Swagger document builder instance
 * @param {SwaggerUiOptions} uiOptions - Swagger UI configuration options
 *
 * @example
 * ```typescript
 * import { setup as authPluginSetup } from './plugins/auth.plugin';
 *
 * const docBuilder = new DocumentBuilder();
 * const uiOptions = { operationsSorter: 'alpha' };
 * await authPluginSetup(app, docBuilder, uiOptions);
 * ```
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
