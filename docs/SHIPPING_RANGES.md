# Sistema de Rangos de Envío

## Descripción

El sistema de rangos de envío permite a los negocios configurar diferentes costos de envío basados en la distancia de entrega. Esto proporciona flexibilidad para ajustar los precios según la ubicación del cliente.

## Campos del Modelo Business

### `maxShippingDistance` (Float | null)

- **Descripción**: Distancia máxima en kilómetros que el negocio acepta para realizar envíos
- **null**: Sin límite de distancia
- **Ejemplo**: `5.0` (acepta envíos hasta 5 km a la redonda)

### `shippingRanges` (JSON)

- **Descripción**: Array de objetos que definen los rangos de distancia y sus costos
- **Estructura**:

```typescript
interface ShippingRange {
  fromKm: number; // Desde (kilómetros)
  toKm: number | null; // Hasta (kilómetros), null = infinito
  cost: number; // Costo del envío
}
```

### `shippingCost` (Float | null) - DEPRECADO

- **Nota**: Se mantiene por compatibilidad, usar `shippingRanges` en su lugar

## Ejemplos de Configuración

### Ejemplo 1: Costo Único (Sin importar la distancia)

```json
[
  {
    "fromKm": 0,
    "toKm": null,
    "cost": 1500
  }
]
```

- **Distancia máxima**: null (sin límite) o cualquier valor
- **Resultado**: $1500 de envío sin importar la distancia

### Ejemplo 2: Rangos Escalonados

```json
[
  {
    "fromKm": 0,
    "toKm": 1,
    "cost": 1000
  },
  {
    "fromKm": 1,
    "toKm": 2,
    "cost": 1500
  },
  {
    "fromKm": 2,
    "toKm": 4,
    "cost": 2000
  },
  {
    "fromKm": 4,
    "toKm": null,
    "cost": 3000
  }
]
```

- **0-1 km**: $1000
- **1-2 km**: $1500
- **2-4 km**: $2000
- **4+ km**: $3000

### Ejemplo 3: Con Límite de Distancia

```json
[
  {
    "fromKm": 0,
    "toKm": 2,
    "cost": 800
  },
  {
    "fromKm": 2,
    "toKm": 5,
    "cost": 1200
  }
]
```

- **Distancia máxima**: 5 km
- **0-2 km**: $800
- **2-5 km**: $1200
- **5+ km**: Rechazado (fuera del rango)

## Uso en el Código

### 1. Calcular Costo de Envío

```typescript
import { calculateShippingCost, calculateDistance } from "@/lib/shipping-utils";
import { ShippingRange } from "@/lib/shipping-utils";

// Obtener rangos del negocio
const ranges = business.shippingRanges as ShippingRange[] | null;

// Calcular distancia entre negocio y cliente
const distanceKm = calculateDistance(
  business.lat!,
  business.lng!,
  orderLat,
  orderLng
);

// Calcular costo
const shippingCost = calculateShippingCost(
  distanceKm,
  ranges,
  business.shippingCost || 0 // Fallback al valor antiguo
);

if (shippingCost === null) {
  // La distancia excede el máximo permitido
  console.log("Entrega fuera del rango de envío");
} else {
  console.log(`Costo de envío: $${shippingCost}`);
}
```

### 2. Verificar Rango de Envío

```typescript
import { isWithinShippingRange, calculateDistance } from "@/lib/shipping-utils";

const distanceKm = calculateDistance(
  business.lat!,
  business.lng!,
  orderLat,
  orderLng
);

const canDeliver = isWithinShippingRange(
  distanceKm,
  business.maxShippingDistance
);

if (!canDeliver) {
  console.log(
    `Ubicación fuera del rango máximo de ${business.maxShippingDistance} km`
  );
}
```

### 3. Validar Rangos

