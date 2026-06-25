# Módulo 0 — Inducción general

**Audiencia:** Todo el personal  
**Duración sugerida:** 2 horas  
**Prerrequisitos:** Ninguno

[← Volver al índice](./README.md)

---

## Objetivos

Al finalizar este módulo podrás:

- Entender qué es Aion y cómo se organiza la plataforma
- Iniciar y cerrar sesión correctamente
- Reconocer los estados de un pedido y el vocabulario común
- Aplicar las reglas básicas de operación y comunicación entre áreas

---

## 1. ¿Qué es Aion Restaurant POS?

**Aion** es una plataforma digital de gestión para restaurantes que centraliza:

- Menú digital y pedidos en línea
- Operaciones de cocina y servicio en tiempo real
- Punto de venta (POS) para facturación en mostrador
- Inventario, mesas, reservas, empleados, gastos y cierre de caja
- Panel administrativo con indicadores de negocio (KPIs)

Es un sistema **multi-restaurante (multi-tenant)**: un mismo despliegue sirve a varios restaurantes, pero **cada restaurante ve únicamente sus propios datos**.

### Las tres áreas de la aplicación

```
┌─────────────────┬─────────────────────┬─────────────────────────┐
│  VISTA CLIENTE  │    VISTA STAFF      │     PANEL ADMIN         │
│  (Comensal)     │  (Operaciones)      │   (Administración)      │
├─────────────────┼─────────────────────┼─────────────────────────┤
│ Menú digital    │ Tablero Kanban      │ Dashboard, POS,         │
│ Carrito         │ de pedidos          │ Inventario, Gastos,     │
│ Pre-orden       │ Historial           │ Cierre caja, Empleados  │
│ Reservas        │                     │ Mesas, Configuración    │
└─────────────────┴─────────────────────┴─────────────────────────┘
```

---

## 2. Roles de acceso al sistema

| Rol de login | Pantalla principal | Quién lo usa |
|--------------|-------------------|--------------|
| `customer` | `/aion/cliente/menu` | Comensales |
| `staff` | `/aion/staff` | Meseros, cocina, bar |
| `admin` | `/aion/admin` | Gerente, cajero, administrador |

### Cargos vs. permisos

Los cargos (Mesero, Cocinero, Cajero, Chef, Bartender, etc.) se registran en el módulo **Empleados**, pero **no cambian el acceso al sistema**. Un mesero y un cocinero pueden usar la misma cuenta staff y ver el mismo tablero Kanban.

---

## 3. Primer acceso

### Paso 1: Abrir la aplicación

Ir a `/aion/login` (o `/cazuela/login` para La Cazuela).

### Paso 2: Iniciar sesión

1. Ingresar email y contraseña proporcionados por el administrador.
2. El sistema redirige según el rol:
   - Admin → `/aion/admin`
   - Staff → `/aion/staff`
   - Cliente → `/aion/cliente/menu`

### Paso 3: Cerrar sesión

- Usar siempre el botón **Cerrar sesión** al terminar el turno.
- No compartir credenciales entre compañeros.
- En dispositivos compartidos (tablet de cocina, PC de caja), cerrar sesión antes de entregar el equipo.

---

## 4. Ciclo de vida de un pedido

```
Pendiente → Preparando → Listo → Entregado
                              ↘ Cancelado
```

| Estado | Etiqueta | Significado |
|--------|----------|-------------|
| `pending` | Pendiente | Recibido, aún no en cocina |
| `preparing` | Preparando | Cocina/bar trabajando |
| `ready` | Listo | Terminado, esperando recogida |
| `delivered` | Entregado | Cliente recibió el pedido |
| `cancelled` | Cancelado | Anulado (con autorización) |

### Dos flujos principales

| Origen | Estado inicial | Pago inicial |
|--------|----------------|--------------|
| Cliente web (menú QR) | Pendiente | Pendiente |
| Admin POS (mostrador) | Entregado | Pagado |

---

## 5. Reglas de oro

| # | Regla | Por qué |
|---|-------|---------|
| 1 | Actualiza el estado en cuanto cambie la situación real | Cliente y equipo dependen de esa info |
| 2 | No marques "Entregado" si el plato no salió | Genera quejas y métricas falsas |
| 3 | No modifiques inventario sin autorización | Afecta menú y reportes |
| 4 | Prioriza pedidos URGENTES (>15 min en preparación) | El sistema los marca en rojo |
| 5 | Verifica la mesa antes de entregar | Evita errores de servicio |
| 6 | Cuenta el efectivo antes del cierre de caja | El sistema calcula sobrantes/faltantes |

---

## 6. Comunicación entre áreas

```
CLIENTE ──(pedido)──► SISTEMA ──► STAFF COCINA/BAR
                                      │
                                      ▼
CLIENTE ◄──(sirve)── MESERO ◄──(recoge)── COCINA (Listo)
```

**Protocolo:**
1. Cocina marca **Listo** → mesero revisa tablero o recibe aviso.
2. Mesero recoge, sirve y marca **Entregado**.
3. Si hay retraso >15 min, el pedido aparece como **URGENTE**.

---

## 7. Tipos de pedido y métodos de pago

### Tipos de pedido

| Tipo | Uso |
|------|-----|
| `salon` | Consumo en el local |
| `reserva` | Pedido ligado a reserva |
| `domicilio` | Entrega a domicilio |
| `recoger` | Para llevar |

### Métodos de pago (POS admin)

Efectivo, tarjeta, transferencia.

> Los pedidos del menú web quedan con **pago pendiente**. El cobro se hace en caja/POS o por medios acordados por el restaurante.

---

## 8. Dispositivos y conectividad

| Área | Dispositivo recomendado |
|------|------------------------|
| Cocina | Tablet fija con `/aion/staff` |
| Bar | Tablet o PC |
| Meseros | Smartphone (consulta) |
| Caja | PC con impresora → `/aion/admin/pos` |
| Gerente | PC/laptop → `/aion/admin` |

- El tablero staff se actualiza cada **5 segundos**.
- Si falla la conexión: botón **Reintentar**.
- Tener plan B con comunicación verbal.

---

## 9. Ejercicio de inducción

1. Iniciar sesión con credenciales demo (ver [README](./README.md)).
2. Identificar a qué pantalla te redirige según tu rol.
3. Cerrar sesión correctamente.
4. Nombrar los 5 estados de un pedido en orden.
5. Explicar la diferencia entre rol de login y cargo de empleado.

---

## Siguiente paso

Según tu rol, continúa con:

- Servicio de salón → [01-mesero-mesera.md](./01-mesero-mesera.md)
- Cocina → [02-cocina.md](./02-cocina.md)
- Bar → [03-bar-bartender.md](./03-bar-bartender.md)
- Caja → [04-cajero-pos.md](./04-cajero-pos.md)
- Gerencia → [05-gerente-supervisor.md](./05-gerente-supervisor.md)
- Administrador → [06-administrador-sistema.md](./06-administrador-sistema.md)

Todos deben leer también [07-experiencia-cliente.md](./07-experiencia-cliente.md) para entender el flujo completo.
