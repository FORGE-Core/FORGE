# Il Cafeto — Tenant demo (Cappi)

Restaurante/cafetería en **Bogotá**, tenant piloto multi-tenant de Cappi.

| Campo | Valor |
|-------|-------|
| Slug | `il-cafeto` |
| Industria | Restaurante / Cafetería |
| Programa | Aion Restaurant POS v1.0 |
| Color marca | `#581c22` |

## Estructura de esta carpeta

```
tenants/il-cafeto/
├── index.ts           # Definición del tenant (export ilCafetoTenant)
├── organization.ts    # Datos de empresa, admin y empleados demo
├── modules.ts         # Catálogo de módulos publicados
├── capacitacion/      # Manuales markdown (contenido indexado para RAG)
│   ├── README.md
│   ├── 00-induccion-general.md
│   └── …
└── README.md          # Este archivo
```

## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@ilcafeto.com` | `ilcafeto2024!` |
| Mesero | `staff1@ilcafeto.com` | `Staff1234!` |
| Barista | `staff2@ilcafeto.com` | `Staff1234!` |
| Cajero | `staff3@ilcafeto.com` | `Staff1234!` |

## Cargar en base de datos

Desde la raíz del proyecto:

```bash
npm run db:seed:il-cafeto
# o
npm run db:seed
```

El seed es idempotente: actualiza organización, usuarios, módulos y documentos sin duplicar.

## Capacitación

El curso completo (~16–24 h) está en [`capacitacion/`](./capacitacion/README.md): inducción, mesero, cocina, bar, caja, gerencia, administración, experiencia cliente y apéndices.

Cada archivo `.md` se indexa como documento privado de **solo Il Cafeto** en la base de datos multi-tenant.

## Añadir otro restaurante

Copia esta carpeta como plantilla:

```bash
cp -r tenants/il-cafeto tenants/mi-restaurante
```

Edita `organization.ts`, `modules.ts`, reemplaza `capacitacion/` y registra el tenant en `tenants/index.ts`.
