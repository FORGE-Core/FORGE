# Contexto del proyecto — Cappi / FORGE

> Documento de referencia para IAs y desarrolladores que entran al proyecto sin historial previo.
> Repositorio: `force` (producto backend: **Cappi**).

---

## 1. Resumen ejecutivo

**Cappi** es una plataforma **SaaS multi-tenant** de capacitación empresarial con **inteligencia artificial contextual (RAG)**. Convierte la documentación interna de cada empresa (manuales, procedimientos, políticas) en un ecosistema de aprendizaje para equipos de alta rotación: restaurantes, retail, logística, operaciones de campo.

**No es un chatbot genérico.** Es un mentor IA que responde con el conocimiento *de la empresa*, combinado con módulos de capacitación, actividades evaluativas, simulaciones, seguimiento de progreso y reportes.

**Nombres en el producto:**

| Contexto | Nombre |
|----------|--------|
| Repositorio / backend | **Cappi** (`package.json`: `"name": "cappi"`) |
| UI (landing, sidebar) | **FORGE** |
| Asistente IA en la interfaz | **NOVA** |

**Licencia:** Proyecto privado © 2026.

---

## 2. Problema y propuesta de valor

### Dolores que resuelve

| Dolor | Consecuencia |
|-------|--------------|
| Manuales en PDF, WhatsApp o carpetas | El empleado no encuentra la respuesta a tiempo |
| Capacitación presencial repetitiva | Costosa, inconsistente, difícil de escalar |
| Alta rotación | Onboarding largo, errores operativos |
| Conocimiento en la cabeza del supervisor | Dependencia de personas, no de procesos |
| Chatbots genéricos | Respuestas incorrectas o ajenas al negocio |

### Propuesta

```
Documentación dispersa  →  Biblioteca empresarial privada
Capacitación genérica   →  Programa por rol e industria
"Pregúntale a alguien"  →  Mentor IA con contexto de TU empresa
Supervisión a ciegas    →  Progreso, intentos y reportes por equipo
```

### Qué es y qué NO es

| ✅ Sí es | ❌ No es |
|---------|---------|
| LMS empresarial con IA contextual (RAG) | Clon de ChatGPT |
| SaaS multi-tenant | Curso MOOC público |
| Gestión documental privada por organización | Google Drive con chat |
| Plataforma B2B (empresa → empleados) | App de estudio individual |
| Base para actividades, simulaciones y analytics | Solo visor de PDFs |

---

## 3. Público objetivo

### Cliente (quien paga / administra)

- **ADMIN**: registra la organización, sube documentos, publica módulos, invita empleados, reportes globales.
- **SUPERVISOR**: monitorea avance del equipo, identifica brechas.

### Usuario final

- **EMPLOYEE**: consume módulos, hace actividades, consulta al mentor IA (NOVA).

### Verticales prioritarias

1. Restaurantes y retail (caso piloto: Il Cafeto, POS Aion)
2. Logística y almacén
3. Cualquier operación con alta rotación

---

## 4. Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS v4, Framer Motion, componentes tipo shadcn/ui (Radix) |
| Estado | Zustand (UI), TanStack Query |
| Backend | Route Handlers (`src/app/api/`), Server Actions |
| Auth | NextAuth v5, Prisma Adapter, bcrypt, Google OAuth opcional |
| BD | PostgreSQL (Supabase recomendado), Prisma ORM 6 |
| Vectores | pgvector (extensión Prisma), Pinecone opcional |
| IA | Capa desacoplada: Gemini (default), OpenAI, Ollama |
| PDF | `unpdf` para extracción de texto |
| Automatización | n8n + webhooks |
| Validación | Zod |
| Tests | Playwright E2E + axe-core (a11y) |
| Observabilidad | Sentry (opcional) |
| PWA | manifest, service worker, Web Push (VAPID) |

---

