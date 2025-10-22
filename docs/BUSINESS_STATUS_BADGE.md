# Badge de Estado y Horarios en BusinessCard

## Implementación Completada

Se ha agregado un sistema completo de visualización de estado del negocio y horarios directamente en las cards de la página principal.

## Archivos Modificados/Creados

### 1. **components/BusinessHoursDialog.tsx** (NUEVO)

Componente modal que muestra información detallada de horarios.

**Características:**

- ✅ Estado actual del negocio (Abierto/Cerrado con indicador pulsante)
- ✅ Mensaje contextual (ej: "Abre a las 10:00", "Cerrado hoy")
- ✅ Horario semanal completo con todas las franjas horarias
- ✅ Días especiales de cierre con fechas y motivos
- ✅ Tiempo de preparación estimado
- ✅ Indicador si acepta pedidos fuera del horario
- ✅ Diseño responsive con scroll interno

**Secciones del diálogo:**

1. **Estado Actual**

   ```
   🟢 Abierto ahora
   Abierto hoy: 10:00-15:00, 20:00-24:00
   ```

   o

   ```
   🔴 Cerrado
   Abre a las 10:00
   ```

2. **Horario Semanal**

   ```
   Lunes    10:00-15:00, 20:00-24:00
   Martes   09:00-18:00
   Miércoles Cerrado
   Jueves   08:00-12:00, 14:00-18:00
   ...
   ```

3. **Cierres Especiales**

   ```
   25 de diciembre   Navidad
   1 de enero        Año Nuevo
   ```

4. **Información Adicional**
   - Tiempo de preparación: X minutos
   - Acepta pedidos fuera del horario (si aplica)

### 2. **components/BusinessCard.tsx** (ACTUALIZADO)

Se agregó el badge de estado y botón de información.

**Nuevas características:**

1. **Badge de Estado Dinámico**

   - 🟢 **Abierto**: Verde con animación pulsante
   - 🔴 **Cerrado**: Rojo
   - 🟠 **Cerrado Temporalmente**: Naranja
   - ⚫ **Cerrado Permanentemente**: Gris

2. **Botón de Información** (icono ℹ️)
   - Abre el diálogo `BusinessHoursDialog`
   - Posicionado junto al badge de estado
   - Hover effect para mejor UX

**Lógica implementada:**

```typescript
// Determinar estado del negocio
const schedule = business.schedule as BusinessSchedule | null;
const { isOpen: businessIsOpen } = schedule
  ? isBusinessOpen(schedule, business.status, specialClosedDays || [])
  : { isOpen: false };

// Determinar color y texto del badge
const getStatusBadge = () => {
  if (business.status === "CERRADO_PERMANENTE") {
    return {
      label: "Cerrado permanentemente",
      color: "bg-gray-500/10 text-gray-700 border-gray-500/20",
      dot: "bg-gray-500",
    };
  }

  if (business.status === "CERRADO_TEMPORAL") {
    return {
      label: "Cerrado temporalmente",
      color: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      dot: "bg-orange-500",
    };
  }

  if (businessIsOpen) {
    return {
      label: "Abierto",
      color: "bg-green-500/10 text-green-700 border-green-500/20",
      dot: "bg-green-500 animate-pulse",
    };
  }

  return {
    label: "Cerrado",
    color: "bg-red-500/10 text-red-700 border-red-500/20",
    dot: "bg-red-500",
  };
};
```

## Visualización en la UI

### Card del Negocio (Vista Principal)

```
┌─────────────────────────────────────────────┐
│  [Imagen del Negocio]            [1 mes]   │
├─────────────────────────────────────────────┤
│  Nombre del Negocio                         │
│  [Panadería] [🟢 Abierto] [ℹ️]              │
│                                             │
│  Descripción breve del negocio...           │
│                                             │
│  📍 Dirección del negocio                   │
│  💬 WhatsApp disponible                     │
│  💳 Pagos digitales                         │
│  📦 Envío: $500                             │
│                                             │
│  📦 12  👥 45        ⭐ 4.5                  │
│                                             │
│  [💬 Chat]        [👁️ Ver tienda]          │
└─────────────────────────────────────────────┘
```

### Diálogo de Horarios (Click en ℹ️)

```
┌─────────────────────────────────────────────┐
│  🕐 Horarios de Atención               [X]  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ Estado actual                       │   │
│  │ 🟢 Abierto ahora                    │   │
│  │ Abierto hoy: 10:00-15:00, 20:00-24:00 │
│  └─────────────────────────────────────┘   │
│                                             │
│  Horario Semanal                            │
│  ┌─────────────────────────────────────┐   │
│  │ Lunes     10:00-15:00, 20:00-24:00  │   │
│  │ Martes    09:00-18:00               │   │
│  │ Miércoles Cerrado                   │   │
│  │ Jueves    08:00-12:00, 14:00-18:00  │   │
│  │ Viernes   09:00-18:00               │   │
│  │ Sábado    10:00-14:00               │   │
│  │ Domingo   Cerrado                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Cierres Especiales                         │
│  ┌─────────────────────────────────────┐   │
│  │ 25 de diciembre   Navidad           │   │
│  │ 1 de enero        Año Nuevo         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Tiempo de preparación estimado      │   │
│  │ 30 minutos                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ℹ️ Este negocio acepta pedidos fuera del  │
│     horario de atención                     │
└─────────────────────────────────────────────┘
```

