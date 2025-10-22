# Sistema de Horarios y Estado de Negocios

## 📋 Descripción General

Se ha implementado un sistema completo para gestionar los horarios de atención, días de cierre especiales y el estado operativo de los negocios.

## 🆕 Nuevos Campos en el Modelo Business

### 1. **status** (BusinessStatus)

Estado actual del negocio:

- `ABIERTO`: Negocio abierto y operativo
- `CERRADO_TEMPORAL`: Cerrado temporalmente (vacaciones, día libre, etc.)
- `CERRADO_PERMANENTE`: Cerrado permanentemente

### 2. **closedReason** (String?)

Motivo por el cual el negocio está cerrado.
Ejemplos: "Vacaciones de verano", "Día festivo", "Mantenimiento", "Emergencia familiar"

### 3. **schedule** (JSON)

Horarios de atención del negocio por día de la semana.

**Estructura:**

```json
{
  "lunes": { "enabled": true, "open": "09:00", "close": "18:00" },
  "martes": { "enabled": true, "open": "09:00", "close": "18:00" },
  "miercoles": { "enabled": true, "open": "09:00", "close": "18:00" },
  "jueves": { "enabled": true, "open": "09:00", "close": "18:00" },
  "viernes": { "enabled": true, "open": "09:00", "close": "20:00" },
  "sabado": { "enabled": true, "open": "10:00", "close": "14:00" },
  "domingo": { "enabled": false, "open": "10:00", "close": "14:00" }
}
```

### 4. **specialClosedDays** (JSON)

Array de días especiales de cierre.

**Estructura:**

```json
[
  { "date": "2025-12-25", "reason": "Navidad" },
  { "date": "2025-01-01", "reason": "Año Nuevo" }
]
```

### 5. **acceptOrdersOutsideHours** (Boolean)

Indica si acepta pedidos fuera del horario. **Valor por defecto**: `false`

### 6. **preparationTime** (Int?)

Tiempo estimado de preparación en minutos. **Valor por defecto**: `30`

## 🛠️ Utilidades (lib/business-hours.ts)

- `isBusinessOpen()` - Verifica si está abierto ahora
- `getBusinessHoursMessage()` - Mensaje del horario actual
- `formatFullSchedule()` - Formatea horario completo
- `getCurrentDayOfWeek()` - Día actual en español
- `isValidTimeFormat()` - Valida formato HH:mm
- `isValidTimeRange()` - Valida rango de horas
- `defaultSchedule` - Horario por defecto (L-V 9:00-18:00)

## 🚀 Migración

```bash
npx prisma migrate dev
```

---

**Fecha**: 22 de Octubre, 2025
**Estado**: ✅ Implementado
