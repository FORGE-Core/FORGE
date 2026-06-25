# Módulo 1 — Mesero / Mesera / Servicio de salón

**Audiencia:** Meseros, meseras, personal de servicio  
**Duración sugerida:** 3 horas  
**Acceso requerido:** Rol `staff`  
**Pantalla principal:** `/aion/staff`

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md) · [Experiencia cliente](./07-experiencia-cliente.md)

---

## Objetivos

Al finalizar podrás:

- Operar el tablero Kanban de pedidos
- Atender clientes que piden desde el menú digital
- Coordinar entregas con cocina y bar
- Consultar historial y resolver incidencias básicas

---

## 1. Responsabilidades del mesero en Aion

- Monitorear pedidos nuevos en el tablero
- Coordinar entrega cuando el estado sea **Listo**
- Marcar pedidos como **Entregado** tras servir al cliente
- Apoyar a clientes con menú digital (QR, tablet en mesa)
- Comunicar incidencias al supervisor o admin
- Coordinar estado de mesas con admin/reservas

---

## 2. Acceso y navegación

| Acción | Ruta |
|--------|------|
| Login | `/aion/login` |
| Tablero principal | `/aion/staff` |
| Historial | `/aion/staff/historial` |

Tras login con rol `staff`, el sistema redirige automáticamente a `/aion/staff`.

---

## 3. El tablero Kanban

### Columnas

```
┌──────────┬────────────┬────────┬───────────┬───────────┐
│Pendiente │ Preparando │ Listo  │ Entregado │ Cancelado │
└──────────┴────────────┴────────┴───────────┴───────────┘
```

### Información en cada tarjeta

- **Código del pedido** (ej. `#AION-0042`)
- **Nombre del cliente**
- **Mesa** asignada
- **Tiempo de espera** (minutos)
- **Lista de ítems** con cantidades
- Badge **NUEVO** — pedidos con menos de 2 minutos
- Badge **URGENTE** — más de 15 minutos en preparación

El tablero se **actualiza cada 5 segundos**. Usa **Reintentar** si hay error de red.

---

## 4. Acciones del mesero

| Situación | Tu acción | Botón en pantalla |
|-----------|-----------|-------------------|
| Pedido recién llegado | Verificar mesa e ítems; avisar a cocina | Solo lectura |
| Plato listo en cocina | Recoger y servir | — |
| Plato entregado al cliente | Confirmar en sistema | **Entregar** |
| Cliente cancela | Escalar a supervisor/admin | No cancelar sin autorización |

> **Importante:** Cocina mueve Pendiente → Preparando → Listo. El mesero normalmente ejecuta **Entregar**.

---

## 5. Atender clientes con menú digital

Flujo del cliente:

1. Explora el **Menú** por categorías
2. Agrega platos al **Carrito**
3. Va a **Pre-orden** o **Reserva con hora**
4. Confirma: nombre, email, mesa, fecha/hora
5. El pedido aparece en tu tablero como **Pendiente**

### Tu rol

- Confirmar verbalmente: "Ya lo vemos en cocina."
- Indicar tiempo estimado si preguntan.
- Ayudar con alergias (el detalle del plato muestra alérgenos).
- Explicar que pueden ver el avance en su pantalla.

### Fases que ve el cliente

1. Recibido en cocina
2. En preparación
3. Listo
4. Servido

**Por eso debes actualizar estados en tiempo real: el cliente está mirando su pantalla.**

---

## 6. Historial de pedidos

**Ruta:** `/aion/staff/historial`

Útil para:

- Consultar pedidos del día, semana o mes
- Ver totales de ventas del período
- Resolver reclamos ("¿qué pidió la mesa 5 a las 8pm?")

---

## 7. Escenarios prácticos

### Escenario A: Pedido nuevo de mesa 7

1. Aparece tarjeta en **Pendiente** con badge NUEVO.
2. Verificas: "Mesa 7 — 2× Cappuccino, 1× Cheesecake".
3. Avisas a barista/cocina.
4. Cuando aparece en **Listo**, recoges y sirves.
5. Presionas **Entregar**.

### Escenario B: Cliente dice "pedí hace 20 minutos"

1. Buscas el pedido por nombre o mesa.
2. Si está en **Preparando** con URGENTE → escalas a cocina.
3. Si está en **Listo** y nadie lo recogió → entregas de inmediato y marcas **Entregado**.
4. Si está en **Pendiente** → cocina no lo inició; escalas.

### Escenario C: Cliente quiere agregar algo

- No se edita un pedido existente desde staff en la versión actual.
- Protocolo: segundo pedido desde menú o venta vía admin POS.

### Escenario D: QR no funciona

- Verificar URL y conexión.
- Ofrecer menú físico mientras tanto.
- Escalar a admin si persiste.

---

## 8. Errores comunes

| Error | Consecuencia | Corrección |
|-------|-------------|------------|
| No marcar Entregado | Cliente ve "Listo" eternamente | Marcar al servir |
| Entregar pedido de otra mesa | Queja del cliente | Verificar código y mesa |
| Ignorar URGENTE | Cliente insatisfecho | Priorizar siempre |
| Cerrar sesión sin avisar | Siguiente turno sin acceso | Entregar credenciales solo a supervisor |

---

## 9. Cheat sheet

```
ENTRAR:     /aion/login → /aion/staff
VER:        Tablero Kanban (5 columnas)
PRIORIDAD:  URGENTE > NUEVO > LISTO (recoger)
ACCIÓN:     Entregar (cuando sirves al cliente)
NO HACER:   Cancelar pedidos, acceder admin, ignorar LISTO
```

---

## 10. Ejercicio práctico

1. Login con `staff1@ilcafeto.com` / `Staff1234!`
2. Observar el tablero y ubicar cada columna.
3. Simular flujo: otro participante crea pedido como cliente.
4. Esperar estado **Listo** y marcar **Entregar**.
5. Consultar el pedido en **Historial**.

---

## Evaluación

Ver preguntas de staff en [08-apendices.md](./08-apendices.md#evaluación--staff).
