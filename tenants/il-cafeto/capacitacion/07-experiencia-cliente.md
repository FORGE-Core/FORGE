# Módulo 7 — Experiencia del cliente

**Audiencia:** Meseros, gerentes, admin (referencia para entender el flujo completo)  
**Duración sugerida:** 1.5 horas

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md)

---

## Objetivos

Al finalizar podrás:

- Explicar el recorrido completo del comensal en Aion
- Apoyar clientes con menú digital, carrito y seguimiento
- Entender reservas y pre-órdenes
- Conocer la experiencia gamificada y el asistente IA

---

## 1. Rutas del cliente

| Ruta | Función |
|------|---------|
| `/aion/cliente/menu` | Menú con filtros por categoría |
| `/aion/cliente/plato/[id]` | Detalle: descripción, precio, alérgenos |
| `/aion/cliente/carrito` | Carrito activo |
| `/aion/cliente/pre-orden` | Revisión antes de confirmar |
| `/aion/cliente/reserva-hora` | Reserva de mesa + pedido |
| `/aion/cliente/pedido` | Resumen post-envío |
| `/aion/cliente/confirmacion` | Confirmación final |
| `/aion/cliente/estado-pedido/[orderId]` | Seguimiento en tiempo real |
| `/aion/cliente/experiencia` | Quiz + IA para descubrir platos |

> La Cazuela: prefijo `/cazuela/cliente/...`

---

## 2. Flujo completo del comensal

```
Landing (/aion)
    │
    ├── Menú clásico ──► /cliente/menu
    │                         │
    │                         ▼
    │                    Agregar al carrito
    │                         │
    │                         ▼
    │                    /cliente/carrito
    │                         │
    │              ┌──────────┴──────────┐
    │              ▼                     ▼
    │        /pre-orden            /reserva-hora
    │              │                     │
    │              └──────────┬──────────┘
    │                         ▼
    │                   Confirmar pedido
    │                         │
    │                         ▼
    │              /cliente/estado-pedido
    │
    └── Experiencia ──► /cliente/experiencia
```

---

## 3. Registro de clientes

**Ruta:** `/aion/registro`

- Crea cuenta con rol `customer`
- Contraseña: 8+ chars, mayúscula, minúscula, número
- Tras registro → menú

**Demo:** `cliente1@gmail.com` / `Cliente1234!`

---

## 4. Menú y categorías

El cliente filtra por categoría. Referencia Il Cafeto:

Entradas, Ensaladas, Carnes, Adiciones, Postres, Bebidas, Cafés, Cervezas, Cócteles, Vino, Sangría, Smoothies, Sándwiches.

Solo productos con `available: true` y stock aparecen.

---

## 5. Pre-orden y reserva

### Pre-orden

1. Revisa carrito
2. Ingresa nombre, email
3. Selecciona mesa disponible
4. Confirma → `POST /api/orders`
5. Pedido queda **Pendiente**, pago **Pendiente**

### Reserva con hora

**Ruta:** `/aion/cliente/reserva-hora`

1. Fecha, hora, tamaño del grupo
2. Mesa disponible (`GET /api/reservas/mesas`)
3. Crea reserva + pedido asociado

---

## 6. Seguimiento en tiempo real

El cliente ve actualizaciones cada **~5 segundos**:

| Fase cliente | Estado en staff |
|--------------|-----------------|
| Recibido en cocina | Pendiente |
| En preparación | Preparando |
| Listo | Listo |
| Servido | Entregado |

**Implicación para el personal:** cada retraso en actualizar estados se refleja en la pantalla del cliente.

---

## 7. Gamificación y experiencia

**Ruta:** `/aion/cliente/experiencia`

- Quiz interactivo sobre preferencias
- Chat con IA que conoce el menú completo
- Niveles y XP (`user_levels`)
- Recompensas (`rewards`) por visitas

El gerente puede usar esto en promociones y fidelización.

---

## 8. Qué debe saber el personal

| Situación del cliente | Qué hacer |
|----------------------|-----------|
| "No encuentro mi pedido" | Pedir nombre/código; verificar tablero staff |
| "Dice 'En preparación' hace mucho" | Verificar estado real y actualizar |
| "Quiero cambiar mi pedido" | Escalar; no se edita desde cliente en v1 |
| "¿Puedo pagar aquí?" | Dirigir a caja; sin pago online integrado |
| "El QR no funciona" | Verificar URL/conexión; menú físico temporal |
| Preguntas sobre platos | Detalle del plato tiene alérgenos; Experiencia tiene IA |

---

## 9. Pago del cliente

Los pedidos web quedan con **pago pendiente**. Opciones operativas:

1. Cobrar en caja/POS (protocolo del restaurante)
2. Medios externos acordados
3. Admin registra venta en POS si aplica

No hay pasarela de pago en línea integrada en la versión actual.

---

## 10. Ejercicio práctico (equipo completo)

**Participantes:** 1 cliente, 1 cocina, 1 mesero

1. Cliente: login demo → menú → carrito → pre-orden → confirmar
2. Cocina: Pendiente → Preparando → Listo
3. Cliente: verificar pantalla de seguimiento en cada paso
4. Mesero: entregar y marcar Entregado
5. Cliente: confirmar fase "Servido"

**Meta:** completar flujo en <10 min simulados.

---

## Referencias cruzadas

- Meseros: [01-mesero-mesera.md](./01-mesero-mesera.md)
- Cocina: [02-cocina.md](./02-cocina.md)
- Admin (reservas/menú): [06-administrador-sistema.md](./06-administrador-sistema.md)
