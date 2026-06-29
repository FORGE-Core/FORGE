# FORGE — Plataforma SaaS de Capacitación Empresarial con IA Contextual

> **Documento de Ingeniería de Requisitos**  
> Versión 1.0 · Junio 2026  
> Autores: Equipo de desarrollo FORGE

---

## Descripción General

**FORGE** (nombre comercial: **FORGE**) es una plataforma web SaaS multi-tenant de capacitación empresarial que integra un motor de inteligencia artificial basado en **Retrieval-Augmented Generation (RAG)**. Permite a organizaciones convertir su documentación interna (manuales, procedimientos, políticas operativas) en un ecosistema de aprendizaje estructurado y consultable, accesible para equipos de alta rotación en industrias como restaurantes, retail, logística y operaciones de campo.

El sistema complementa los módulos de capacitación con un **mentor de IA contextual** que responde preguntas con base exclusiva en el material corporativo indexado de cada tenant, garantizando respuestas precisas y alineadas a los procesos internos de cada empresa.

---

## Objetivo del Sistema

Proveer a organizaciones empresariales una plataforma centralizada de capacitación que:

1. **Estructure** el conocimiento operativo disperso (PDFs, manuales, guías) en módulos de aprendizaje navegables.
2. **Potencie** el acceso al conocimiento mediante un mentor de IA que cita el material interno de la empresa, sin alucinaciones ni respuestas genéricas.
3. **Registre** el progreso, intentos y desempeño de cada empleado para ofrecer visibilidad real al supervisor.
4. **Escale** de forma segura bajo un modelo multi-tenant donde cada organización opera con total aislamiento de datos.

---

## Alcance del Proyecto

| Módulo | Incluido en v1 | Excluido (fuera de alcance) |
|---|---|---|
| Registro y autenticación multi-tenant | ✅ | Autenticación biométrica / SSO empresarial |
| Gestión de módulos de capacitación | ✅ | Generador automático de currículos con IA |
| Actividades evaluativas (opción múltiple, V/F, etc.) | ✅ | Evaluaciones con proctoring o cámara |
| Simulaciones interactivas | ✅ | Simulaciones en VR/AR |
| Mentor IA con RAG (chat sobre documentos internos) | ✅ | Canales de mensajería entre usuarios |
| Gestión documental (subida, chunking, indexación) | ✅ | Firma electrónica de documentos |
| Dashboard de progreso y reportes por equipo | ✅ | BI externo (Power BI, Tableau, Looker) |
| Gestión de equipo y roles (Admin / Supervisor / Empleado) | ✅ | Nómina, liquidaciones o integración con RRHH |
| Motor ALAE — accesibilidad adaptativa | ✅ (rama `feature/chanti`) | Síntesis de voz generada en servidor |
| PWA con notificaciones push | ✅ | Aplicación móvil nativa (iOS / Android) |
| Automatizaciones con n8n / webhooks | 🚧 En roadmap | Integraciones con ERPs de terceros |

---

## Stakeholders

| ID | Rol | Interés principal | Nivel de influencia |
|---|---|---|---|
| SK-01 | Administrador de organización | Gestionar usuarios, cargar documentos, publicar módulos y ver reportes del equipo | Alto |
| SK-02 | Empleado / Aprendiz | Acceder a módulos, consultar el mentor IA y completar actividades en su turno de trabajo | Alto |
| SK-03 | Supervisor / Gerente | Monitorear el progreso del equipo, detectar brechas y asignar repasos | Medio |
| SK-04 | Equipo de desarrollo (interno) | Mantenibilidad del código, cobertura de pruebas, deuda técnica, despliegue continuo | Alto |
| SK-05 | Área legal / cumplimiento | Privacidad de datos por tenant, retención y eliminación de información personal | Medio |
| SK-06 | Proveedor de IA (Google Gemini / OpenAI) | Uso correcto de la API, cumplimiento de políticas de uso aceptable | Bajo |
| SK-07 | Cliente piloto (ej. Il Cafeto) | Velocidad de onboarding, calidad de respuestas del mentor, facilidad de carga de manuales | Alto |

