# Datos demo para desarrollo (`prisma db seed`)

Esta carpeta **no forma parte de la aplicación en runtime**. Solo alimenta la base de datos local con organizaciones de ejemplo.

## Empresas reales (producción)

- Registro en `/register`
- Datos en PostgreSQL (`Organization`, `User`, etc.)
- Documentos subidos en la UI
- **No** requieren carpeta en el repositorio

## Demos de desarrollo (opcional)

```
seed-data/
├── manifest.ts              # Lista de bundles a sembrar
└── demos/
    └── il-cafeto/           # Ejemplo: restaurante + curso Aion POS
        ├── index.ts
        ├── organization.ts
        ├── modules.ts
        └── capacitacion/    # Markdown indexado en RAG
```

Para añadir **otro demo local** (no un cliente de producción):

1. Copia `demos/il-cafeto/` → `demos/mi-demo/`
2. Edita `organization.ts`, `modules.ts` y el contenido markdown
3. Importa el bundle en `manifest.ts`

La lógica de seed está en [`src/lib/seed/seed-organization.ts`](../src/lib/seed/seed-organization.ts).

```bash
npx prisma db seed
```
