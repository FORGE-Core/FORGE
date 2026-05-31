# Módulo 4 — Cajero / Punto de Venta (POS)

**Audiencia:** Cajeros, personal de caja  
**Duración sugerida:** 4 horas  
**Acceso requerido:** Rol `admin` (cuenta admin o supervisada)

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md)

---

## Objetivos

Al finalizar podrás:

- Operar el Punto de Venta (POS) de punta a punta
- Registrar ventas en efectivo, tarjeta y transferencia
- Imprimir facturas
- Realizar cierre de caja y entender cuadrado/sobrante/faltante

---

## 1. Responsabilidades del cajero

- Registrar ventas directas en **Punto de venta**
- Cobrar pedidos de clientes en mostrador
- Manejar efectivo, tarjeta y transferencias
- Imprimir facturas
- Apoyar el **cierre de caja** al final del turno
- Reportar sobrantes y faltantes al gerente

---

## 2. Rutas principales

| Función | Ruta |
|---------|------|
| Login | `/aion/login` |
| Punto de venta | `/aion/admin/pos` |
| Pedidos (consulta) | `/aion/admin/pedidos` |
| Cierre de caja | `/aion/admin/cierre-caja` |

> El POS requiere rol `admin`. El cajero opera con cuenta admin dedicada o supervisada por gerencia.

---

## 3. Layout del POS

```
┌────────────────────────────┬─────────────────────┐
│   CATÁLOGO DE PRODUCTOS    │      CARRITO        │
│   (buscador + categorías)  │   Mesa seleccionada │
│                            │   Ítems + cantidades│
│   [Producto] [Producto]    │   Subtotal          │
│   [Producto] [Producto]    │   IVA (19%)         │
│   ...                      │   TOTAL             │
│                            │   Método de pago    │
│                            │   [Confirmar pedido]│
└────────────────────────────┴─────────────────────┘
```

---

## 4. Procedimiento — Venta en POS

### Paso 1: Seleccionar mesa

Elegir mesa del cliente. Para venta para llevar, usar mesa según protocolo del restaurante.

### Paso 2: Agregar productos

- Buscar por nombre.
- Clic en producto para agregar al carrito.
- Badge `x2`, `x3` indica cantidad.
- Productos sin stock aparecen **deshabilitados**.

### Paso 3: Revisar totales

| Concepto | Descripción |
|----------|-------------|
| Subtotal | Suma de productos |
| IVA | Según tasa configurada (default 19%) |
| Total | Subtotal + IVA |

### Paso 4: Método de pago

| Método | Acción adicional |
|--------|-----------------|
| **Efectivo** | Ingresar monto recibido → sistema calcula **cambio** |
| **Tarjeta** | Confirmar tras cobro en datáfono |
| **Transferencia** | Confirmar tras verificar comprobante |

### Paso 5: Confirmar pedido

Al confirmar, el sistema automáticamente:

- Crea orden con estado **Entregado**
- Marca pago como **Pagado**
- Registra venta en reportes
- Descuenta stock del inventario
- Registra movimiento de caja (si hay turno abierto)

### Paso 6: Imprimir factura

Botón **Imprimir factura** → ventana con formato imprimible.

---

## 5. Pedido web vs. venta POS

| Aspecto | Cliente web | POS admin |
|---------|-------------|-----------|
| Estado inicial | Pendiente | Entregado |
| Pago inicial | Pendiente | Pagado |
| Pasa por cocina | Sí | No (venta directa) |
| Descuenta stock | Al confirmar orden | Al confirmar venta |
| Uso típico | Mesa con QR | Mostrador, para llevar |

---

## 6. Cierre de caja

**Ruta:** `/aion/admin/cierre-caja`

### Conceptos

| Concepto | Descripción |
|----------|-------------|
| Turno de caja | Período operativo (Mañana / Noche) |
| Efectivo esperado | Lo que el sistema calcula |
| Efectivo contado | Lo que cuentas físicamente |
| **Cuadrado** | Contado = Esperado ✅ |
| **Sobrante** | Contado > Esperado |
| **Faltante** | Contado < Esperado |

### Procedimiento

1. Ir a **Cierre de caja**
2. Verificar: fecha, turno, responsable, sede
3. Contar **todo el efectivo** en caja
4. Ingresar monto en **Efectivo contado**
5. Agregar nota si hay observaciones
6. Registrar cierre
7. Revisar resultado y reportar faltantes al gerente

---

## 7. Escenarios prácticos

### Escenario A: Efectivo $50.000, total $37.500

1. Seleccionar productos
2. Método: **Efectivo**
3. Recibido: `50000`
4. Cambio: `$12.500`
5. Confirmar e imprimir factura

### Escenario B: Faltante de $5.000

1. Recontar efectivo
2. Revisar ventas del turno en **Pedidos**
3. Verificar ventas en efectivo no registradas
4. Registrar cierre con nota
5. Reportar al gerente

### Escenario C: Cliente web paga en caja

1. Buscar pedido en **Pedidos** por código o nombre
2. Verificar ítems y total con el cliente
3. Cobrar según protocolo del restaurante

### Escenario D: Producto sin stock

- Aparece deshabilitado en POS
- Ofrecer alternativa
- Avisar a admin/cocina

### Escenario E: "El efectivo recibido no cubre el total"

- Verificar monto ingresado ≥ total
- Corregir y volver a confirmar

---

## 8. Protocolo de cierre de turno

| Paso | Hora | Acción |
|------|------|--------|
| 1 | T-30 min | Avisar fin de pedidos nuevos en cocina |
| 2 | T-15 min | Verificar pedidos en preparación |
| 3 | T-10 min | Completar ventas pendientes en POS |
| 4 | T-5 min | Contar efectivo |
| 5 | T-0 | Registrar cierre de caja |
| 6 | T+5 | Revisar cuadrado/sobrante/faltante |
| 7 | T+10 | Cerrar sesión |

---

## 9. Errores comunes

| Error | Consecuencia | Corrección |
|-------|-------------|------------|
| Ventas en efectivo no registradas | Faltante al cierre | Registrar toda venta en POS |
| Cierre sin contar | Datos incorrectos | Contar siempre antes de registrar |
| Compartir cuenta admin | Sin trazabilidad | Cuenta por cajero o turno |
| No imprimir factura cuando la piden | Queja cliente | Usar botón Imprimir factura |

---

## 10. Cheat sheet

```
ENTRAR:     /aion/login → /aion/admin/pos
FLUJO:      Mesa → Productos → Pago → Confirmar → Factura
PAGOS:      Efectivo (con cambio) | Tarjeta | Transferencia
CIERRE:     /aion/admin/cierre-caja → contar → registrar
NO HACER:   Ventas sin registrar, cierre sin contar
```

---

## 11. Ejercicio práctico

1. Login admin demo.
2. Registrar 3 ventas: efectivo, tarjeta, transferencia.
3. Imprimir factura de al menos una.
4. Simular cierre de caja con monto cuadrado.
5. Simular faltante y documentar nota explicativa.

---

## Evaluación

Ver preguntas de cajero en [08-apendices.md](./08-apendices.md#evaluación--cajero).
