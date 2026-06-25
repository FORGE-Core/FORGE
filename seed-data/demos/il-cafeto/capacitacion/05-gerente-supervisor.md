# Módulo 5 — Gerente / Supervisor

**Audiencia:** Gerentes, supervisores de turno  
**Duración sugerida:** 4 horas  
**Acceso requerido:** Rol `admin`

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md)

---

## Objetivos

Al finalizar podrás:

- Supervisar operación diaria vía Dashboard
- Interpretar KPIs y tomar decisiones con datos
- Gestionar mesas, reservas e incidencias
- Supervisar inventario, gastos y cierres de caja
- Coordinar personal y escalar problemas

---

## 1. Responsabilidades del gerente

- Supervisar operación vía Dashboard
- Tomar decisiones con datos (ventas, gastos, beneficio)
- Gestionar incidencias operativas y quejas
- Supervisar inventario y stock bajo
- Coordinar reservas del día
- Supervisar cierres de caja
- Apoyar gestión de personal (módulo Empleados)

---

## 2. Rutas principales

| Función | Ruta |
|---------|------|
| Dashboard | `/aion/admin` |
| Pedidos | `/aion/admin/pedidos` |
| Inventario | `/aion/admin/inventario` |
| Gastos | `/aion/admin/gastos` |
| Cierre de caja | `/aion/admin/cierre-caja` |
| Empleados | `/aion/admin/empleados` |
| Mesas / Reservas | `/aion/admin/mesas-reservas` |
| Configuración | `/aion/admin/configuracion` |
| Tablero staff (supervisión) | `/aion/staff` |

---

## 3. Dashboard — Centro de mando

### KPIs principales

| Indicador | Qué te dice |
|-----------|------------|
| Ventas hoy | Ingresos del día en curso |
| Ventas semana | Tendencia semanal |
| Ventas mes | Acumulado mensual |
| Ticket promedio | Gasto promedio por cliente |
| Gastos del mes | Total de egresos registrados |
| Beneficio estimado | Ventas − Gastos (referencial) |
| Plato más vendido | Ítem estrella del período |
| Gráfico 7 días | Tendencia visual de ventas |

### Alertas automáticas

- **Stock bajo:** productos bajo mínimo configurado
- **Reservas del día:** cantidad de reservas hoy
- **Gastos elevados:** según umbrales del sistema

### Chatbot administrativo

Asistente IA en el Dashboard (modo admin) para consultas operativas y financieras en español. Verificar datos críticos antes de decisiones importantes.

---

## 4. Rutina matutina del gerente

1. Revisar **reservas del día** en Dashboard y Mesas / Reservas
2. Confirmar reservas pendientes
3. Verificar mesas marcadas como `reservada`
4. Revisar **alertas de stock bajo**
5. Briefing con cocina y servicio sobre eventos o grupos grandes
6. Verificar turno de caja abierto

---

## 5. Supervisión de pedidos

**Ruta:** `/aion/admin/pedidos`

- Tabla histórica con filtros
- Exportación a **CSV** para Excel
- Detalle de ítems y totales
- Resolución de reclamos con trazabilidad

### Protocolo ante queja por demora

1. Buscar pedido por código o nombre del cliente
2. Revisar historial de estados y tiempos
3. Identificar cuello de botella (cocina, mesero, etc.)
4. Resolver con el cliente
5. Retroalimentar al equipo

---

## 6. Mesas y reservas

**Ruta:** `/aion/admin/mesas-reservas`

### Estados de mesa

| Estado | Significado | Acción |
|--------|-------------|--------|
| `libre` | Disponible | Asignar comensales |
| `ocupada` | Clientes sentados | Monitorear rotación |
| `reservada` | Reservada para hora futura | Preparar antes de llegada |
| `limpieza` | Post-servicio | No sentar hasta limpiar |

### Estados de reserva

| Estado | Significado |
|--------|-------------|
| `pendiente` | Sin confirmar |
| `confirmada` | Confirmada |
| `cancelada` | Anulada |

### Reserva grande (ej. 20 personas)