## 5. Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Presentación — Next.js App Router + React + UI components   │
├─────────────────────────────────────────────────────────────┤
│  Aplicación — hooks, store, páginas dashboard                │
├─────────────────────────────────────────────────────────────┤
│  API — /api/documents, /api/chat, /api/training-modules…    │
├─────────────────────────────────────────────────────────────┤
│  Servicios — process-document, generate-learning-content     │
├─────────────────────────────────────────────────────────────┤
│  IA — ai/providers/, ai/rag/ (chunker, retriever, pipeline) │
├─────────────────────────────────────────────────────────────┤
│  Infra — lib/db, tenant, document-storage, env, rate-limit   │
├──────────────┬──────────────┬──────────────────────────────┤
│ PostgreSQL   │  Archivos    │  APIs externas (Gemini, S3)    │
│ + Prisma     │  storage/    │  n8n webhooks                │
└──────────────┴──────────────┴──────────────────────────────┘
```

### Multi-tenant

- Cada **Organization** aísla usuarios, documentos, chunks, conversaciones, reportes.
- Campo `organizationId` en casi todas las entidades.
- Helpers en `src/lib/tenant.ts`: `getOrganizationId()`, `tenantScope()`, `requireOrganization()`.
- Sesión NextAuth incluye `organizationId` y `role`.
- Header `x-organization-id` para workers/APIs internas.
- **Sin cruce de datos** entre organizaciones.

### Flujo RAG (Retrieval-Augmented Generation)

```
Admin sube PDF → extraer texto (unpdf) → chunker.ts (~800 chars)
    → DocumentChunk en PostgreSQL (+ embeddings si RAG_ENABLED)
Empleado pregunta → retriever (top-K similares) → pipeline.ts (prompt + contexto)
    → proveedor IA → respuesta + fuentes citadas
```

**Reglas del mentor** (`src/ai/rag/pipeline.ts`):

- Priorizar contexto recuperado de documentos de la empresa.
- Sin material indexado: orientación general breve.
- Pregunta específica sin contexto: sugerir consultar al supervisor.

**Proveedores IA** (`src/ai/providers/`):

| Proveedor | Variables | Uso |
|-----------|-----------|-----|
| `gemini` (default) | `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_EMBEDDING_MODEL` | Producción |
| `openai` | `OPENAI_API_KEY` | Alternativa |
| `ollama` | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | Desarrollo local |

`RAG_ENABLED=true` activa búsqueda vectorial (requiere pgvector). `false` usa chunks recientes.

---

## 6. ALAE — Accesibilidad, aprendizaje adaptativo e inclusión

**ALAE** es un subsistema transversal que adapta la experiencia de aprendizaje según el perfil del usuario.

### Modelos Prisma relacionados

- `AccessibilityProfile`: escala de fuente, alto contraste, modo oscuro, reducir movimiento, modalidad preferida, lenguaje simplificado, modo paso a paso, lectura en voz alta, ritmo de aprendizaje, comandos de voz.
- `LearningProfile`: puntuaciones por modalidad (READING, LISTENING, VISUAL, PRACTICE), nivel de soporte (STANDARD, GUIDED, SIMPLIFIED, INTENSIVE).
- `InclusionAudit`: auditorías de inclusión de contenido (score, dimensiones, issues, recomendaciones).
- `AccessibilityEvent`: telemetría de uso de funciones de accesibilidad.
- `ContentAdaptation`: adaptaciones IA guardadas (SIMPLIFY, STEP_BY_STEP).

### Componentes clave (`src/components/alae/`)

- `accessibility-provider.tsx` — contexto React global de preferencias
- `alae-dashboard-shell.tsx` — envoltorio del dashboard con ALAE
- `preference-wizard.tsx` — onboarding de preferencias
- `alae-adapt-buttons.tsx`, `simplified-content.tsx`, `step-by-step-view.tsx`
- `nova-avatar-2d.tsx` — avatar del asistente NOVA
- `voice-command-listener.tsx` — comandos de voz (parcial/futuro)
- `inclusion-score-card.tsx`, `inclusion-issues-list.tsx`

### Lógica backend (`src/lib/alae/`)

- `prompts.ts` — augmentación del system prompt de NOVA según perfil ALAE
- `adapt-content.ts` — simplificar contenido o convertir a pasos con IA
- `inclusion-scorer.ts`, `learning-analytics.ts`, `predictions.ts`
- `accessibility-profile.ts` — CRUD de perfil de accesibilidad

### APIs ALAE

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/alae/adapt` | Adaptar contenido (simplificar / paso a paso) |
| `POST` | `/api/alae/inclusion-audit` | Auditar inclusión de un contenido |
| `POST` | `/api/alae/inclusion-audit/bulk` | Auditoría masiva |
| `GET/POST` | `/api/alae/modality` | Modalidad de aprendizaje |
| `GET/PUT` | `/api/accessibility/profile` | Perfil de accesibilidad |
| `GET/PUT` | `/api/learning-profile` | Perfil de aprendizaje |
| `GET` | `/api/reports/inclusion` | Reportes de inclusión |
| `GET` | `/api/reports/learning-patterns` | Patrones de aprendizaje |

