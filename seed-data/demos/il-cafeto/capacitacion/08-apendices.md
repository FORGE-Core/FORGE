# Apéndices — Glosario, flujos integrados, evaluaciones

[← Volver al índice](./README.md)

---

## Flujos operativos integrados

### Flujo A — Servicio completo en salón (cliente digital)

| Paso | Actor | Acción | Sistema |
|------|-------|--------|---------|
| 1 | Cliente | Escanea QR, explora menú | `/cliente/menu` |
| 2 | Cliente | Agrega al carrito | — |
| 3 | Cliente | Confirma pre-orden con mesa | `POST /api/orders` |
| 4 | Sistema | Crea pedido `pending` | Tablero staff |
| 5 | Cocina | Inicia preparación | `preparing` |
| 6 | Cliente | Ve "En preparación" | Poll cada 5s |
| 7 | Cocina | Marca listo | `ready` |
| 8 | Mesero | Recoge y sirve | — |
| 9 | Mesero | Marca entregado | `delivered` |
| 10 | Cliente | Paga en caja (si aplica) | POS admin |

**Tiempo objetivo:** 15–25 min según tipo de plato.

### Flujo B — Venta rápida en mostrador (POS)

| Paso | Acción |
|------|--------|
| 1 | Seleccionar mesa o para llevar |
| 2 | Agregar productos |
| 3 | Elegir pago |
| 4 | Confirmar → `delivered` + `paid` |
| 5 | Imprimir factura |

**Tiempo objetivo:** 2–5 min.

### Flujo C — Reserva con pedido anticipado

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cliente | Reserva + pedido en `/reserva-hora` |
| 2 | Admin | Confirma reserva |
| 3 | Admin | Marca mesa `reservada` |
| 4 | Cocina | Prepara según hora |
| 5 | Mesero | Recibe al cliente |

### Flujo D — Cierre de turno

| Paso | Hora | Acción |
|------|------|--------|
| 1 | T-30 min | Fin de pedidos nuevos en cocina |
| 2 | T-15 min | Completar pedidos en preparación |
| 3 | T-10 min | Ventas pendientes en POS |
| 4 | T-5 min | Contar efectivo |
| 5 | T-0 | Registrar cierre de caja |
| 6 | T+10 | Cerrar sesión en dispositivos |

### Flujo E — Incidencia de stock

| Paso | Actor | Acción |
|------|-------|--------|
| 1 | Cocina | Detecta falta de insumo |
| 2 | Admin | Desactiva producto en Inventario |
| 3 | Mesero | Informa a clientes afectados |
| 4 | Admin | Registra compra en Gastos |
| 5 | Admin | Reactiva con stock actualizado |

---

## Solución de problemas frecuentes

### Acceso

| Problema | Causa | Solución |
|----------|-------|----------|
| "Acceso denegado" | Rol incorrecto | Verificar en Configuración → Usuarios |
| Sesión expira rápido | Token 15 min | Re-login |
| Redirige a menú cliente | Rol `customer` | Usar cuenta staff/admin |
| Datos de otro restaurante | Sesión cruzada | Cerrar sesión y re-login |

### Operación

| Problema | Causa | Solución |
|----------|-------|----------|
| Pedido no aparece | Delay/error | Refrescar; ver admin/pedidos |
| No mueve tarjeta | Transición inválida | Usar botones Iniciar/Listo/Entregar |
| Producto no en POS | Sin stock/desactivado | Revisar Inventario |
| Cliente no ve update | Estado no cambiado | Actualizar en tablero staff |
| URGENTE persiste | Sigue en preparing | Marcar Listo → Entregado |

### Caja

| Problema | Causa | Solución |
|----------|-------|----------|
| Faltante recurrente | Ventas no registradas | Capacitar cajero en POS |
| Sobrante | Error en cambio | Revisar procedimiento efectivo |
| Total POS incorrecto | IVA mal configurado | Configuración → Preferencias |

### Mensajes de error

| Mensaje | Acción |
|---------|--------|
| "Email y contraseña son obligatorios" | Completar formulario |
| "Sin restaurante asignado" | Admin vincula usuario |
| "No hay platos en tu pedido" | Agregar productos al carrito |
| "El efectivo recibido no cubre el total" | Ingresar monto ≥ total |
| "Failed loading orders" | Reintentar; verificar conexión |

---

## Glosario

