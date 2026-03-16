---
description: Instructions for AI assistants when working on the Kotrip platform
applyTo: '**'
---

# Kotrip Platform - Architecture for Kotrip applications

## Instruction loading (mandatory)

Before starting any task:

1. Always read `.github/copilot-instructions.md` (if present) for general repo rules.
2. Always read **all** markdown files in `.github/instructions/` (if present).
3. If any instruction files conflict, precedence is:
   - This `CLAUDE.md`
   - `.github/instructions/<more-specific>.md`
   - `.github/instructions/<generic>.md`
   - `.github/copilot-instructions.md`
4. If applying instructions would be ambiguous, do not guess-ask which file to follow.

## Architecture Overview

This is a **monorepo** with three npm workspaces: `backend` (NestJS + TypeORM), `frontend` (Next.js 16 + React 19), and `data` (shared types). The entire stack runs in Docker containers with hot-reload for development.

### Key Services

- **Backend**: NestJS + Fastify, PostgreSQL via TypeORM, Redis for Bull queues, MinIO for file storage
- **Frontend**: Next.js App Router with feature-based "Screaming Architecture"
- **Infrastructure**: ClamAV malware scanning, i18n via `nestjs-i18n` / `next-intl`

## Critical Developer Workflows

### Development Environment

```bash
# Install dependencies (use ci for deterministic install)
npm ci

# Start all services with hot-reload
docker compose -f compose.yml -f compose.dev.yml up -d

# Check container status
docker compose ps

# Include DevTools (PGAdmin, RedisInsight, BullBoard)
docker compose -f compose.yml -f compose.dev.yml --profile devtools up -d
```

### Required QA Steps (mandatory after every change)

1. **Compile check**: `npm run qa:compile` (in target package)
2. **Verify server starts**: Check containers are running and listening
3. **Format code**: `npm run qa:format:fix` (from repo root)

### Service Ports (Development)

| Service    | Port |
| ---------- | ---- |
| Frontend   | 3060 |
| Backend    | 3050 |
| PostgreSQL | 3030 |
| Redis      | 3031 |

## Project-Specific Patterns

### Backend Module Structure

Each module in `backend/src/modules/` follows this pattern:

```
module-name/
├── dto/              # Input DTOs with class-validator
├── dto-outputs/      # Response DTOs
├── entities/         # TypeORM entities
├── guard/            # Auth guards (JWT, roles)
├── services/         # Business logic
├── *.controller.ts   # HTTP endpoints
└── *.module.ts       # NestJS module
```

### Frontend Feature Structure

Uses "Screaming Architecture" - organize by feature, not file type:

```
features/auth/
├── components/       # Feature-specific components
├── hooks/            # Feature-specific hooks
├── services/         # API calls
└── index.ts          # Public exports
```

### Protected Pages (Frontend)

Use `composePage` wrapper with **inline config only** (AST-parsed):

```tsx
// ✅ Correct - inline config
export default composePage({
  component: MyPage,
  access: { roles: [Role.USER] },
  sidebar: { labelKey: 'sidebar.myPage', icon: BookOpen, order: 30 },
});
```

### Cursor Pagination (Backend)

Use the custom pagination library at `backend/src/lib/pagination/`:

```typescript
import {
  definePaginationSchema,
  executeCursorQuery,
  field,
} from '@/lib/pagination';

export const mySchema = definePaginationSchema({
  scope: 'endpoint:v1',
  alias: 'e',
  entity: MyDto,
  // ... see .github/instructions/5fdb839e.instructions.md for full docs
});
```

## Code Conventions

### Language Rules

- **Code**: English
- **Documentation** (JSDoc, README, comments): Spanish, formal tone

### Type Safety

- **No type excuses**: Avoid `any`, `unknown`, or forced castings
- All TypeScript must compile without errors via `qa:compile`

### Hot-Reload Behavior

- File changes inside `backend/` or `frontend/` trigger automatic container reload
- Changes outside the tsconfig scope may require manual restart:
  ```bash
  docker compose restart backend  # or frontend
  ```

## Integration Points

### Authentication Flow