```typescript
import { validateShippingRanges, ShippingRange } from "@/lib/shipping-utils";

const ranges: ShippingRange[] = [
  { fromKm: 0, toKm: 1, cost: 1000 },
  { fromKm: 1, toKm: 2, cost: 1500 },
];

const { valid, errors } = validateShippingRanges(ranges);

if (!valid) {
  console.error("Errores en los rangos:", errors);
}
```

## Componente de Edición

### ShippingRangesEditor

Componente visual para que los propietarios configuren sus rangos de envío:

```tsx
import ShippingRangesEditor from "@/components/ShippingRangesEditor";
import { ShippingRange } from "@/lib/shipping-utils";

// En tu formulario
const [shippingRanges, setShippingRanges] = useState<ShippingRange[]>([
  { fromKm: 0, toKm: null, cost: 1500 },
]);

<ShippingRangesEditor
  ranges={shippingRanges}
  onChange={setShippingRanges}
  maxDistance={business.maxShippingDistance}
/>;
```

### Características del Editor:

- ✅ Agregar/eliminar rangos
- ✅ Botón "Costo Único" para tarifa plana
- ✅ Validación en tiempo real
- ✅ Vista previa formateada
- ✅ Soporte para "infinito" (∞)
- ✅ Muestra la distancia máxima configurada

## Reglas de Validación

1. **El primer rango debe empezar en 0 km**
2. **No puede haber gaps entre rangos**
   - Malo: 0-1, 2-3 (falta el rango 1-2)
   - Bueno: 0-1, 1-2, 2-3
3. **Solo el último rango puede tener `toKm: null`**
4. **`fromKm` debe ser menor que `toKm`**
5. **Todos los costos deben ser positivos**

## Flujo de Trabajo Completo

### 1. Propietario configura el negocio:

```typescript
await prisma.business.update({
  where: { id: businessId },
  data: {
    hasShipping: true,
    maxShippingDistance: 5, // 5 km máximo
    shippingRanges: [
      { fromKm: 0, toKm: 2, cost: 1000 },
      { fromKm: 2, toKm: 5, cost: 1500 },
    ],
  },
});
```

### 2. Cliente selecciona ubicación de entrega:

```typescript
const distanceKm = calculateDistance(
  business.lat!,
  business.lng!,
  selectedLat,
  selectedLng
);
```

### 3. Sistema valida y calcula:

```typescript
// Validar distancia máxima
if (!isWithinShippingRange(distanceKm, business.maxShippingDistance)) {
  return { error: "Ubicación fuera del rango de envío" };
}

// Calcular costo
const shippingCost = calculateShippingCost(
  distanceKm,
  business.shippingRanges as ShippingRange[],
  0
);

if (shippingCost === null) {
  return { error: "No se pudo calcular el costo de envío" };
}

// Crear orden con el costo calculado
const total = subtotal + shippingCost;
```

## Migración desde el Sistema Anterior

Para negocios que usaban `shippingCost` simple:

```typescript
// Convertir costo simple a rango
const oldCost = business.shippingCost || 0;
const newRanges = [{ fromKm: 0, toKm: null, cost: oldCost }];

await prisma.business.update({
  where: { id: businessId },
  data: {
    shippingRanges: newRanges,
  },
});
```

## Consideraciones

- **Rendimiento**: El cálculo de distancia usa la fórmula de Haversine (precisa para distancias cortas)
- **Precisión**: Las distancias se redondean a 2 decimales
- **Compatibilidad**: Se mantiene `shippingCost` para backward compatibility
- **Formato de moneda**: Los costos se formatean con `toLocaleString("es-AR")`

## Próximas Mejoras

- [ ] Integrar con OrderMapSelector para mostrar costo en tiempo real
- [ ] Agregar ShippingRangesEditor a EditarNegocioDialog
- [ ] Agregar ShippingRangesEditor a NuevoNegocioDialog
- [ ] Mostrar costo de envío en BusinessDetailClient antes de confirmar
- [ ] Agregar tabla de rangos en la vista pública del negocio