El pipeline RAG y `stream-pipeline.ts` inyectan `buildNovaSystemAugmentation()` según el contexto ALAE del usuario.

---

## 7. Modelo de datos (Prisma)

Archivo: `prisma/schema.prisma`

### Enums importantes

- `UserRole`: ADMIN, SUPERVISOR, EMPLOYEE
- `UserStatus`: PENDING, ACTIVE, SUSPENDED (solo ACTIVE puede iniciar sesión)
- `ActivityType`: TRUE_FALSE, MULTIPLE_CHOICE, ORDER_STEPS, SIMULATION, ERROR_DETECTION, CASE_STUDY
- `ModuleStatus`: DRAFT, PUBLISHED, ARCHIVED
- `DocumentType`: PDF, IMAGE, VIDEO, AUDIO, MANUAL, DIAGRAM, PROCESS
- `DocumentStatus`: UPLOADING, PROCESSING, READY, FAILED
- `LearningModality`: READING, LISTENING, VISUAL, PRACTICE, MIXED
- `AutomationTrigger`: USER_COMPLETED_MODULE, USER_FAILED_ACTIVITY, DOCUMENT_PROCESSED, LOW_SCORE_DETECTED, CUSTOM_WEBHOOK

### Entidades principales

| Modelo | Propósito |
|--------|-----------|
| `Organization` | Tenant (empresa cliente), `settings` JSON |
| `User` | Usuario con rol, status, organizationId |
| `TrainingModule` | Módulo de capacitación (slug, audiencia, estado) |
| `Process` | Proceso operativo con pasos JSON |
| `Activity` | Ejercicio evaluativo (content JSON) |
| `Document` | Archivo o manual |
| `DocumentChunk` | Fragmento para RAG (+ embedding vía raw SQL pgvector) |
| `UserProgress` | Avance por usuario y módulo |
| `ActivityAttempt` | Intento con respuestas y puntaje |
| `Conversation` / `Message` | Historial del mentor IA |
| `LearningEvent` | Eventos para aprendizaje adaptativo + webhooks n8n |
| `ReportSnapshot` | Reportes materializados |
| `Automation` | Reglas disparadas por eventos |
| `PushSubscription` | Suscripciones Web Push |

---

## 8. Rutas de la aplicación

### Públicas / Auth

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Inicio de sesión |
| `/register` | Registro empresa + admin |

### Dashboard (requieren sesión — `src/middleware.ts`)

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | KPIs, actividad, recomendaciones IA |
| `/dashboard/onboarding` | Onboarding guiado para admins |
| `/dashboard/modules` | Catálogo de módulos por organización |
| `/dashboard/modules/[slug]` | Detalle de módulo |
| `/dashboard/documents` | Subida y gestión de PDFs |
| `/dashboard/chat` | Mentor IA (NOVA) con streaming |
| `/dashboard/activities` | Actividades evaluativas |
| `/dashboard/simulations` | Simulaciones operativas |
| `/dashboard/team` | Vista supervisor del equipo |
| `/dashboard/team/[id]` | Detalle de empleado |
| `/dashboard/reports` | Reportes generales |
| `/dashboard/reports/inclusion` | Reportes de inclusión ALAE |
| `/dashboard/reports/learning-patterns` | Patrones de aprendizaje |
| `/dashboard/accessibility` | Configuración de accesibilidad |
| `/dashboard/profile` | Perfil de usuario |
| `/dashboard/settings` | Ajustes de organización |

---

## 9. APIs REST principales

