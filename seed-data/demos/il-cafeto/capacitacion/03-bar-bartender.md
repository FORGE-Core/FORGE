# Módulo 3 — Bar / Bartender

**Audiencia:** Bartenders, baristas, personal de bar  
**Duración sugerida:** 2 horas  
**Acceso requerido:** Rol `staff`  
**Pantalla principal:** `/aion/staff`

[← Volver al índice](./README.md) · [Inducción general](./00-induccion-general.md) · [Cocina](./02-cocina.md)

---

## Objetivos

Al finalizar podrás:

- Usar el tablero staff para pedidos con bebidas
- Aplicar tiempos objetivo según tipo de bebida
- Coordinar con cocina en pedidos mixtos
- Priorizar urgencias en el área de bar

---

## 1. Particularidades del área de bar

El bartender usa el **mismo tablero staff** que cocina (`/aion/staff`). No hay pantalla KDS separada para bar.

### Categorías típicas del menú (referencia Il Cafeto)

- Bebidas
- Cafés
- Cervezas
- Cócteles
- Vino
- Sangría
- Smoothies

En La Cazuela las categorías pueden variar según el menú configurado en Inventario.

---

## 2. Responsabilidades

- Identificar ítems de bebida en cada tarjeta de pedido
- Preparar bebidas en paralelo con cocina cuando el pedido es mixto
- Marcar estados según protocolo acordado con cocina
- Priorizar URGENTES y bebidas rápidas en rush

---

## 3. Protocolo para pedidos mixtos

El sistema muestra comida y bebidas en **una sola tarjeta**. Acordar con cocina:

| Protocolo | Descripción |
|-----------|-------------|
| **Estándar** | Marcar **Listo** solo cuando comida **y** bebidas estén completas |
| **Bebida primero** | Mesero decide si sirve bebida antes; estado Listo cuando todo esté listo |
| **Bar independiente** | Bar prepara bebidas verbalmente; cocina marca Listo al final |

Documentar el protocolo elegido en el restaurante y capacitar a todo el equipo.

---

## 4. Tiempos objetivo

| Tipo | Tiempo objetivo | Acción |
|------|----------------|--------|
| Café, gaseosa, cerveza | < 3 min | Iniciar y Listo casi inmediato |
| Cócteles, sangría | 5–8 min | Iniciar en cuanto aparece |
| Smoothies elaborados | 5–7 min | Priorizar si hay cola |
| URGENTE (cualquier tipo) | Inmediato | Prioridad absoluta |

---

## 5. Flujo operativo en bar

```
Pedido aparece en PENDIENTE
         │
         ▼
Identificar ítems de bar en la tarjeta
         │
         ▼
Coordinar con cocina quién mueve estados
         │
         ▼
Preparar bebidas
         │
         ▼
Avisar a cocina/mesero cuando bar terminó su parte
         │
         ▼
Estado LISTO (según protocolo) → mesero recoge
```

---

## 6. Escenarios prácticos

### Escenario A: Solo bebidas (2 cafés, mesa 4)

1. Pedido en Pendiente.
2. Iniciar preparación.
3. Preparar cafés (<3 min).
4. Marcar Listo (si bar tiene autonomía) o avisar a quien gestione estados.
5. Mesero recoge y entrega.

### Escenario B: Pedido mixto (bandeja paisa + 2 cervezas)

1. Cocina trabaja comida; bar prepara cervezas.
2. Bar termina primero → espera o sirve cervezas según protocolo.
3. Cuando comida está lista, marcar Listo (cocina o bar según acuerdo).
4. Mesero entrega todo junto o en dos tiempos (coordinado).

### Escenario C: Rush nocturno (muchos cócteles)

1. Priorizar URGENTES.
2. Bebidas rápidas (cerveza, vino) en paralelo.
3. Cócteles en orden FIFO dentro de no-urgentes.
4. Comunicar tiempos a meseros si hay demora.

### Escenario D: Insumo agotado (ej. licor específico)

1. No preparar bebida sin insumo.
2. Avisar mesero/supervisor de inmediato.
3. Admin desactiva ítem en Inventario si aplica.

---

## 7. Coordinación con meseros

- Si bebida está lista pero comida no, mesero puede servir bebida primero (acordar con gerente).
- Avisar verbalmente cuando un pedido lleva >5 min en **Listo** sin recoger.
- En eventos/reservas grandes, confirmar pedido con mesero antes de preparar batch.

---

## 8. Errores comunes

| Error | Corrección |
|-------|------------|
| Ignorar ítems de bar en tarjeta mixta | Revisar lista completa de ítems |
| Marcar Listo sin terminar cóctel | Esperar preparación completa |
| No avisar falta de insumo | Escalar a admin de inmediato |
| No coordinar con cocina en mixtos | Definir protocolo claro de estados |

---

## 9. Cheat sheet

```
ENTRAR:     /aion/login → /aion/staff
VER:        Ítems de bar en cada tarjeta
RÁPIDO:     Café/cerveza < 3 min
ELABORADO:  Cócteles 5–8 min
PRIORIDAD:  URGENTE > FIFO
COORDINAR:  Con cocina en pedidos mixtos
```

---

## 10. Ejercicio práctico

1. Login como `staff2@ilcafeto.com` (barista demo).
2. Procesar 2 pedidos solo bebidas de punta a punta.
3. Procesar 1 pedido mixto coordinando con cocina.
4. Identificar y priorizar un pedido URGENTE simulado.

---

## Evaluación

Ver preguntas de staff en [08-apendices.md](./08-apendices.md#evaluación--staff).
