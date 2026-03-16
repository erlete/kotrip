/**
 * Declaraciones de tipos para noVNC.
 *
 * La librería noVNC no incluye definiciones TypeScript. Este archivo
 * proporciona los tipos mínimos necesarios para la integración VNC
 * del reproductor de actividades.
 *
 * El módulo se importa como `import type` desde `@novnc/novnc/lib/rfb`
 * para obtener los tipos, mientras que en runtime se carga el bundle
 * pre-empaquetado desde `/assets/novnc/rfb.mjs` vía `webpackIgnore`.
 */
declare module '@novnc/novnc/lib/rfb' {
  /** Credenciales para autenticación VNC. */
  interface RFBCredentials {
    username?: string;
    password?: string;
    target?: string;
  }

  /** Capacidades reportadas por el servidor VNC. */
  interface RFBCapabilities {
    power: boolean;
  }

  /** Opciones del constructor de RFB. */
  interface RFBOptions {
    shared?: boolean;
    credentials?: RFBCredentials;
    repeaterID?: string;
    wsProtocols?: string[];
  }

  /**
   * Cliente VNC basado en WebSocket.
   *
   * Renderiza un escritorio remoto en un elemento DOM proporcionado
   * y gestiona la comunicación VNC a través de WebSocket.
   */
  export default class RFB extends EventTarget {
    constructor(
      target: HTMLElement,
      urlOrChannel: string | WebSocket,
      options?: RFBOptions,
    );

    // ─── Propiedades ───────────────────────────────────────────

    /** Si es true, el usuario solo puede observar (sin interacción). */
    viewOnly: boolean;

    /** Si es true, se enfoca el visor al hacer clic. */
    focusOnClick: boolean;

    /** Recorta el viewport al tamaño del contenedor. */
    clipViewport: boolean;

    /** Permite arrastrar el viewport (útil con clipViewport). */
    dragViewport: boolean;

    /** Escala el escritorio remoto al tamaño del contenedor. */
    scaleViewport: boolean;

    /** Solicita al servidor redimensionar la sesión al tamaño del visor. */
    resizeSession: boolean;

    /** Muestra un cursor de punto cuando el cursor remoto no es visible. */
    showDotCursor: boolean;

    /** Color de fondo del canvas (CSS color string). */
    background: string;

    /** Nivel de calidad JPEG (0-9). */
    qualityLevel: number;

    /** Nivel de compresión (0-9). */
    compressionLevel: number;

    /** Capacidades del servidor VNC conectado. */
    readonly capabilities: RFBCapabilities;

    // ─── Métodos ───────────────────────────────────────────────

    /** Cierra la conexión VNC. */
    disconnect(): void;

    /** Envía credenciales al servidor VNC. */
    sendCredentials(credentials: RFBCredentials): void;

    /** Envía una tecla al servidor VNC. */
    sendKey(keysym: number, code: string | null, down?: boolean): void;

    /** Envía la combinación Ctrl+Alt+Del al servidor. */
    sendCtrlAltDel(): void;

    /** Enfoca el canvas VNC. */
    focus(): void;

    /** Desenfoca el canvas VNC. */
    blur(): void;

    /** Envía señal de apagado a la máquina (requiere capacidad power). */
    machineShutdown(): void;

    /** Envía señal de reinicio a la máquina. */
    machineReboot(): void;

    /** Envía señal de reset a la máquina. */
    machineReset(): void;

    /** Envía texto desde el portapapeles al servidor VNC. */
    clipboardPasteFrom(text: string): void;
  }
}
