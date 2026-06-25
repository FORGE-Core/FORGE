# Capacitación Aion Restaurant POS

Manual de capacitación dividido por rol para empleados, gerencia y administradores del sistema.

**Versión:** 1.0  
**Plataforma:** Aion — Sistema de Gestión para Restaurantes  
**Duración sugerida del curso completo:** 16–24 horas

---

## Índice de módulos

| # | Módulo | Archivo | Audiencia | Duración |
|---|--------|---------|-----------|----------|
| 0 | Inducción general | [00-induccion-general.md](./00-induccion-general.md) | Todos | 2 h |
| 1 | Mesero / Mesera | [01-mesero-mesera.md](./01-mesero-mesera.md) | Servicio de salón | 3 h |
| 2 | Cocina | [02-cocina.md](./02-cocina.md) | Cocinero, Chef, Auxiliar | 3 h |
| 3 | Bar / Bartender | [03-bar-bartender.md](./03-bar-bartender.md) | Bar | 2 h |
| 4 | Cajero / POS | [04-cajero-pos.md](./04-cajero-pos.md) | Caja | 4 h |
| 5 | Gerente / Supervisor | [05-gerente-supervisor.md](./05-gerente-supervisor.md) | Gerencia | 4 h |
| 6 | Administrador del sistema | [06-administrador-sistema.md](./06-administrador-sistema.md) | Admin IT / dueño | 6 h |
| 7 | Experiencia del cliente | [07-experiencia-cliente.md](./07-experiencia-cliente.md) | Todos (referencia) | 1.5 h |
| — | Glosario, evaluaciones y apéndices | [08-apendices.md](./08-apendices.md) | Todos | — |

---

## Rutas de acceso rápido

| Área | URL | Rol de login |
|------|-----|--------------|
| Login | `/aion/login` | Todos |
| Cliente | `/aion/cliente/menu` | `customer` |
| Staff | `/aion/staff` | `staff` |
| Admin | `/aion/admin` | `admin` |

> La Cazuela usa el prefijo `/cazuela/` en lugar de `/aion/`.

---

## Roles de login vs. cargos operativos

| Rol de login | Acceso en sistema |
|--------------|-------------------|
| `customer` | Menú, carrito, pedidos, reservas |
| `staff` | Tablero Kanban de pedidos |
| `admin` | Panel administrativo completo |

Los cargos (Mesero, Cocinero, Cajero, etc.) se registran en **Empleados** como `role_title`, pero **no cambian los permisos de login**. Meseros y cocineros comparten la vista staff; solo admin accede al POS, inventario y configuración.

---

## Credenciales de prueba (demo)

### Il Cafeto (Bogotá)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@ilcafeto.com` | `ilcafeto2024!` |
| Staff (Mesero) | `staff1@ilcafeto.com` | `Staff1234!` |
| Staff (Barista) | `staff2@ilcafeto.com` | `Staff1234!` |
| Staff (Cajero) | `staff3@ilcafeto.com` | `Staff1234!` |

### La Cazuela (Medellín)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@lacazuela.com` | `lacazuela2024!` |
| Staff (Cocinero) | `staff1@lacazuela.com` | `Staff1234!` |
| Staff (Mesera) | `staff2@lacazuela.com` | `Staff1234!` |

### Clientes demo

`cliente1@gmail.com` / `Cliente1234!`

---

## Plan de curso sugerido

### 5 días (20 horas)

| Día | Módulos | Audiencia |
|-----|---------|-----------|
| Día 1 | 00 + 07 | Todos |
| Día 2 | 01 + 02 | Servicio y cocina |
| Día 3 | 03 + 04 | Bar y caja |
| Día 4 | 05 + 06 (parte 1) | Gerencia y admin |
| Día 5 | 06 (parte 2) + evaluación | Admin y supervisores |

### 1 día intensivo (8 horas)

| Hora | Contenido |
|------|-----------|
| 08:00–09:00 | Módulo 00 |
| 09:00–10:30 | Módulos 01 + 02 (práctica tablero) |
| 10:45–12:00 | Módulo 04 (POS) |
| 13:00–14:30 | Módulo 05 (Dashboard) |
| 14:45–16:30 | Módulo 06 (Configuración) |
| 16:30–17:00 | Evaluación |

---

## Materiales para impartir el curso

- [ ] Proyector o pantalla grande
- [ ] Tablets para práctica staff (mín. 2)
- [ ] PC para práctica admin/POS
- [ ] Credenciales demo
- [ ] Conexión a internet estable
- [ ] Casos de práctica impresos (ver cada módulo)

---

## Escalamiento de incidencias

| Nivel | Responsable | Cuándo |
|-------|-------------|--------|
| 1 | Supervisor de turno | Incidencias operativas |
| 2 | Gerente | Quejas, cancelaciones, faltantes |
| 3 | Admin del sistema | Usuarios, configuración, bugs |
| 4 | Soporte técnico | Infraestructura, base de datos |
