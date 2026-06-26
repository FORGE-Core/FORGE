# Arquitectura Cappi

## Visión

Cappi es una plataforma SaaS **multi-tenant** de capacitación empresarial con IA contextual (RAG). No es un chatbot genérico: es un ecosistema de aprendizaje, actividades, simulaciones y analytics.

## Capas

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation (Next.js App Router + React + shadcn/ui)   │
├─────────────────────────────────────────────────────────────┤
│  Application (features/, hooks/, store/)                      │
├─────────────────────────────────────────────────────────────┤
│  API (Route Handlers, Server Actions)                       │
├─────────────────────────────────────────────────────────────┤
│  Domain Services (services/)                                │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure (lib/, integrations/, workflows/)           │
├──────────────┬──────────────┬──────────────┬──────────────┤
│  PostgreSQL  │  Vector DB   │  S3/Cloudinary│  n8n/Webhooks│
│  + Prisma    │  pgvector    │  Storage      │  Automations │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

## Multi-tenant

- Cada `Organization` aísla usuarios, documentos, embeddings y reportes.
- Todas las queries incluyen `organizationId` (ver `lib/tenant.ts`).
- Header `x-organization-id` para APIs internas/workers.
- Preparado para row-level security en PostgreSQL.

## Flujo RAG

1. Admin sube documento → `Document` (status: UPLOADING)
2. Worker extrae texto (PDF, OCR, transcripción)
3. `chunker.ts` divide en fragmentos
4. Proveedor IA genera embeddings
5. Se guardan en `DocumentChunk` + vector pgvector
6. Empleado pregunta en chat
7. `retriever.ts` busca chunks similares (cosine)
8. `pipeline.ts` construye prompt con contexto
9. Modelo responde **solo** con información recuperada

## Proveedores IA (desacoplados)

```
ai/providers/
  types.ts      → interfaz AIProvider
  openai.ts     → GPT + embeddings
  gemini.ts     → Gemini chat + embeddings
  anthropic.ts  → Claude chat (sin embeddings)
  ollama.ts     → Llama 3 local
  index.ts      → factory getAIProvider() / getEmbeddingProvider()
```

Cambiar proveedor de chat: `AI_DEFAULT_PROVIDER=anthropic` en `.env`.

Claude no expone endpoint de embeddings, por lo que el proveedor de embeddings
se resuelve por separado vía `getEmbeddingProvider()` (`EMBEDDING_PROVIDER`, con
fallback a Gemini cuando el chat usa Anthropic).

## Migración futura a microservicios

| Módulo actual          | Servicio futuro      |
|------------------------|----------------------|
| `ai/rag/`              | rag-service          |
| `integrations/storage` | document-processor   |
| `workflows/`           | n8n + event bus      |
| `app/api/`             | NestJS API Gateway   |

Los contratos TypeScript en `types/` facilitan la extracción.

## Roles

| Rol        | Permisos principales                          |
|------------|-----------------------------------------------|
| ADMIN      | usuarios, módulos, documentos, reportes       |
| SUPERVISOR | progreso, desempeño, alertas                  |
| EMPLOYEE   | capacitación, chat IA, actividades              |

## Seguridad

- NextAuth v5 + Prisma Adapter
- Validación con Zod en Server Actions
- Tenant scope obligatorio en cada query
- Rate limiting en `/api/chat` (pendiente MVP+1)
