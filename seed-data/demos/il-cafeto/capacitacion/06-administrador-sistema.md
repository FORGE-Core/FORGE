# Módulo 6 — Administrador del sistema

**Audiencia:** Administrador de Aion, IT del restaurante, dueño-operador  
**Duración sugerida:** 6 horas  
**Acceso requerido:** Rol `admin`

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md)

---

## Objetivos

Al finalizar podrás:

- Configurar un restaurante de punta a punta en Aion
- Gestionar usuarios, menú, mesas e inventario
- Aplicar branding y preferencias (IVA, moneda, timezone)
- Entender multi-tenant, seguridad y mantenimiento rutinario
- Resolver incidencias técnicas de primer nivel

---

## 1. Perfil del administrador del sistema

El administrador del sistema es quien:

- Configura el restaurante en la plataforma
- Crea y gestiona usuarios staff y admin
- Mantiene menú, precios e inventario
- Define branding (colores, logo)
- Configura IVA, moneda y zona horaria
- Supervisa integridad de datos multi-tenant
- Resuelve incidencias técnicas de primer nivel

---

## 2. Mapa completo del panel admin

| Sección | Ruta | Función |
|---------|------|---------|
| Dashboard | `/aion/admin` | KPIs, gráficos, alertas, chatbot IA |
| Punto de venta | `/aion/admin/pos` | Facturación rápida |
| Pedidos | `/aion/admin/pedidos` | Histórico y consulta |
| Inventario | `/aion/admin/inventario` | Menú, stock, movimientos |
| Gastos | `/aion/admin/gastos` | Egresos operativos |
| Cierre de caja | `/aion/admin/cierre-caja` | Turnos y cuadre |
| Empleados | `/aion/admin/empleados` | RRHH y nómina |
| Mesas / Reservas | `/aion/admin/mesas-reservas` | Layout y reservas |
| Configuración | `/aion/admin/configuracion` | Perfil, branding, preferencias, usuarios |

---

## 3. Configuración — 4 pestañas

**Ruta:** `/aion/admin/configuracion`

### Pestaña: Perfil

| Campo | Descripción |
|-------|-------------|
| Nombre del restaurante | Sidebar y documentos |
| Dirección | Referencia para clientes |
| Teléfono | Contacto del local |
| Sedes (branches) | Sucursales activas |

### Pestaña: Branding

| Campo | Descripción |
|-------|-------------|
| Color primario | Color principal de marca |
| Color secundario | Complemento visual |
| Color de acento | Botones, highlights |
| Color de fondo | Fondo vistas cliente |
| Logo | URL del logo |

Preview en vivo al cambiar colores.

**Demos:** Il Cafeto `#581c22` · La Cazuela `#14532d`

### Pestaña: Preferencias

| Campo | Valor típico | Impacto |
|-------|--------------|---------|
| Moneda | `COP` | Formato de precios |
| Zona horaria | `America/Bogota` | Fechas y turnos |
| Tasa de IVA | `19` | Cálculo en POS |
| Propina sugerida | `10` | Referencia clientes |

### Pestaña: Usuarios

| Campo al crear | Descripción |
|----------------|-------------|
| Nombre | Nombre del usuario |
| Email | Login único |
| Contraseña | Mín. 8 chars, mayúscula, minúscula, número |
| Rol | `admin` o `staff` |

**Comportamientos:**
- Email existente → solo crea vínculo `user_restaurants`
- Admin no puede eliminarse a sí mismo
- Desvincular quita acceso al restaurante

---

## 4. Onboarding de restaurante nuevo

### Checklist

```
□ Restaurante creado (nombre, dirección, teléfono)
□ Sede(s) configuradas
□ Admin principal vinculado (user_restaurants)
□ Branding aplicado
□ Preferencias: moneda, IVA, timezone
□ Menú cargado (Inventario)
□ Mesas creadas
□ Usuarios staff creados
□ Empleados registrados en RRHH
□ Turno de caja probado
□ Prueba end-to-end: pedido → cocina → entrega → cierre
```

### Orden recomendado

1. Configuración → Perfil
2. Configuración → Branding
3. Configuración → Preferencias
4. Inventario (menú completo)
5. Mesas / Reservas
6. Configuración → Usuarios
7. Empleados
8. Prueba operativa

---

## 5. Gestión del menú e inventario

**Ruta:** `/aion/admin/inventario`

### Pestañas

| Pestaña | Contenido |
|---------|-----------|
| Productos | Platos, bebidas, insumos vendibles |
| Servicios | Ítems categorizados como servicio |
| Movimientos | Historial de entradas/salidas |

### Campos por producto

| Campo | Uso |
|-------|-----|
| Nombre | Menú y POS |
| Categoría | Filtros y organización |
| Precio | Venta al cliente |
| Costo unitario | Margen |
| Stock | Cantidad disponible |
| Stock mínimo | Alerta en Dashboard |
| Disponible | Activo en menú |

### Desactivar vs. eliminar

| Acción | Cuándo | Efecto |
|--------|--------|--------|
| Desactivar | Agotado temporalmente | Desaparece del menú; conserva historial |
| Eliminar (soft) | Igual que desactivar | Reversible |
| Eliminar (hard) | Error de creación | Borrado permanente |

### Sincronización

