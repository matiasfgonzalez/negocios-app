# Formularios de Horarios y Estado de Negocio

## Resumen de Implementación

Se han agregado los campos del sistema de horarios y estado del negocio a los formularios de creación y edición de negocios.

## Archivos Modificados

### 1. **components/BusinessScheduleEditor.tsx** (NUEVO)

Componente reutilizable para editar el horario semanal y días especiales de cierre.

**Características:**

- Editor de horario para cada día de la semana (Lunes a Domingo)
- Toggle para habilitar/deshabilitar días
- Inputs de tipo `time` para horarios de apertura y cierre
- Validación de rangos de tiempo
- Gestión de días especiales de cierre con fecha y motivo
- Interfaz responsive con diseño optimizado para móviles

**Props:**

```typescript
interface BusinessScheduleEditorProps {
  schedule: BusinessSchedule | null;
  specialClosedDays: SpecialClosedDay[];
  onScheduleChange: (schedule: BusinessSchedule) => void;
  onSpecialDaysChange: (days: SpecialClosedDay[]) => void;
}
```

### 2. **components/NuevoNegocioDialog.tsx** (ACTUALIZADO)

Formulario de creación de negocios con nuevos campos:

**Nuevos campos agregados:**

- **Estado del Negocio** (Select): ABIERTO, CERRADO_TEMPORAL, CERRADO_PERMANENTE
- **Motivo del Cierre** (Input): Mostrado condicionalmente si está cerrado
- **Tiempo de Preparación** (Number): En minutos, valor por defecto 30
- **Aceptar Pedidos Fuera del Horario** (Checkbox): Boolean
- **Horarios de Atención** (BusinessScheduleEditor): Horario semanal completo
- **Días Especiales de Cierre** (BusinessScheduleEditor): Fechas especiales

**Estado inicial:**

```typescript
const [formData, setFormData] = useState({
  // ... campos existentes
  status: "ABIERTO" as BusinessStatus,
  closedReason: "",
  acceptOrdersOutsideHours: false,
  preparationTime: "30",
});
const [schedule, setSchedule] = useState<BusinessSchedule>(defaultSchedule);
const [specialClosedDays, setSpecialClosedDays] = useState<SpecialClosedDay[]>(
  []
);
```

### 3. **components/EditarNegocioDialog.tsx** (ACTUALIZADO)

Formulario de edición con los mismos campos nuevos que el formulario de creación.

**Inicialización con datos existentes:**

```typescript
const [formData, setFormData] = useState({
  // ... campos existentes
  status: business.status || "ABIERTO",
  closedReason: business.closedReason || "",
  acceptOrdersOutsideHours: business.acceptOrdersOutsideHours || false,
  preparationTime: business.preparationTime?.toString() || "30",
});
const [schedule, setSchedule] = useState<BusinessSchedule>(
  (business.schedule as BusinessSchedule) || defaultSchedule
);
const [specialClosedDays, setSpecialClosedDays] = useState<SpecialClosedDay[]>(
  (business.specialClosedDays as SpecialClosedDay[]) || []
);
```

### 4. **app/api/businesses/route.ts** (ACTUALIZADO)

Endpoint POST actualizado para crear negocios con nuevos campos.

**Nuevos campos en el body:**

```typescript
const {
  // ... campos existentes
  status,
  closedReason,
  schedule,
  specialClosedDays,
  acceptOrdersOutsideHours,
  preparationTime,
} = body;
```

**Datos de creación:**

```typescript
const business = await prisma.business.create({
  data: {
    // ... campos existentes
    status: status || "ABIERTO",
    closedReason: closedReason || null,
    schedule: schedule || null,
    specialClosedDays: specialClosedDays || null,
    acceptOrdersOutsideHours: acceptOrdersOutsideHours || false,
    preparationTime: preparationTime || null,
    ownerId,
  },
  // ...
});
```

### 5. **app/api/businesses/[id]/route.ts** (ACTUALIZADO)

Endpoint PUT actualizado para editar negocios con nuevos campos.

**Actualización condicional:**

```typescript
const business = await prisma.business.update({
  where: { id },
  data: {
    // ... campos existentes
    status: status === undefined ? existingBusiness.status : status,
    closedReason:
      closedReason === undefined ? existingBusiness.closedReason : closedReason,
    schedule: schedule === undefined ? existingBusiness.schedule : schedule,
    specialClosedDays:
      specialClosedDays === undefined
        ? existingBusiness.specialClosedDays
        : specialClosedDays,
    acceptOrdersOutsideHours:
      acceptOrdersOutsideHours === undefined
        ? existingBusiness.acceptOrdersOutsideHours
        : acceptOrdersOutsideHours,
    preparationTime:
      preparationTime === undefined
        ? existingBusiness.preparationTime
        : preparationTime,
  },
  // ...
});
```

## Estructura del Formulario

### Sección "Estado y Operación"

1. **Estado del Negocio** (Select - Requerido)

   - Opciones: Abierto, Cerrado Temporalmente, Cerrado Permanentemente
   - Por defecto: ABIERTO

2. **Motivo del Cierre** (Input condicional)

   - Se muestra solo si el estado es CERRADO_TEMPORAL o CERRADO_PERMANENTE
   - Placeholder: "Ej: Vacaciones, renovación, etc."

3. **Tiempo de Preparación** (Input numérico)

   - En minutos
   - Paso: 5 minutos
   - Por defecto: 30 minutos
   - Descripción: "Tiempo estimado que toma preparar un pedido"

4. **Aceptar Pedidos Fuera del Horario** (Checkbox)
   - Por defecto: false
   - Descripción: "Si está activado, los clientes podrán realizar pedidos incluso cuando el negocio esté cerrado"

### Sección "Horarios de Atención"

