# Configuración

## Comandos

CMD_COMPOSE = docker compose

## Argumentos

ARG_PROD_BACKEND = -f compose.backend.yml
ARG_PROD_FRONTEND = -f compose.frontend.yml
ARG_DEV_BACKEND_OVERRIDE = -f compose.backend.dev.yml
ARG_DEV_FRONTEND_OVERRIDE = -f compose.frontend.dev.yml
ARG_PROFILE_DEVTOOLS = --profile devtools

## Operaciones

OP_UP = up --detach
OP_BUILD = build
OP_DOWN = down
OP_DOWN_VOLUMES = down --volumes

# Mensaje de ayuda por defecto

.DEFAULT_GOAL := help

help:
	@echo Uso: make [objetivo]
	@echo Objetivos disponibles:
	@echo   00 - make all-down                  - detiene todos los contenedores
	@echo   01 - make all-down-volumes          - detiene todos los contenedores y elimina volumenes
	@echo   02 - make dev-backend-build         - construye backend para desarrollo
	@echo   03 - make dev-backend-reup          - inicia backend para desarrollo
	@echo   04 - make dev-backend-reup-devtools - inicia backend con perfil devtools
	@echo   05 - make dev-build                 - reconstruye imagenes de desarrollo
	@echo   06 - make dev-build-no-cache        - reconstruye imagenes de desarrollo sin cache
	@echo   07 - make dev-frontend-build        - construye frontend para desarrollo
	@echo   08 - make dev-frontend-reup         - inicia frontend para desarrollo
	@echo   09 - make dev-reup                  - reinicia el entorno de desarrollo
	@echo   10 - make logs                      - muestra los logs de todos los contenedores
	@echo   11 - make prod-backend-build        - construye backend para produccion
	@echo   12 - make prod-backend-reup         - inicia backend para produccion
	@echo   13 - make prod-build                - reconstruye imagenes de produccion
	@echo   14 - make prod-build-no-cache       - reconstruye imagenes de produccion sin cache
	@echo   15 - make prod-frontend-build       - construye frontend para produccion
	@echo   16 - make prod-frontend-reup        - inicia frontend para produccion
	@echo   17 - make prod-reup                 - reinicia el entorno de produccion

# Objetivos de proyecto

all-down:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_DOWN)

all-down-volumes:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(ARG_PROFILE_DEVTOOLS) $(OP_DOWN_VOLUMES)

dev-backend-build:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(OP_BUILD)

dev-backend-reup:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(OP_UP)

dev-backend-reup-devtools:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROFILE_DEVTOOLS) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROFILE_DEVTOOLS) $(OP_UP)

dev-build:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_BUILD)

dev-build-no-cache:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_BUILD) --no-cache

dev-frontend-build:
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_BUILD)

dev-frontend-reup:
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(OP_UP)

dev-reup:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(ARG_PROFILE_DEVTOOLS) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) $(ARG_PROFILE_DEVTOOLS) $(OP_UP)

logs:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_DEV_BACKEND_OVERRIDE) $(ARG_PROD_FRONTEND) $(ARG_DEV_FRONTEND_OVERRIDE) logs --follow --timestamps

prod-backend-build:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(OP_BUILD)

prod-backend-reup:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(OP_UP)

prod-build:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_PROD_FRONTEND) $(OP_BUILD)

prod-build-no-cache:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_PROD_FRONTEND) $(OP_BUILD) --no-cache

prod-frontend-build:
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(OP_BUILD)

prod-frontend-reup:
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_FRONTEND) $(OP_UP)

prod-reup:
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_PROD_FRONTEND) $(OP_DOWN_VOLUMES)
	$(CMD_COMPOSE) $(ARG_PROD_BACKEND) $(ARG_PROD_FRONTEND) $(OP_UP)