---

## Requisitos Funcionales

### Autenticación y Gestión Multi-Tenant

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-01 | El sistema debe permitir el registro de una organización nueva con nombre de empresa, correo electrónico del administrador y contraseña, creando simultáneamente un tenant (`Organization`) y una cuenta de rol `ADMIN` en una única transacción atómica. | El registro crea exactamente un registro `Organization` y un `User` con `role = ADMIN` y `status = ACTIVE`; no se crean registros parciales si algún paso falla. |
| RF-02 | El sistema debe autenticar usuarios por credenciales (correo + contraseña con bcrypt de 12 rounds) y opcionalmente mediante Google OAuth. | Login exitoso devuelve sesión JWT con `organizationId`, `userId` y `role`; login con credenciales incorrectas retorna HTTP 401 sin revelar si el correo existe. |
| RF-03 | El sistema debe proteger todas las rutas del dashboard (`/home`, `/modules`, `/activities`, `/chat`, `/documents`, `/reports`, `/team`, etc.) redirigiendo a `/login` a usuarios no autenticados. | Una petición `GET /home` sin cookie de sesión válida retorna HTTP 302 hacia `/login`; con sesión válida, retorna HTTP 200. |
| RF-04 | El sistema debe impedir que un usuario de la organización A acceda a recursos (módulos, documentos, conversaciones, usuarios) de la organización B, incluso si manipula manualmente el ID del recurso en la petición. | Prueba IDOR: petición autenticada como `org-A` al endpoint `/api/documents/{id-de-org-B}` retorna HTTP 403 o 404, nunca HTTP 200 con datos de otra organización. |
| RF-05 | El sistema debe permitir a un administrador crear, listar, editar el estado (`PENDING` → `ACTIVE` → `SUSPENDED`) y desactivar cuentas de usuario dentro de su organización sin afectar otros tenants. | CRUD completo de usuarios accesible en `/api/users`; un usuario `SUSPENDED` no puede iniciar sesión aunque sus credenciales sean correctas. |

### Módulos de Capacitación y Actividades

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-06 | El sistema debe permitir la creación y publicación de módulos de capacitación con título, descripción, audiencia objetivo, duración estimada y estado (`DRAFT` / `PUBLISHED`), identificados por un slug único por organización. | Un módulo en estado `PUBLISHED` aparece en `GET /api/training-modules`; uno en `DRAFT` no es visible para empleados. |
| RF-07 | El sistema debe registrar cada intento de actividad con el `userId`, `activityId`, respuestas dadas, puntuación obtenida (0–100), tiempo invertido en segundos y si fue aprobado (`passed: boolean`). | `POST /api/activities/:id/attempt` persiste todos los campos en `ActivityAttempt`; un segundo intento crea un segundo registro sin sobrescribir el primero. |
| RF-08 | El sistema debe permitir la ejecución de simulaciones interactivas y registrar cada intento con métricas de desempeño equivalentes a las actividades. | `POST /api/simulations/:id/attempt` retorna un objeto con `score`, `passed` y `timeSpent`; el registro persiste en `SimulationAttempt`. |
| RF-09 | El sistema debe registrar el progreso de cada usuario por módulo (`UserProgress`), calculando el porcentaje de avance con base en las actividades completadas vs. el total del módulo. | `GET /api/training-modules/:slug` incluye un campo `progress` entre 0 y 100 calculado dinámicamente para el usuario autenticado. |