| Término | Definición |
|---------|------------|
| **Aion** | Plataforma SaaS de gestión para restaurantes |
| **Tenant** | Restaurante aislado en sistema multi-tenant |
| **Branch / Sede** | Sucursal física |
| **POS** | Point of Sale — Punto de venta |
| **Kanban** | Tablero visual por columnas de estado |
| **JWT** | Credencial de sesión (token) |
| **KPI** | Indicador clave de desempeño |
| **Soft delete** | Desactivar sin borrar permanentemente |
| **IVA** | Impuesto (19% por defecto) |
| **Ticket promedio** | Venta promedio por transacción |
| **FIFO** | Primero en entrar, primero en salir |
| **Cuadrado** | Efectivo contado = esperado |
| **URGENTE** | Pedido >15 min en preparación |
| **role_title** | Cargo del empleado (RRHH) |
| **role (login)** | Permiso: customer, staff, admin |
| **Feature flag** | Función activable por restaurante |

---

## Evaluación — Staff

**Formato:** 20 preguntas + ejercicio práctico · **Aprobación:** 70%

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Cada cuánto se actualiza el tablero staff? | Cada 5 segundos |
| 2 | ¿Qué estado sigue a Pendiente cuando cocina empieza? | Preparando |
| 3 | ¿Cuándo aparece URGENTE? | >15 min en preparación |
| 4 | ¿Quién normalmente marca Entregado? | Mesero |
| 5 | ¿URL del tablero staff? | `/aion/staff` |
| 6 | ¿Puede un mesero acceder al POS? | No |
| 7 | ¿Qué ve el cliente si el plato está listo pero no servido? | "Listo" |
| 8 | ¿Se edita pedido existente desde staff? | No en v1 |
| 9 | ¿Producto agotado? | Avisar admin |
| 10 | ¿Diferencia cargo vs rol login? | Cargo=RRHH; rol=acceso |

---

## Evaluación — Cajero

**Aprobación:** 70%

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Qué pasa al confirmar venta POS? | delivered + paid + descuenta stock |
| 2 | ¿Métodos de pago POS? | Efectivo, tarjeta, transferencia |
| 3 | ¿Cierre cuadrado? | Contado = Esperado |
| 4 | ¿Dónde se configura IVA? | Configuración → Preferencias |
| 5 | ¿Qué hacer con faltante? | Reportar gerente con nota |

---

## Evaluación — Gerente

**Aprobación:** 80%

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Dónde confirmar reservas? | Mesas / Reservas |
| 2 | ¿Qué hacer con stock bajo? | Comprar o desactivar en 24h |
| 3 | ¿Dónde ver beneficio estimado? | Dashboard |
| 4 | ¿Quién autoriza cancelaciones? | Gerente/supervisor |
| 5 | ¿Exportar pedidos? | Pedidos → CSV |

---

## Evaluación — Administrador

**Aprobación:** 80%

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Cómo crear usuario staff? | Configuración → Usuarios |
| 2 | ¿Desactivar producto? | Inventario |
| 3 | ¿Qué es multi-tenant? | Varios restaurantes aislados |
| 4 | ¿Duración access token? | ~15 minutos |
| 5 | Soft vs hard delete | Soft desactiva; hard borra |
| 6 | ¿Gestión reservas? | Mesas / Reservas |
| 7 | ¿KPIs Dashboard? | Ventas, ticket, gastos, beneficio… |
| 8 | ¿Aislamiento datos? | restaurantId en JWT |

---

## Certificación por rol

| Rol | Requisito | Certificado |
|-----|-----------|-------------|
| Staff operativo | 70% + ejercicio flujo completo | Aion Staff Certificado |
| Cajero | 70% + POS + cierre | Aion Cajero Certificado |
| Gerente | 80% + caso de gestión | Aion Gerente Certificado |
| Administrador | 80% + config completa | Aion Admin Certificado |

### Recertificación

- Cada **6 meses** o tras actualización mayor
- Evaluación corta (10 preguntas) + práctica 15 min
- Registrar: fecha, participante, rol, resultado

---

## Ejercicios prácticos del curso

### Ejercicio 1 — Flujo completo (equipos de 3)
Cliente pide → cocina procesa → mesero entrega. Meta: <10 min.

### Ejercicio 2 — Venta POS
3 ventas (efectivo, tarjeta, transferencia) + 1 factura impresa.

### Ejercicio 3 — Cierre de caja
5 ventas simuladas → contar → verificar cuadrado.

### Ejercicio 4 — Config admin
Producto + mesa + usuario staff → verificar menú y POS.

### Ejercicio 5 — Incidencia
Pedido URGENTE + producto agotado + faltante de caja.

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026 | Manual inicial dividido por rol |
