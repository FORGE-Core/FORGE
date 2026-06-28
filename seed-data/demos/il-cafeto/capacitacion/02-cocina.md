# Módulo 2 — Cocina (Cocinero, Chef, Auxiliar)

**Audiencia:** Cocineros, chefs, auxiliares de cocina  
**Duración sugerida:** 3 horas  
**Acceso requerido:** Rol `staff`  
**Pantalla principal:** `/aion/staff`

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md)

---

## Objetivos

Al finalizar podrás:

- Gestionar el tablero de pedidos desde la perspectiva de cocina
- Aplicar priorización correcta (urgentes, nuevos, FIFO)
- Coordinar con meseros para entrega
- Comunicar faltantes de insumos al admin

---

## 1. Responsabilidades de cocina en Aion

- Monitorear la columna **Pendiente** constantemente
- Iniciar preparación (**Pendiente → Preparando**)
- Marcar platos terminados (**Preparando → Listo**)
- Priorizar pedidos **URGENTES** (>15 min)
- Coordinar con meseros para recogida
- Avisar al admin si un producto debe desactivarse por falta de insumos

---

## 2. Flujo de trabajo

```
Nuevo pedido en PENDIENTE
         │
         ▼
  Presionas "Iniciar" ──► PREPARANDO
         │
         ▼
  Presionas "Listo" ──► LISTO
         │
         ▼
  Mesero recoge y sirve ──► ENTREGADO (lo marca mesero)
```

### Botones de acción

| Estado actual | Botón | Nuevo estado |
|---------------|-------|--------------|
| Pendiente | **Iniciar** | Preparando |
| Preparando | **Listo** | Listo |
| Listo | **Entregar** | Entregado |

También puedes **arrastrar y soltar** tarjetas entre columnas.

---

## 3. Ejemplo de tarjeta

```
┌─────────────────────────────┐
│ #AION-0038        🔴 URGENTE│
│ Mesa 12 · Juan Pérez        │
│ ⏱ 18 min                    │
├─────────────────────────────┤
│ 2× Bandeja Paisa            │
│ 1× Sopa del día             │
│ 1× Limonada natural         │
├─────────────────────────────┤
│        [ Iniciar ]          │
└─────────────────────────────┘
```

---

## 4. Priorización

**Orden recomendado:**

1. 🔴 **URGENTE** — más de 15 min en preparación
2. 🟡 **NUEVO** — recién llegados (confirmar que se tomaron)
3. 🟢 **Preparando** — FIFO (primero en entrar, primero en salir)
4. ⚪ **Listo** — avisar a mesero si llevan >3 min sin recoger

---

## 5. Coordinación con inventario

Cuando un insumo se agota:

1. Avisar al admin o gerente **inmediatamente**.
2. El admin desactiva el producto en **Inventario** (`available: false`).
3. El producto desaparece del menú del cliente.
4. **No** aceptar verbalmente un plato que ya no está en sistema.

---

## 6. Pedidos mixtos (comida + bebidas)

El sistema muestra **todos los ítems en una sola tarjeta**. Acordar protocolo interno:

- **Opción A:** Cocina marca Listo cuando **toda** la orden está lista (bar y cocina coordinan).
- **Opción B:** División verbal — bar prepara bebidas, cocina comida; Listo cuando ambos terminen.

---

## 7. Escenarios prácticos

### Escenario A: Rush de almuerzo (12 pedidos pendientes)

1. Ordenar por antigüedad.
2. Iniciar todos los que puedas en paralelo.
3. Marcar Listo conforme salgan (no esperar lote completo).
4. Priorizar URGENTE de inmediato.

### Escenario B: Falta un ingrediente

1. **No** marques Listo si el plato no está completo.
2. Avisa a mesero/supervisor para hablar con el cliente.
3. Admin cancela ítem o pedido si es necesario.

### Escenario C: Pedido en Listo sin recoger

1. Avisar verbalmente a meseros.
2. Si lleva >5 min, escalar a supervisor.
3. No marcar Entregado tú mismo (protocolo estándar: lo hace mesero).

### Escenario D: Fin de turno

1. Verificar que no queden pedidos en **Preparando**.
2. Pasar estado verbal de pendientes al siguiente turno.
3. Cerrar sesión en la tablet.

---

## 8. Buenas prácticas

- Mantener tablet con `/aion/staff` siempre visible
- Refrescar con **Reintentar** si la conexión falla
- No acumular pedidos en **Listo** sin avisar a meseros
- Marcar **Iniciar** en cuanto empieces (el cliente ve "En preparación")
- No marcar **Listo** antes de terminar

---

## 9. Cheat sheet

```
ENTRAR:     /aion/login → /aion/staff
VER:        Columna PENDIENTE (pedidos nuevos)
ACCIÓN 1:   Iniciar (pendiente → preparando)
ACCIÓN 2:   Listo (preparando → listo)
PRIORIDAD:  URGENTE siempre primero
NO HACER:   Dejar en pendiente, marcar listo sin terminar
```

---

## 10. Ejercicio práctico

1. Login staff en tablet de cocina.
2. Tomar 3 pedidos pendientes: Iniciar → Listo en secuencia.
3. Simular URGENTE: identificar badge rojo y priorizar.
4. Avisar a mesero cuando un pedido quede en Listo.
5. Verificar en pantalla cliente que el estado cambió.

---

## Evaluación

Ver preguntas de staff en [08-apendices.md](./08-apendices.md#evaluación--staff).