### Mentor de IA con RAG

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-10 | El sistema debe recibir una pregunta del empleado en `POST /api/chat`, recuperar los fragmentos (`DocumentChunk`) más relevantes del tenant activo mediante búsqueda semántica o recencia, y retornar una respuesta generada por IA citando las fuentes utilizadas. | La respuesta incluye el campo `sources` con los IDs o títulos de los documentos citados; el contenido de otros tenants no aparece en el contexto enviado al modelo. |
| RF-11 | Cuando `RAG_ENABLED=true`, el sistema debe calcular embeddings vectoriales para cada chunk y recuperar los K más similares a la consulta usando similitud coseno (pgvector). | Con un corpus de 100 chunks, la pregunta "¿Cómo se cierra turno?" devuelve chunks con los procedimientos de cierre; un chunk de otro módulo sin relación no aparece en los primeros 5 resultados. |
| RF-12 | Cuando no existe material indexado para una consulta específica de la empresa, el mentor debe responder orientación general breve y sugerir explícitamente al empleado que consulte al supervisor o que el administrador cargue el manual correspondiente. | Tenant sin documentos: el mentor no inventa políticas internas y menciona explícitamente la ausencia de material en la respuesta. |
| RF-13 | El sistema debe soportar respuestas en streaming mediante `GET/POST /api/chat/stream`, enviando tokens de texto al cliente a medida que el modelo los genera, para reducir la latencia percibida. | El cliente recibe el primer token en ≤ 2 s; la respuesta completa se renderiza incrementalmente sin esperar a que el modelo finalice. |

### Gestión Documental

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-14 | El sistema debe permitir subir documentos en formato PDF (máximo 15 MB) mediante `POST /api/documents`, extraer su texto, dividirlo en chunks de ~800 caracteres con solapamiento, y persistirlos como `DocumentChunk` vinculados al tenant. | Un PDF de 10 páginas produce entre 15 y 40 chunks en la base de datos con `organizationId` correcto; el documento queda disponible para consulta en el mentor IA en ≤ 60 s. |
| RF-15 | El sistema debe permitir listar (`GET /api/documents`), descargar (`GET /api/documents/:id/file`) y eliminar (`DELETE /api/documents/:id`) documentos del tenant activo. | Eliminar un documento borra también sus `DocumentChunk` asociados; el archivo físico en `storage/uploads/{organizationId}/` es eliminado. |
| RF-16 | El sistema debe permitir reprocesar un documento existente (`POST /api/documents/:id/reprocess`) sin eliminar el registro original ni su historial de uso en conversaciones. | El documento mantiene su `id` y `createdAt`; los chunks anteriores son reemplazados por los nuevos; el campo `updatedAt` se actualiza. |

### Motor ALAE — Accesibilidad Adaptativa

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-17 | El sistema debe crear automáticamente un perfil de accesibilidad (`AccessibilityProfile`) con valores por defecto para cada usuario nuevo (escala de fuente 1×, contraste normal, ritmo `NORMAL`, modalidad `MIXED`). | Al crear un usuario, existe exactamente un `AccessibilityProfile` vinculado con todos los campos en sus valores por defecto. |
| RF-18 | El sistema debe adaptar cualquier fragmento de contenido textual mediante `POST /api/alae/adapt`, retornando una versión simplificada (`SIMPLIFY`) o enriquecida visualmente (`VISUAL`) según el tipo solicitado, en ≤ 5 s para textos de hasta 1 000 palabras. | Prueba con texto de 800 palabras: respuesta adaptada recibida en ≤ 5 s; tipo `SIMPLIFY` registra evento de modalidad `READING` en el perfil. |
| RF-19 | El sistema debe registrar la modalidad de aprendizaje utilizada en cada interacción con ALAE y actualizar el campo `preferredModality` del perfil cuando una modalidad supere el 60 % del historial reciente del usuario. | Tras 10 interacciones de tipo `SIMPLIFY`, `preferredModality` del perfil refleja `READING`. |
| RF-20 | El sistema debe ofrecer un asistente de configuración inicial (wizard de accesibilidad) que guíe al usuario por sus preferencias antes de acceder al primer módulo, marcando `wizardCompleted = true` al finalizar. | Un usuario sin `wizardCompleted = true` es redirigido a `/onboarding`; al completarlo, accede al dashboard sin redirección adicional. |

### Reportes y Equipo