Todas las rutas protegidas requieren sesión NextAuth (cookie), salvo `/api/auth/*`.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |
| `GET/POST` | `/api/documents` | Listar / subir PDF (máx. 15 MB) |
| `GET` | `/api/documents/[id]/file` | Descargar archivo |
| `DELETE` | `/api/documents/[id]` | Eliminar documento |
| `POST` | `/api/documents/[id]/generate` | Generar módulo + actividades con IA |
| `POST` | `/api/documents/[id]/reprocess` | Reprocesar chunks/embeddings |
| `GET/POST` | `/api/training-modules` | Módulos publicados |
| `GET` | `/api/training-modules/[slug]` | Detalle módulo |
| `GET` | `/api/training-modules/[slug]/video` | Video del módulo |
| `POST` | `/api/chat` | Chat mentor IA |
| `POST` | `/api/chat/stream` | Chat con streaming SSE |
| `GET` | `/api/chat/suggestions` | Sugerencias adaptativas |
| `GET/POST` | `/api/conversations` | Historial de conversaciones |
| `GET/POST` | `/api/activities` | Actividades |
| `POST` | `/api/activities/[id]/attempt` | Enviar intento |
| `GET/POST` | `/api/simulations` | Simulaciones |
| `POST` | `/api/simulations/[id]/attempt` | Intento de simulación |
| `GET/POST` | `/api/processes` | Procesos operativos |
| `GET/PUT` | `/api/organization` | Datos de la organización |
| `GET/POST` | `/api/users` | Gestión de usuarios (admin) |
| `GET/PUT` | `/api/users/[id]` | Usuario individual |
| `GET` | `/api/dashboard` | Datos del dashboard |
| `GET` | `/api/reports/overview` | Resumen de reportes |
| `GET` | `/api/reports/export` | Exportación CSV |
| `GET/POST` | `/api/automations` | Automatizaciones n8n |
| `GET` | `/api/onboarding/status` | Estado de onboarding |
| `POST` | `/api/notifications/subscribe` | Suscripción Web Push |

**Rate limiting:** `src/lib/api-guard.ts` — 80 req/min por usuario o IP en APIs sensibles (chat).

---

## 10. Estructura del repositorio

```
force/  (Cappi)
├── src/
│   ├── services/             # ⭐ Capa de negocio (toda lógica de dominio)
│   │   ├── types.ts          # ServiceContext, errores
│   │   ├── documents/        # Upload, listado, RAG ingest
│   │   ├── chat/             # Mentor NOVA, conversaciones
│   │   ├── training/         # Módulos y actividades
│   │   ├── users/            # Equipo
│   │   ├── organization/     # Tenant
│   │   ├── dashboard/        # KPIs
│   │   ├── profile/          # Perfil empleado
│   │   ├── reports/          # Analytics
│   │   ├── processes/        # Procesos operativos
│   │   ├── alae/             # Adaptación de contenido
│   │   └── ai/               # Generación IA
│   ├── lib/                  # Infraestructura (db, storage, auth, re-exports)
│   ├── app/api/              # Handlers delgados → services
│   └── ...
```

**Regla:** Las rutas API y páginas server llaman a `src/services/`, no a `db` directamente.

Ver `src/services/README.md` para convenciones completas.

### Estructura anterior (referencia)
├── prisma/
│   ├── schema.prisma       # Modelo multi-tenant completo + ALAE
│   ├── seed.ts             # Seed Il Cafeto
│   └── supabase-setup.sql  # Extensión pgvector
├── src/
│   ├── app/
│   │   ├── (auth)/         # login, register
│   │   ├── (dashboard)/    # páginas del dashboard
│   │   └── api/            # Route Handlers REST
│   ├── ai/
│   │   ├── providers/      # gemini, openai, ollama
│   │   └── rag/            # chunker, retriever, pipeline, stream-pipeline
│   ├── auth.ts             # NextAuth config + providers
│   ├── auth.config.ts      # Config compartida (middleware)
│   ├── middleware.ts       # Protección /dashboard/*
│   ├── components/
│   │   ├── alae/           # Accesibilidad e inclusión
│   │   ├── chat/           # ai-chat.tsx
│   │   ├── documents/      # upload, cards
│   │   ├── layout/         # sidebar, navbar, dashboard-chrome
│   │   ├── modules/        # module-card, video player
│   │   ├── nova/           # nova-widget.tsx
│   │   ├── notifications/  # push-toggle
│   │   ├── onboarding/     # onboarding-gate
│   │   ├── pwa/            # install prompt
│   │   └── ui/             # shadcn-style primitives
│   ├── hooks/              # use-voice-input, etc.
│   ├── lib/
│   │   ├── alae/           # lógica ALAE
│   │   ├── analytics/      # dashboard, reports
│   │   ├── auth/           # roles
│   │   ├── learning/       # events
│   │   ├── organization/   # settings
│   │   ├── seed/           # seed-organization (solo prisma db seed)
│   │   ├── training/       # modules, format
│   │   ├── vector/         # embeddings pgvector
│   │   ├── workflows/      # n8n
│   │   └── db.ts, tenant.ts, rate-limit.ts, api-guard.ts, env.ts
│   ├── services/
│   │   ├── documents/      # process-document.ts
│   │   └── ai/             # generate-learning-content.ts
│   ├── data/mock-content.ts  # Datos demo LogiExpress (dashboard parcial)
│   └── types/index.ts
├── seed-data/                # Demos opcionales para prisma db seed (no runtime)
│   ├── manifest.ts
│   └── demos/il-cafeto/
│   ├── il-cafeto/
│   │   ├── organization.ts
│   │   ├── modules.ts
│   │   └── capacitacion/   # Manuales markdown Aion POS
│   └── index.ts
├── storage/uploads/          # PDFs por organizationId (gitignored)
├── docs/
│   ├── ARCHITECTURE.md
│   └── MVP-ROADMAP.md
├── e2e/                      # Tests Playwright
├── context.md                # Este archivo
├── .env.example
└── README.md
```

---

## 11. Caso piloto: Il Cafeto

Restaurante/cafetería demo en Bogotá. Tenant real en BD para probar el flujo completo.

### Cargar datos

```bash
npm run db:seed
# alias: npm run db:seed:il-cafeto
```

Seed **idempotente**: actualiza org, usuarios, 9 módulos y documentos indexados.

### Credenciales demo (solo desarrollo)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@ilcafeto.com` | `ilcafeto2024!` |
| Mesero | `staff1@ilcafeto.com` | `Staff1234!` |
| Barista | `staff2@ilcafeto.com` | `Staff1234!` |
| Cajero | `staff3@ilcafeto.com` | `Staff1234!` |

