# Validación de Pedidos en Página Individual de Negocio

## Descripción

Se ha implementado la visualización del estado del negocio y la validación de pedidos en la página de detalle individual de cada negocio (`BusinessDetailClient.tsx`).

## Funcionalidades Implementadas

### 1. **Visualización del Estado del Negocio**

Se agregó una sección prominente que muestra:

- **Badge de Estado**: Indica si el negocio está:

  - 🟢 **Abierto** (con animación de pulso)
  - 🔴 **Cerrado**
  - 🟠 **Cerrado Temporalmente**
  - ⚫ **Cerrado Permanentemente**

- **Botón de Información de Horarios**: Abre el diálogo `BusinessHoursDialog` con:

  - Horarios completos de la semana
  - Múltiples franjas horarias por día
  - Días especiales de cierre
  - Tiempo de preparación

- **Tiempo de Preparación**: Se muestra junto al estado si está configurado

### 2. **Mensajes Informativos**

#### Cuando NO se pueden hacer pedidos:

```
⚠️ Pedidos no disponibles
Este negocio está cerrado permanentemente
```

O bien:

```
⚠️ Pedidos no disponibles
Cerrado temporalmente: [Razón del cierre]
```

O bien:

```
⚠️ Pedidos no disponibles
El negocio está cerrado en este momento
```

#### Cuando se aceptan pedidos fuera de horario:

```
ℹ️ Este negocio acepta pedidos fuera del horario de atención
```

### 3. **Validación de Pedidos**

Se implementó la lógica `canOrderNow` que determina si se pueden realizar pedidos:

```typescript
const canOrderNow =
  (business.status === "ABIERTO" && businessIsOpen) ||
  business.acceptOrdersOutsideHours;
```

**Reglas de Validación:**

- ✅ Se PERMITEN pedidos si:

  - El negocio está ABIERTO **Y** está dentro del horario de atención
  - **O** el negocio acepta pedidos fuera de horario (`acceptOrdersOutsideHours = true`)

- ❌ Se BLOQUEAN pedidos si:
  - El negocio está CERRADO_PERMANENTE
  - El negocio está CERRADO_TEMPORAL y NO acepta pedidos fuera de horario
  - El negocio está fuera de horario y NO acepta pedidos fuera de horario

### 4. **Elementos Deshabilitados**

Cuando `canOrderNow = false`, se deshabilitan:

1. **Botón "Ver Carrito"**: Cambia a "Pedidos no disponibles" y se muestra en gris
2. **Botones "Agregar"**: En cada producto cambian a "No disponible" y se deshabilitan
3. **Botones +/-**: Los botones de aumentar/disminuir cantidad en productos se deshabilitan
4. **Botón "Realizar Pedido"**: Deshabilitado con mensaje explicativo
5. **Botón "Pedir por WhatsApp"**: Deshabilitado para usuarios no autenticados

## Ubicación de los Cambios

### Archivo: `components/BusinessDetailClient.tsx`

#### Importaciones agregadas (líneas ~1-40):

```typescript
import BusinessHoursDialog from "@/components/BusinessHoursDialog";
import {
  BusinessSchedule,
  SpecialClosedDay,
  isBusinessOpen,
} from "@/lib/business-hours";
import { Clock, AlertCircle } from "lucide-react";
```

#### Lógica de validación (líneas ~225-270):

```typescript
// Calcular estado del negocio
const schedule = business.schedule as BusinessSchedule | null;
const specialClosedDays =
  (business.specialClosedDays as SpecialClosedDay[]) || [];

const { isOpen: businessIsOpen, reason } = schedule
  ? isBusinessOpen(schedule, business.status, specialClosedDays)
  : { isOpen: false, reason: "Horario no especificado" };

// Determinar si se pueden hacer pedidos
const canOrderNow =
  (business.status === "ABIERTO" && businessIsOpen) ||
  business.acceptOrdersOutsideHours;

// Obtener configuración del badge de estado
const getStatusBadge = () => {
  /* ... */
};
const statusBadge = getStatusBadge();
```

#### Sección de UI del estado (después de la descripción):

```typescript
{
  /* Status and Business Hours Section */
}
<div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
  {/* Badge de estado + botón de info de horarios */}
  {/* Tiempo de preparación */}
  {/* Mensajes informativos condicionales */}
</div>;
```

#### Botones deshabilitados:

- **Botón "Ver Carrito"**: `disabled={!canOrderNow}`
- **Botones de productos**: `disabled={product.stock === 0 || !canOrderNow}`
- **Botones +/-**: `disabled={!canOrderNow}` o `disabled={cartQty >= product.stock || !canOrderNow}`
- **Botones de checkout**: `disabled={... || !canOrderNow || ...}`