| ID | Requisito | Criterio de verificación |
|---|---|---|
| RF-21 | El sistema debe generar un reporte de progreso por organización con métricas de módulos completados, actividades aprobadas, tiempo de estudio acumulado y puntuación promedio por empleado. | `GET /api/reports/overview` retorna datos de todos los usuarios activos del tenant; los datos de otros tenants no aparecen. |
| RF-22 | El sistema debe generar un reporte de inclusión con métricas de adopción de ALAE, diversidad de modalidades de aprendizaje y una puntuación de inclusión calculada de 0 a 100. | `GET /api/reports/inclusion` retorna `inclusionScore`, `modalityBreakdown` y `alaeAdoptionRate` para el tenant. |
| RF-23 | El sistema debe permitir exportar reportes en formato descargable mediante `GET /api/reports/export`. | La descarga produce un archivo CSV o PDF válido con los datos del período solicitado; el archivo no contiene datos de otros tenants. |

---

## Requisitos No Funcionales

| ID | Categoría | Requisito | Métrica objetivo |
|---|---|---|---|
| RNF-01 | Rendimiento | El TTFB de las páginas del dashboard no debe superar 800 ms bajo carga normal (≤ 100 usuarios concurrentes por tenant). | P95 ≤ 800 ms medido con k6 o Lighthouse. |
| RNF-02 | Rendimiento | Las respuestas de la API REST deben completarse en ≤ 500 ms para el 95 % de las peticiones (excluyendo streaming y procesamiento de documentos). | P95 ≤ 500 ms en producción. |
| RNF-03 | Escalabilidad | La arquitectura multi-tenant debe soportar ≥ 50 organizaciones activas simultáneas sin degradación observable de rendimiento. | Prueba de carga con 50 tenants; tasa de error < 0,1 %. |
| RNF-04 | Seguridad | Toda ruta de API debe validar que el `organizationId` del JWT coincida con el recurso solicitado; accesos cruzados entre tenants deben retornar HTTP 403. | Prueba IDOR manual y automatizada: 0 filtraciones de datos entre tenants. |
| RNF-05 | Seguridad | Las contraseñas deben almacenarse como hash bcrypt con factor de costo ≥ 12; nunca en texto plano, logs ni cookies. | Revisión de código + búsqueda de cadenas `password` en logs de producción. |
| RNF-06 | Accesibilidad | La interfaz debe cumplir con WCAG 2.1 nivel AA en todas las páginas del dashboard. | Auditoría axe-core: 0 violaciones de nivel A y AA; Lighthouse Accessibility ≥ 90. |
| RNF-07 | Disponibilidad | El sistema debe mantener disponibilidad ≥ 99,5 % mensual (≤ 3,6 h de inactividad/mes). | Monitoreo externo continuo; reporte mensual de uptime. |
| RNF-08 | Mantenibilidad | El código debe pasar linting ESLint en modo estricto y TypeScript en `strict: true` sin errores en cada commit al rama `main`. | CI/CD rechaza PRs con errores de lint o de tipo. |
| RNF-09 | Privacidad | Los datos de cada tenant deben almacenarse en la misma instancia de PostgreSQL pero aislados lógicamente por `organizationId`; ninguna query debe omitir este filtro en tablas con datos de usuario. | Revisión de arquitectura Prisma; helper `tenantScope()` obligatorio en todas las queries sensibles. |
| RNF-10 | Usabilidad | El flujo completo de onboarding (registro → wizard de accesibilidad → primer módulo) debe completarse en ≤ 10 minutos por un usuario sin experiencia previa en la plataforma. | Prueba de usabilidad con 5 usuarios representativos; mediana ≤ 10 min. |
| RNF-11 | PWA | La aplicación debe ser instalable como PWA en Chrome, Edge y Safari con soporte de notificaciones push y un Lighthouse PWA score ≥ 90. | Reporte Lighthouse en entorno de producción. |

---

## Restricciones del Sistema

