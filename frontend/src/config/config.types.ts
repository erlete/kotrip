import { Role } from '@kotrip/data';
import type { FooterLogoRaw, LanguageCode } from './config.utils';

/**
 * Tipo utilitario que convierte recursivamente todas las propiedades
 * de un tipo en opcionales, incluyendo las propiedades anidadas.
 *
 * @remarks
 * Se utiliza para definir {@link AppConfigOverride}, de forma que el archivo
 * de configuración del cliente solo necesite declarar los campos que desea
 * sobreescribir respecto a los valores por defecto.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Configuración completa de la aplicación.
 *
 * @remarks
 * Define la estructura canónica que debe satisfacer la configuración final
 * tras resolver las sobrecargas del cliente (`app.config.ts`) sobre los
 * valores por defecto (`app.config.default.ts`).
 *
 * No todos los campos están actualmente integrados en los componentes.
 * Los que están pendientes de implementación se marcan con `// @TODO:`.
 *
 * @see AppConfigOverride
 * @see resolveConfig
 */
export interface AppConfig {
  /**
   * Configuración de identidad de marca de la plataforma.
   * Controla el nombre, descripción, logotipos y favicon visibles en la interfaz.
   */
  brand: {
    /**
     * Nombre de la plataforma.
     *
     * @remarks
     * Se usa como título de la pestaña del navegador.
     */
    title: string;

    /**
     * Descripción breve de la plataforma.
     *
     * @remarks
     * Se usa en metadatos SEO.
     */
    description: string;

    /**
     * Configuración del logotipo principal.
     */
    logo: {
      /**
       * Rutas a las variantes del logotipo según el contexto de uso.
       */
      path: {
        /**
         * Logotipo estándar sobre fondo claro (navbar, página de login).
         */
        normal: string;

        /**
         * Logotipo sobre fondo oscuro o coloreado (sidebar).
         */
        negative: string;

        /**
         * Logotipo animado o simplificado para pantallas de carga.
         */
        loader: string;
      };

      /**
       * Texto alternativo para accesibilidad.
       */
      alt: string;

      /**
       * Dimensiones de referencia del logotipo en píxeles.
       *
       * @remarks
       * Deben respetar la relación de aspecto del archivo original para evitar distorsión.
       */
      dimmensions: {
        /**
         * Ancho del logotipo en píxeles.
         */
        width: number;

        /**
         * Alto del logotipo en píxeles.
         */
        height: number;
      };
    };

    /**
     * Ruta al favicon de la plataforma.
     */
    favicon: string;

    /**
     * Lista de logos a mostrar en el pie de página (certificaciones, patrocinadores, etc.).
     */
    footerImages: FooterLogoRaw[];
  };

  /**
   * Configuración del tema visual de la aplicación.
   *
   * @remarks
   * Los colores y el factor de radio se definen directamente en
   * `globals.css` como variables CSS hex, sin necesidad de generadores.
   */
  theme: {
    /**
     * Modo de color inicial de la aplicación.
     *
     * @remarks
     * Actúa como valor de reserva cuando el usuario no tiene una preferencia
     * almacenada en la cookie de tema. Una vez que el usuario alterna el tema,
     * su elección tiene prioridad sobre este valor.
     */
    defaultMode: 'light' | 'dark';

    /**
     * Indica si los usuarios pueden alternar entre modo claro y oscuro.
     *
     * @remarks
     * Si es `false`, el control de cambio de tema queda oculto en la interfaz
     * y la plataforma permanece en el modo definido por `mode`.
     */
    allowToggle: boolean;
  };

