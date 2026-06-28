# Capa de servicios — Cappi / FORGE

La capa `services` se divide en **cliente** y **servidor**:

```
src/services/
├── client/          # Peticiones HTTP (fetch) desde el navegador
│   ├── http.ts      # apiRequest, apiBlob, ApiClientError
│   ├── documents.client.ts
│   ├── chat.client.ts
│   ├── training.client.ts
│   └── ...
├── server/          # Lógica de negocio + Prisma (solo servidor)
│   ├── types.ts
│   ├── errors.ts
│   ├── documents/
│   ├── chat/
│   └── ...
└── index.ts         # Re-exporta solo client (seguro para UI)
```

## Cliente (`@/services/client`)

Usar en componentes `"use client"` y hooks:

```typescript
import { documentsClient, chatClient } from "@/services/client";

const { documents } = await documentsClient.list();
const res = await chatClient.streamMessage({ message, conversationId });
```

No importar `@/services/server` desde componentes cliente.

## Servidor (`@/services/server`)

Usar en Route Handlers, Server Components y Server Actions:

```typescript
import { listDocuments } from "@/services/server/documents";
import type { ServiceContext } from "@/services/server/types";

const ctx: ServiceContext = {
  organizationId: session.user.organizationId,
  userId: session.user.id,
  role: session.user.role,
};
```

## Errores

- **Servidor:** `ServiceError` → `serviceErrorResponse()` en APIs
- **Cliente:** `ApiClientError` con `status` y mensaje del API

## Reglas

1. UI → `services/client` → `/api/*` → `services/server`
2. Nunca `db` en rutas API; solo en `services/server`
3. Validar tenant con `server/shared/tenant-guards.ts`