| ID | Restricción | Justificación |
|---|---|---|
| RST-01 | El frontend y el backend deben construirse exclusivamente con **Next.js 15 (App Router)** y **TypeScript 5** en modo estricto. | Decisión arquitectónica de equipo; evita fragmentación de stack. |
| RST-02 | La base de datos relacional debe ser **PostgreSQL 15+** accedida únicamente a través de **Prisma ORM 6**; no se permiten queries SQL crudas en código de aplicación. | Garantiza migraciones versionadas y tipado seguro. |
| RST-03 | El sistema debe soportar al menos tres proveedores de IA intercambiables (**Gemini**, **OpenAI**, **Ollama**) vía la variable de entorno `AI_DEFAULT_PROVIDER`, sin cambios de código al rotar proveedores. | Evita vendor lock-in y permite operación local sin costos de API. |
| RST-04 | Los archivos de documentos deben almacenarse en `storage/uploads/{organizationId}/` en desarrollo y en un servicio S3/Cloudinary en producción; no se permite mezclar archivos de distintos tenants en el mismo directorio o bucket sin prefijo. | Aislamiento de activos y seguridad de almacenamiento. |
| RST-05 | No se desarrollará ninguna aplicación móvil nativa en la versión 1; toda la funcionalidad móvil se entregará a través de la PWA. | Restricción de presupuesto y tiempo de desarrollo. |
| RST-06 | El presupuesto mensual de API de IA está limitado al plan contratado; el sistema debe implementar controles de rate limiting por usuario y organización antes del lanzamiento en producción. | Control de costos operativos. |

---

## Casos de Uso Principales

| ID | Nombre | Actor(es) | Descripción resumida |
|---|---|---|---|
| CU-01 | Registrar organización | Usuario anónimo | Un representante de empresa completa el formulario de registro, creando el tenant y su cuenta administradora. |
| CU-02 | Cargar manual corporativo | Administrador | El admin sube un PDF; el sistema lo extrae, divide en chunks y lo indexa para el mentor IA. |
| CU-03 | Publicar módulo de capacitación | Administrador | El admin crea y publica un módulo con título, descripción y audiencia objetivo. |
| CU-04 | Consumir módulo de capacitación | Empleado | El empleado accede al módulo, visualiza el contenido y completa las actividades evaluativas. |
| CU-05 | Consultar el mentor de IA | Empleado | El empleado formula una pregunta operativa; el sistema recupera fragmentos relevantes del tenant y genera una respuesta citando fuentes internas. |
| CU-06 | Configurar accesibilidad (ALAE) | Empleado | El usuario ejecuta el wizard de onboarding o modifica su perfil de accesibilidad en `/settings`. |
| CU-07 | Adaptar contenido con ALAE | Sistema / Empleado | El sistema adapta automáticamente el texto de un módulo o el empleado solicita la versión simplificada. |
| CU-08 | Ejecutar simulación | Empleado | El empleado realiza una simulación interactiva; el sistema registra el intento y retroalimenta el desempeño. |
| CU-09 | Monitorear progreso del equipo | Administrador / Supervisor | El supervisor visualiza el avance, puntuaciones y tiempo de estudio de cada miembro del equipo. |
| CU-10 | Exportar reporte de inclusión | Administrador | El admin descarga métricas de adopción de ALAE y diversidad de modalidades en CSV o PDF. |

---

## Actores y Procesos del Sistema

```
╔══════════════════════════════════════════════════════════════════╗
║                     PLATAFORMA FORGE                    ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  ACTORES EXTERNOS          SISTEMA                               ║
║                                                                  ║
║  [Administrador] ──────▶  Tenant Context (organizationId)       ║
║  [Supervisor]    ──────▶  ┌────────────────────────────────┐    ║
║  [Empleado]      ──────▶  │       CAPA DE PRESENTACIÓN      │    ║
║                           │   Next.js App Router + React    │    ║
║  [Proveedor IA]  ◀──────  └────────────────────────────────┘    ║
║  (Gemini / OpenAI          │                                     ║
║   / Ollama)               ▼                                     ║
║                    ┌──────────────────────────────────────┐      ║
║                    │         CAPA DE SERVICIOS             │      ║
║                    │  ┌────────────┐  ┌───────────────┐   │      ║
║                    │  │ Chat + RAG │  │ Doc Service   │   │      ║
║                    │  │ (pipeline) │  │ (chunker)     │   │      ║
║                    │  └─────┬──────┘  └───────┬───────┘   │      ║
║                    │        │                 │            │      ║
║                    │  ┌─────▼─────────────────▼────────┐  │      ║
║                    │  │         MOTOR ALAE              │  │      ║
║                    │  │  AccessibilityProfile           │  │      ║
║                    │  │  LearningProfile (modality)     │  │      ║
║                    │  │  AdaptContent (IA)              │  │      ║
║                    │  │  InclusionScorer (reportes)     │  │      ║
║                    │  └─────────────────────────────────┘  │      ║
║                    └──────────────────────────────────────┘      ║
║                                    │                             ║
║                    ┌───────────────▼──────────────────────┐      ║
║                    │     CAPA DE INFRAESTRUCTURA           │      ║
║                    │  PostgreSQL + Prisma  |  storage/     │      ║
║                    │  Middleware auth/tenant  |  pgvector  │      ║
║                    └──────────────────────────────────────┘      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

**Flujo RAG (Retrieval-Augmented Generation):**

```
Admin sube PDF
    │
    ▼
