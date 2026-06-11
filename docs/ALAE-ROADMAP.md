# ALAE — Roadmap Fase 0 y Fase 1

## Arquitectura

```
Usuario → AccessibilityProvider (DOM + API)
       → LearningProfile (reglas por eventos)
       → NOVA/RAG (prompt augmentation)
       → Adapt API (simplify / step-by-step)
       → Inclusion Audit (PDF → score)
       → Reports /dashboard/reports/inclusion
```

## Carpetas

```
prisma/schema.prisma          # Modelos ALAE
src/lib/alae/                 # Lógica de negocio
src/components/alae/          # UI + provider
src/app/api/accessibility/    # Perfil accesibilidad
src/app/api/learning-profile/ # Perfil adaptativo
src/app/api/alae/             # adapt + inclusion-audit
src/app/api/reports/inclusion # Dashboard inclusión
```

## Completado (Fase 0 + 1) ✅

- Provider, wizard, perfiles, APIs
- NOVA adaptativo (stream + pipeline) + declaredNeeds + learningPace
- Inclusion Score en PDFs, módulos (lista + detalle)
- Dashboard inclusión con módulos más complejos
- UI en documentos, reportes, perfil, settings
- Learning profile desde actividades/simulaciones/chat
- Lectura automática + subtítulos contextuales en video
- Política de inclusión por organización
- Test e2e a11y (landing, login, register)
- Documentación formal: `docs/ALAE.md`

## Fase 1.5 ✅

- Dashboard adaptativo con tarjeta ALAE y recomendaciones por modalidad
- Toolbar de accesibilidad rápida (texto, contraste, oscuro, voz)
- Actividades en modo paso a paso (ALAE)
- Inclusion Score en módulos (admin)
- API modalidad + tracking de video
- Auditoría masiva de contenido
- Seed de perfiles ALAE + inclusion audits

## Fase 2 (parcial) ✅

- Avatar NOVA 2D animado (idle, listening, thinking, speaking)
- Comandos de voz globales ALAE
- Modo voz en NOVA (micrófono + lectura automática)
- Analítica de patrones de aprendizaje (`/dashboard/reports/learning-patterns`)
- PWA instalable + service worker
- Notificaciones push Web (VAPID)

## Fuera de alcance (decisión de producto)

- ~~Avatar 3D~~ — no se implementará
- ~~Avatar con señas en video~~ — no se implementará
- El avatar actual es **NovaAvatar2D** (SVG simple en chat/widget); suficiente para el producto

## Fase 3 (pendiente, sin avatar)

- Lengua de señas con contenido estático/ampliado (glosario, sin avatar animado)
- Navegación 100% por voz
- ML predictivo (opcional)