1. Crear reserva con estado `confirmada`
2. Marcar mesas como `reservada`
3. Avisar a cocina con anticipación
4. Día del evento: `ocupada` al llegar el grupo

---

## 7. Inventario

**Ruta:** `/aion/admin/inventario`

| Pestaña | Contenido |
|---------|-----------|
| Productos | Platos, bebidas vendibles |
| Servicios | Ítems tipo servicio |
| Movimientos | Historial de stock |

### Acciones gerenciales

- Desactivar producto agotado sin borrar historial
- Reactivar cuando hay insumos
- Exportar CSV para análisis
- Revisar movimientos ante discrepancias

---

## 8. Gastos

**Ruta:** `/aion/admin/gastos`

| Categoría | Ejemplos |
|-----------|----------|
| `ingredientes` | Compras de alimentos |
| `nomina` | Pagos a empleados |
| `servicios` | Luz, agua, internet |
| `equipos` | Mantenimiento |
| `otros` | Misceláneos |

Registrar gastos el mismo día. Comparar vs. ventas en Dashboard.

---

## 9. Empleados

**Ruta:** `/aion/admin/empleados`

- CRUD de personal con cargo, contrato, salario, estado
- Historial de pagos de nómina
- Estimación de nómina del mes

> El cargo en Empleados **no da acceso al sistema**. Para eso: Configuración → Usuarios.

---

## 10. KPIs y acciones correctivas

| KPI | Meta | Si está mal |
|-----|------|-------------|
| Ticket promedio | Mantener/subir | Upselling, combos |
| Pedidos urgentes/día | Mínimo | Revisar staffing cocina |
| Faltantes de caja | Cero | Capacitar cajero |
| Stock bajo | Resolver en 24h | Comprar o desactivar menú |
| Beneficio estimado | Positivo | Revisar gastos y precios |

---

## 11. Protocolos de gestión

### Cancelaciones

| Quién | Autorización | Acción |
|-------|--------------|--------|
| Cliente antes de preparar | Supervisor | Escalar a admin |
| Durante preparación | Gerente | Evaluar caso |
| Error del restaurante | Gerente | Cancelar + compensación |
| Después de servir | Gerente | Gestionar reclamo, no cancelar |

### Urgencias (>15 min)

1. Cocina prioriza
2. Mesero verifica comunicación
3. Gerente interviene si hay >2 urgentes simultáneos
4. Disculpa proactiva al cliente si aplica

---

## 12. Revisión financiera de fin de mes

1. Dashboard → ventas del mes y ticket promedio
2. Gastos → total por categoría
3. Beneficio estimado
4. Exportar pedidos e inventario a CSV
5. Reunión con admin/propietario

---

## 13. Escenarios prácticos

### Escenario A: Dos pedidos URGENTES a la vez

1. Ir a `/aion/staff` para ver estado real
2. Reforzar cocina verbalmente
3. Meseros priorizan recogida de Listo
4. Hablar con clientes afectados

### Escenario B: Faltante recurrente en caja

1. Revisar historial de cierres
2. Observar turno del cajero en POS
3. Capacitar en registro de ventas
4. Considerar doble conteo en cierre

### Escenario C: Producto agotado en pleno servicio

1. Admin desactiva en Inventario
2. Meseros informan a clientes
3. Registrar compra en Gastos cuando repone
4. Reactivar producto

---

## 14. Cheat sheet

```
ENTRAR:     /aion/login → /aion/admin
MAÑANA:     Reservas + stock bajo + briefing
SUPERVISAR: Dashboard + /aion/staff
INCIDENTES: Pedidos → estados → escalar
FIN MES:    KPIs + gastos + export CSV
```

---

## 15. Ejercicio práctico

1. Revisar Dashboard y anotar 3 KPIs del día.
2. Confirmar una reserva pendiente.
3. Desactivar un producto en Inventario y verificar menú cliente.
4. Resolver un caso de queja con pedido del historial.
5. Revisar un cierre de caja con faltante simulado.

---

## Evaluación

Ver preguntas de gerente en [08-apendices.md](./08-apendices.md#evaluación--gerente).
