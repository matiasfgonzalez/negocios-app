# Sistema de Múltiples Franjas Horarias

## Actualización Importante: Soporte para Múltiples Franjas Horarias por Día

Se ha actualizado el sistema de horarios para soportar **múltiples franjas horarias por día**, permitiendo a los negocios definir horarios discontinuos como:

- **Lunes**: 10:00-15:00 y 20:00-24:00
- **Martes**: 08:00-12:00, 14:00-18:00 y 20:00-23:00
- **Miércoles**: 09:00-18:00 (una sola franja)

## Cambios en la Estructura de Datos

### Antes (Una sola franja por día)

```typescript
interface DaySchedule {
  enabled: boolean;
  open: string; // "09:00"
  close: string; // "18:00"
}
```

### Ahora (Múltiples franjas por día)

```typescript
interface TimeSlot {
  open: string; // "09:00"
  close: string; // "18:00"
}

interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[]; // Array de franjas horarias
}
```

## Archivos Modificados

### 1. **lib/business-hours.ts** (ACTUALIZADO)

**Nuevos tipos:**

```typescript
export interface TimeSlot {
  open: string; // Formato: "HH:mm"
  close: string; // Formato: "HH:mm"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[]; // Ahora es un array
}
```

**Horario por defecto actualizado:**

```typescript
export const defaultSchedule: BusinessSchedule = {
  lunes: {
    enabled: true,
    timeSlots: [{ open: "09:00", close: "18:00" }],
  },
  martes: {
    enabled: true,
    timeSlots: [{ open: "09:00", close: "18:00" }],
  },
  // ... resto de días
};
```

**Función `isBusinessOpen()` actualizada:**

- Ahora itera sobre todas las franjas horarias del día
- Verifica si la hora actual está dentro de alguna franja
- Si no está abierto, busca la próxima franja de apertura

```typescript
// Verificar si está dentro de alguna franja horaria
for (const slot of daySchedule.timeSlots) {
  if (currentTime >= slot.open && currentTime <= slot.close) {
    return { isOpen: true };
  }
}

// Encontrar la próxima apertura
const nextSlot = daySchedule.timeSlots.find((slot) => currentTime < slot.open);
if (nextSlot) {
  return { isOpen: false, reason: `Abre a las ${nextSlot.open}` };
}
```

**Función `getBusinessHoursMessage()` actualizada:**

```typescript
// Si hay una sola franja horaria
if (daySchedule.timeSlots.length === 1) {
  const slot = daySchedule.timeSlots[0];
  return `Abierto hoy de ${slot.open} a ${slot.close}`;
}

// Si hay múltiples franjas horarias
const slots = daySchedule.timeSlots
  .map((slot) => `${slot.open}-${slot.close}`)
  .join(", ");
return `Abierto hoy: ${slots}`;
```

**Ejemplos de salida:**

- Una franja: `"Abierto hoy de 09:00 a 18:00"`
- Múltiples franjas: `"Abierto hoy: 10:00-15:00, 20:00-24:00"`

**Función `formatFullSchedule()` actualizada:**

```typescript
return days.map((day) => {
  const daySchedule = schedule[day];
  if (!daySchedule || !daySchedule.enabled) {
    return `${dayNames[day]}: Cerrado`;
  }
  const slots = daySchedule.timeSlots
    .map((slot) => `${slot.open}-${slot.close}`)
    .join(", ");
  return `${dayNames[day]}: ${slots}`;
});
```

**Ejemplos de salida:**

```
[
  "Lunes: 10:00-15:00, 20:00-24:00",
  "Martes: 09:00-18:00",
  "Miércoles: Cerrado",
  "Jueves: 08:00-12:00, 14:00-18:00",
  ...
]
```

### 2. **components/BusinessScheduleEditor.tsx** (REESCRITO)

Componente completamente rediseñado para gestionar múltiples franjas horarias.

**Nuevas funcionalidades:**

1. **Agregar Franjas Horarias**
   - Botón "+ Agregar franja" por cada día habilitado
   - Nuevas franjas inician con valores por defecto (09:00-18:00)
   - Sin límite de franjas por día

