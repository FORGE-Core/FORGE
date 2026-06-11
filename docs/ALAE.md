# ALAE — Adaptive Learning & Accessibility Engine

Documentación formal Fase 0 + Fase 1 (cierre).

## Arquitectura

```
Usuario
  → AccessibilityProvider (DOM + preferencias)
  → LearningProfile (reglas por eventos)
  → declaredNeeds (wizard → NOVA + recomendaciones)
  → NOVA/RAG (augmentación de system prompt)
  → Adapt API (simplificar / paso a paso)
  → Inclusion Audit (PDF + módulos → score)
  → Reports /dashboard/reports/inclusion
```

Multi-tenant: todos los modelos incluyen `organizationId`.

## Modelos Prisma

| Modelo | Propósito |
|--------|-----------|
| `AccessibilityProfile` | Preferencias UI y aprendizaje por usuario |
| `LearningProfile` | Contadores de modalidad y nivel de soporte |
| `InclusionAudit` | Score 0–100 por documento o módulo |
| `AccessibilityEvent` | Telemetría de uso ALAE |
| `ContentAdaptation` | Historial de adaptaciones IA |

## APIs

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/PATCH | `/api/accessibility/profile` | Perfil de accesibilidad |
| GET/PATCH | `/api/learning-profile` | Perfil adaptativo + wizard |
| POST | `/api/alae/adapt` | Simplificar o paso a paso |
| POST | `/api/alae/inclusion-audit` | Auditar contenido |
| POST | `/api/alae/inclusion-audit/bulk` | Auditoría masiva |
| GET | `/api/reports/inclusion` | Dashboard de inclusión |
| POST | `/api/alae/modality` | Registrar uso de modalidad |

## Casos de uso

### Empleado — primer login
1. Wizard ALAE: modalidad + ayudas preferidas
2. `declaredNeeds` guardado → NOVA personalizado
3. Dashboard muestra recomendaciones ALAE

### Empleado — módulo complejo
1. Ve Inclusion Score en detalle del módulo
2. Usa «Explicar fácil» o «Guíame paso a paso»
3. Ritmo lento activa menos pasos automáticamente

### Admin — documento nuevo
1. PDF procesado → Inclusion Score automático
2. Reportes → módulos más complejos
3. Umbral configurable en Ajustes

### NOVA — chat adaptativo
- `simplifiedLanguage` → frases cortas
- `stepByStepMode` → un paso a la vez
- `VISUAL` → listas + diagramas Mermaid
- `declaredNeeds.examples` → más ejemplos prácticos
- `declaredNeeds.simulations` → sugiere simulaciones

## Checklist Fase 1 (cerrado)

- [x] Accessibility Profile completo
- [x] Learning Profile con reglas
- [x] Wizard inicial
- [x] Provider + `useAccessibility()`
- [x] NOVA adaptativo (RAG + stream)
- [x] Botones adaptación en módulo y chat
- [x] Inclusion Score en PDFs y módulos
- [x] Dashboard inclusión + módulos complejos
- [x] declaredNeeds consumido en NOVA y recomendaciones
- [x] learningPace con efecto en UX
- [x] captionsEnabled en reproductor de video
- [x] WCAG: skip link, focus, aria, e2e axe
- [x] Componentes `src/components/alae/*`

## Fuera de alcance (Fase 2+)

- Avatar 3D / señas en video
- Navegación 100% por voz
- ML predictivo avanzado

## Tareas futuras (opcional)

1. Subtítulos VTT reales desde transcripción de video
2. Auditoría axe en rutas autenticadas con fixture de login
3. Renderizado Mermaid en chat (preview visual)