## Flujo de Usuario

### Escenario 1: Negocio Abierto y Dentro de Horario

1. Usuario ve badge verde "🟢 Abierto" con pulso
2. Todos los botones están habilitados
3. Puede agregar productos al carrito
4. Puede realizar el pedido normalmente

### Escenario 2: Negocio Cerrado pero Acepta Pedidos Fuera de Horario

1. Usuario ve badge rojo "🔴 Cerrado"
2. Mensaje azul: "ℹ️ Este negocio acepta pedidos fuera del horario de atención"
3. Todos los botones están habilitados
4. Puede realizar el pedido normalmente

### Escenario 3: Negocio Cerrado y NO Acepta Pedidos Fuera de Horario

1. Usuario ve badge rojo "🔴 Cerrado"
2. Mensaje ámbar: "⚠️ Pedidos no disponibles - El negocio está cerrado en este momento"
3. Todos los botones de pedido están deshabilitados y en gris
4. Botón "Ver Carrito" muestra "Pedidos no disponibles"
5. Botones "Agregar" muestran "No disponible"
6. No puede realizar pedidos

### Escenario 4: Negocio Cerrado Temporalmente

1. Usuario ve badge naranja "🟠 Cerrado temporalmente"
2. Mensaje ámbar: "⚠️ Pedidos no disponibles - Cerrado temporalmente: [Razón]"
3. Si NO acepta pedidos fuera de horario: Botones deshabilitados
4. Si SÍ acepta pedidos fuera de horario: Botones habilitados

### Escenario 5: Negocio Cerrado Permanentemente

1. Usuario ve badge gris "⚫ Cerrado permanentemente"
2. Mensaje ámbar: "⚠️ Pedidos no disponibles - Este negocio está cerrado permanentemente"
3. **SIEMPRE** todos los botones deshabilitados (incluso con `acceptOrdersOutsideHours`)

## Integración con Sistema Existente

Esta implementación se integra con:

- ✅ `lib/business-hours.ts` - Funciones de cálculo de estado
- ✅ `BusinessHoursDialog.tsx` - Diálogo de información de horarios
- ✅ `BusinessCard.tsx` - Misma lógica de badge de estado
- ✅ Sistema de carrito existente
- ✅ Flujo de pedidos autenticados y no autenticados
- ✅ Validación de ubicación para delivery

## Consistencia de Diseño

- Se mantiene el mismo esquema de colores que `BusinessCard`:
  - Verde para "Abierto"
  - Rojo para "Cerrado"
  - Naranja para "Cerrado Temporalmente"
  - Gris para "Cerrado Permanentemente"
- Se usa el mismo componente `BusinessHoursDialog` para consistencia
- Los mensajes de error/advertencia usan el mismo estilo visual (ámbar con `AlertCircle`)
- Los mensajes informativos usan estilo azul

## Dependencias

- `lib/business-hours.ts`: Funciones de cálculo de estado
- `components/BusinessHoursDialog.tsx`: Modal de horarios
- `lucide-react`: Iconos Clock y AlertCircle
- `@/app/types/types.ts`: Tipos BusinessSchedule, SpecialClosedDay

## Notas Técnicas

- La validación se realiza en tiempo real basándose en el horario actual
- Se considera la zona horaria del sistema
- Los días especiales de cierre tienen prioridad sobre el horario regular
- La lógica de `canOrderNow` es simple pero efectiva:
  ```typescript
  canOrderNow = (ABIERTO && dentroDeHorario) || aceptaPedidosFueraDeHorario;
  ```
- El estado `CERRADO_PERMANENTE` siempre bloquea pedidos, sin excepciones

## Testing Sugerido

1. ✅ Negocio abierto dentro de horario → Debe permitir pedidos
2. ✅ Negocio cerrado sin `acceptOrdersOutsideHours` → Debe bloquear pedidos
3. ✅ Negocio cerrado con `acceptOrdersOutsideHours=true` → Debe permitir pedidos
4. ✅ Negocio con `status=CERRADO_TEMPORAL` → Depende de `acceptOrdersOutsideHours`
5. ✅ Negocio con `status=CERRADO_PERMANENTE` → Siempre bloquea pedidos
6. ✅ Badge de estado debe animarse cuando está abierto (pulso verde)
7. ✅ Diálogo de horarios debe mostrar información completa
8. ✅ Mensajes informativos deben ser claros y contextuales

## Mejoras Futuras

- [ ] Agregar tooltip en botones deshabilitados explicando por qué
- [ ] Mostrar próxima apertura cuando esté cerrado
- [ ] Notificaciones push cuando el negocio vuelva a abrir
- [ ] Opción de "Notificarme cuando abra"