### Contenido de capacitación

En `seed-data/demos/il-cafeto/capacitacion/` — curso completo **Aion Restaurant POS** (~16–24 h):

| # | Módulo | Audiencia |
|---|--------|-----------|
| 0 | Inducción general | Todos |
| 1 | Mesero / Mesera | Servicio de salón |
| 2 | Cocina | Cocinero, chef |
| 3 | Bar / Bartender | Bar |
| 4 | Cajero / POS | Caja |
| 5 | Gerente / Supervisor | Gerencia |
| 6 | Administrador del sistema | Admin IT |
| 7 | Experiencia del cliente | Referencia |
| 8 | Apéndices | Glosario y evaluaciones |

### Añadir otro tenant demo

1. Empresas reales: `/register` + documentos en la UI
2. Demo local opcional: copiar `seed-data/demos/il-cafeto/` → `seed-data/demos/nueva-demo/`
3. Editar `organization.ts`, `modules.ts`, `capacitacion/`
4. Registrar en `seed-data/manifest.ts`
5. `npm run db:seed`

O usar `/register` para crear empresa vía app y subir PDFs manualmente.

---

## 12. Variables de entorno críticas

Ver `.env.example` completo.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL pooler (Supabase puerto 6543) |
| `DIRECT_URL` | Conexión directa para migraciones |
| `AUTH_SECRET` | Secreto NextAuth |
| `AUTH_URL` | URL pública (`http://localhost:3000`) |
| `GEMINI_API_KEY` | API Google AI (proveedor default) |
| `AI_DEFAULT_PROVIDER` | `gemini` \| `openai` \| `ollama` |
| `RAG_ENABLED` | `true` para búsqueda vectorial |
| `EMBEDDING_DIMENSIONS` | `768` (Gemini embedding) |
| `STORAGE_PROVIDER` | `local` \| `s3` \| `cloudinary` |
| `N8N_WEBHOOK_URL` | Automatizaciones (opcional) |
| `SENTRY_DSN` | Observabilidad (opcional) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push |

---

## 13. Scripts npm

| Comando | Acción |
|---------|--------|
| `npm run dev` | Desarrollo (Turbopack) |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Tests Playwright |
| `npm run db:push` | Sincronizar schema |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Cargar Il Cafeto |
| `npm run vapid:generate` | Generar claves Web Push |

---

## 14. Inicio rápido

```bash
git clone <repo> && cd force
npm install
cp .env.example .env
# Editar: DATABASE_URL, DIRECT_URL, AUTH_SECRET, GEMINI_API_KEY

npx prisma db push
npx prisma generate
npm run db:seed          # opcional: demo Il Cafeto
npm run dev              # http://localhost:3000
```

Para producción con RAG: ejecutar `prisma/supabase-setup.sql` en Supabase y `RAG_ENABLED=true`.

---

## 15. Convenciones de código

