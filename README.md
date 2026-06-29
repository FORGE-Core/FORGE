# FORGE

**Plataforma SaaS multi-tenant de capacitación empresarial con inteligencia artificial contextual.**

FORGE convierte la documentación interna de cada empresa — manuales, procedimientos, políticas, guías operativas — en un **ecosistema de aprendizaje** para equipos de alta rotación: restaurantes, logística, retail, operaciones de campo y cualquier negocio donde capacitar rápido y bien es crítico.

No es un chatbot genérico. Es un **mentor IA** que responde con el conocimiento *de tu empresa*, combinado con módulos de capacitación, seguimiento de progreso, actividades evaluativas y reportes para supervisión.

> En la interfaz de producto aparece la marca **FORGE** en algunas pantallas (landing, sidebar). El repositorio y el producto backend se denominan  **FORGE**.

---

## Tabla de contenidos ##

1. [El problema que resuelve](#el-problema-que-resuelve)
2. [La propuesta de valor](#la-propuesta-de-valor)
3. [Qué es y qué no es FORGE](#qué-es-y-qué-no-es-forge)
4. [Público objetivo](#público-objetivo)
5. [Funcionalidades](#funcionalidades)
6. [Modelo multi-tenant](#modelo-multi-tenant)
7. [Roles y permisos](#roles-y-permisos)
8. [Caso piloto: Il Cafeto](#caso-piloto-il-cafeto)
9. [Flujo de inteligencia artificial (RAG)](#flujo-de-inteligencia-artificial-rag)
10. [Modelo de datos](#modelo-de-datos)
11. [Stack tecnológico](#stack-tecnológico)
12. [Arquitectura](#arquitectura)
13. [Estructura del repositorio](#estructura-del-repositorio)
14. [Inicio rápido](#inicio-rápido)
15. [Variables de entorno](#variables-de-entorno)
16. [Scripts disponibles](#scripts-disponibles)
17. [APIs principales](#apis-principales)
18. [Contenido de capacitación incluido](#contenido-de-capacitación-incluido)
19. [Estado actual y roadmap](#estado-actual-y-roadmap)
20. [Seguridad](#seguridad)
21. [Documentación adicional](#documentación-adicional)

---

## El problema que resuelve

Las empresas operativas pierden tiempo y dinero por:

| Dolor | Consecuencia |
|-------|--------------|
| Manuales en PDF, WhatsApp o carpetas compartidas | El empleado no encuentra la respuesta en el momento |
| Capacitación presencial repetitiva | Costosa, inconsistente y difícil de escalar |
| Alta rotación de personal | Onboarding eterno; errores operativos recurrentes |
| Conocimiento en la cabeza del supervisor | Dependencia de personas, no de procesos |
| Chatbots genéricos (ChatGPT, etc.) | Respuestas incorrectas o ajenas a *tu* negocio |

FORGE centraliza el conocimiento operativo, lo **indexa por empresa** y lo pone al alcance del empleado en el piso de trabajo: módulos estructurados + mentor IA que cita el material interno.

---

## La propuesta de valor

```
Documentación dispersa  →  Biblioteca empresarial privada
Capacitación genérica   →  Programa por rol y por industria
“Pregúntale a alguien”  →  Mentor IA con contexto de TU empresa
Supervisión a ciegas    →  Progreso, intentos y reportes por equipo
```

**Resultados esperados (MVP):**

- Reducir tiempo de onboarding ≥ 40 %
- ≥ 80 % de respuestas del mentor con fuentes del material cargado
- ≥ 3 módulos activos por organización piloto
- Menos errores operativos por falta de procedimiento claro

---

## Qué es y qué no es FORGE

| ✅ FORGE **sí** es | ❌ FORGE **no** es |
|-------------------|-------------------|
| LMS empresarial con IA contextual (RAG) | Un clon de ChatGPT para empleados |
| SaaS multi-tenant (una instancia, muchas empresas) | Un curso MOOC público |
| Gestión documental privada por organización | Google Drive con chat encima |
| Plataforma para **empresas** que capacitan a **empleados** | App de estudio individual sin contexto corporativo |
| Base para actividades, simulaciones y analytics | Solo un visor de PDFs |

---

## Público objetivo

### Cliente (quien contrata / paga)

- **Administrador de la empresa** (dueño, RR.HH., operaciones, IT): registra la organización, sube documentos, publica módulos, invita empleados.
- **Supervisor / gerente**: monitorea avance, identifica brechas, asigna repasos.

### Usuario final (quien aprende)

- **Empleado operativo**: mesero, cajero, operador de almacén, repartidor, etc. Consume módulos, hace actividades y consulta al mentor IA.

### Verticales prioritarias

1. **Restaurantes y retail** — procedimientos de POS, servicio, cocina, caja (ver caso Il Cafeto).
2. **Logística y almacén** — envíos, devoluciones, inventario, seguridad.
3. **Operaciones con alta rotación** — cualquier equipo que necesite respuestas rápidas y estandarizadas.

---

## Funcionalidades

### Implementadas hoy

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Landing** | `/` | Presentación del producto, registro e inicio de sesión |
| **Registro empresarial** | `/register` | Crea `Organization` + usuario `ADMIN` en una transacción |
| **Login** | `/login` | Credenciales (email/contraseña) y Google OAuth (opcional) |
| **Dashboard** | `/dashboard` | KPIs, actividad reciente, módulos destacados (parte en datos demo) |
| **Módulos** | `/dashboard/modules` | Catálogo de capacitación **por organización** (desde BD) |
| **Detalle de módulo** | `/dashboard/modules/[slug]` | Descripción, audiencia, progreso, enlaces a mentor y documentos |
| **Documentos** | `/dashboard/documents` | Subida de PDF, listado, descarga, eliminación — aislado por tenant |
| **Mentor IA** | `/dashboard/chat` | Chat con RAG sobre documentos indexados de la empresa |
| **Actividades** | `/dashboard/activities` | UI preparada (tipos definidos en schema) |
| **Simulaciones** | `/dashboard/simulations` | UI preparada |
| **Reportes** | `/dashboard/reports` | UI preparada |
| **Perfil / Ajustes** | `/dashboard/profile`, `/settings` | Gestión de cuenta |

### En diseño / schema (pendiente de producto completo)

- Actividades evaluativas: verdadero/falso, opción múltiple, ordenar pasos, simulación, detección de errores, casos de estudio
- Aprendizaje adaptativo vía `LearningEvent`
- Automatizaciones con n8n (`Automation`, webhooks)
- Reportes históricos (`ReportSnapshot`)
- Streaming en chat, aprobación de usuarios `PENDING`, CRUD admin de módulos desde UI

---

## Modelo multi-tenant

Cada **empresa** es una `Organization`. Todo el contenido y los usuarios pertenecen a exactamente una organización.

```
┌─────────────────────────────────────────────────────────────┐
│                    Instancia FORGE (SaaS)                    │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Il Cafeto      │  LogiExpress MX │  Otra empresa…          │
│  slug: il-cafeto│  (registro app) │                         │
├─────────────────┼─────────────────┼─────────────────────────┤
│  Usuarios       │  Usuarios        │  Usuarios               │
│  Módulos        │  Módulos         │  Módulos                │
│  Documentos     │  Documentos      │  Documentos             │
│  Chunks / RAG   │  Chunks / RAG    │  Chunks / RAG           │
│  Conversaciones │  …               │  …                      │
└─────────────────┴─────────────────┴─────────────────────────┘
         ▲                    ▲
         │                    │
    Sin cruce de datos entre organizaciones
```

**Aislamiento técnico:**

- Campo `organizationId` en usuarios, documentos, módulos, chunks, conversaciones, etc.
- Helper `tenantScope(organizationId)` y `getOrganizationId()` en `src/lib/tenant.ts`
- Sesión NextAuth incluye `organizationId` del usuario
- APIs rechazan peticiones sin sesión o sin tenant válido
- Header `x-organization-id` reservado para workers/APIs internas

**Registro de una nueva empresa:**

1. Admin completa `/register` con nombre de empresa, email y contraseña.
2. Se crea `Organization` (slug único derivado del nombre) + `User` con rol `ADMIN`.
3. Esa cuenta gestiona documentos, módulos y futuros empleados de su tenant.

---

## Roles y permisos

| Rol | Código | Responsabilidad principal |
|-----|--------|---------------------------|
| **Administrador** | `ADMIN` | Alta de empresa, documentos, módulos, configuración, reportes globales |
| **Supervisor** | `SUPERVISOR` | Seguimiento de equipo, alertas, desempeño (en roadmap) |
| **Empleado** | `EMPLOYEE` | Consumir capacitación, mentor IA, actividades |

Estados de usuario: `PENDING` · `ACTIVE` · `SUSPENDED` (solo `ACTIVE` puede iniciar sesión).

---

## Caso piloto: Il Cafeto

**Il Cafeto** es un restaurante/cafetería demo en Bogotá, configurado como tenant real en la base de datos. Sirve para probar el flujo completo: empresa → contenido → empleados → mentor IA.

El programa de capacitación demo vive en [`seed-data/demos/il-cafeto/capacitacion/`](./seed-data/demos/il-cafeto/capacitacion/): manuales del sistema **Aion Restaurant POS** (mesero, cocina, bar, caja, gerencia, administración, etc.).

### Cargar / actualizar Il Cafeto

```bash
npm run db:seed
# alias: npm run db:seed:il-cafeto
```

El seed es **idempotente**: actualiza organización, usuarios, 9 módulos publicados y documentos indexados sin duplicar la empresa.

### Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin (empresa) | `admin@ilcafeto.com` | `ilcafeto2024!` |
| Empleado — Mesero | `staff1@ilcafeto.com` | `Staff1234!` |
| Empleado — Barista | `staff2@ilcafeto.com` | `Staff1234!` |
| Empleado — Cajero | `staff3@ilcafeto.com` | `Staff1234!` |

### Qué incluye el seed

- **Organización:** nombre, slug `il-cafeto`, industria, settings (ciudad, color de marca `#581c22`, programa Aion POS)
- **9 módulos** publicados con slug, audiencia, duración estimada y descripción
- **10 documentos** tipo `MANUAL` (9 módulos + índice README), cada uno partido en **chunks** para el mentor IA
- **Usuarios** admin + 3 empleados operativos

Tras el seed, inicia sesión y visita:

- `/dashboard/modules` — catálogo Il Cafeto
- `/dashboard/documents` — biblioteca indexada
- `/dashboard/chat` — preguntas sobre procedimientos del restaurante

---

## Flujo de inteligencia artificial (RAG)

**RAG** = *Retrieval-Augmented Generation*: el modelo responde apoyándose en fragmentos recuperados de los documentos de la empresa, no inventando políticas internas.

```
┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│ Admin sube   │────▶│ Extraer     │────▶│ chunker.ts       │
│ PDF (o seed  │     │ texto (PDF) │     │ fragmentos ~800  │
│  markdown)   │     └─────────────┘     │ caracteres       │
└──────────────┘                         └────────┬─────────┘
                                                  │
                     ┌────────────────────────────▼────────────────────────────┐
                     │  DocumentChunk en PostgreSQL (+ embeddings si RAG_ENABLED) │
                     └────────────────────────────┬────────────────────────────┘
                                                  │
┌──────────────┐     ┌─────────────┐     ┌────────▼─────────┐
│ Empleado     │────▶│ retriever   │────▶│ pipeline.ts      │
│ pregunta en  │     │ top-K chunks│     │ prompt + contexto│
│ /api/chat    │     │ similares   │     │ + proveedor IA   │
└──────────────┘     └─────────────┘     └────────┬─────────┘
                                                  │
                                          Respuesta + fuentes
```

**Reglas del mentor** (`src/ai/rag/pipeline.ts`):

- Priorizar información del contexto recuperado.
- Si no hay material indexado, orientación general breve y sugerencia de subir manuales.
- Si la pregunta es específica de la empresa y no hay contexto: indicar que consulte al supervisor.

**Proveedores de IA** (intercambiables vía `AI_DEFAULT_PROVIDER`):

| Proveedor | Variable | Uso típico |
|-----------|----------|------------|
| **Gemini** (default) | `GEMINI_API_KEY` | Chat + embeddings en producción |
| **OpenAI** | `OPENAI_API_KEY` | GPT + embeddings |
| **Ollama** | `OLLAMA_BASE_URL` | Desarrollo local sin costo de API |

Con `RAG_ENABLED=false` (default estable), el chat usa los últimos chunks de la organización sin búsqueda vectorial. Con `RAG_ENABLED=true` se activa similitud por embeddings (requiere pgvector configurado).

---

## Modelo de datos

Resumen de entidades Prisma (`prisma/schema.prisma`):

| Entidad | Propósito |
|---------|-----------|
| `Organization` | Tenant: empresa cliente |
| `User` | Usuario ligado a una organización y rol |
| `TrainingModule` | Módulo de capacitación (slug, audiencia, estado `DRAFT`/`PUBLISHED`) |
| `Process` | Proceso operativo con pasos JSON, opcionalmente ligado a módulo |
| `Activity` | Ejercicio evaluativo (tipo, contenido JSON, puntos) |
| `Document` | Archivo o manual (PDF, MANUAL, etc.) |
| `DocumentChunk` | Fragmento de texto para RAG |
| `UserProgress` | Avance por usuario y módulo |
| `ActivityAttempt` | Intento de actividad con respuestas y puntaje |
| `Conversation` / `Message` | Historial del mentor IA |
| `LearningEvent` | Eventos para aprendizaje adaptativo |
| `ReportSnapshot` | Reportes materializados |
| `Automation` | Reglas disparadas por eventos (n8n, webhooks) |

Extensiones previstas: **pgvector** en PostgreSQL para embeddings; almacenamiento de archivos en **S3/Cloudinary** (hoy: disco local en `storage/uploads/{organizationId}/`).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Estilos** | Tailwind CSS v4, Framer Motion, componentes tipo shadcn/ui |
| **Estado** | Zustand (UI), TanStack Query (preparado) |
| **Backend** | Route Handlers, Server Actions |
| **Auth** | NextAuth v5, Prisma Adapter, bcrypt, Google OAuth opcional |
| **Base de datos** | PostgreSQL (Supabase recomendado), Prisma ORM 6 |
| **Vectores** | pgvector (extensión Prisma), Pinecone opcional |
| **IA** | Capa desacoplada: Gemini, OpenAI, Ollama |
| **PDF** | `unpdf` para extracción de texto |
| **Automatización** | n8n + webhooks (preparado en env) |
| **Validación** | Zod |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│  Presentación — Next.js App Router + React + UI components   │
├─────────────────────────────────────────────────────────────┤
│  Aplicación — hooks, store, páginas dashboard                │
├─────────────────────────────────────────────────────────────┤
│  API — /api/documents, /api/chat, /api/training-modules    │
├─────────────────────────────────────────────────────────────┤
│  Servicios — process-document, auth actions                  │
├─────────────────────────────────────────────────────────────┤
│  IA — providers/, rag/ (chunker, retriever, pipeline)      │
├─────────────────────────────────────────────────────────────┤
│  Infra — lib/db, tenant, document-storage, env             │
├──────────────┬──────────────┬──────────────────────────────┤
│ PostgreSQL   │  Archivos    │  APIs externas (Gemini, S3)  │
│ + Prisma     │  storage/    │                              │
└──────────────┴──────────────┴──────────────────────────────┘
```

**Evolución prevista:** extraer `ai/rag/` a microservicio, API Gateway NestJS, procesador de documentos asíncrono. Ver [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## Estructura del repositorio

```
FORGE/
├── prisma/
│   ├── schema.prisma          # Modelo multi-tenant completo
│   └── seed.ts                # Seed Il Cafeto + capacitación
├── src/
│   ├── app/
│   │   ├── (auth)/            # login, register
│   │   ├── (dashboard)/       # dashboard, modules, documents, chat…
│   │   └── api/               # REST: documents, chat, training-modules
│   ├── ai/
│   │   ├── providers/         # Gemini, OpenAI, Ollama
│   │   └── rag/               # chunker, retriever, pipeline
├── seed-data/                 # Demos opcionales para `prisma db seed` (no runtime)
│   ├── manifest.ts
│   └── demos/il-cafeto/       # Ejemplo: curso Aion POS
│   ├── il-cafeto/             # Restaurante demo Bogotá
│   │   ├── organization.ts
│   │   ├── modules.ts
│   │   └── capacitacion/      # Manuales markdown del tenant
│   └── index.ts               # Registro de tenants para seed
│   ├── components/            # UI: layout, documents, modules, chat…
│   ├── data/mock-content.ts   # Datos demo dashboard (LogiExpress)
│   ├── lib/
│   │   ├── training/          # Catálogo Il Cafeto, consultas módulos
│   │   ├── tenant.ts
│   │   ├── db.ts
│   │   └── document-storage.ts
│   ├── server/actions/        # registerAction, etc.
│   └── services/documents/    # PDF → chunks
├── storage/uploads/           # PDFs por organizationId (gitignored)
├── docs/
│   ├── ARCHITECTURE.md
│   └── MVP-ROADMAP.md
└── .env.example
```

---

## Inicio rápido

### Requisitos

- Node.js 20+
- PostgreSQL (recomendado: [Supabase](https://supabase.com))
- Clave API de Gemini u OpenAI (para el mentor IA)

### Pasos

```bash
# 1. Clonar e instalar
git clone <repo-url> FORGE && cd FORGE
npm install

# 2. Entorno
cp .env.example .env
# Editar: DATABASE_URL, DIRECT_URL, AUTH_SECRET, GEMINI_API_KEY

# 3. Base de datos
npx prisma db push
npx prisma generate

# 4. (Opcional) Empresa demo Il Cafeto con todo el contenido de capacitación
npm run db:seed

# 5. Desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

- **Nueva empresa:** [http://localhost:3000/register](http://localhost:3000/register)
- **Demo restaurante:** login con `admin@ilcafeto.com` tras ejecutar el seed

---

## Variables de entorno

Copia `.env.example` a `.env`. Variables críticas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL pooler (puerto 6543, `?pgbouncer=true` en Supabase) |
| `DIRECT_URL` | Conexión directa para migraciones (`db push`) |
| `AUTH_SECRET` | Secreto NextAuth (string largo aleatorio) |
| `AUTH_URL` | URL pública de la app, ej. `http://localhost:3000` |
| `GEMINI_API_KEY` | API Google AI (proveedor por defecto) |
| `AI_DEFAULT_PROVIDER` | `gemini` \| `openai` \| `ollama` |
| `RAG_ENABLED` | `true` para búsqueda vectorial; `false` usa chunks recientes |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | OAuth Google (opcional) |

Almacenamiento cloud (producción): `STORAGE_PROVIDER`, credenciales AWS S3 o Cloudinary. Automatización: `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET`.

---

## Scripts disponibles

| Comando | Acción |
|---------|--------|
| `npm run dev` | Servidor desarrollo (Turbopack) |
| `npm run build` | Build producción |
| `npm run start` | Servidor producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Sincronizar schema con BD |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:generate` | Generar Prisma Client |
| `npm run db:studio` | Prisma Studio (explorar datos) |
| `npm run db:seed` | Cargar Il Cafeto + capacitación |

---

## APIs principales

Todas las rutas protegidas requieren sesión activa (cookie NextAuth), salvo auth.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/documents` | Lista documentos de la organización |
| `POST` | `/api/documents` | Sube PDF (máx. 15 MB), extrae texto, crea chunks |
| `GET` | `/api/documents/[id]/file` | Descarga archivo almacenado |
| `DELETE` | `/api/documents/[id]` | Elimina documento y archivo |
| `GET` | `/api/training-modules` | Módulos publicados + progreso del usuario |
| `GET` | `/api/training-modules/[slug]` | Detalle de un módulo |
| `POST` | `/api/chat` | Pregunta al mentor IA (`{ "message": "..." }`) |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |

---

## Contenido de capacitación incluido

En [`seed-data/demos/il-cafeto/capacitacion/`](./seed-data/demos/il-cafeto/capacitacion/) hay un **curso completo** para el sistema Aion Restaurant POS (~16–24 h), pensado para restaurantes multi-sucursal:

| # | Módulo | Audiencia |
|---|--------|-----------|
| 0 | Inducción general | Todos |
| 1 | Mesero / Mesera | Servicio de salón |
| 2 | Cocina | Cocinero, chef, auxiliar |
| 3 | Bar / Bartender | Bar |
| 4 | Cajero / POS | Caja |
| 5 | Gerente / Supervisor | Gerencia |
| 6 | Administrador del sistema | Admin IT / dueño |
| 7 | Experiencia del cliente | Referencia para todos |
| 8 | Apéndices | Glosario y evaluaciones |

El README del curso está en [`seed-data/demos/il-cafeto/capacitacion/README.md`](./seed-data/demos/il-cafeto/capacitacion/README.md) (planes de 5 días, credenciales demo Aion, escalamiento de incidencias).

Para **otra empresa en producción**: usa `/register` y sube PDFs en Documentos. Para **otro demo local** de desarrollo, copia `seed-data/demos/il-cafeto/` y regístralo en [`seed-data/manifest.ts`](./seed-data/manifest.ts).

---

## Estado actual y roadmap

### ✅ Hecho

- Schema multi-tenant Prisma
- Registro empresa + admin
- Auth por credenciales (+ Google si está configurado)
- Gestión documental PDF con chunks
- Mentor IA con pipeline RAG
- Módulos por organización (API + UI)
- Seed Il Cafeto con 9 módulos y documentos indexados
- Landing y dashboard UI premium
- Capa de proveedores IA intercambiable

### 🚧 En progreso / parcial

- Dashboard principal aún mezcla datos mock (`LogiExpress MX`)
- Embeddings pgvector en producción (`RAG_ENABLED`)
- Actividades y simulaciones (UI sin backend completo)
- Reportes y automatizaciones n8n

### 📋 Roadmap detallado

Ver [docs/MVP-ROADMAP.md](./docs/MVP-ROADMAP.md) — fases de auth, core, aprendizaje, analytics y producción.

---

## Seguridad

- Contraseñas con **bcrypt** (12 rounds) en registro y seed
- Middleware protege `/dashboard/*`
- Queries acotadas por `organizationId` de la sesión
- Documentos y archivos en rutas `storage/uploads/{organizationId}/`
- Validación **Zod** en Server Actions
- Rate limiting en chat: pendiente (MVP+1)

**Importante:** las contraseñas demo de Il Cafeto son solo para desarrollo. Cámbialas antes de cualquier despliegue público.

---

## Documentación adicional

- [Arquitectura técnica](./docs/ARCHITECTURE.md) — capas, RAG, multi-tenant, microservicios futuros
- [Roadmap MVP](./docs/MVP-ROADMAP.md) — fases, métricas de éxito, checklist

---

## Licencia

Proyecto **privado** — FORGE © 2026. Todos los derechos reservados.