```typescript
const handleAddTimeSlot = (day: DayOfWeek) => {
  const daySchedule = currentSchedule[day];
  if (!daySchedule) return;

  const newSlot: TimeSlot = { open: "09:00", close: "18:00" };
  const updated = {
    ...currentSchedule,
    [day]: {
      ...daySchedule,
      timeSlots: [...daySchedule.timeSlots, newSlot],
    },
  };
  setCurrentSchedule(updated);
  onScheduleChange(updated);
};
```

2. **Eliminar Franjas Horarias**
   - Botón "X" en cada franja (excepto si es la única)
   - Mínimo 1 franja por día habilitado
   - Confirmación visual al pasar el mouse

```typescript
const handleRemoveTimeSlot = (day: DayOfWeek, slotIndex: number) => {
  const daySchedule = currentSchedule[day];
  if (!daySchedule || daySchedule.timeSlots.length <= 1) return;

  const updated = {
    ...currentSchedule,
    [day]: {
      ...daySchedule,
      timeSlots: daySchedule.timeSlots.filter((_, i) => i !== slotIndex),
    },
  };
  setCurrentSchedule(updated);
  onScheduleChange(updated);
};
```

3. **Editar Franjas Horarias**
   - Inputs de tipo `time` para apertura y cierre
   - Validación en tiempo real
   - Indicador visual de errores

```typescript
const handleTimeSlotChange = (
  day: DayOfWeek,
  slotIndex: number,
  field: "open" | "close",
  value: string
) => {
  const daySchedule = currentSchedule[day];
  if (!daySchedule) return;

  const updatedSlots = [...daySchedule.timeSlots];
  updatedSlots[slotIndex] = {
    ...updatedSlots[slotIndex],
    [field]: value,
  };

  const updated = {
    ...currentSchedule,
    [day]: {
      ...daySchedule,
      timeSlots: updatedSlots,
    },
  };
  setCurrentSchedule(updated);
  onScheduleChange(updated);
};
```

**Nueva interfaz visual:**

```
┌─────────────────────────────────────────────────┐
│ ☑ Lunes                    [+ Agregar franja]  │
│   10:00 a 15:00 [X]                            │
│   20:00 a 24:00 [X]                            │
├─────────────────────────────────────────────────┤
│ ☑ Martes                   [+ Agregar franja]  │
│   09:00 a 18:00                                │
├─────────────────────────────────────────────────┤
│ ☐ Miércoles                                     │
│   Cerrado                                       │
└─────────────────────────────────────────────────┘
```

**Características UI:**

- Texto de ayuda: "Puedes agregar múltiples franjas horarias por día"
- Layout jerárquico: Toggle del día → Franjas indentadas
- Botón eliminar solo visible si hay más de una franja
- Validación visual: "Hora inválida" en rojo si close < open
- Diseño responsive con espaciado consistente

## Compatibilidad con Datos Existentes

### Migración Automática

Los datos existentes con formato antiguo (`open` y `close` directos) se deben migrar a `timeSlots`. Si tienes negocios con datos antiguos:

```typescript
// Formato antiguo (no funcionará)
{
  lunes: { enabled: true, open: "09:00", close: "18:00" }
}

// Formato nuevo (correcto)
{
  lunes: {
    enabled: true,
    timeSlots: [{ open: "09:00", close: "18:00" }]
  }
}
```

**Script de migración sugerido** (ejecutar en consola de Prisma Studio o script):

```javascript
// Leer negocios con schedule
const businesses = await prisma.business.findMany({
  where: { schedule: { not: null } },
});

// Migrar cada uno
for (const business of businesses) {
  const oldSchedule = business.schedule;
  const newSchedule = {};

  for (const day in oldSchedule) {
    if (oldSchedule[day].open && oldSchedule[day].close) {
      // Convertir formato antiguo a nuevo
      newSchedule[day] = {
        enabled: oldSchedule[day].enabled,
        timeSlots: [
          {
            open: oldSchedule[day].open,
            close: oldSchedule[day].close,
          },
        ],
      };
    } else {
      // Ya está en formato nuevo
      newSchedule[day] = oldSchedule[day];
    }
  }

  // Actualizar en BD
  await prisma.business.update({
    where: { id: business.id },
    data: { schedule: newSchedule },
  });
}
```

