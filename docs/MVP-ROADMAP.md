# Roadmap MVP — FORGE / Cappi ✅ COMPLETADO

## Fase 1 — Fundación ✅

- [x] Estructura Next.js + TypeScript + Tailwind v4
- [x] Schema Prisma multi-tenant
- [x] Capa IA desacoplada (Gemini + OpenAI + Ollama)
- [x] Pipeline RAG base
- [x] Landing + Dashboard UI premium
- [x] Componentes base (Navbar, Sidebar, Chat, Metrics)
- [x] Auth (NextAuth credenciales + Google OAuth opcional)
- [x] pgvector (script SQL en `prisma/supabase-setup.sql`)

## Fase 2 — Core producto ✅

- [x] CRUD módulos (API + UI admin)
- [x] CRUD procesos (API)
- [x] Upload documentos (local + S3)
- [x] Procesamiento PDF → chunks → embeddings
- [x] Generación IA: documento → módulo + actividades + simulación
- [x] Chat IA con streaming SSE
- [x] Historial de conversaciones
- [x] Aprobación de usuarios (ADMIN)
- [x] Ajustes de organización con datos reales
- [x] Onboarding guiado (`/dashboard/onboarding`)

## Fase 3 — Aprendizaje ✅

- [x] Actividades: opción múltiple, V/F, ordenar pasos, detectar errores
- [x] Simulaciones operativas (CASE_STUDY)
- [x] Tracking de progreso por empleado
- [x] LearningEvent + webhooks n8n
- [x] Sugerencias de repaso adaptativas (dashboard)
- [x] Vista supervisor por empleado (`/dashboard/team/[id]`)

## Fase 4 — Analytics y automatización ✅

- [x] Dashboard de reportes (ADMIN/SUPERVISOR)
- [x] Hallazgos IA en reportes
- [x] Webhooks n8n
- [x] UI gestión de automatizaciones (Ajustes)
- [x] Exportación CSV (`/api/reports/export`)
- [x] Rate limiting en APIs de chat

## Fase 5 — Producción ✅

- [x] Tests E2E (Playwright — `npm run test:e2e`)
- [x] CI/CD (GitHub Actions — `.github/workflows/ci.yml`)
- [x] Observabilidad (Sentry opcional — `SENTRY_DSN`)
- [x] Rate limiting
- [x] Onboarding empresarial guiado
- [ ] Modo voz (futuro — post-MVP)

## Activar en producción

```env
RAG_ENABLED=true
GEMINI_API_KEY=...
EMBEDDING_DIMENSIONS=768
STORAGE_PROVIDER=s3          # opcional
AWS_S3_BUCKET=...
N8N_WEBHOOK_URL=...          # opcional
SENTRY_DSN=...               # opcional
```

Ejecutar `prisma/supabase-setup.sql` en Supabase.

## Flujo demo

1. Admin → `/dashboard/onboarding`
2. Subir PDF en Documentos
3. Revisar módulos/actividades generados
4. Empleado usa Mentor IA (streaming)
5. Supervisor revisa `/dashboard/team/[id]` y exporta reportes CSV