- JWT-based with access + refresh tokens
- Guards: `AuthGuard` (JWT), `RolesGuard` (RBAC)
- See `backend/src/modules/auth/README.md` for full documentation

### Frontend -> Backend Communication

- OpenAPI types auto-generated via `frontend/scripts/generate-backend-types.mjs`
- API client uses `openapi-fetch`

### File Storage

- MinIO S3-compatible storage
- ClamAV integration for malware scanning
- Handled by `backend/src/modules/files/`

## Key Files Reference

- [backend/src/app.module.ts](backend/src/app.module.ts) - Main NestJS module with all integrations
- [frontend/src/features/routing/](frontend/src/features/routing/) - Route protection and sidebar config
- [backend/src/lib/pagination/](backend/src/lib/pagination/) - Cursor pagination library
- [compose.dev.yml](compose.dev.yml) - Development Docker overrides

## General Guidelines

- It is not allowed to introduce hacky solutions. Always present a clean approach to the requested code changes, keeping code understandable and functional.
- Documentation is a must. Every suitable piece of code, specially in TypeScript, must be documented via JSDoc, paying attention to the surrounding code, the tone of the documentation, style, format, etc.
- Organization is essential for the correct development of solutions in the project, thus each file must have a clear purpose and components. This rule also applies in cascade to lower-category implementations.
- Code must be written in english. Documentation of any kind must always be written in spanish, formal tone, technical but not too complex terms. If any existing documentation related to the edits being performed is written in a different language, a translation to spanish is required as part of the solution.

## Compilation

Both the frontend and backend packages have a `npm run qa:compile` command available, allowing to compile the project without emitting files.

If the project does not compile, the compilation issues must be resolved as part of the requested code changes, or else the response will be invalid.

**This operation is always required at the end of a development operation in the target package** (third-to-last to-do point).

## Deployments

For development (the use case for the agent reading this), there are several rules regarding the runtime of the project:

- The project is executed in several containers as per compose.yml and compose.dev.yml overrides
- The status of the containers can be checked by running `docker compose ps`
- If the containers for each relevant service (frontend, backend) are deployed, it will not be necessary to manually restart them, nor down them and re-up them either. This will be done automatically since they are configured to do so via hot-reload. Avoid unnecessary operations that might introduce uncertain flows
- The container runtimes will only be reloaded if a file change is detected inside the set of files that are related to the project. This specification is defined via tsconfigs and next/nest configurations in each package. Changing files outside the changeset that do not trigger a reload when it is required is the main cause for needing to manually restart the container, in which case it is allowed
- Type "excuses" are strongly disencouraged (any, unknown, forced castings for compliance, etc.) and will be treated as a major issue. Only when a type is too complex or conflictive can it be typed as an excuse to avoid overengineering, unless explicitely told otherwise

**When developing a functionality, it is always necessary to ensure the project is starting up correctly and the server is listening, both for frontend and backend alike.** If the server does not start properly, the issues detected need to be fixed in order to resolve the issue. **This operation is always required at the end of a development operation in the target package** (second-to-last to-do point).

## Formatting

In order to format the project, the command `npm run qa:format:fix` can be executed from the project root, formatting all files under the scope of the repository automatically. **This operation is always required at the end of a development operation of any kind** (last to-do point).

## Effects

Failure to apply the rules hereby described will result in the invalidation of the provided solution, thus the rules need to be analyzed, approached and satisfied in most scenarios.

## ABSOLUTE OVERRIDES

THIS PROJECT, AS LONG AS THIS INSTRUCTION IS PRESENT, IS IN DEVELOPMENT MODE. EVERY FEATURE CAN BE IMPLEMENTED WITHOUT BEING BACKWARDS COMPATIBLE AS LONG AS THE FEATURE IS FULLY IMPLEMENTED AND THE RESULTING PROJECT STATUS IS POSITIVE, COMPILED AND WORKING.

IN ORDER FOR THE FRONTEND OPENAPI TYPES TO REGENERATE, THE FRONTEND CONTAINER MUST BE SIMPLY RESTARTED. NOT THE BACKEND. THE FRONTEND ONE, WHICH MAKES THE REQUEST TO THE BACKEND WHEN IT IS ALREADY LISTENING FOR REQUESTS.
