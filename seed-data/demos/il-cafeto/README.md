# Il Cafeto — demo de desarrollo (Cappi)

Restaurante/cafetería en **Bogotá**, bundle de ejemplo para `prisma db seed`.

| Campo | Valor |
|-------|-------|
| Slug | `il-cafeto` |
| Industria | Restaurante / Cafetería |
| Programa | Aion Restaurant POS v1.0 |
| Color marca | `#581c22` |

## Estructura de esta carpeta

```
seed-data/demos/il-cafeto/
├── index.ts           # Export ilCafetoSeed
├── organization.ts    # Empresa, admin y empleados demo
├── modules.ts         # Catálogo de módulos
├── capacitacion/      # Manuales markdown (RAG)
│   ├── README.md
│   ├── 00-induccion-general.md
│   └── …
└── README.md
```

## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@ilcafeto.com` | `ilcafeto2024!` |
| Mesero | `staff1@ilcafeto.com` | `Staff1234!` |
| Barista | `staff2@ilcafeto.com` | `Staff1234!` |
| Cajero | `staff3@ilcafeto.com` | `Staff1234!` |

## Cargar en base de datos

```bash
npm run db:seed
```

El seed es idempotente: actualiza organización, usuarios, módulos y documentos sin duplicar.

## Capacitación

El curso completo (~16–24 h) está en [`capacitacion/`](./capacitacion/README.md).

Cada `.md` se indexa como documento de **solo Il Cafeto** en PostgreSQL (`organizationId`).

## Otra empresa en producción

Usa `/register` en la app. **No** copies esta carpeta por cada cliente real.

Para otro **demo local** de desarrollo:

```bash
cp -r seed-data/demos/il-cafeto seed-data/demos/mi-demo
```

Edita los archivos y añade el import en [`seed-data/manifest.ts`](../../manifest.ts).
