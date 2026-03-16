import { getBackendBaseUrl } from '@/lib/backend/url';
import { NextRequest, NextResponse } from 'next/server';

/** Número máximo de reintentos ante fallos transitorios de conexión. */
const MAX_RETRIES = 1;

/** Tiempo de espera entre reintentos en milisegundos. */
const RETRY_DELAY_MS = 500;

/**
 * Buckets permitidos para acceso a través del proxy.
 * SEGURIDAD: Solo los buckets listados aquí son accesibles.
 * Tras la unificación de almacenamiento, todo el contenido reside en
 * el bucket único `kotrip` con rutas jerárquicas internas.
 */
const ALLOWED_BUCKETS = new Set(['kotrip']);

/**
 * Extensiones de archivo permitidas para el proxy.
 * SEGURIDAD: Previene acceso a tipos de archivo potencialmente peligrosos.
 */
const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.ico',
  '.pdf',
  '.mp4',
  '.webm',
  '.mp3',
  '.wav',
  '.ogg',
]);

/**
 * Verifica si un nombre de bucket está permitido para acceso público.
 *
 * @param bucket - Nombre del bucket a verificar
 * @returns true si el bucket está permitido
 */
function isBucketAllowed(bucket: string): boolean {
  return ALLOWED_BUCKETS.has(bucket);
}

/**
 * Valida que la ruta del archivo sea segura y permitida.
 *
 * @param pathSegments - Segmentos de la ruta (bucket, carpeta, archivo)
 * @returns true si la ruta es válida y permitida
 */
function isValidPath(pathSegments: string[]): boolean {
  if (pathSegments.length < 2) {
    return false;
  }

  const bucket = pathSegments[0];
  const fileName = pathSegments[pathSegments.length - 1];

  if (!isBucketAllowed(bucket)) {
    return false;
  }

  if (pathSegments.some((segment) => segment === '..' || segment === '.')) {
    return false;
  }

  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return false;
  }

  return true;
}

/**
 * Obtiene el Content-Type basado en la extensión del archivo.
 *
 * @param fileName - Nombre del archivo
 * @returns Content-Type apropiado
 */
function getContentType(fileName: string): string {
  const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
  };
  return contentTypes[extension] ?? 'application/octet-stream';
}

/**
 * API Route que actúa como proxy reverso para archivos almacenados en MinIO.
 *
 * Reenvía las peticiones al endpoint `/storage/*` del backend, que a su vez
 * accede a MinIO a través de la red Docker interna `data`. Esta indirección
 * es necesaria porque el contenedor del frontend no comparte red con MinIO.
 *
 * Ruta: GET /api/storage/[bucket]/[...path]
 *
 * SEGURIDAD:
 * - Solo permite acceso a buckets definidos en ALLOWED_BUCKETS
 * - Valida extensiones de archivo permitidas
 * - Previene path traversal attacks
 * - No expone credenciales de MinIO al cliente
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await params;

    if (!isValidPath(pathSegments)) {
      return NextResponse.json(
        { error: 'Invalid or forbidden path' },
        { status: 403 },
      );
    }

    // Construir la URL del backend, reenviando query params (firma prefirmada).
    const storagePath = pathSegments.join('/');
    const queryString = request.nextUrl.search;
    const backendUrl = `${getBackendBaseUrl()}/storage/${storagePath}${queryString}`;

    // Si la URL tiene query params es una URL prefirmada con expiración propia.
    const isPresigned = queryString.length > 0;

    // Realizar la petición al backend con reintento ante fallos transitorios.
    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Accept-Encoding':
              request.headers.get('Accept-Encoding') ?? 'gzip, deflate',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            return NextResponse.json(
              { error: 'File not found' },
              { status: 404 },
            );
          }
          return NextResponse.json(
            { error: 'Storage service error' },
            { status: response.status },
          );
        }

        const body = await response.arrayBuffer();
        const fileName = pathSegments[pathSegments.length - 1];

        return new NextResponse(body, {
          status: 200,
          headers: {
            'Content-Type': getContentType(fileName),
            'Content-Length': body.byteLength.toString(),
            'Cache-Control': isPresigned
              ? 'private, max-age=1800, must-revalidate'
              : 'public, max-age=31536000, immutable',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    console.error('[Storage Proxy]', backendUrl, lastError);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  } catch (err) {
    console.error('[Storage Proxy] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