```
INVENTARIO (admin)
    ├──► MENÚ CLIENTE (solo available: true)
    └──► POS (stock > 0 o stock null)
```

---

## 6. Gestión de mesas

| Campo | Ejemplo |
|-------|---------|
| Número | 12 |
| Capacidad | 4 |
| Zona | Terraza / Interior / Bar |
| Estado | libre |
| Sede | Branch activa |

**Buenas prácticas:** numeración coherente con plano físico; actualizar estados en tiempo real (`ocupada` → `limpieza` → `libre`).

---

## 7. Autenticación y seguridad

### Sesión

| Elemento | Detalle |
|----------|---------|
| Access token | Cookie `aion_access_token`, ~15 min |
| Refresh token | Cookie `aion_refresh_token`, ~7 días |
| Payload JWT | `{ id, email, role, restaurantId }` |
| Aislamiento | Queries filtrados por `restaurantId` |

### Reglas de seguridad

1. No compartir credenciales admin con staff operativo
2. Crear cuentas **staff** para meseros/cocina; **admin** para caja/gerencia
3. Cerrar sesión en equipos compartidos
4. Rotar contraseñas periódicamente
5. Verificar `restaurantId` correcto (evitar mezcla multi-tenant)
6. No exponer `.env` ni secretos JWT

### Validación de contraseñas

- Mínimo 8 caracteres
- Al menos una mayúscula, una minúscula y un número

---

## 8. Multi-tenant

Un despliegue sirve a **varios restaurantes** aislados:

```
Despliegue Aion
├── Il Cafeto (Bogotá)     → /aion/*
├── La Cazuela (Medellín)  → /cazuela/*
└── [Restaurante N]        → /[slug]/*
```

### Prueba de aislamiento

1. Login `admin@ilcafeto.com` → menú cafetero, 12 mesas, 3 empleados
2. Cerrar sesión
3. Login `admin@lacazuela.com` → menú colombiano, 8 mesas, 2 empleados
4. **Datos nunca se mezclan**

### Feature flags por restaurante

- Multi-sede
- Cierre de caja
- Nómina
- Chatbot admin

---

## 9. Chatbot administrativo (IA)

En Dashboard, modo admin. Puede orientar sobre operación y finanzas en español. **No reemplaza** verificación de datos críticos ni soporte de infraestructura.

---

## 10. Mantenimiento rutinario

| Frecuencia | Tarea |
|------------|-------|
| Diaria | Alertas Dashboard, usuarios activos |
| Semanal | Stock bajo, export pedidos, reservas |
| Mensual | Cierre financiero, empleados activos |
| Trimestral | Auditoría menú/precios, limpieza inactivos |
| Ante cambios | Branding, IVA, contacto |

---

## 11. Escenarios avanzados

### Nuevo mesero con acceso

1. Configuración → Usuarios → rol `staff`
2. Empleados → cargo "Mesero/a"
3. Entregar credenciales de forma segura
4. Capacitar con [01-mesero-mesera.md](./01-mesero-mesera.md)
5. Supervisar primer turno

### Cambio de precios masivo

1. Inventario → editar precios
2. Verificar POS y menú cliente
3. Comunicar al equipo antes de horario pico

### Restaurante con dos sedes

1. Verificar branches en Configuración
2. Asignar empleados y mesas por sede
3. Cierres de caja por sede

### Staff no puede entrar

1. Verificar email/contraseña
2. Confirmar vínculo en `user_restaurants`
3. Verificar rol (`staff` o `admin`)
4. Recrear vínculo o resetear contraseña

---

## 12. APIs admin (referencia)

Todas requieren `requireAdmin()` — JWT con `role: admin` y `restaurantId` válido.

| Ruta | Función |
|------|---------|
| `GET /api/admin/dashboard` | KPIs |
| `GET/PUT /api/admin/configuracion` | Config restaurante |
| `GET/POST/PUT/DELETE /api/admin/inventario` | Menú/stock |
| `GET/POST/PUT/DELETE /api/admin/gastos` | Gastos |
| `GET/POST/PUT/DELETE /api/admin/empleados` | RRHH |
| `GET/POST/PUT/DELETE /api/admin/mesas-reservas` | Mesas y reservas |
| `GET/POST /api/admin/cierre-caja` | Cierre caja |
| `GET/POST/DELETE /api/admin/usuarios` | Usuarios tenant |
| `GET /api/admin/orders` | Listado pedidos |
| `GET/POST /api/admin/pos` | POS |

---

## 13. Cheat sheet

```
ENTRAR:     /aion/login → /aion/admin
CONFIG:     /aion/admin/configuracion (4 pestañas)
USUARIOS:   Configuración → Usuarios
MENÚ:       /aion/admin/inventario
MESAS:      /aion/admin/mesas-reservas
REPORTES:   Dashboard + export CSV
NO HACER:   Compartir admin, mezclar tenants
```

---

## 14. Ejercicio práctico

1. Crear producto nuevo en Inventario y verificar en menú cliente y POS.
2. Crear mesa nueva.
3. Crear usuario staff.
4. Cambiar color primario en Branding.
5. Ejecutar prueba end-to-end completa.
6. Exportar pedidos a CSV.

---

## Evaluación

Ver preguntas de administrador en [08-apendices.md](./08-apendices.md#evaluación--administrador).