## Ejemplos de Uso

### Ejemplo 1: Negocio con Horario Corrido

```typescript
const schedule = {
  lunes: {
    enabled: true,
    timeSlots: [{ open: "09:00", close: "18:00" }],
  },
  martes: {
    enabled: true,
    timeSlots: [{ open: "09:00", close: "18:00" }],
  },
  // ... resto de días
};

// Mensaje: "Abierto hoy de 09:00 a 18:00"
```

### Ejemplo 2: Negocio con Horario Partido (Almuerzo)

```typescript
const schedule = {
  lunes: {
    enabled: true,
    timeSlots: [
      { open: "08:00", close: "13:00" },
      { open: "16:00", close: "20:00" },
    ],
  },
  // ... resto de días
};

// Mensaje: "Abierto hoy: 08:00-13:00, 16:00-20:00"
```

### Ejemplo 3: Restaurante con Almuerzo y Cena

```typescript
const schedule = {
  lunes: {
    enabled: true,
    timeSlots: [
      { open: "12:00", close: "15:00" }, // Almuerzo
      { open: "20:00", close: "24:00" }, // Cena
    ],
  },
  sabado: {
    enabled: true,
    timeSlots: [
      { open: "12:00", close: "16:00" },
      { open: "20:00", close: "01:00" }, // Hasta la 1 AM
    ],
  },
  domingo: {
    enabled: false,
    timeSlots: [{ open: "12:00", close: "15:00" }],
  },
};
```

### Ejemplo 4: Negocio 24 Horas con Descanso

```typescript
const schedule = {
  lunes: {
    enabled: true,
    timeSlots: [
      { open: "00:00", close: "23:59" }, // Todo el día
    ],
  },
  martes: {
    enabled: true,
    timeSlots: [
      { open: "00:00", close: "04:00" }, // Madrugada
      { open: "06:00", close: "23:59" }, // Resto del día (cierra 04:00-06:00)
    ],
  },
};
```

## Validaciones

### Frontend

- ✅ Hora de cierre debe ser posterior a hora de apertura
- ✅ Mínimo 1 franja por día habilitado
- ✅ Formato HH:mm validado por input type="time"
- ✅ Indicador visual de errores en tiempo real

### Backend

- ✅ JSON schema valida estructura
- ✅ Prisma acepta cualquier JSON válido
- ✅ TypeScript garantiza tipos correctos

## Flujo de Trabajo del Usuario

1. **Crear/Editar Negocio**
2. **Ir a sección "Horarios de Atención"**
3. **Para cada día:**
   - Habilitar/deshabilitar con checkbox
   - Si está habilitado:
     - Por defecto tiene 1 franja (09:00-18:00)
     - Click "+ Agregar franja" para añadir más
     - Editar horarios con time pickers
     - Click "X" para eliminar franjas (si hay más de 1)
4. **Guardar negocio**

## Beneficios

✅ **Flexibilidad**: Soporta cualquier configuración de horarios  
✅ **Usabilidad**: Interfaz intuitiva con botones claros  
✅ **Validación**: Previene errores con validación en tiempo real  
✅ **Escalabilidad**: Sin límite de franjas por día  
✅ **Compatibilidad**: Funciona con estructura JSON de Prisma

## Próximos Pasos Sugeridos

1. **Migrar datos existentes** (si hay negocios con formato antiguo)
2. **Mostrar horarios en página pública** del negocio
   - Usar `formatFullSchedule()` para listado completo
   - Usar `getBusinessHoursMessage()` para mensaje contextual
3. **Badge de estado** en tiempo real (Abierto/Cerrado)
4. **Validación de pedidos** según franjas horarias
5. **Notificaciones** cuando el negocio está por cerrar
