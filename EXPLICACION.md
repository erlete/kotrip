# Kotrip: Como funciona todo esto (sin morir en el intento)

> Si alguna vez te has preguntado que pasa desde que le das click a "Iniciar sesion" hasta que ves tus viajes en pantalla... este documento es para ti. No hace falta que sepas programar. Bueno, un poquito si. Pero vamos a ir paso a paso, con calma, y algun que otro chiste malo por el camino.

---

## Indice

- [Kotrip: Como funciona todo esto (sin morir en el intento)](#kotrip-como-funciona-todo-esto-sin-morir-en-el-intento)
  - [Indice](#indice)
  - [1. La foto general: que es Kotrip](#1-la-foto-general-que-es-kotrip)
  - [2. La infraestructura: Docker y sus amigos](#2-la-infraestructura-docker-y-sus-amigos)
    - [Que es Docker (y por que nos importa)](#que-es-docker-y-por-que-nos-importa)
    - [El Dockerfile: la receta del tupper](#el-dockerfile-la-receta-del-tupper)
    - [Docker Compose: la orquesta](#docker-compose-la-orquesta)
    - [Herramientas de desarrollo extra](#herramientas-de-desarrollo-extra)
  - [3. El frontend: lo que ves en pantalla](#3-el-frontend-lo-que-ves-en-pantalla)
    - [Next.js: el framework](#nextjs-el-framework)
    - [Estructura del frontend](#estructura-del-frontend)
    - [El cliente del backend: como habla el frontend con el backend](#el-cliente-del-backend-como-habla-el-frontend-con-el-backend)
    - [Tecnologias del frontend](#tecnologias-del-frontend)
  - [4. El backend: el cerebro de la operacion](#4-el-backend-el-cerebro-de-la-operacion)
    - [NestJS: el framework](#nestjs-el-framework)
    - [Fastify: el servidor HTTP](#fastify-el-servidor-http)
    - [Estructura del backend](#estructura-del-backend)
    - [Modulos: las secciones de la cocina](#modulos-las-secciones-de-la-cocina)
  - [5. El paquete compartido: @kotrip/data](#5-el-paquete-compartido-kotripdata)
  - [6. Autenticacion: quien eres tu y por que deberia dejarte pasar](#6-autenticacion-quien-eres-tu-y-por-que-deberia-dejarte-pasar)
    - [Que es la autenticacion](#que-es-la-autenticacion)
    - [JWT: tu pulsera de festival](#jwt-tu-pulsera-de-festival)
    - [Dos tokens: access y refresh](#dos-tokens-access-y-refresh)
    - [El flujo completo de autenticacion](#el-flujo-completo-de-autenticacion)
    - [Donde se guardan los tokens en el frontend](#donde-se-guardan-los-tokens-en-el-frontend)
    - [Contrasenas: nunca en texto plano](#contrasenas-nunca-en-texto-plano)
  - [7. El viaje de una peticion: de tu click al servidor y vuelta](#7-el-viaje-de-una-peticion-de-tu-click-al-servidor-y-vuelta)
  - [8. DTOs: los formularios de seguridad del aeropuerto](#8-dtos-los-formularios-de-seguridad-del-aeropuerto)
    - [Que es un DTO](#que-es-un-dto)
    - [DTOs de entrada: lo que envias al backend](#dtos-de-entrada-lo-que-envias-al-backend)
    - [DTOs de salida: lo que te devuelve el backend](#dtos-de-salida-lo-que-te-devuelve-el-backend)
    - [La relacion entre DTOs de entrada y salida](#la-relacion-entre-dtos-de-entrada-y-salida)
  - [9. Validacion: class-validator y Zod](#9-validacion-class-validator-y-zod)
    - [Zod (frontend): el primer filtro](#zod-frontend-el-primer-filtro)
    - [class-validator (backend): el segundo filtro](#class-validator-backend-el-segundo-filtro)
    - [ValidationPipe global](#validationpipe-global)
  - [10. Controllers: los recepcionistas](#10-controllers-los-recepcionistas)
    - [Que es un Controller](#que-es-un-controller)
    - [Ejemplo real: AuthController](#ejemplo-real-authcontroller)
    - [Decoradores en los controllers](#decoradores-en-los-controllers)
  - [11. Services: los que hacen el trabajo de verdad](#11-services-los-que-hacen-el-trabajo-de-verdad)
    - [Que es un Service](#que-es-un-service)
    - [Ejemplo real: AuthService (login)](#ejemplo-real-authservice-login)
    - [El patron Service-Repository](#el-patron-service-repository)
  - [12. Entities: el mapa de la base de datos](#12-entities-el-mapa-de-la-base-de-datos)
    - [Que es una Entity](#que-es-una-entity)
    - [Ejemplo real: User Entity](#ejemplo-real-user-entity)
    - [CUDTzEntity: la clase base](#cudtzentity-la-clase-base)
    - [Relaciones entre entities](#relaciones-entre-entities)
  - [13. Guards y decoradores: los porteros del backend](#13-guards-y-decoradores-los-porteros-del-backend)
    - [Que es un Guard](#que-es-un-guard)
    - [AuthGuard: verificar identidad](#authguard-verificar-identidad)
    - [RolesGuard: verificar permisos](#rolesguard-verificar-permisos)
    - [ThrottlerGuard: limite de velocidad](#throttlerguard-limite-de-velocidad)
    - [El decorador @Auth(): todo en uno](#el-decorador-auth-todo-en-uno)
    - [El decorador @ActiveUser()](#el-decorador-activeuser)
  - [14. Manejo de errores: cuando las cosas van mal](#14-manejo-de-errores-cuando-las-cosas-van-mal)
    - [ErrorManager: errores con estilo](#errormanager-errores-con-estilo)
    - [GlobalErrorInterceptor: la red de seguridad](#globalerrorinterceptor-la-red-de-seguridad)
  - [15. Archivos y antivirus: MinIO y ClamAV](#15-archivos-y-antivirus-minio-y-clamav)
    - [MinIO: tu propio Amazon S3](#minio-tu-propio-amazon-s3)
    - [ClamAV: el antivirus](#clamav-el-antivirus)
    - [Proxy de archivos](#proxy-de-archivos)
  - [16. Internacionalizacion: hablando en varios idiomas](#16-internacionalizacion-hablando-en-varios-idiomas)
    - [En el frontend: next-intl](#en-el-frontend-next-intl)
    - [En el backend: nestjs-i18n](#en-el-backend-nestjs-i18n)
  - [17. Resumen visual completo](#17-resumen-visual-completo)
    - [La tabla resumen de tecnologias](#la-tabla-resumen-de-tecnologias)
    - [Y eso es todo (por ahora)](#y-eso-es-todo-por-ahora)

---

## 1. La foto general: que es Kotrip

Kotrip es una aplicacion web para planificar viajes. Puedes crear viajes, invitar amigos, planificar itinerarios, controlar gastos, subir archivos... basicamente, lo que harias en un grupo de WhatsApp pero sin que nadie mande 47 audios de 3 minutos.

La aplicacion tiene tres partes principales:

```mermaid
graph LR
    A["🖥️ Frontend<br/>(lo que ves)"] -->|peticiones HTTP| B["⚙️ Backend<br/>(la logica)"]
    B -->|consultas SQL| C["🗄️ Base de datos<br/>(donde se guarda todo)"]
    B -->|archivos| D["📦 MinIO<br/>(almacen de archivos)"]
    B -->|trabajos en cola| E["🔴 Redis<br/>(cola de tareas)"]
```

Piensa en un restaurante:

- El **frontend** es el comedor: lo que el cliente ve, los menus, las mesas bonitas.
- El **backend** es la cocina: donde se prepara todo, con sus reglas de higiene y sus recetas.
- La **base de datos** es la despensa: donde se guardan todos los ingredientes.
- **Redis** es la lista de comandas pendientes.
- **MinIO** es el almacen donde guardas las fotos de los platos para Instagram.

---

## 2. La infraestructura: Docker y sus amigos

### Que es Docker (y por que nos importa)

Imagina que quieres hacer una paella. Necesitas arroz, azafran, pollo, una paellera... Si cada persona que quiere probar tu receta tiene que ir a comprar todo, instalar una cocina identica a la tuya y seguir tus instrucciones exactas, seria un desastre.

Docker es como mandar un **tupper completo con la comida ya hecha**. Todo el mundo recibe lo mismo, funciona igual en todos lados, y nadie tiene que preocuparse de si tiene la version correcta del azafran.

En terminos tecnicos: Docker empaqueta una aplicacion con todas sus dependencias en un **contenedor**. Un contenedor es como una mini-computadora virtual que tiene exactamente lo que necesita para funcionar.

### El Dockerfile: la receta del tupper

Nuestro `Dockerfile` usa algo llamado **multi-stage build**, que es como cocinar por etapas:

```mermaid
graph TD
    A["📦 base<br/>Node.js 24 pelado"] --> B["📚 deps<br/>Instalar dependencias<br/>(npm ci)"]
    B --> C["🔨 build-backend<br/>Compilar NestJS"]
    B --> D["🔨 build-frontend<br/>Compilar Next.js"]
    C --> E["🚀 backend-prod<br/>Solo lo necesario<br/>para produccion"]
    D --> F["🚀 frontend-prod<br/>Solo lo necesario<br/>para produccion"]
    C --> G["🛠️ backend-dev<br/>Con herramientas<br/>de desarrollo"]
    D --> H["🛠️ frontend-dev<br/>Con herramientas<br/>de desarrollo"]
```

Cada etapa solo copia lo que necesita de la anterior. Es como si en la primera etapa compras todos los ingredientes, en la segunda cocinas, y en la tercera solo te llevas el plato terminado (sin los restos de cebolla en la encimera).

### Docker Compose: la orquesta

Docker Compose es el director de orquesta. En vez de levantar cada contenedor a mano, escribes un archivo que dice: "quiero una base de datos, un backend, un Redis, un MinIO..." y Docker Compose los levanta todos juntos, conectados entre si.

Kotrip tiene varios archivos compose:

| Archivo | Para que sirve |
| --- | --- |
| `compose.backend.yml` | Produccion: backend + PostgreSQL + Redis + MinIO + ClamAV |
| `compose.backend.dev.yml` | Desarrollo: anade pgAdmin, Redis Insight, Bull Board |
| `compose.frontend.yml` | Produccion: frontend standalone |
| `compose.networks.yml` | Define la red compartida entre servicios |

La arquitectura de servicios en produccion se ve asi:

```mermaid
graph TB
    subgraph "Red Docker"
        FE["🖥️ Frontend<br/>Next.js<br/>Puerto 3060"]
        BE["⚙️ Backend<br/>NestJS + Fastify<br/>Puerto 3050"]
        PG["🐘 PostgreSQL 17<br/>Base de datos<br/>Puerto 5432"]
        RD["🔴 Redis 8<br/>Cola de tareas<br/>Puerto 6379"]
        MN["📦 MinIO<br/>Almacen S3<br/>Puertos 9000/9001"]
        AV["🛡️ ClamAV<br/>Antivirus<br/>Puerto 3310"]
    end

    FE -->|"API calls"| BE
    FE -->|"proxy archivos"| MN
    BE --> PG
    BE --> RD
    BE --> MN
    BE -->|"escanea archivos"| AV

    style FE fill:#4ade80,color:#000
    style BE fill:#60a5fa,color:#000
    style PG fill:#a78bfa,color:#000
    style RD fill:#f87171,color:#000
    style MN fill:#fbbf24,color:#000
    style AV fill:#94a3b8,color:#000
```

Cada servicio tiene un **health check** (como un medico que le toma el pulso periódicamente). Si PostgreSQL no responde a `pg_isready`, Docker sabe que algo va mal. El backend no arranca hasta que todos sus servicios dependientes estan "healthy". Es como no abrir el restaurante hasta que la cocina, la despensa y el almacen esten listos.

### Herramientas de desarrollo extra

En modo desarrollo, tenemos herramientas adicionales para ver que esta pasando por dentro:

| Herramienta | Que hace | Analogia |
| --- | --- | --- |
| **pgAdmin** | Interfaz web para ver y editar la base de datos | Abrir la despensa y ver todos los estantes |
| **Redis Insight** | Ver que hay en Redis | Revisar la lista de comandas pendientes |
| **Bull Board** | Ver el estado de los trabajos en cola | El panel de pedidos de la cocina |

---

## 3. El frontend: lo que ves en pantalla

### Next.js: el framework

El frontend esta hecho con **Next.js 16**, que es un framework de React. Si React es como tener piezas de LEGO, Next.js es el manual de instrucciones que te dice como montarlas para que queden bien.

Next.js tiene una caracteristica muy importante: puede ejecutar codigo **en el servidor** y **en el navegador**. Esto es como tener un chef que prepara parte del plato en la cocina (servidor) y te lo termina en la mesa (navegador).

```mermaid
graph LR
    subgraph "Servidor (Node.js)"
        SC["Server Components<br/>Se renderizan aqui<br/>(mas rapido, mas seguro)"]
        SA["Server Actions<br/>Funciones que corren<br/>en el servidor"]
    end

    subgraph "Navegador (tu ordenador)"
        CC["Client Components<br/>Interactividad<br/>(botones, formularios)"]
    end

    SC -->|"HTML generado"| CC
    CC -->|"formularios"| SA
    SA -->|"respuesta"| CC
```

### Estructura del frontend

```
frontend/src/
├── app/                    # Las paginas de la aplicacion
│   ├── [locale]/           # Soporte multiidioma (es, en, gl)
│   ├── api/storage/        # Proxy para acceder a archivos de MinIO
│   └── (main)/             # Layout principal
├── features/               # Funcionalidades organizadas por dominio
│   ├── auth/               # Todo lo de autenticacion
│   ├── trips/              # Todo lo de viajes
│   ├── files/              # Subida de archivos
│   ├── home/               # Pagina principal
│   └── i18n/               # Traducciones
├── components/             # Componentes reutilizables (botones, inputs...)
├── lib/
│   ├── backend/            # Cliente para hablar con el backend
│   │   ├── client.ts       # El mensajero que envia peticiones
│   │   └── openapi.ts      # Tipos generados automaticamente
│   ├── schemas/            # Esquemas de validacion (Zod)
│   └── fetch.ts            # Utilidades para peticiones
├── hooks/                  # Logica reutilizable de React
└── config/                 # Configuracion de la app
```

### El cliente del backend: como habla el frontend con el backend

En `lib/backend/client.ts` vive el **mensajero** del frontend. Usa una libreria llamada `openapi-fetch` que genera tipos automaticamente a partir del esquema OpenAPI del backend. Esto significa que si el backend cambia la forma de un endpoint, TypeScript te avisa inmediatamente de que algo no cuadra.

Este cliente tiene un **middleware de autenticacion** que funciona como un asistente personal:

1. Antes de cada peticion, anade automaticamente tu token de acceso en la cabecera.
2. Si el backend responde "tu token ha caducado" (error 401), el middleware automaticamente intenta renovar el token y reintenta la peticion.
3. Tu, como usuario, ni te enteras. Magia.

### Tecnologias del frontend

| Tecnologia | Que hace | Analogia |
| --- | --- | --- |
| **React 19** | Construir interfaces con componentes | Piezas de LEGO |
| **Next.js 16** | Framework para React (rutas, servidor, optimizacion) | El manual de LEGO |
| **TypeScript** | JavaScript con tipos (detecta errores antes de ejecutar) | Corrector ortografico |
| **Tailwind CSS** | Estilos con clases de utilidad | Pegatinas decorativas predisenas |
| **HeroUI** | Componentes bonitos ya hechos (botones, modales...) | Kit de LEGO pre-montado |
| **react-hook-form** | Gestion eficiente de formularios | Secretaria que organiza tus formularios |
| **Zod** | Validacion de datos en el frontend | Control de calidad antes de enviar |
| **next-intl** | Internacionalizacion (multiples idiomas) | Traductor simultaneo |
| **Leaflet** | Mapas interactivos | Google Maps pero open source |
| **ApexCharts** | Graficos y estadisticas | Excel pero bonito |

---

## 4. El backend: el cerebro de la operacion

### NestJS: el framework

El backend usa **NestJS 11**, que es un framework para Node.js. Si el frontend era un restaurante, NestJS es como construir una cocina industrial: todo tiene su sitio, hay protocolos para todo, y si alguien intenta meter las manos en la olla sin guantes, el sistema lo detiene.

NestJS esta basado en un concepto llamado **Inyeccion de Dependencias** (DI). Suena complicado, pero es simple:

> Imagina que eres un chef y necesitas un cuchillo. En vez de ir tu al cajon a buscar uno, alguien te lo pone en la mano automaticamente. Eso es DI: le dices al sistema "necesito esto" y el sistema te lo da.

### Fastify: el servidor HTTP

En vez del servidor por defecto (Express), Kotrip usa **Fastify**, que es significativamente mas rapido. Es la diferencia entre un camarero que camina y uno que va en patines.

### Estructura del backend

```
backend/src/
├── main.ts                    # Punto de entrada (enciende la cocina)
├── app.module.ts              # Modulo raiz (el plano de la cocina)
├── common/                    # Cosas compartidas
│   ├── decorators/            # Anotaciones reutilizables
│   ├── entities/              # Entidad base con timestamps
│   ├── error-handling/        # Gestion centralizada de errores
│   ├── interceptors/          # Interceptores (logging, errores)
│   └── pipes/                 # Transformadores de datos
├── modules/
│   ├── auth/                  # Autenticacion
│   ├── user/                  # Usuarios
│   ├── trip/                  # Viajes
│   ├── files/                 # Archivos
│   ├── health/                # Estado del servidor
│   ├── locality/              # Municipios de Espana
│   ├── seeder/                # Datos iniciales
│   └── i18n-validator/        # Validacion con traducciones
└── i18n/                      # Archivos de traduccion (es, en, gl)
```

### Modulos: las secciones de la cocina

En NestJS, todo se organiza en **modulos**. Cada modulo es como una seccion de la cocina:

```mermaid
graph TB
    subgraph "AppModule (la cocina entera)"
        AM["🏠 App Module"]

        subgraph "Modulos de negocio"
            AUTH["🔐 AuthModule"]
            USER["👤 UserModule"]
            TRIP["✈️ TripModule"]
            FILE["📁 FilesModule"]
            LOC["📍 LocalityModule"]
        end

        subgraph "Modulos de infraestructura"
            DB["🗄️ TypeOrmModule<br/>(PostgreSQL)"]
            I18N["🌍 I18nModule<br/>(traducciones)"]
            THRT["🛡️ ThrottlerModule<br/>(rate limiting)"]
            BULL["🐂 BullModule<br/>(colas Redis)"]
            SEED["🌱 SeederModule<br/>(datos iniciales)"]
        end
    end

    AM --> AUTH
    AM --> USER
    AM --> TRIP
    AM --> FILE
    AM --> LOC
    AM --> DB
    AM --> I18N
    AM --> THRT
    AM --> BULL
    AM --> SEED

    AUTH --> USER
    TRIP --> USER
    FILE --> USER
```

Cada modulo contiene sus propios controllers, services, entities y DTOs. Es como si la seccion de postres tiene su propio chef, sus propias recetas, sus propios ingredientes y su propia lista de pedidos.

---

## 5. El paquete compartido: @kotrip/data

Hay ciertas cosas que tanto el frontend como el backend necesitan saber. Por ejemplo: que roles de usuario existen, que estados puede tener un viaje, cual es la longitud minima de una contrasena...

Para no duplicar esta informacion (y arriesgarte a que un lado diga "hay 3 roles" y el otro diga "hay 4"), existe el paquete `@kotrip/data`. Es como un **diccionario comun** que ambos lados consultan.

```mermaid
graph LR
    DATA["📖 @kotrip/data<br/>Enums, constantes, tipos"]
    FE["🖥️ Frontend"]
    BE["⚙️ Backend"]

    DATA --> FE
    DATA --> BE

    style DATA fill:#fbbf24,color:#000
```

Que contiene:

```
data/src/modules/
├── auth/
│   └── enums.ts         # OtpPurpose (REGISTRATION_VERIFICATION, PASSWORD_RECOVERY)
├── user/
│   ├── enums.ts         # Role (USER, ADMIN), Language (EN, ES, GL), UserStatus
│   ├── constants.ts     # MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, etc.
│   └── role-groups.ts   # Agrupaciones de roles
├── trip/
│   ├── enums.ts         # TripStatus (PLANNED, ACTIVE, FINISHED, CANCELLED)
│   └── constants.ts     # Limites de longitud para nombres, descripciones...
└── storage/
    └── constants.ts     # Constantes de almacenamiento
```

Un ejemplo concreto: el enum `UserStatus` define que estados puede tener un usuario:

```typescript
enum UserStatus {
  PENDING_VERIFICATION, // Acaba de registrarse, no ha verificado el email
  PENDING_REVIEW, // Verificado, pero esperando aprobacion
  APPROVED, // Todo correcto, puede entrar
  IMPORTED, // Importado de otro sistema
  REJECTED, // Rechazado
  BLOCKED, // Bloqueado (se porto mal)
}
```

Si el backend usa `UserStatus.APPROVED` y el frontend tambien, ambos se refieren exactamente a lo mismo. Cero ambiguedad.

---

## 6. Autenticacion: quien eres tu y por que deberia dejarte pasar

### Que es la autenticacion

La autenticacion es el proceso de demostrar que eres quien dices ser. En la vida real, es ensenar el DNI. En una aplicacion web, es el clasico "email y contrasena".

Pero hay un problema: HTTP (el protocolo de internet) **no tiene memoria**. Cada vez que tu navegador hace una peticion al servidor, el servidor no tiene ni idea de quien eres. Es como si cada vez que entras al restaurante, el camarero te preguntara "y tu quien eres?".

### JWT: tu pulsera de festival

Para resolver esto, usamos **JWT (JSON Web Token)**. Cuando te autentificas correctamente, el servidor te da un token, que es como una **pulsera de festival**: mientras la lleves puesta, puedes entrar a todas las zonas sin tener que ensenar el DNI cada vez.

Un JWT tiene tres partes (separadas por puntos):

```
eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAa290cmlwLmVzIn0.firma_secreta
|_______ Cabecera ______||_____________ Datos __________________||___ Firma ___|
```

- **Cabecera**: dice que tipo de token es y como esta firmado.
- **Datos (payload)**: informacion sobre ti (email, rol, cuando caduca...).
- **Firma**: una firma criptografica que demuestra que el token no ha sido manipulado. Solo el servidor puede crear esta firma porque solo el tiene la clave secreta.

### Dos tokens: access y refresh

Kotrip usa **dos tokens** distintos:

| Token | Vida util | Para que sirve |
| --- | --- | --- |
| **Access Token** | Corta (minutos) | Identificarte en cada peticion |
| **Refresh Token** | Larga (dias) | Conseguir un nuevo access token sin volver a meter tu contrasena |

Por que dos? Seguridad. Si alguien roba tu access token, solo funciona unos minutos. El refresh token es mas valioso, asi que se guarda con mas cuidado.

Es como tener una tarjeta de acceso temporal para la oficina (access token) y una tarjeta maestra guardada en la caja fuerte (refresh token) que te permite sacar una nueva tarjeta temporal cuando la anterior caduca.

### El flujo completo de autenticacion

```mermaid
sequenceDiagram
    actor U as Usuario
    participant F as Frontend (Next.js)
    participant B as Backend (NestJS)
    participant DB as PostgreSQL

    Note over U,DB: 📝 REGISTRO

    U->>F: Rellena formulario de registro
    F->>F: Valida datos con Zod
    F->>B: POST /auth/register
    B->>B: Valida con class-validator
    B->>B: Hashea contrasena con bcrypt
    B->>DB: Guarda usuario (status: PENDING_VERIFICATION)
    B->>DB: Guarda codigo OTP de 6 digitos
    B-->>F: OK, revisa tu email
    F-->>U: "Te hemos enviado un codigo"

    Note over U,DB: ✉️ VERIFICACION DE EMAIL

    U->>F: Introduce codigo de 6 digitos
    F->>B: POST /auth/verify-email
    B->>DB: Comprueba codigo OTP
    B->>DB: Cambia status a APPROVED
    B-->>F: Email verificado!

    Note over U,DB: 🔑 LOGIN

    U->>F: Email + contrasena
    F->>F: Valida formato con Zod
    F->>B: POST /auth/login
    B->>DB: Busca usuario por email
    B->>B: Compara contrasena con bcrypt
    B->>B: Genera access + refresh tokens (JWT)
    B-->>F: Tokens + datos del usuario
    F->>F: Cifra tokens y los guarda en cookies
    F-->>U: Bienvenido! Redireccion a /home

    Note over U,DB: 🔄 RENOVACION AUTOMATICA

    U->>F: Navega por la app (access token caducado)
    F->>B: Peticion con token caducado
    B-->>F: 401 No autorizado
    F->>F: Middleware detecta el 401
    F->>B: POST /auth/refresh (con refresh token)
    B->>B: Verifica refresh token, genera nuevos tokens
    B-->>F: Nuevos tokens
    F->>F: Guarda nuevos tokens en cookies
    F->>B: Reintenta peticion original con nuevo token
    B-->>F: Respuesta exitosa
    F-->>U: (ni se entero de nada 😎)
```

### Donde se guardan los tokens en el frontend

Los tokens se guardan en **cookies cifradas** (AES encryption). Esto es importante por varias razones:

1. **HttpOnly**: JavaScript del navegador no puede leerlas. Si algun script malicioso se cuela en la pagina, no puede robar tus tokens.
2. **Cifradas**: Incluso si alguien intercepta la cookie, ve un churro de caracteres ilegible.
3. **Secure**: Solo se envian por HTTPS.

```mermaid
graph TD
    subgraph "Navegador del usuario"
        CK["🍪 Cookies cifradas"]
        CK --> AT["accessToken (cifrado AES)"]
        CK --> RT["refreshToken (cifrado AES)"]
        CK --> SS["session (datos de usuario, cifrado AES)"]
    end

    subgraph "Lo que ve un atacante"
        HK["🔒 aGVsbG8gd29ybGQgdGhpcyBpcyBub3Q..."]
    end
```

### Contrasenas: nunca en texto plano

Cuando te registras, tu contrasena **jamas** se guarda tal cual. Se transforma usando **bcrypt**, que es un algoritmo de hashing. El hash es una transformacion de un solo sentido: puedes convertir "MiContrasena123!" en `$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`, pero no puedes hacer lo contrario.

Es como una trituradora de papel: puedes meter un documento y obtener confeti, pero no puedes reconstruir el documento original a partir del confeti.

Cuando haces login, el servidor hashea la contrasena que envias y compara **los hashes**, nunca las contrasenas en texto plano.

---

## 7. El viaje de una peticion: de tu click al servidor y vuelta

Vamos a seguir el viaje completo de una peticion real. Digamos que quieres ver la lista de tus viajes.

```mermaid
sequenceDiagram
    actor U as Tu navegador
    participant CC as Client Component<br/>(React)
    participant SA as Server Action<br/>(Next.js servidor)
    participant MW as Auth Middleware<br/>(client.ts)
    participant BE as Backend<br/>(NestJS)
    participant GD as AuthGuard
    participant CT as TripController
    participant SV as TripService
    participant DB as PostgreSQL

    U->>CC: Click en "Mis viajes"
    CC->>SA: Llama a getTrips()
    SA->>MW: backendClient.GET('/trips')
    MW->>MW: Lee accessToken de cookies
    MW->>BE: GET /trips<br/>Authorization: Bearer eyJhb...
    BE->>GD: Pasa por AuthGuard
    GD->>GD: Verifica JWT, extrae usuario
    GD->>GD: Comprueba status == APPROVED
    GD-->>CT: OK, usuario autenticado
    CT->>SV: getTrips(userId)
    SV->>DB: SELECT * FROM trips WHERE...
    DB-->>SV: Datos de viajes
    SV-->>CT: Array de viajes
    CT-->>BE: Respuesta JSON
    BE-->>MW: 200 OK + datos
    MW-->>SA: Datos de viajes
    SA-->>CC: Datos de viajes
    CC-->>U: Renderiza la lista en pantalla
```

Cada capa tiene su responsabilidad:

| Capa | Responsabilidad | Analogia |
| --- | --- | --- |
| **Client Component** | Mostrar cosas y capturar interacciones | El camarero que atiende mesas |
| **Server Action** | Ejecutar logica en el servidor de Next.js | El maitre que coordina |
| **Auth Middleware** | Anadir tokens automaticamente | El asistente que te pone el gafete |
| **AuthGuard** | Verificar que tienes permiso | El portero del VIP |
| **Controller** | Recibir la peticion y decidir que hacer | El recepcionista |
| **Service** | Ejecutar la logica de negocio | El chef |
| **Base de datos** | Guardar y devolver datos | La despensa |

---

## 8. DTOs: los formularios de seguridad del aeropuerto

### Que es un DTO

DTO significa **Data Transfer Object** (Objeto de Transferencia de Datos). Es una clase que define exactamente que datos esperas recibir y en que formato. Es como el formulario que rellenas en el aeropuerto: tiene campos especificos, y si dejas uno en blanco o escribes algo raro, no pasas.

### DTOs de entrada: lo que envias al backend

Cuando haces login, envias un email y una contrasena. El DTO de login define que forma deben tener esos datos:

```typescript
// backend/src/modules/auth/dto/login.dto.ts (simplificado)
export class LoginDto {
  @IsEmail() // Debe ser un email valido
  @MaxLength(512) // No mas de 512 caracteres (por si acaso)
  email: string;

  @IsString() // Debe ser texto
  @MinLength(8) // Minimo 8 caracteres
  @MaxLength(128) // Maximo 128 caracteres
  @Matches(/[A-Z]/) // Al menos una mayuscula
  @Matches(/[a-z]/) // Al menos una minuscula
  @Matches(/[0-9]/) // Al menos un numero
  @Matches(/[^A-Za-z0-9]/) // Al menos un caracter especial
  password: string;
}
```

Si envias `{ email: "no-soy-un-email", password: "123" }`, el DTO lo rechaza antes de que el codigo de negocio se entere de nada. Es como si el guardia de seguridad del aeropuerto no te deja pasar porque no has rellenado bien el formulario, sin necesidad de molestar al piloto.

### DTOs de salida: lo que te devuelve el backend

Tambien hay DTOs para las respuestas. Cuando haces login exitosamente, el backend te devuelve un `LoginOutputDto`:

```typescript
// backend/src/modules/auth/dto-outputs/login.output.dto.ts (simplificado)
export class LoginOutputDto {
  backendTokens: {
    accessToken: string; // Tu pulsera de festival
    refreshToken: string; // Tu pulsera VIP de repuesto
    expiresIn: number; // Cuanto dura (en segundos)
    refreshExpiresIn: number; // Cuanto dura la de repuesto
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    role: Role;
    // ... (sin la contrasena, obviamente)
  };
}
```

Fijate que la **contrasena nunca aparece** en la respuesta. El DTO de salida actua como un filtro que solo deja pasar la informacion que el frontend necesita.

### La relacion entre DTOs de entrada y salida

```mermaid
graph LR
    subgraph "Lo que envias"
        IN["📥 LoginDto<br/>email: string<br/>password: string"]
    end

    subgraph "Lo que pasa dentro"
        PROC["⚙️ AuthService<br/>Valida contrasena<br/>Genera tokens"]
    end

    subgraph "Lo que recibes"
        OUT["📤 LoginOutputDto<br/>tokens + usuario<br/>(sin contrasena!)"]
    end

    IN --> PROC --> OUT
```

---

## 9. Validacion: class-validator y Zod

La validacion ocurre en **dos lugares**, porque nunca esta de mas comprobar las cosas dos veces.

### Zod (frontend): el primer filtro

Antes de enviar datos al backend, el frontend los valida con **Zod**. Es como un asistente que revisa tu formulario antes de enviarlo por correo:

```typescript
// Ejemplo simplificado de esquema Zod
const loginSchema = z.object({
  email: z.email('Introduce un email valido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
});
```

Si el email no tiene formato de email, el formulario te muestra un error al instante, sin necesidad de contactar al servidor. Rapido y amigable.

### class-validator (backend): el segundo filtro

Incluso si el frontend valida los datos, el backend los valida otra vez con **class-validator**. Por que? Porque nunca te fies del frontend. Alguien podria enviar peticiones directamente al backend saltandose el frontend (con herramientas como Postman o curl).

Es como la diferencia entre el control de seguridad del edificio (frontend) y el control de seguridad de la caja fuerte (backend). Puedes engañar al del edificio, pero la caja fuerte tiene su propia cerradura.

```mermaid
graph LR
    U["👤 Usuario"] -->|datos| Z["🔍 Zod<br/>(frontend)<br/>Validacion rapida"]
    Z -->|datos validados| CV["🔍 class-validator<br/>(backend)<br/>Validacion estricta"]
    CV -->|datos seguros| S["⚙️ Service<br/>(logica de negocio)"]

    Z -.->|error inmediato| U
    CV -.->|error HTTP 400| U
```

### ValidationPipe global

En el `main.ts` del backend, se configura un **ValidationPipe global** que aplica automaticamente class-validator a todos los DTOs:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Elimina campos no definidos en el DTO
    forbidNonWhitelisted: true, // Rechaza si envias campos extra
    stopAtFirstError: true, // Para en el primer error (no los acumula)
  }),
);
```

Opciones importantes:

- **whitelist**: Si el DTO dice que solo espera `email` y `password`, y envias un campo extra como `hackear: true`, ese campo se elimina silenciosamente.
- **forbidNonWhitelisted**: Mejor aun, si envias campos extra, directamente te rechaza la peticion.
- **stopAtFirstError**: No pierde tiempo validando todo si el primer campo ya fallo.

---

## 10. Controllers: los recepcionistas

### Que es un Controller

Un controller es la **puerta de entrada** al backend. Cada endpoint de la API (cada URL a la que puedes hacer peticiones) esta definido en un controller. Su trabajo es:

1. Recibir la peticion.
2. Extraer los datos (del body, de la URL, de los headers...).
3. Llamar al service correspondiente.
4. Devolver la respuesta.

No hace logica de negocio. Es como el recepcionista de un hotel: te recibe, mira tu reserva y te manda a la habitacion correcta. No limpia habitaciones ni cocina desayunos.

### Ejemplo real: AuthController

```typescript
// backend/src/modules/auth/auth.controller.ts (simplificado)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login') // POST /auth/login
  login(@Body() loginDto: LoginDto) {
    // Extrae y valida el body
    return this.authService.login(loginDto);
  }

  @Post('register') // POST /auth/register
  register(@Body() registerDto: NewRegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email') // POST /auth/verify-email
  verifyEmail(@Body() verifyDto: VerifyDto) {
    return this.authService.verifyEmail(verifyDto);
  }

  @Post('refresh') // POST /auth/refresh
  @UseGuards(RefreshGuard) // Solo con refresh token valido
  refreshToken(@ActiveUser() user) {
    return this.authService.refreshToken(user);
  }

  @Patch('session') // PATCH /auth/session
  @Auth(Role.USER) // Solo usuarios autenticados
  updateSession(@ActiveUser() user, @Body() dto: UpdateSessionDto) {
    return this.authService.updateSession(user, dto);
  }
}
```

Observa como cada metodo es cortito. Recibe, delega, devuelve. Limpio y ordenado.

### Decoradores en los controllers

Los `@` que ves encima de los metodos son **decoradores**. Son como etiquetas que modifican el comportamiento:

| Decorador | Que hace | Analogia |
| --- | --- | --- |
| `@Controller('auth')` | Define la ruta base `/auth` | El nombre del departamento |
| `@Post('login')` | Este metodo responde a POST /auth/login | La ventanilla especifica |
| `@Body()` | Extrae los datos del cuerpo de la peticion | "Dame el formulario que has rellenado" |
| `@UseGuards(RefreshGuard)` | Aplica un guardia de seguridad | "Ensenaa la pulsera VIP" |
| `@Auth(Role.USER)` | Solo usuarios autenticados con rol USER | "Solo empleados autorizados" |
| `@ActiveUser()` | Extrae el usuario del token JWT | "Ah, eres tu, Juan" |

---

## 11. Services: los que hacen el trabajo de verdad

### Que es un Service

Si el controller es el recepcionista, el service es el **chef**. Aqui esta toda la logica de negocio: validar que la contrasena es correcta, generar tokens, crear viajes, calcular gastos...

### Ejemplo real: AuthService (login)

```typescript
// backend/src/modules/auth/services/auth.service.ts (simplificado)
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Buscar usuario por email (incluyendo la contrasena hasheada)
    const user = await this.userRepo.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'password', 'role', 'status'],
    });

    // 2. Si no existe, error
    if (!user) {
      throw new ErrorManager('UNAUTHORIZED', 'Credenciales invalidas');
    }

    // 3. Comparar contrasena con bcrypt
    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new ErrorManager('UNAUTHORIZED', 'Credenciales invalidas');
    }

    // 4. Verificar que el usuario esta aprobado
    if (
      user.status !== UserStatus.APPROVED &&
      user.status !== UserStatus.IMPORTED
    ) {
      throw new ErrorManager('FORBIDDEN', 'Tu cuenta no esta activa');
    }

    // 5. Generar tokens JWT
    const tokens = await this.createBackendTokens(user);

    // 6. Devolver tokens + datos del usuario (sin la contrasena)
    return {
      backendTokens: tokens,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
```

Fijate en algo clave: cuando el usuario no existe y cuando la contrasena es incorrecta, el mensaje de error es **el mismo** ("Credenciales invalidas"). Esto es a proposito: si dijeras "el usuario no existe" vs "contrasena incorrecta", un atacante podria deducir que emails estan registrados en la plataforma.

### El patron Service-Repository

```mermaid
graph TD
    CT["Controller<br/>Recibe peticion"] --> SV["Service<br/>Logica de negocio"]
    SV --> RP["Repository (TypeORM)<br/>Habla con la BD"]
    RP --> DB["PostgreSQL<br/>Base de datos"]

    style CT fill:#4ade80,color:#000
    style SV fill:#60a5fa,color:#000
    style RP fill:#a78bfa,color:#000
    style DB fill:#f87171,color:#000
```

- **Controller**: recibe y responde. No sabe de base de datos.
- **Service**: ejecuta la logica. No sabe de HTTP.
- **Repository**: habla con la base de datos. No sabe de logica de negocio.

Cada uno hace lo suyo y no se mete en el trabajo del otro. Como un equipo bien organizado.

---

## 12. Entities: el mapa de la base de datos

### Que es una Entity

Una entity (entidad) es una **clase de TypeScript que representa una tabla de la base de datos**. Cada propiedad de la clase es una columna de la tabla. TypeORM (el ORM que usamos) se encarga de traducir entre objetos de TypeScript y filas de PostgreSQL.

Es como tener un plano del edificio: la entity describe como se ve la tabla, y TypeORM la construye por ti.

### Ejemplo real: User Entity

```typescript
// backend/src/modules/user/entities/user.entity.ts (simplificado)
@Entity()
export class User extends CUDTzEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Identificador unico (UUID)

  @Column({ unique: true, length: 512 })
  email: string; // Email (unico en toda la tabla)

  @Column({ nullable: true })
  firstName: string; // Nombre

  @Column({ nullable: true })
  lastName: string; // Apellido

  @Column({ select: false }) // NO se incluye en las consultas por defecto
  password: string; // Contrasena hasheada

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role; // Rol (USER o ADMIN)

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus; // Estado de la cuenta

  @Column({ type: 'enum', enum: Language, default: Language.ES })
  language: Language; // Idioma preferido
}
```

Puntos importantes:

- **`@PrimaryGeneratedColumn('uuid')`**: El ID se genera automaticamente como UUID (un identificador unico universal, como `a1b2c3d4-e5f6-...`). Es mejor que un numero autoincremental porque no revela cuantos usuarios tienes.
- **`select: false` en password**: Cuando haces una consulta normal, la contrasena **no se incluye**. Solo cuando especificamente la pides (como en el login). Esto previene que la contrasena se filtre accidentalmente.
- **`unique: true` en email**: La base de datos garantiza que no pueden existir dos usuarios con el mismo email.

### CUDTzEntity: la clase base

Todas las entities heredan de `CUDTzEntity` (Created, Updated, Dates, TimeZone), que anade automaticamente:

```typescript
export class CUDTzEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date; // Cuando se creo este registro

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date; // Cuando se modifico por ultima vez
}
```

Asi no tienes que acordarte de anadir estos campos en cada entity. Es herencia clasica de la programacion orientada a objetos, aplicada de forma practica.

### Relaciones entre entities

Las entities se relacionan entre si, igual que las tablas en una base de datos relacional:

```mermaid
erDiagram
    USER ||--o{ TRIP_MEMBER : "es miembro de"
    TRIP ||--o{ TRIP_MEMBER : "tiene miembros"
    TRIP ||--o{ TRIP_ITINERARY : "tiene paradas"
    TRIP ||--o{ EXPENSE : "tiene gastos"
    TRIP ||--o{ TRIP_MEMBER_INVITATION : "tiene invitaciones"
    TRIP_ITINERARY ||--o{ TRIP_ITINERARY_TICKET : "tiene tickets"
    TRIP }o--|| LOCALITY : "es en"
    USER ||--o{ USER_EMAIL_VERIFICATION : "tiene codigos OTP"

    USER {
        uuid id PK
        string email UK
        string firstName
        string lastName
        string password
        enum role
        enum status
        enum language
    }

    TRIP {
        uuid id PK
        string name
        string description
        date startDate
        date endDate
        enum status
        decimal budget
        int rating
    }

    TRIP_MEMBER {
        uuid id PK
        uuid userId FK
        uuid tripId FK
        enum permissions
    }

    EXPENSE {
        uuid id PK
        uuid tripId FK
        string concept
        decimal amount
    }

    LOCALITY {
        int id PK
        string name
        string province
    }
```

---

## 13. Guards y decoradores: los porteros del backend

### Que es un Guard

Un guard es una clase que decide si una peticion puede continuar o no. Se ejecuta **antes** de que la peticion llegue al controller. Es literalmente un portero.

### AuthGuard: verificar identidad

El `AuthGuard` es el portero principal. Esto es lo que hace:

```mermaid
graph TD
    REQ["📨 Peticion entrante"] --> AG["🛡️ AuthGuard"]
    AG --> T1{"Tiene token<br/>en el header?"}
    T1 -->|No| R1["❌ 401 No autorizado"]
    T1 -->|Si| T2{"El token<br/>es valido?"}
    T2 -->|No| R2["❌ 401 Token invalido"]
    T2 -->|Si| T3{"El usuario<br/>esta aprobado?"}
    T3 -->|No| R3["❌ 403 Cuenta no activa"]
    T3 -->|Si| T4["✅ Adelante!<br/>Anade usuario al request"]
    T4 --> CT["📋 Controller"]
```

### RolesGuard: verificar permisos

Despues del AuthGuard, puede actuar el `RolesGuard`. Este comprueba que el usuario tiene el **rol necesario** para acceder al recurso.

```typescript
// Ejemplo de uso
@Auth(Role.ADMIN)  // Solo administradores pueden acceder
@Get('all-users')
getAllUsers() { ... }

@Auth(Role.USER)   // Cualquier usuario autenticado
@Get('my-trips')
getMyTrips() { ... }
```

Los administradores (`ADMIN`) siempre pasan el check de roles. Es como el dueno del restaurante: puede entrar a todas las zonas.

### ThrottlerGuard: limite de velocidad

El `ThrottlerGuard` previene que alguien haga demasiadas peticiones en poco tiempo (rate limiting). En Kotrip, el limite es **10 peticiones por minuto** en los endpoints de autenticacion.

Esto protege contra ataques de fuerza bruta: si alguien intenta adivinar tu contrasena probando miles de combinaciones, despues de 10 intentos en un minuto, el servidor le bloquea temporalmente. Es como si el portero dijera "llevas 10 intentos de entrar con el DNI equivocado, vuelve en un rato".

### El decorador @Auth(): todo en uno

Kotrip tiene un decorador personalizado `@Auth()` que combina varios guards en uno:

```typescript
// Esto...
@Auth(Role.USER)

// ...equivale a esto:
@UseGuards(AuthGuard, RolesGuard)
@SetMetadata('roles', [Role.USER])
```

Es un atajo que evita escribir tres lineas cada vez. Pragmatismo puro.

### El decorador @ActiveUser()

Cuando el AuthGuard verifica tu token, extrae tu informacion (id, email, rol) y la adjunta a la peticion. El decorador `@ActiveUser()` permite al controller acceder a esa informacion facilmente:

```typescript
@Auth(Role.USER)
@Get('profile')
getProfile(@ActiveUser() user: UserActiveInterface) {
  // user.id, user.email, user.role... disponibles directamente
  return this.userService.findById(user.id);
}
```

---

## 14. Manejo de errores: cuando las cosas van mal

### ErrorManager: errores con estilo

El backend tiene una clase centralizada para errores llamada `ErrorManager`. En vez de lanzar excepciones genericas, todo error pasa por aqui:

```typescript
// Crear un error
throw new ErrorManager('NOT_FOUND', 'El viaje no existe');
throw new ErrorManager('UNAUTHORIZED', 'Credenciales invalidas');
throw new ErrorManager('FORBIDDEN', 'No tienes permiso para hacer esto');
throw new ErrorManager('BAD_REQUEST', 'Los datos no son validos');
```

ErrorManager convierte estos errores en respuestas HTTP con el codigo de estado correcto:

| Tipo | Codigo HTTP | Significado |
| --- | --- | --- |
| BAD_REQUEST | 400 | "Has enviado datos mal formateados" |
| UNAUTHORIZED | 401 | "No se quien eres" |
| FORBIDDEN | 403 | "Se quien eres, pero no tienes permiso" |
| NOT_FOUND | 404 | "Eso que buscas no existe" |
| INTERNAL_SERVER_ERROR | 500 | "Algo ha petado por nuestra parte" |

### GlobalErrorInterceptor: la red de seguridad

Si algun error no es capturado por el codigo (un bug, una excepcion inesperada, la base de datos se ha caido...), el `GlobalErrorInterceptor` lo atrapa y lo normaliza. Ningún error escapa sin formato.

```mermaid
graph TD
    ERR["💥 Error inesperado"] --> GEI["🕸️ GlobalErrorInterceptor"]
    GEI --> NORM["Normaliza el error"]
    NORM --> RESP["📤 Respuesta HTTP formateada<br/>{ statusCode: 500, message: '...' }"]
```

Esto evita que el servidor envie mensajes de error con informacion interna (como nombres de tablas, consultas SQL, o stack traces) que podrian ser utiles para un atacante. El usuario solo ve un mensaje limpio.

---

## 15. Archivos y antivirus: MinIO y ClamAV

### MinIO: tu propio Amazon S3

MinIO es un servidor de almacenamiento de archivos compatible con la API de Amazon S3. En vez de guardar archivos en el disco del servidor (mala idea: si el servidor se cae, adios archivos), los guardamos en MinIO.

Piensa en MinIO como un Google Drive pero que tu controlas. Los archivos se organizan en **buckets** (cubos), que son como carpetas de nivel superior.

### ClamAV: el antivirus

Antes de aceptar cualquier archivo subido por un usuario, el backend lo pasa por **ClamAV**, un antivirus de codigo abierto. Si detecta malware, el archivo se rechaza.

```mermaid
graph LR
    U["👤 Usuario<br/>sube archivo"] --> BE["⚙️ Backend"]
    BE --> AV{"🛡️ ClamAV<br/>Escaneo antivirus"}
    AV -->|Limpio| MN["📦 MinIO<br/>Se guarda"]
    AV -->|Infectado| REJ["❌ Rechazado"]
```

Es como el control de equipaje del aeropuerto: todo pasa por el escaner de rayos X antes de que lo acepten.

### Proxy de archivos

El frontend no accede directamente a MinIO. En su lugar, tiene una ruta API (`/api/storage/`) que actua como **proxy**. Esto anade una capa de seguridad extra: el navegador del usuario nunca conoce la URL real de MinIO.

---

## 16. Internacionalizacion: hablando en varios idiomas

Kotrip soporta tres idiomas: **espanol (es)**, **ingles (en)** y **gallego (gl)**.

### En el frontend: next-intl

El frontend usa `next-intl` con rutas basadas en el locale. La URL cambia segun el idioma:

- `/es/viajes` para espanol
- `/en/trips` para ingles
- `/gl/viaxes` para gallego

### En el backend: nestjs-i18n

El backend tambien traduce sus mensajes de error. Cuando class-validator rechaza un campo, el mensaje de error viene en el idioma del usuario.

Como sabe el backend que idioma hablas? A traves del `JwtLanguageResolver`: extrae el idioma de tu token JWT.

```mermaid
graph LR
    JWT["🔑 JWT Token<br/>language: 'es'"] --> RESOLVER["🌍 JwtLanguageResolver"]
    RESOLVER --> I18N["📖 i18n Service"]
    I18N --> MSG["'La contrasena debe tener<br/>al menos 8 caracteres'"]
```

Si tu idioma es ingles, veras: "Password must be at least 8 characters". Mismo error, diferente idioma.

---

## 17. Resumen visual completo

Para cerrar, aqui tienes el mapa completo de como encajan todas las piezas:

```mermaid
graph TB
    subgraph "🌐 Cliente (tu navegador)"
        BROWSER["Navegador"]
        COOKIES["🍪 Cookies cifradas<br/>(tokens + session)"]
    end

    subgraph "🖥️ Frontend (Next.js 16)"
        direction TB
        PAGES["📄 Paginas<br/>(App Router)"]
        COMPONENTS["🧩 Componentes<br/>(React 19 + HeroUI)"]
        SA["⚡ Server Actions"]
        CLIENT["📡 Backend Client<br/>(openapi-fetch)"]
        AUTHMW["🔐 Auth Middleware<br/>(anade tokens)"]
        SCHEMAS["✅ Zod Schemas<br/>(validacion frontend)"]
    end

    subgraph "⚙️ Backend (NestJS 11 + Fastify)"
        direction TB
        GUARDS["🛡️ Guards<br/>(Auth, Roles, Throttler)"]
        CONTROLLERS["📋 Controllers<br/>(reciben peticiones)"]
        SERVICES["🔧 Services<br/>(logica de negocio)"]
        DTOS["📝 DTOs + class-validator<br/>(validacion backend)"]
        ENTITIES["🗺️ Entities (TypeORM)<br/>(mapa de la BD)"]
        ERRORS["💥 ErrorManager<br/>(errores centralizados)"]
        INTRCPT["🕸️ Interceptors<br/>(logging, errores)"]
    end

    subgraph "🗄️ Infraestructura (Docker)"
        PG["🐘 PostgreSQL 17"]
        REDIS["🔴 Redis 8"]
        MINIO["📦 MinIO"]
        CLAMAV["🛡️ ClamAV"]
    end

    subgraph "📖 Compartido"
        DATA["@kotrip/data<br/>(enums, constantes, tipos)"]
    end

    BROWSER --> PAGES
    BROWSER <--> COOKIES
    PAGES --> COMPONENTS
    COMPONENTS --> SA
    SA --> SCHEMAS
    SCHEMAS --> CLIENT
    CLIENT --> AUTHMW
    AUTHMW -->|HTTP + Bearer token| GUARDS
    GUARDS --> DTOS
    DTOS --> CONTROLLERS
    CONTROLLERS --> SERVICES
    SERVICES --> ENTITIES
    ENTITIES --> PG
    SERVICES --> REDIS
    SERVICES --> MINIO
    SERVICES --> CLAMAV
    SERVICES --> ERRORS
    INTRCPT -.->|intercepta errores| ERRORS

    DATA -.-> SCHEMAS
    DATA -.-> DTOS
    DATA -.-> ENTITIES
```

### La tabla resumen de tecnologias

| Capa           | Tecnologia      | Version  | Para que                   |
| -------------- | --------------- | -------- | -------------------------- |
| **Frontend**   | Next.js         | 16       | Framework React con SSR    |
|                | React           | 19       | Componentes de interfaz    |
|                | TypeScript      | 5.9      | Tipos estaticos            |
|                | Tailwind CSS    | 4        | Estilos                    |
|                | HeroUI          | 3.0 beta | Componentes UI             |
|                | Zod             | 4        | Validacion frontend        |
|                | react-hook-form | 7        | Formularios                |
|                | next-intl       | 4        | Internacionalizacion       |
|                | openapi-fetch   | --       | Cliente API tipado         |
| **Backend**    | NestJS          | 11       | Framework backend          |
|                | Fastify         | --       | Servidor HTTP rapido       |
|                | TypeORM         | 0.3      | ORM para PostgreSQL        |
|                | class-validator | --       | Validacion de DTOs         |
|                | bcryptjs        | --       | Hashing de contrasenas     |
|                | JWT             | --       | Tokens de autenticacion    |
|                | nestjs-i18n     | --       | Traducciones backend       |
|                | Bull            | --       | Colas de trabajo           |
| **Infra**      | PostgreSQL      | 17       | Base de datos relacional   |
|                | Redis           | 8        | Cache y colas              |
|                | MinIO           | --       | Almacenamiento de archivos |
|                | ClamAV          | --       | Antivirus                  |
|                | Docker          | --       | Contenedores               |
| **Compartido** | @kotrip/data    | --       | Enums, tipos, constantes   |

---

### Y eso es todo (por ahora)

Si has llegado hasta aqui, enhorabuena. Ahora sabes mas sobre como funciona Kotrip que la mayoria de personas que dicen "yo se de tecnologia" en LinkedIn.

Recuerda: la programacion no es magia. Es un monton de gente escribiendo instrucciones muy especificas para que una maquina haga exactamente lo que le pides. A veces funciona. A veces no. Y cuando no funciona, hay que leer el error con calma, buscar en Google, y rezar un poco.

Bienvenido al club.
