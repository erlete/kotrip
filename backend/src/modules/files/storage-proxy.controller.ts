import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Número máximo de reintentos ante fallos transitorios de conexión con MinIO.
 *
 * Los fallos más habituales son `ECONNRESET` y resolución DNS tardía
 * en el primer arranque del contenedor.
 */
const MAX_RETRIES = 2;

/** Tiempo de espera entre reintentos en milisegundos. */
const RETRY_DELAY_MS = 500;

/**
 * Controlador proxy inverso ligero para servir archivos almacenados en MinIO.
 *
 * Expone una ruta pública `GET /storage/*` que reenvía la petición HTTP
 * al servidor MinIO interno, incluyendo query parameters (firmas prefirmadas S3).
 *
 * No requiere autenticación JWT: el acceso se controla en origen
 * desde el route handler del frontend (`/api/storage/[...path]`), que valida
 * buckets permitidos, extensiones de archivo y previene path traversal antes
 * de reenviar la solicitud a este endpoint.
 *
 * @remarks
 * Este controlador existe porque el contenedor del frontend no comparte red
 * Docker con MinIO (que reside en la red `data`). El backend, al pertenecer
 * a las redes `backend` y `data`, actúa como intermediario.
 */
@ApiExcludeController()
@Controller('storage')
export class StorageProxyController {
  private readonly logger = new Logger(StorageProxyController.name);

  /** URL base interna de MinIO construida a partir de las variables de entorno. */
  private readonly minioBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'localhost',
    );
    const port = this.configService.get<string>('MINIO_PORT', '9000');
    this.minioBaseUrl = `http://${endpoint}:${port}`;
  }

  /**
   * Reenvía la petición al servidor MinIO y devuelve la respuesta como stream.
   *
   * La ruta completa después de `/storage/` se utiliza directamente como
   * ruta del objeto en MinIO, incluyendo el bucket como primer segmento.
   * Los query parameters (firmas prefirmadas) se reenvían sin modificar.
   *
   * @param req - Petición Fastify entrante.
   * @param res - Respuesta Fastify para envío directo con streaming.
   */
  @Get('*')
  async proxy(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const wildcard = (req.params as { '*': string })['*'];
    const queryString = req.url.includes('?')
      ? req.url.substring(req.url.indexOf('?'))
      : '';
    const minioUrl = `${this.minioBaseUrl}/${wildcard}${queryString}`;

    let lastError: unknown;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(minioUrl, {
          method: 'GET',
          headers: {
            'Accept-Encoding':
              (req.headers['accept-encoding'] as string) ?? 'gzip, deflate',
          },
        });

        if (!response.ok) {
          return res.status(response.status).send({
            error:
              response.status === 404
                ? 'File not found'
                : 'Storage service error',
          });
        }

        const contentType =
          response.headers.get('content-type') ?? 'application/octet-stream';
        const contentLength = response.headers.get('content-length');

        void res.header('Content-Type', contentType);
        void res.header('X-Content-Type-Options', 'nosniff');
        if (contentLength) {
          void res.header('Content-Length', contentLength);
        }

        // Reenviar el body como stream sin almacenarlo completo en memoria.
        if (response.body) {
          return res.send(response.body);
        }

        // Fallback: si no hay body stream, enviar como ArrayBuffer.
        const buffer = await response.arrayBuffer();
        return res.send(Buffer.from(buffer));
      } catch (err) {
        lastError = err;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }

    this.logger.error(
      `Error al reenviar petición a MinIO: ${minioUrl}`,
      lastError instanceof Error ? lastError.stack : String(lastError),
    );
    return res.status(500).send({ error: 'Internal server error' });
  }
}