## Estados Posibles del Badge

### 1. Abierto (Verde)

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 text-green-700 border-green-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
  Abierto
</span>
```

### 2. Cerrado (Rojo)

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/10 text-red-700 border-red-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
  Cerrado
</span>
```

### 3. Cerrado Temporalmente (Naranja)

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-orange-500/10 text-orange-700 border-orange-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
  Cerrado temporalmente
</span>
```

### 4. Cerrado Permanentemente (Gris)

```tsx
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-500/10 text-gray-700 border-gray-500/20">
  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
  Cerrado permanentemente
</span>
```

## Flujo de Usuario

1. **Usuario ve la card del negocio**

   - Badge de estado visible inmediatamente
   - Color y punto indicador muestran el estado actual

2. **Usuario hace click en el botón ℹ️**

   - Se abre el diálogo modal
   - Muestra información completa de horarios

3. **Usuario revisa horarios**

   - Estado actual en la parte superior
   - Horario semanal completo
   - Días especiales de cierre (si existen)
   - Información adicional relevante

4. **Usuario cierra el diálogo**
   - Click en X, fuera del modal, o ESC
   - Vuelve a la vista principal

## Casos de Uso

### Ejemplo 1: Restaurante Abierto

```
Badge: 🟢 Abierto
Diálogo:
  - Estado: Abierto ahora
  - Mensaje: Abierto hoy: 12:00-15:00, 20:00-24:00
  - Horario: Lunes a Domingo con franjas de almuerzo y cena
```

### Ejemplo 2: Negocio Cerrado (Fuera de Horario)

```
Badge: 🔴 Cerrado
Diálogo:
  - Estado: Cerrado
  - Mensaje: Abre a las 09:00
  - Horario: Lunes a Viernes 09:00-18:00
```

### Ejemplo 3: Negocio Cerrado Temporalmente

```
Badge: 🟠 Cerrado temporalmente
Diálogo:
  - Estado: Cerrado
  - Mensaje: Cerrado temporalmente
  - Motivo: Vacaciones de verano (en closedReason del business)
```

### Ejemplo 4: Día Especial de Cierre

```
Badge: 🔴 Cerrado
Diálogo:
  - Estado: Cerrado
  - Mensaje: Navidad
  - Cierres Especiales: 25 de diciembre - Navidad
```

## Integración con Sistema de Horarios

El componente utiliza las funciones de `lib/business-hours.ts`:

- **`isBusinessOpen()`**: Determina si está abierto en tiempo real
- **`getBusinessHoursMessage()`**: Genera mensaje contextual
- **`formatFullSchedule()`**: Formatea horario semanal completo

## Responsive Design

- **Mobile**: Badge y botón en una sola línea, diálogo ocupa 95% del ancho
- **Tablet**: Layout optimizado con mejor espaciado
- **Desktop**: Diálogo centrado con ancho máximo (max-w-md)

## Dark Mode

Todos los componentes soportan modo oscuro:

- Colores adaptativos con variantes `dark:`
- Contraste mejorado para mejor legibilidad
- Animaciones y efectos consistentes

## Accesibilidad

- ✅ Botones con aria-labels
- ✅ Indicadores visuales claros
- ✅ Contraste de colores adecuado
- ✅ Soporte para teclado (ESC para cerrar diálogo)
- ✅ Punto pulsante para estado "Abierto" (indicador de tiempo real)

## Beneficios

1. **Información Instantánea**: Usuario ve el estado sin hacer click
2. **Detalles On-Demand**: Información completa disponible con un click
3. **UX Mejorada**: No necesita entrar al detalle del negocio para ver horarios
4. **Actualización en Tiempo Real**: Estado se calcula dinámicamente
5. **Visual Atractivo**: Colores y animaciones que llaman la atención
6. **Consistente**: Mismo sistema de horarios que en el resto de la app

## Próximas Mejoras Sugeridas

1. **Auto-refresh**: Actualizar estado cada minuto sin recargar
2. **Countdown**: Mostrar tiempo hasta que abra/cierre
3. **Notificaciones**: "Este negocio abre en 30 minutos"
4. **Filtro por Estado**: Filtrar negocios abiertos/cerrados en la página principal
5. **Orden por Proximidad de Apertura**: Mostrar primero los que están por abrir
