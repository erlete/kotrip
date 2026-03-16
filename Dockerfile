# ==========================================================================
#  Kotrip Monorepo - Multi-stage Dockerfile
#
#  Stages:
#    base            -> Runtime mínimo (node:24-slim)
#    deps            -> Instalación de dependencias de todos los workspaces
#    build-backend   -> Compilación de NestJS con SWC
#    build-frontend  -> Build de Next.js con output standalone
#    backend-dev     -> Imagen de desarrollo para backend
#    frontend-dev    -> Imagen de desarrollo para frontend
#    backend-prod    -> Imagen de producción para backend (sin devDeps)
#    frontend-prod   -> Imagen de producción para frontend (standalone)
# ==========================================================================

# ==========================================================================
# Stage: base - Entorno de ejecución mínimo
# ==========================================================================
FROM node:24-slim AS base

USER root
RUN mkdir -p /app /var/log/app \
  && chown -R node:node /app /var/log/app
USER node

WORKDIR /app

# ==========================================================================
# Stage: deps - Instalación de dependencias de todos los workspaces
#
# Capa de caché: solo se invalida si cambian los package.json o el lockfile.
# Se usa --ignore-scripts para evitar ejecutar postinstall/prepare del host
# (lefthook, generador de instrucciones LLM) dentro de Docker.
# ==========================================================================
FROM base AS deps

ENV CI=1
WORKDIR /app

# 1. Copiar manifiestos de paquetes (capa de caché de dependencias):
COPY --chown=node:node package-lock.json package.json ./
COPY --chown=node:node backend/package.json backend/package.json
COPY --chown=node:node frontend/package.json frontend/package.json
COPY --chown=node:node data/package.json data/package.json

# 2. Instalar todas las dependencias (sin scripts de ciclo de vida):
RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm ci --ignore-scripts

# 3. Compilar paquete compartido de tipos (@kotrip/data):
COPY --chown=node:node data/tsconfig*.json data/
COPY --chown=node:node data/src/ data/src/
RUN npm run build -w data

# ==========================================================================
# Stage: build-backend - Compilación de NestJS con SWC
#
# Se descargan las localidades de España (INE/OpenDataSoft) antes de compilar
# para que NestJS las incluya como assets en dist/ junto con el seeder.
# ==========================================================================
FROM deps AS build-backend

COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node backend/tsconfig*.json backend/
COPY --chown=node:node backend/nest-cli*.json backend/
COPY --chown=node:node backend/src/ backend/src/

# Descargar localidades para que el seeder las tenga disponibles en producción:
RUN node --input-type=module -e "import fn from './scripts/modules/fetch-localities.mjs'; await fn();"

RUN npm run build:prod -w backend

# ==========================================================================
# Stage: build-frontend - Build de Next.js (output standalone)
# ==========================================================================
FROM deps AS build-frontend

COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node prettier.config.mjs .prettierignore ./
COPY --chown=node:node frontend/tsconfig*.json frontend/
COPY --chown=node:node frontend/next.config.ts frontend/
COPY --chown=node:node frontend/postcss.config.mjs frontend/
COPY --chown=node:node frontend/src/ frontend/src/
COPY --chown=node:node frontend/public/ frontend/public/
COPY --chown=node:node frontend/scripts/ frontend/scripts/

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w frontend

# ==========================================================================
# Stage: backend-dev - Imagen de desarrollo para backend
# ==========================================================================
FROM deps AS backend-dev

# Herramientas de depuración (solo en desarrollo):
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/*
USER node

COPY --chown=node:node backend/tsconfig*.json backend/
COPY --chown=node:node backend/nest-cli*.json backend/
COPY --chown=node:node backend/src/ backend/src/

WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ==========================================================================
# Stage: frontend-dev - Imagen de desarrollo para frontend
# ==========================================================================
FROM deps AS frontend-dev

# Herramientas de depuración (solo en desarrollo):
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/*
USER node

COPY --chown=node:node scripts/ scripts/
COPY --chown=node:node prettier.config.mjs .prettierignore ./
COPY --chown=node:node frontend/tsconfig*.json frontend/
COPY --chown=node:node frontend/next.config.ts frontend/
COPY --chown=node:node frontend/postcss.config.mjs frontend/
COPY --chown=node:node frontend/src/ frontend/src/
COPY --chown=node:node frontend/public/ frontend/public/
COPY --chown=node:node frontend/scripts/ frontend/scripts/

WORKDIR /app/frontend
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ==========================================================================
# Stage: backend-prod-deps - Dependencias de producción (sin devDependencies)
#
# Instala únicamente las dependencias de producción desde cero, evitando
# el costoso `npm prune` que genera una cantidad masiva de operaciones de
# I/O en overlayfs (stat/unlink de miles de archivos en node_modules).
# Al usar `npm ci --omit=dev` directamente, solo se descargan e instalan
# los paquetes necesarios para producción.
# ==========================================================================
FROM base AS backend-prod-deps

ENV CI=1
WORKDIR /app

COPY --chown=node:node package-lock.json package.json ./
COPY --chown=node:node backend/package.json backend/package.json
COPY --chown=node:node frontend/package.json frontend/package.json
COPY --chown=node:node data/package.json data/package.json

RUN --mount=type=cache,target=/home/node/.npm,uid=1000,gid=1000 \
    npm ci --omit=dev --ignore-scripts

# ==========================================================================
# Stage: backend-prod - Imagen de producción para backend
#
# Contiene únicamente:
#   - node_modules sin devDependencies
#   - backend/dist (compilado con SWC)
#   - data/dist (tipos compartidos compilados)
# ==========================================================================
FROM base AS backend-prod

WORKDIR /app

# Manifiestos necesarios para resolución de módulos npm:
COPY --chown=node:node --from=backend-prod-deps /app/package.json ./
COPY --chown=node:node --from=backend-prod-deps /app/backend/package.json backend/
COPY --chown=node:node --from=backend-prod-deps /app/data/package.json data/

# Dependencias de producción (purgadas de devDependencies):
COPY --chown=node:node --from=backend-prod-deps /app/node_modules/ node_modules/

# Artefactos compilados:
COPY --chown=node:node --from=build-backend /app/backend/dist/ backend/dist/
COPY --chown=node:node --from=deps /app/data/dist/ data/dist/

WORKDIR /app/backend
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

# ==========================================================================
# Stage: frontend-prod - Imagen de producción para frontend (standalone)
#
# Next.js standalone output es autocontenido: incluye sus propias
# dependencias empaquetadas, sin necesidad de node_modules externo.
# ==========================================================================
FROM base AS frontend-prod

WORKDIR /app

# Servidor standalone (autocontenido con dependencias empaquetadas):
COPY --chown=node:node --from=build-frontend /app/frontend/.next/standalone/ ./

# Activos estáticos (CSS, JS chunks):
COPY --chown=node:node --from=build-frontend /app/frontend/.next/static/ frontend/.next/static/

# Activos públicos:
COPY --chown=node:node --from=build-frontend /app/frontend/public/ frontend/public/

EXPOSE 3000
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
CMD ["node", "frontend/server.js"]