Extracción de texto (unpdf)
    │
    ▼
Chunker (~800 chars por chunk)
    │
    ▼
DocumentChunk en PostgreSQL ──[RAG_ENABLED]──▶ Embeddings (pgvector)
    │
    ▼ (consulta del empleado)
Retriever: top-K chunks por similitud coseno o recencia
    │
    ▼
Pipeline: prompt + contexto + proveedor IA
    │
    ▼
Respuesta + fuentes ──▶ Empleado
```

---

## Priorización de Requisitos — MoSCoW

### Must Have — Obligatorio para el lanzamiento

| ID | Descripción |
|---|---|
| RF-01, RF-02, RF-03 | Registro, autenticación y protección de rutas |
| RF-04, RF-05 | Aislamiento multi-tenant y gestión de usuarios |
| RF-06, RF-07, RF-09 | Módulos de capacitación con actividades y seguimiento de progreso |
| RF-10, RF-12, RF-14 | Mentor IA con RAG, fallback sin material y subida de documentos |
| RNF-04, RNF-05 | Seguridad multi-tenant y protección de contraseñas |

### Should Have — Importante, próxima iteración

| ID | Descripción |
|---|---|
| RF-08 | Simulaciones interactivas |
| RF-11 | Búsqueda vectorial con pgvector (`RAG_ENABLED=true`) |
| RF-13 | Chat en streaming |
| RF-17, RF-18, RF-19, RF-20 | Motor ALAE completo (perfil, adaptación, wizard, modalidad) |
| RF-21, RF-22 | Reportes de progreso e inclusión |
| RNF-01, RNF-02 | Umbrales de rendimiento |
| RNF-06 | Cumplimiento WCAG 2.1 AA |

### Could Have — Deseable, si hay tiempo

| ID | Descripción |
|---|---|
| RF-15, RF-16 | Eliminación y reprocesamiento de documentos |
| RF-23 | Exportación de reportes en CSV/PDF |
| RNF-10 | Prueba formal de usabilidad del onboarding |
| RNF-11 | PWA certificada con Lighthouse ≥ 90 |

### Won't Have — Fuera de alcance v1

| Descripción |
|---|
| Autenticación SSO empresarial (SAML, LDAP) |
| Generación automática de currículos con IA |
| Aplicación móvil nativa (iOS / Android) |
| Evaluaciones con proctoring o cámara |
| Integración con sistemas de nómina o RRHH |
| Síntesis de voz generada en servidor |
| BI externo (Power BI, Tableau) |
| Simulaciones en VR / AR |

---

## Tecnologías Propuestas

| Capa | Tecnología | Versión | Rol |
|---|---|---|---|
| Framework fullstack | Next.js (App Router) | 15.x | SSR, API routes, Server Actions |
| Lenguaje | TypeScript | 5.x (strict) | Tipado completo frontend y backend |
| ORM | Prisma | 6.x | Modelo de datos multi-tenant, migraciones |
| Base de datos | PostgreSQL + pgvector | 15+ | Datos relacionales + embeddings vectoriales |
| Autenticación | NextAuth.js | v5 | JWT, bcrypt, Google OAuth opcional |
| IA — Chat / Adaptación | Gemini (default), OpenAI, Ollama | — | RAG, adaptación ALAE, streaming |
| Estilos | Tailwind CSS v4 + Framer Motion | 4.x | UI responsiva y animaciones |
| Componentes UI | shadcn/ui + Radix UI | — | Accesibilidad base (ARIA) |
| Validación | Zod | 3.x | Validación de entrada en Server Actions y APIs |
| Estado del cliente | Zustand | — | Estado global de UI |
| Extracción de PDF | unpdf | — | Text extraction en el servidor |
| Notificaciones push | Web Push API (service worker) | — | PWA, notificaciones en segundo plano |
| Automatización | n8n + webhooks | — | Reglas automáticas (roadmap) |
| Almacenamiento de archivos | Local (`storage/uploads/`) → S3/Cloudinary | — | PDFs por tenant |
| CI/CD | GitHub Actions | — | Lint, type-check, build en cada PR |
| Despliegue | Vercel (recomendado) | — | Edge network, serverless functions |

---

## Criterios de Aceptación

| ID | Criterio | Método de verificación |
|---|---|---|
| CA-01 | Un administrador puede registrar su empresa, cargar un PDF de 20 páginas y recibir una respuesta del mentor basada en ese documento, todo en ≤ 15 minutos desde el registro. | Sesión cronometrada con usuario real. |
| CA-02 | Un empleado de la organización A no puede acceder, ni a través de la UI ni manipulando peticiones HTTP, a datos (documentos, chats, módulos) de la organización B. | Prueba de penetración OWASP IDOR; resultado esperado: HTTP 403/404. |
| CA-03 | El mentor responde preguntas operativas con texto extraído del manual corporativo cargado, citando el documento fuente, en ≥ 80 % de las consultas relevantes al material existente. | Evaluación manual con 20 preguntas sobre el corpus Il Cafeto; ≥ 16 respuestas con fuente correcta. |
| CA-04 | El chat en streaming muestra el primer token en ≤ 2 s y completa la respuesta en ≤ 15 s para consultas de complejidad media. | Medición con DevTools → Network → Timing. |
| CA-05 | La auditoría de accesibilidad con axe-core no reporta violaciones de nivel A ni AA en ninguna página del dashboard. | Integración axe en pruebas E2E (Playwright + axe-playwright). |
| CA-06 | Un documento PDF de 50 páginas queda indexado y consultable en el mentor en ≤ 90 s tras la subida. | Prueba cronometrada con el manual Il Cafeto módulo 1. |
| CA-07 | El score de Lighthouse en producción alcanza: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, PWA ≥ 90. | Reporte Lighthouse ejecutado en CI contra el entorno de staging. |
| CA-08 | El wizard de accesibilidad ALAE completo (5 pasos) puede ser completado con teclado únicamente, sin uso del ratón, por un usuario con discapacidad motriz. | Prueba de navegación por teclado (Tab, Enter, Space, flechas); sin trampas de foco. |

---

## Riesgos Identificados

| ID | Riesgo | Probabilidad | Impacto | Estrategia de mitigación |
|---|---|---|---|---|
| R-01 | Latencia o indisponibilidad de la API de IA (Gemini / OpenAI) en horas pico, degradando el mentor y la adaptación ALAE. | Media | Alto | Implementar caché de respuestas frecuentes por hash de consulta + contexto; mostrar indicador de carga; definir timeout de 30 s y fallback de mensaje de error claro. Soportar Ollama como alternativa local. |
| R-02 | Filtración de datos entre tenants por omisión del filtro `organizationId` en una query Prisma. | Baja | Crítico | Helper `tenantScope()` obligatorio; revisión de código en cada PR; pruebas de integración de aislamiento por endpoint; regla de lint personalizada. |
| R-03 | Costos de API de IA superiores al presupuesto por uso intensivo del mentor y ALAE en organizaciones grandes. | Media | Medio | Rate limiting por usuario (N peticiones/hora) y por organización; monitoreo de tokens consumidos; caché de adaptaciones ALAE por hash de contenido. |
| R-04 | El procesamiento de documentos PDF grandes (> 200 páginas) excede el timeout de serverless functions (Vercel: 60 s en plan gratuito). | Media | Medio | Procesar documentos en workers de background o queues; dividir en chunks pequeños antes de llamar al modelo; aumentar timeout en plan Pro. |
| R-05 | Baja adopción del wizard ALAE por parte de los empleados, reduciendo el impacto medible de accesibilidad. | Media | Medio | Hacer el wizard obligatorio antes del primer módulo (redirect automático); diseño UX atractivo y corto (≤ 3 minutos). |
| R-06 | Deuda técnica por velocidad de desarrollo, generando regresiones y dificultando incorporación de nuevos desarrolladores. | Alta | Medio | ESLint + TypeScript strict en CI; umbral de cobertura en pruebas; documentación de arquitectura en `docs/ARCHITECTURE.md`. |
| R-07 | Proveedor de base de datos (Supabase) introduce cambios de precios o limitaciones que afecten el plan de embeddings pgvector. | Baja | Medio | Mantener abstracción de almacenamiento vectorial; evaluar alternativa Railway + PostgreSQL propio. |

---

## Cronograma Resumido

| Fase | Actividades principales | Duración estimada | Entregable verificable |
|---|---|---|---|
| **F1 — Fundamentos** | Arquitectura multi-tenant, autenticación, modelo Prisma, CI/CD | 3 semanas | Base desplegable con login y aislamiento de tenants |
| **F2 — Core de capacitación** | Módulos, actividades, simulaciones, progreso, gestión de equipo | 4 semanas | MVP de capacitación con registro de intentos |
| **F3 — Mentor IA + RAG** | Subida documental, chunker, retriever, pipeline, streaming | 3 semanas | Chat con fuentes internas del tenant |
| **F4 — Motor ALAE** | Perfil de accesibilidad, wizard, adaptación de contenido, modalidad | 4 semanas | ALAE integrado en módulos y chat |
| **F5 — Reportes y PWA** | Reportes de progreso e inclusión, exportación, service worker, push | 2 semanas | Dashboard de reportes + PWA instalable |
| **F6 — Calidad y lanzamiento** | Auditoría WCAG, pruebas de carga, prueba de penetración, documentación | 2 semanas | Versión 1.0 en producción con score Lighthouse ≥ 90 |

> **Duración total estimada:** 18 semanas (≈ 4,5 meses)  
> Piloto con Il Cafeto ejecutable desde el final de F3.

---

## Conclusiones

FORGE resuelve un problema real de organizaciones operativas: el conocimiento institucional disperso que genera errores, costos de capacitación repetitiva y alta rotación sin onboarding efectivo. Su diferenciador central es el **mentor de IA contextual basado en RAG**, que garantiza respuestas fundamentadas en el material interno de cada empresa y no en conocimiento genérico.

Los requisitos definidos en este documento son **verificables y medibles**: cada RF tiene un criterio de aceptación concreto; cada RNF tiene una métrica numérica. La priorización MoSCoW asegura que el equipo entregue un núcleo funcional (RF-01 a RF-14, RNF-04, RNF-05) antes de expandir hacia ALAE, reportes avanzados y PWA.

Los riesgos más críticos — filtración de datos entre tenants (R-02) y costos de API de IA (R-03) — cuentan con mitigaciones técnicas concretas que deben implementarse antes del lanzamiento en producción. El modelo de datos Prisma con `organizationId` en todas las entidades sensibles y la capa de proveedores de IA intercambiable son decisiones arquitectónicas que abordan ambos riesgos desde el diseño.

El sistema está diseñado para escalar de un piloto de restaurante (Il Cafeto) a múltiples verticales industriales sin cambios de arquitectura, lo que valida su viabilidad como producto SaaS de largo plazo.

---

*Documento de Ingeniería de Requisitos — FORGE · Versión 1.0 · Junio 2026*