  /**
   * Configuración de internacionalización (i18n).
   *
   * @remarks
   * Determina los idiomas disponibles en la plataforma y el idioma inicial.
   */
  i18n: {
    /**
     * Código del idioma predeterminado de la plataforma.
     *
     * @remarks
     * Debe coincidir con uno de los valores definidos en `availableLanguages`
     * y con los códigos disponibles en {@link LanguageCode}.
     * Se utiliza como idioma de reserva cuando no se puede determinar la
     * preferencia del usuario.
     */
    defaultLanguage: LanguageCode;

    /**
     * Lista de idiomas disponibles en la plataforma.
     *
     * @remarks
     * Cada entrada define el código interno y la etiqueta visible en el
     * selector de idioma. Si se omite en `app.config.ts`, se usarán todos
     * los idiomas soportados están definidos en el enum `Language` del paquete `@kotrip/data`.
     */
    availableLanguages: {
      /**
       * Código del idioma. Debe ser un valor de {@link LanguageCode}.
       */
      value: LanguageCode;

      /**
       * Etiqueta legible que se muestra en el selector de idioma.
       */
      label: string;
    }[];
  };

  /**
   * Información de contacto de la organización propietaria de la plataforma.
   *
   * @remarks
   * Disponible para su uso en páginas de ayuda, footer o formularios de
   * soporte.
   */
  contact: {
    /**
     * Dirección de correo electrónico de contacto.
     */
    email: string;

    /**
     * Número de teléfono de contacto.
     */
    phone: string;

    /**
     * URL del perfil de LinkedIn de la organización.
     */
    linkedIn: string;
  };

  /**
   * URLs a los documentos legales de la plataforma.
   *
   * @remarks
   * Se muestran en el pie de página y en los formularios que requieren
   * aceptación.
   */
  legal: {
    /**
     * URL de la política de cookies.
     */
    cookies: string;

    /**
     * URL de la política de privacidad.
     */
    privacy: string;
  };

  /**
   * Configuración tipográfica de la plataforma.
   *
   * // @TODO: Integrar en los componentes. Actualmente definido en el esquema pero no consumido.
   */
  typography: {
    /**
     * Familia tipográfica principal (valor CSS `font-family`).
     */
    fontFamily: string;

    /**
     * Escala tipográfica por tamaño semántico.
     *
     * @remarks
     * Los valores deben ser unidades CSS válidas.
     */
    scale: Record<string, string>;
  };

  /**
   * Escala de espaciado de la plataforma.
   *
   * // @TODO: Integrar en los componentes. Actualmente definido en el esquema pero no consumido.
   */
  spacing: Record<string, string>;

  /**
   * Configuración del nivel de animación permitido en la plataforma.
   *
   * // @TODO: Integrar en los componentes. Actualmente definido en el esquema pero no consumido.
   */
  animation: {
    /**
     * Nivel de animación permitido en la plataforma.
     *
     * @remarks
     * Valores posibles:
     * - 'none': sin animaciones (accesibilidad máxima).
     * - 'reduced: animaciones esenciales únicamente.
     * - 'full': todas las animaciones habilitadas.
     */
    level: 'none' | 'reduced' | 'full';
  };

  /**
   * Configuración del comportamiento inicial del layout principal.
   */
  layout: {
    /**
     * Indica si el menú lateral debe aparecer contraído al cargar la aplicación por primera vez.
     * En dispositivos de escritorio, este valor es el estado inicial;
     * en tablets y móviles, el sidebar se contrae siempre independientemente de este valor.
     */
    sidebarCollapsedByDefault: boolean;
  };

  /**
   * Etiquetas de visualización para cada rol de usuario de la plataforma.
   * Permite personalizar los nombres que se muestran en la interfaz para cada rol.
   *
   * // @TODO: Integrar en los componentes. Actualmente definido en el esquema pero no consumido.
   */
  roles: Record<Role, string>;
}

/**
 * Tipo para sobrecargas parciales de la configuración.
 *
 * @remarks
 * Permite que `app.config.ts` defina únicamente los campos que deben diferir
 * respecto a los valores por defecto de `app.config.default.ts`.
 * Todos los campos son opcionales de forma recursiva.
 *
 * @see AppConfig
 * @see resolveConfig
 */
export type AppConfigOverride = DeepPartial<AppConfig>;
