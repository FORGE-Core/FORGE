# Tenants (multi-tenant)

Cada **empresa** que usa Cappi puede tener su propia carpeta bajo `tenants/`. Ahí vive todo lo que la identifica como tenant aislado: configuración, usuarios demo, catálogo de módulos y contenido de capacitación.

## Tenants registrados

| Tenant | Carpeta | Slug | Industria |
|--------|---------|------|-----------|
| Il Cafeto | [`il-cafeto/`](./il-cafeto/) | `il-cafeto` | Restaurante / Cafetería (Bogotá) |

## Estructura de un tenant

```
tenants/{id}/
├── index.ts           # Export TenantDefinition
├── organization.ts    # name, slug, settings, admin, staff
├── modules.ts         # módulos publicados + metadata UI
├── capacitacion/      # markdown indexado en RAG (por tenant)
└── README.md
```

## Registrar un tenant nuevo

1. Copia la carpeta de un tenant existente:
   ```bash
   cp -r tenants/il-cafeto tenants/mi-empresa
   ```
2. Edita `organization.ts`, `modules.ts` y el contenido en `capacitacion/`.
3. Ajusta `index.ts` del nuevo tenant.
4. Importa y añade el tenant en [`tenants/index.ts`](./index.ts):
   ```ts
   import { miEmpresaTenant } from "./mi-empresa";
   export const tenants = [ilCafetoTenant, miEmpresaTenant];
   ```
5. Ejecuta el seed:
   ```bash
   npm run db:seed
   ```

## Seed

La lógica genérica está en [`src/lib/tenants/seed-tenant.ts`](../src/lib/tenants/seed-tenant.ts). Por cada tenant:

- Crea/actualiza `Organization` por slug
- Crea usuarios admin y empleados
- Publica módulos y documentos **solo** para esa organización
- Indexa chunks de markdown para el mentor IA

Los datos de un tenant **nunca** se mezclan con otro: todo lleva `organizationId` en base de datos.