Utiliza el componente `BusinessScheduleEditor` que incluye:

1. **Horario Semanal**

   - Un toggle para cada día de la semana
   - Inputs de tiempo para apertura y cierre (cuando está habilitado)
   - Validación en tiempo real de rangos válidos
   - Por defecto: Lunes a Viernes 09:00-18:00, fines de semana cerrados

2. **Días Especiales de Cierre**
   - Botón "Agregar" para añadir fechas especiales
   - Input de fecha (date picker)
   - Input de motivo (texto libre)
   - Botón eliminar por cada fecha especial
   - Sin fechas por defecto (array vacío)

## Flujo de Datos

### Creación de Negocio

1. Usuario abre el diálogo "Nuevo Negocio"
2. Completa información básica, contacto, ubicación
3. **Configura estado y operación** (nuevos campos)
4. **Define horarios semanales** con el editor visual
5. **Agrega días especiales de cierre** (opcional)
6. Al enviar:
   - `formData` se combina con `schedule` y `specialClosedDays`
   - Se envía POST a `/api/businesses`
   - Backend guarda en formato JSON los horarios
   - Se resetea el formulario al estado inicial

### Edición de Negocio

1. Usuario abre el diálogo "Editar Negocio"
2. Formulario se inicializa con datos existentes del negocio
3. `schedule` y `specialClosedDays` se parsean desde JSON
4. Usuario modifica campos según necesidad
5. Al enviar:
   - Solo se envían campos modificados
   - PUT a `/api/businesses/[id]`
   - Backend actualiza solo los campos proporcionados
   - Se refresca la página

## Valores por Defecto

```typescript
// Estado inicial en creación
status: "ABIERTO"
closedReason: ""
acceptOrdersOutsideHours: false
preparationTime: "30" (minutos)

// Horario por defecto (defaultSchedule)
{
  lunes: { enabled: true, open: "09:00", close: "18:00" },
  martes: { enabled: true, open: "09:00", close: "18:00" },
  miercoles: { enabled: true, open: "09:00", close: "18:00" },
  jueves: { enabled: true, open: "09:00", close: "18:00" },
  viernes: { enabled: true, open: "09:00", close: "18:00" },
  sabado: { enabled: false, open: "09:00", close: "13:00" },
  domingo: { enabled: false, open: "09:00", close: "13:00" },
}

// Días especiales
specialClosedDays: [] (sin fechas especiales)
```

## Validaciones

### Frontend

1. **Rangos de Tiempo**: `isValidTimeRange(open, close)`

   - La hora de cierre debe ser posterior a la de apertura
   - Mostrar error visual si el rango es inválido

2. **Campos Requeridos**:

   - Estado del Negocio (siempre requerido)
   - Motivo del Cierre (requerido solo si estado es cerrado)

3. **Formato de Tiempo**: HTML5 input type="time"
   - Garantiza formato HH:mm automáticamente

### Backend

- Validación de tipos con Prisma
- Valores por defecto para campos opcionales
- BusinessStatus como enum en la base de datos

## UI/UX

### Diseño Visual

- **Secciones claramente divididas** con títulos y separadores
- **Campos condicionales** para mejor experiencia (motivo solo si cerrado)
- **Iconos descriptivos** (Clock para horarios)
- **Responsive design**: Grid adaptable para móviles
- **Feedback visual**: Mensajes de ayuda y validación en tiempo real

### Accesibilidad

- Labels asociados a inputs con `htmlFor`
- Placeholders descriptivos
- Textos de ayuda (`text-muted-foreground`)
- Botones con íconos + texto

### Interacción

- **Checkboxes** para días habilitados (fácil toggle)
- **Time pickers** nativos del navegador
- **Botón + agregar** para días especiales
- **Botón X** para eliminar fechas especiales
- **Validación en tiempo real** sin necesidad de submit

## Testing Sugerido

### Casos de Prueba

1. **Crear negocio con horario por defecto**

   - Verificar que se guarde correctamente
   - Verificar formato JSON en BD

2. **Editar negocio existente sin horarios**

   - Verificar que se inicialice con defaultSchedule
   - Permitir guardar horarios por primera vez

3. **Modificar días de atención**

   - Habilitar/deshabilitar días
   - Cambiar horarios
   - Verificar persistencia

4. **Agregar días especiales**

   - Añadir múltiples fechas
   - Eliminar fechas
   - Verificar array en BD

5. **Cambiar estado de negocio**

   - ABIERTO → CERRADO_TEMPORAL (con motivo)
   - CERRADO_TEMPORAL → ABIERTO
   - Verificar persistencia del motivo

6. **Validación de horarios**
   - Horario inválido (cierre antes de apertura)
   - Verificar mensaje de error
   - No permitir guardar con errores

## Próximos Pasos

Una vez probados los formularios, se puede:

1. **Mostrar horarios en la página pública del negocio**

   - Usar `formatFullSchedule()` para mostrar horario completo
   - Usar `isBusinessOpen()` para badge de estado actual
   - Usar `getBusinessHoursMessage()` para mensaje contextual

2. **Validar pedidos según horarios**

   - Implementar en `/api/orders` validación de `acceptOrdersOutsideHours`
   - Mostrar mensaje al cliente si está fuera de horario

3. **Dashboard de gestión rápida**
   - Botón rápido para cambiar estado (ABIERTO ↔ CERRADO_TEMPORAL)
   - Vista resumida de horarios
   - Calendario de días especiales

## Notas Técnicas

- Los horarios se guardan como JSON en PostgreSQL (campo `Json`)
- No se requiere migración adicional (campos ya existen en schema)
- El componente `BusinessScheduleEditor` es reutilizable
- Imports dinámicos mantienen SSR compatibility
- TypeScript garantiza type safety con tipos importados de `lib/business-hours.ts`