- **TypeScript** estricto en todo el proyecto.
- **Validación** con Zod en Server Actions y APIs.
- **Tenant scope** obligatorio: siempre filtrar por `organizationId` de sesión.
- **Imports** con alias `@/` → `src/`.
- **Componentes UI** en `src/components/ui/` (patrón shadcn: `cn()`, CVA).
- **Server vs Client**: `"use client"` solo donde hace falta interactividad.
- **IA desacoplada**: usar `getAIProvider()`, no llamar APIs de Gemini/OpenAI directamente.
- **Contraseñas**: bcrypt 12 rounds.
- **Commits**: Conventional Commits en inglés.
- **Idioma UI**: español (mensajes, labels, errores).

---

## 16. Estado del MVP

Según `docs/MVP-ROADMAP.md`, las fases 1–5 están **completadas**:

- ✅ Auth (credenciales + Google OAuth)
- ✅ CRUD módulos, procesos, documentos
- ✅ PDF → chunks → embeddings
- ✅ Generación IA: documento → módulo + actividades + simulación
- ✅ Chat IA con streaming SSE + historial
- ✅ Actividades (V/F, opción múltiple, ordenar pasos, detectar errores)
- ✅ Simulaciones (CASE_STUDY)
- ✅ Tracking de progreso + LearningEvent + webhooks n8n
- ✅ Reportes + exportación CSV
- ✅ Onboarding guiado
- ✅ ALAE (accesibilidad, inclusión, adaptación de contenido)
- ✅ Tests E2E Playwright + CI GitHub Actions
- ✅ Rate limiting + Sentry opcional
- ✅ PWA + Web Push
- 🔜 Modo voz completo (post-MVP)

> El `README.md` puede estar parcialmente desactualizado respecto al roadmap. Confiar en el código y `docs/MVP-ROADMAP.md` para el estado real.

---

## 17. Seguridad

- Middleware protege `/dashboard/*`
- Solo usuarios `ACTIVE` pueden autenticarse
- Queries acotadas por `organizationId` de sesión
- Archivos en `storage/uploads/{organizationId}/`
- Rate limiting en chat y APIs sensibles
- Contraseñas demo de Il Cafeto: **cambiar antes de despliegue público**

---

## 18. Archivos clave

| Archivo | Por qué leerlo |
|---------|----------------|
| `README.md` | Visión de producto y guía general |
| `context.md` | Este documento — contexto para IAs |
| `prisma/schema.prisma` | Modelo de datos completo |
| `src/auth.ts` + `src/middleware.ts` | Autenticación y protección de rutas |
| `src/lib/tenant.ts` | Aislamiento multi-tenant |
| `src/ai/rag/pipeline.ts` | Lógica del mentor IA |
| `src/ai/providers/index.ts` | Factory de proveedores IA |
| `src/services/documents/process-document.ts` | Pipeline PDF → chunks |
| `src/lib/alae/prompts.ts` | Cómo ALAE modifica las respuestas de NOVA |
| `src/components/alae/accessibility-provider.tsx` | Estado global de accesibilidad |
| `seed-data/demos/il-cafeto/` | Demo de seed (desarrollo) |
| `docs/ARCHITECTURE.md` | Arquitectura técnica |
| `docs/MVP-ROADMAP.md` | Estado de implementación |

---

## 19. Instrucciones para otra IA

Al trabajar en este proyecto:

1. **Respeta el multi-tenant**: nunca consultes datos sin `organizationId`.
2. **Usa la capa de IA existente** (`getAIProvider()`, `pipeline.ts`, `adapt-content.ts`).
3. **ALAE es transversal**: si tocas chat, módulos o contenido, considera perfiles de accesibilidad.
4. **Minimiza el scope**: cambios pequeños y enfocados; sigue convenciones existentes.
5. **No inventes documentación**: el RAG debe citar fuentes reales de la empresa.
6. **Idioma**: UI y mensajes al usuario en español; commits y código en inglés.
7. **Tests**: `npm run test:e2e` para regresiones; test de a11y en `e2e/a11y.spec.ts`.
8. **No commitear** `.env`, credenciales ni `storage/uploads/`.

---

## 20. Documentación adicional

- `README.md` — guía de producto y desarrollo
- `docs/ARCHITECTURE.md` — capas, RAG, microservicios futuros
- `docs/MVP-ROADMAP.md` — fases completadas y activación en producción
- `seed-data/demos/il-cafeto/capacitacion/README.md` — plan de capacitación Aion POS
