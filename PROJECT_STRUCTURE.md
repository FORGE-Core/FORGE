# 📋 Guía de Estructura del Proyecto Cappi

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Guía de Capas](#guía-de-capas)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Buenas Prácticas](#buenas-prácticas)
6. [⚠️ Advertencias y Antipatrones](#-advertencias-y-antipatrones)
7. [Comandos Útiles](#comandos-útiles)

---

## Descripción General

**Cappi** es una plataforma SaaS **multi-tenant** de capacitación empresarial con IA contextual (RAG).

**Stack Principal:**
- Framework: Next.js 15 (App Router)
- Lenguaje: TypeScript
- Base de datos: PostgreSQL + Prisma + pgvector (vectores)
- Auth: NextAuth v5
- UI: React + Radix UI + Tailwind CSS
- AI: OpenAI / Ollama / Gemini (desacoplados)
- Testing: Playwright
- Storage: S3 / Cloudinary

---

## Estructura de Carpetas

```
force/
├── src/
│   ├── app/                    # Next.js App Router (rutas y layout)
│   ├── components/             # Componentes React reutilizables
│   ├── lib/                    # Utilidades, helpers y servicios compartidos
│   ├── server/                 # Lógica de servidor (Server Actions)
│   ├── services/               # Servicios de dominio (business logic)
│   ├── ai/                     # Pipeline de IA y RAG
│   ├── hooks/                  # Custom React hooks
│   ├── features/               # Características por módulo (escalable)
│   ├── integrations/           # Integraciones externas (Sentry, etc)
│   ├── store/                  # Estado global (Zustand)
│   ├── types/                  # Tipos TypeScript compartidos
│   ├── workflows/              # Automaciones y webhooks
│   ├── auth.config.ts          # Configuración NextAuth
│   ├── auth.ts                 # Funciones de auth
│   ├── middleware.ts           # Middleware Next.js
│   └── instrumentation.ts      # Telemetría Sentry
├── prisma/                     # Schema ORM y migraciones
├── e2e/                        # Tests end-to-end (Playwright)
├── docs/                       # Documentación adicional
├── scripts/                    # Scripts de utilidad
├── public/                     # Archivos estáticos
├── tenants/                    # Configuración por tenant (multi-tenant)
└── [config files]              # .env, tsconfig.json, etc
```

---

## Descripción Detallada de Carpetas

### **src/app/** 
📁 **Next.js App Router - Rutas y Layouts**

```
app/
├── layout.tsx                  # Layout global (RootLayout)
├── page.tsx                    # Landing page / home
├── globals.css                 # Estilos globales
├── manifest.ts                 # PWA manifest
├── viewport.ts                 # Configuración viewport
├── api/                        # Route Handlers (API endpoints)
│   ├── chat/                   # Chat con IA
│   ├── documents/              # CRUD documentos
│   ├── users/                  # CRUD usuarios
│   ├── auth/                   # Endpoints autenticación
│   ├── activities/             # Actividades de aprendizaje
│   ├── learning-profile/       # Perfil de aprendizaje
│   └── [otros módulos]/        # Más endpoints
├── (auth)/                     # Grupo de rutas: login, register
├── (dashboard)/                # Grupo de rutas: dashboard privado
│   ├── layout.tsx              # Layout dashboard
│   └── dashboard/              # Página principal dashboard
```

**Responsabilidad:** Define rutas, layouts y API endpoints. Delega lógica a services, hooks y server actions.

---

### **src/components/**
📁 **Componentes React Reutilizables**

```
components/
├── ui/                         # Componentes base (button, dialog, etc)
├── shared/                     # Componentes compartidos entre features
├── layout/                     # Header, Sidebar, Footer
├── auth/                       # Componentes de autenticación
├── dashboard/                  # Componentes dashboard
├── chat/                       # Chat IA (ai-chat.tsx)
├── alae/                       # Componentes accesibilidad
├── modules/                    # Componentes módulos de capacitación
├── documents/                  # Gestor de documentos
├── notifications/              # Sistema de notificaciones
├── providers.tsx               # Proveedores (Auth, Query, etc)
└── nova/                       # Componentes Nova (temático)
```

**Responsabilidad:** Presentación y UX. Sin lógica de negocio pesada.

**✅ Buena práctica:** Componentes pequeños, reutilizables, con props bien tipadas.

---

### **src/lib/**
📁 **Utilidades, Helpers y Servicios Compartidos**

```
lib/
├── db.ts                       # Inicialización Prisma client
├── env.ts                      # Variables de entorno validadas
├── utils.ts                    # Funciones utilidad generales
├── api-guard.ts                # Validación de requests
├── tenant.ts                   # Multi-tenant utilities
├── rate-limit.ts               # Rate limiting
├── document-storage.ts         # Integración S3/Cloudinary
├── documents.ts                # Lógica de documentos
├── activities/                 # Lógica de actividades
├── alae/                       # Lógica accesibilidad
├── analytics/                  # Telemetría
├── auth/                       # Helpers de autenticación
├── automations/                # Automaciones
├── chat/                       # Lógica chat
├── learning/                   # Lógica aprendizaje
├── notifications/              # Notificaciones
├── organization/               # Lógica organizaciones
├── team/                       # Lógica equipos
├── tenants/                    # Configuración tenants
├── training/                   # Lógica capacitación
├── vector/                     # Utilidades vector DB
└── workflows/                  # Automaciones workflows
```

**Responsabilidad:** Lógica compartida, DB queries, validaciones, utilidades.

**✅ Buena práctica:** Separar por dominio (auth/, learning/, etc). No mezclar responsabilidades.

---

### **src/server/**
📁 **Lógica de Servidor (Server Actions)**

```
server/
└── actions/                    # Server Actions de Next.js
    ├── [module]/               # Acciones por módulo
    └── [action].ts             # Cada acción en un archivo
```

**Responsabilidad:** Server Actions para operaciones que requieren server-side.

**✅ Buena práctica:** 
- Usar "use server" en archivo o función
- Validar input con Zod
- Incluir organizationId en todas las acciones

---

### **src/services/**
📁 **Servicios de Dominio (Business Logic)**

```
services/
├── ai/                         # Servicios IA
│   ├── chat.ts                 # Lógica chat
│   └── [otros servicios]
├── documents/                  # Servicios documentos
└── [otros módulos]/
```

**Responsabilidad:** Lógica de negocio independiente de la presentación.

**Ejemplo:** Procesar documento → generar embeddings → guardar vectores

---

### **src/ai/**
📁 **Pipeline de IA y RAG (Retrieval Augmented Generation)**

```
ai/
├── providers/                  # Proveedores IA (intercambiables)
│   ├── types.ts                # Interfaz AIProvider
│   ├── openai.ts               # Implementación OpenAI
│   ├── ollama.ts               # Implementación Ollama (local)
│   ├── gemini.ts               # Implementación Gemini
│   └── index.ts                # Factory getAIProvider()
├── rag/                        # Pipeline RAG
│   ├── chunker.ts              # Divide documentos en chunks
│   ├── pipeline.ts             # Orquesta el proceso RAG
│   ├── retriever.ts            # Busca chunks similares (cosine)
│   └── stream-pipeline.ts      # Streaming de respuestas
```

**Responsabilidad:** Gestionar flujo IA, embeddings, búsquedas vectoriales.

**🔑 Concepto RAG:**
1. Usuario sube documento
2. Se divide en chunks
3. Se generan embeddings (representación vectorial)
4. Se guardan en pgvector
5. Cuando usuario pregunta → búsqueda cosine
6. Se construye prompt con chunks relevantes
7. Modelo responde basado en el contexto de la empresa

**✅ Cambiar proveedor IA es simple:**
```env
AI_DEFAULT_PROVIDER=ollama  # o openai, gemini
```

---

### **src/hooks/**
📁 **Custom React Hooks**

```
hooks/
└── use-voice-input.ts          # Input por voz
```

**Responsabilidad:** Lógica reutilizable de componentes.

---

### **src/store/**
📁 **Estado Global (Zustand)**

```
store/
└── ui-store.ts                 # Estado UI global (temas, paneles, etc)
```

**Responsabilidad:** Estado global con Zustand (alternativa a Redux).

**✅ Buena práctica:** Mantener store pequeño. No guardar estado de usuario en Zustand.

---

### **src/types/**
📁 **Tipos TypeScript Compartidos**

```
types/
├── index.ts                    # Tipos principales
└── next-auth.d.ts              # Tipos NextAuth extendidos
```

**Responsabilidad:** Definiciones de tipos reutilizables.

**✅ Buena práctica:** Un solo origen de verdad para tipos.

---

### **src/workflows/**
📁 **Automaciones y Webhooks**

```
workflows/
└── [automation workflows]       # Automaciones (n8n, webhooks, etc)
```

**Responsabilidad:** Orquestación de procesos automáticos.

---

### **prisma/**
📁 **Schema y Migraciones**

```
prisma/
├── schema.prisma               # Definición ORM (tablas, relaciones)
├── seed.ts                     # Script para popular BD
└── supabase-setup.sql          # Setup BD (PostgreSQL con pgvector)
```

**Responsabilidad:** Contrato de datos y migraciones.

**✅ Buena práctica:**
- Cada cambio en schema = migración (`npm run db:migrate`)
- Versionar migraciones en Git
- Usar `prisma studio` para inspeccionar datos

---

### **e2e/**
📁 **Tests End-to-End (Playwright)**

```
e2e/
├── a11y.spec.ts                # Tests de accesibilidad
├── landing.spec.ts             # Tests landing page
└── [otros tests]
```

**Responsabilidad:** Automatizar pruebas del flujo completo.

---

### **docs/**
📁 **Documentación**

```
docs/
├── ARCHITECTURE.md             # Arquitectura técnica
├── ALAE.md                     # Sistema ALAE (accesibilidad)
├── ALAE-ROADMAP.md             # Roadmap ALAE
├── MVP-ROADMAP.md              # Roadmap MVP
```

---

### **tenants/**
📁 **Configuración Multi-Tenant**

```
tenants/
├── index.ts                    # Registro de tenants
├── il-cafeto/                  # Configuración tenant "Il Cafeto"
│   ├── index.ts
│   ├── modules.ts              # Módulos específicos del tenant
│   ├── organization.ts         # Config organización
│   └── README.md
```

**Responsabilidad:** Personalización por tenant (branding, módulos, reglas).

---

### **scripts/**
📁 **Scripts de Utilidad**

```
scripts/
└── generate-vapid.mjs          # Genera claves VAPID (Web Push)
```

---

## Guía de Capas

```
┌─────────────────────────────────────────┐
│  🎨 Presentation Layer                  │
│  app/, components/                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  🔄 Application Layer                   │
│  hooks/, store/, features/              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  📡 API Layer                           │
│  app/api/, server/actions/              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  🧠 Domain Services                     │
│  services/, ai/                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  🛠️ Infrastructure                      │
│  lib/, integrations/, workflows/        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  💾 Data Layer                          │
│  Prisma + PostgreSQL + pgvector         │
└─────────────────────────────────────────┘
```

---

## Flujo de Trabajo

### 1️⃣ **Agregar Nueva Funcionalidad**

```
Feature: "Usuarios pueden descargar reportes en PDF"

Paso 1: Planificación
├─ ¿Qué datos necesita? (DB query)
├─ ¿Qué validaciones? (Permisos, organizationId)
└─ ¿Endpoint o Server Action?

Paso 2: Backend
├─ Actualizar schema.prisma si es necesario
│  └─ npx prisma migrate dev
├─ Crear función en lib/ o services/
│  └─ Incluir validación organizationId
└─ Crear Server Action en server/actions/
   └─ Validar input con Zod

Paso 3: Frontend
├─ Crear componente en components/
├─ Usar Server Action o API call
└─ Agregar loading y error states

Paso 4: Testing
├─ E2E: playwright test
└─ Manual: npm run dev

Paso 5: Deploy
├─ Crear PR
├─ Review
└─ Merge a main
```

### 2️⃣ **Usar IA / RAG**

```
User uploads document
    ↓
lib/documents.ts: processDocument()
    ↓
ai/rag/chunker.ts: splitIntoChunks()
    ↓
ai/providers/[provider].ts: generateEmbedding()
    ↓
Prisma: save DocumentChunk + vector
    ↓
User asks question
    ↓
ai/rag/retriever.ts: findSimilarChunks() [cosine similarity]
    ↓
ai/rag/pipeline.ts: buildPromptWithContext()
    ↓
ai/providers/[provider].ts: generateResponse()
    ↓
Stream response to user
```

### 3️⃣ **Agregar Multi-Tenant**

```
Responsabilidades:
├─ Cada query incluye: organizationId
├─ Cada usuario pertenece a: Organization
├─ Documentos aislados por: organizationId
├─ Embeddings aislados por: organizationId
└─ APIs validan: x-organization-id header

Utilidades:
└─ lib/tenant.ts: getTenantFromRequest()
```

---

## Buenas Prácticas ✅

### 1. **Validación de Input**

```typescript
// ✅ BIEN
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  organizationId: z.string().uuid(),
});

export async function createUser(data: unknown) {
  const validated = createUserSchema.parse(data);
  // uso validated...
}

// ❌ MAL
export async function createUser(data: any) {
  // sin validación!
  await db.user.create({ data });
}
```

---

### 2. **Multi-Tenant Everywhere**

```typescript
// ✅ BIEN
async function getUserDocuments(userId: string, organizationId: string) {
  return db.document.findMany({
    where: { 
      createdBy: userId,
      organizationId,  // ← SIEMPRE incluir
    },
  });
}

// ❌ MAL
async function getUserDocuments(userId: string) {
  return db.document.findMany({
    where: { createdBy: userId },
    // sin organizationId → puede acceder a datos de otros tenants!
  });
}
```

---

### 3. **Separación de Responsabilidades**

```typescript
// ✅ BIEN: Componente solo UI
export function DocumentCard({ doc }: { doc: Document }) {
  return (
    <div>
      <h3>{doc.name}</h3>
      <button onClick={handlePreview}>Ver</button>
    </div>
  );
}

// Lógica en hook
export function useDocumentPreview(docId: string) {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    fetchDocument(docId).then(setDoc);
  }, [docId]);
  return doc;
}

// ❌ MAL: Todo en el componente
export function DocumentCard() {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    fetch(`/api/docs/${id}`)
      .then(r => r.json())
      .then(setDoc);
  }, [id]);
  // más lógica aquí...
  return <div>{doc?.name}</div>;
}
```

---

### 4. **Type Safety**

```typescript
// ✅ BIEN: Tipos explícitos
interface Document {
  id: string;
  name: string;
  organizationId: string;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'ERROR';
}

function updateDocumentStatus(
  docId: string,
  status: Document['status']
): Promise<Document> {
  // ...
}

// ❌ MAL: Any es el enemigo
function updateDocumentStatus(docId: any, status: any): any {
  // ...
}
```

---

### 5. **Manejo de Errores**

```typescript
// ✅ BIEN: Específico y útil
try {
  await processDocument(docId);
} catch (error) {
  if (error instanceof DocumentNotFoundError) {
    return res.status(404).json({ error: 'Documento no encontrado' });
  } else if (error instanceof StorageQuotaExceededError) {
    return res.status(413).json({ error: 'Cuota excedida' });
  } else {
    logger.error('Unexpected error', error);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// ❌ MAL: Genérico
try {
  await processDocument(docId);
} catch (error) {
  return res.status(500).json({ error: 'Error' });
}
```

---

### 6. **Lazy Loading e Optimización**

```typescript
// ✅ BIEN: Dynamic import
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'));

export function Dashboard() {
  return (
    <>
      <Header />
      <Suspense fallback={<Spinner />}>
        <HeavyComponent />
      </Suspense>
    </>
  );
}

// ❌ MAL: Cargar todo de golpe
import HeavyComponent from './HeavyComponent';
```

---

### 7. **Rate Limiting y Seguridad**

```typescript
// ✅ BIEN: Limitar requests
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const limited = await rateLimit(req);
  if (limited) {
    return new Response('Too many requests', { status: 429 });
  }
  // ... continuar
}

// ❌ MAL: Sin protección
export async function POST(req: Request) {
  // cualquiera puede hacer spam de requests
}
```

---

### 8. **Environment Variables**

```typescript
// ✅ BIEN: Validado con Zod
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  AI_DEFAULT_PROVIDER: z.enum(['openai', 'ollama', 'gemini']),
});

export const env = envSchema.parse(process.env);

// ❌ MAL: Sin validar
const apiKey = process.env.OPENAI_API_KEY;  // ¿existe?
```

---

### 9. **Documentación de Código**

```typescript
// ✅ BIEN: Claro y útil
/**
 * Procesa un documento y genera embeddings
 * @param docId - ID del documento
 * @param organizationId - Tenant del documento
 * @returns {Promise<ProcessResult>} Resultado del procesamiento
 * @throws {DocumentNotFoundError} Si el documento no existe
 * @example
 * const result = await processDocument('doc123', 'org456');
 */
export async function processDocument(
  docId: string,
  organizationId: string
): Promise<ProcessResult> {
  // ...
}

// ❌ MAL: Misterioso
export async function processDoc(docId: string, org: string) {
  // ...
}
```

---

### 10. **Testing**

```typescript
// ✅ BIEN: Tests significativos
test('should retrieve documents for correct organization', async () => {
  const org1Docs = await getDocuments('org-1');
  const org2Docs = await getDocuments('org-2');
  expect(org1Docs).toHaveLength(2);
  expect(org2Docs).toHaveLength(1);
  expect(org1Docs.some(d => org2Docs.includes(d))).toBe(false);
});

// ❌ MAL: Tests superficiales
test('getDocuments works', async () => {
  const docs = await getDocuments('org-1');
  expect(docs).toBeDefined();
});
```

---

## ⚠️ Advertencias y Antipatrones

### 🚨 **CRÍTICO: Omitir organizationId**

```typescript
// ❌ PELIGROSO: Data leak multi-tenant!
async function getUserProfile(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
  });
  // Un usuario de org-A puede acceder a usuarios de org-B
}

// ✅ CORRECTO
async function getUserProfile(userId: string, organizationId: string) {
  return db.user.findUnique({
    where: { 
      id_organizationId: { id: userId, organizationId },
    },
  });
}
```

---

### 🚨 **CRÍTICO: Requests sin validar**

```typescript
// ❌ PELIGROSO: SQL Injection / XSS
const docName = req.query.name;
db.document.create({ data: { name: docName } });

// ✅ CORRECTO: Validar con Zod
const schema = z.object({ name: z.string().trim().min(1).max(255) });
const { name } = schema.parse(req.query);
db.document.create({ data: { name } });
```

---

### 🚨 **CRÍTICO: Secretos en código**

```typescript
// ❌ PELIGROSO: Key hardcodeada
const apiKey = "sk-abc123def456";
callOpenAI(apiKey);

// ✅ CORRECTO: Variable de entorno
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY not set');
callOpenAI(apiKey);
```

---

### ⚠️ **ALTO: N+1 Queries**

```typescript
// ❌ MALO: N+1 queries
const users = await db.user.findMany({ where: { organizationId } });
for (const user of users) {
  const documents = await db.document.findMany({
    where: { createdBy: user.id },  // ← query por cada usuario!
  });
}

// ✅ BIEN: Join + include
const users = await db.user.findMany({
  where: { organizationId },
  include: { documents: true },  // ← Una sola query
});
```

---

### ⚠️ **ALTO: Estado Global Descontrolado**

```typescript
// ❌ MALO: UI store con lógica de negocio
const uiStore = create((set) => ({
  user: null,
  documents: [],
  setUser: (user) => set({ user }),
  // guardar user aquí está MAL → perder en refresh
}));

// ✅ BIEN: Zustand solo para UI
const uiStore = create((set) => ({
  sidebarOpen: true,
  theme: 'dark',
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
// user y documents vienen de auth context + react-query
```

---

### ⚠️ **ALTO: Server Action sin "use server"**

```typescript
// ❌ MALO: Ejecuta en cliente
export async function deleteDocument(docId: string) {
  await db.document.delete({ where: { id: docId } });
  // ¡Se ejecuta en cliente! ¡Alguien puede alterar el código!
}

// ✅ BIEN: Explicitamente server-side
"use server";
export async function deleteDocument(docId: string, organizationId: string) {
  // Validar organizationId del usuario
  const user = await auth();
  if (!user) throw new Error('Unauthorized');
  
  await db.document.delete({
    where: { 
      id_organizationId: { id: docId, organizationId },
    },
  });
}
```

---

### ⚠️ **MEDIO: Components demasiado grandes**

```typescript
// ❌ MALO: 500 líneas en un archivo
export function DashboardPage() {
  // lógica usuarios
  // lógica documentos
  // lógica reportes
  // lógica notificaciones
  // ...JSX enorme
}

// ✅ BIEN: Componentes pequeños y composables
export function DashboardPage() {
  return (
    <>
      <UsersSection />
      <DocumentsSection />
      <ReportsSection />
      <NotificationsPanel />
    </>
  );
}
```

---

### ⚠️ **MEDIO: Props drilling excesivo**

```typescript
// ❌ MALO: Pasar props 5 niveles de profundidad
<GrandparentComponent 
  userId={userId}
  organizationId={organizationId}
  theme={theme}
  onUpdate={onUpdate}
>
  <ParentComponent 
    userId={userId}
    organizationId={organizationId}
    theme={theme}
    onUpdate={onUpdate}
  >
    <ChildComponent 
      userId={userId}
      organizationId={organizationId}
      theme={theme}
      onUpdate={onUpdate}
    />
  </ParentComponent>
</GrandparentComponent>

// ✅ BIEN: Usar Context o pasar lo necesario
const UserContext = createContext<UserContextType>(null);
export function DashboardPage() {
  return (
    <UserContext.Provider value={{ userId, organizationId }}>
      <Dashboard />
    </UserContext.Provider>
  );
}
```

---

### ⚠️ **MEDIO: Cambiar provider IA sin seguir el contrato**

```typescript
// ❌ MALO: Nueva implementación con firma diferente
class GeminiProvider {
  async generateEmbeddings(text: string, type?: 'query' | 'document') {
    // firma diferente a OpenAI!
  }
}

// ✅ BIEN: Seguir la interfaz
interface AIProvider {
  generateEmbedding(text: string): Promise<number[]>;
  generateResponse(prompt: string): Promise<string>;
}

class GeminiProvider implements AIProvider {
  async generateEmbedding(text: string): Promise<number[]> {
    // implementar contrato
  }
}
```

---

### ⚠️ **MEDIO: Ignorar tipos TypeScript**

```typescript
// ❌ MALO: Desactivar type checking
// @ts-ignore
const result = unknownValue.method();

// ✅ BIEN: Resolver el tipo
interface Response {
  method?: () => void;
}
const result = (unknownValue as Response)?.method?.();
```

---

### ⚠️ **MEDIO: No manejar race conditions**

```typescript
// ❌ MALO: Race condition si se clickea múltiples veces
export function UploadButton() {
  const handleClick = async () => {
    await uploadDocument(file);
    setDocuments([...documents, newDoc]);
  };
  return <button onClick={handleClick}>Subir</button>;
}

// ✅ BIEN: Agregar loading state
export function UploadButton() {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await uploadDocument(file);
    } finally {
      setLoading(false);
    }
  };
  return <button onClick={handleClick} disabled={loading}>Subir</button>;
}
```

---

### ℹ️ **INFO: Migraciones de Prisma**

```bash
# ❌ NO hagas esto en producción
npx prisma db push  # Muy peligroso!

# ✅ CORRECTO: Usar migraciones
npx prisma migrate dev      # Desarrollo
npx prisma migrate deploy   # Producción
```

---

### ℹ️ **INFO: Cambiar Variable Entorno IA**

```bash
# En .env.local o variables de entorno
AI_DEFAULT_PROVIDER=ollama

# Cuando reiniciar, usará Ollama en lugar de OpenAI
# Asegúrate que el proveedor está disponible
```

---

## Comandos Útiles

### **Desarrollo**
```bash
npm run dev              # Iniciar servidor Next.js con Turbopack
npm run lint             # Lint TypeScript + ESLint
npm run test:e2e         # Tests Playwright
npm run test:e2e:ui      # Tests Playwright con UI
```

### **Base de Datos**
```bash
npm run db:generate      # Regenerar Prisma Client
npm run db:migrate       # Crear migración interactiva
npm run db:push          # Push schema sin migración (dev only)
npm run db:studio        # Abrir Prisma Studio (GUI)
npm run db:seed          # Ejecutar seed.ts
npm run db:seed:il-cafeto # Seed específico tenant
```

### **Build y Producción**
```bash
npm run build            # Build para producción
npm run start            # Iniciar servidor Next.js
```

### **Utilidades**
```bash
npm run vapid:generate   # Generar claves VAPID (Web Push)
```

---

## Resumen

| Carpeta | Qué hace | Responsabilidad |
|---------|----------|-----------------|
| `src/app` | Rutas y layouts | Estructura URL y páginas |
| `src/components` | Componentes React | Presentación e UX |
| `src/lib` | Utilidades compartidas | Helpers, DB queries, validación |
| `src/server` | Server Actions | Lógica servidor-side |
| `src/services` | Dominio/negocio | Business logic |
| `src/ai` | IA y RAG | Pipeline embeddings, búsqueda vectorial |
| `src/hooks` | Custom hooks | Lógica reutilizable componentes |
| `src/store` | Estado global | UI state con Zustand |
| `src/types` | Tipos TypeScript | Contrato de datos |
| `prisma` | ORM y BD | Schema, migraciones |
| `e2e` | Tests automatizados | Validar flujos completos |
| `tenants` | Multi-tenant config | Personalización por tenant |

---

## Checklist para Nuevas Features

- [ ] ¿Incluye validación con Zod?
- [ ] ¿Respeta organizationId en queries?
- [ ] ¿Tiene type safety (no uses `any`)?
- [ ] ¿Está separada la lógica de presentación?
- [ ] ¿Hay manejo de errores específicos?
- [ ] ¿Tiene loading y error states?
- [ ] ¿Se actualizó schema.prisma si fue necesario?
- [ ] ¿Pasó tests E2E?
- [ ] ¿Está documentado si es complejo?

---

**Última actualización:** Junio 2026  
**Versión:** 1.0
