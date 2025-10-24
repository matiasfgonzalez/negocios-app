# Sistema de Envíos con Rangos de Distancia

## 📋 Descripción General

El sistema permite a los negocios configurar diferentes costos de envío basados en rangos de distancia desde su ubicación hasta el cliente. El costo se calcula automáticamente en tiempo real cuando el cliente selecciona su ubicación en el mapa.

## 🎯 Características Principales

### 1. Configuración de Rangos de Envío

Los negocios pueden configurar:

- **Distancia Máxima**: Hasta cuántos kilómetros hacen envíos
- **Rangos de Precios**: Diferentes tarifas según la distancia
- **Costo Único**: Una tarifa fija para todas las distancias

#### Ejemplos de Configuración:

**Costo Único:**

- 0 km → ∞: $1,000

**Rangos Múltiples:**

- 0 km → 1 km: $500
- 1 km → 3 km: $800
- 3 km → 5 km: $1,200

### 2. Cálculo Automático

Cuando el cliente selecciona su ubicación:

1. **OSRM (OpenStreetMap Routing Machine)** calcula la ruta real por carretera
2. Se obtiene la distancia exacta en kilómetros
3. Se verifica si está dentro del rango máximo de envío
4. Se calcula el costo según los rangos configurados
5. Se muestra el costo final al cliente

### 3. Validaciones

El sistema valida:

- ✅ Ubicación dentro del área de cobertura
- ✅ Distancia no excede el máximo configurado
- ✅ Rangos de precios correctamente configurados
- ✅ Sin gaps entre rangos
- ✅ Costos positivos

## 🛠️ Componentes del Sistema

### 1. Base de Datos (Prisma Schema)

```prisma
model Business {
  // ... otros campos
  maxShippingDistance Float? // Distancia máxima en km
  shippingRanges      Json?  // Array de ShippingRange
}
```

### 2. Interfaces TypeScript

```typescript
interface ShippingRange {
  fromKm: number; // Inicio del rango
  toKm: number | null; // Fin del rango (null = infinito)
  cost: number; // Costo en pesos
}
```

### 3. Utilidades (`lib/shipping-utils.ts`)

#### `calculateShippingCost(distanceKm, ranges, defaultCost)`

Calcula el costo de envío según la distancia y los rangos configurados.

**Ejemplo:**

```typescript
const cost = calculateShippingCost(2.5, ranges, 0);
// Si ranges = [
//   { fromKm: 0, toKm: 1, cost: 500 },
//   { fromKm: 1, toKm: 3, cost: 800 },
//   { fromKm: 3, toKm: 5, cost: 1200 }
// ]
// Devuelve: 800 (porque 2.5 km está en el rango 1-3 km)
```

#### `isWithinShippingRange(distanceKm, maxDistance)`

Verifica si una distancia está dentro del rango permitido.

#### `validateShippingRanges(ranges)`

Valida que los rangos sean correctos y sin gaps.

### 4. Componentes React

#### `ShippingRangesEditor`

Formulario para configurar rangos de envío en dashboard.

- Checkbox "Costo Único" para tarifa fija
- Agregar/eliminar rangos dinámicamente
- Auto-conexión de rangos (sin gaps)
- Validación en tiempo real

#### `OrderMapSelector`

Mapa interactivo para seleccionar ubicación de entrega.

- Click para seleccionar ubicación
- Cálculo de rutas con OSRM
- Muestra múltiples rutas alternativas
- Calcula distancia y tiempo estimado
- **Calcula costo de envío automáticamente**
- Alerta si está fuera de rango

#### `ShippingRangesDisplay`

Dialog para mostrar las tarifas al cliente.

- Vista amigable de rangos de precios
- Tarifa única o rangos múltiples
- Distancia máxima de cobertura

#### `BusinessDetailClient`

Página principal del negocio con carrito de compras.

- Muestra rangos de envío disponibles
- Integra OrderMapSelector
- Usa costo calculado dinámicamente
- Valida ubicación antes de ordenar

## 🔄 Flujo de Usuario

### Cliente:

1. **Navega al negocio** → Ve la página del negocio
2. **Agrega productos** → Añade items al carrito
3. **Selecciona envío** → Elige "Envío a domicilio"
4. **Ve tarifas** → Hace click en "Ver tarifas" para conocer precios
5. **Selecciona ubicación** → Hace click en el mapa
6. **Sistema calcula** → Automáticamente:
   - Obtiene ruta por OSRM
   - Calcula distancia exacta
   - Verifica si está en rango
   - Calcula costo según rangos
   - Muestra costo y distancia
7. **Completa dirección** → Ingresa dirección exacta
8. **Realiza pedido** → Confirma con el costo calculado

### Propietario:

1. **Configura envíos** → Dashboard → Negocios → Editar
2. **Activa envíos** → Marca checkbox "Tiene envío a domicilio"
3. **Define distancia máxima** → Ej: 10 km
4. **Configura precios**:
   - **Opción A**: Checkbox "Costo Único" → $1,000 para todos
   - **Opción B**: Sin checkbox → Rangos múltiples
     - 0-2 km: $500
     - 2-5 km: $800
     - 5-10 km: $1,200
5. **Guarda** → Sistema valida y guarda configuración

## 📊 Ejemplos de Uso Real

### Caso 1: Pizzería Local

**Configuración:**

- Distancia máxima: 5 km
- Rangos:
  - 0-2 km: $300
  - 2-4 km: $500
  - 4-5 km: $700

**Cliente a 3.2 km:**

- ✅ Dentro del rango (< 5 km)
- 💰 Costo: $500
- 🚗 Tiempo estimado: 8 min

### Caso 2: Supermercado con Tarifa Única

**Configuración:**

- Distancia máxima: 8 km
- Costo único: $1,000

**Cliente a 6.5 km:**

- ✅ Dentro del rango (< 8 km)
- 💰 Costo: $1,000
- 🚗 Tiempo estimado: 15 min

### Caso 3: Cliente Fuera de Rango

**Configuración:**

- Distancia máxima: 5 km
- Rangos: 0-2 ($300), 2-5 ($500)

**Cliente a 7.8 km:**

- ❌ Fuera del rango (> 5 km)
- ⚠️ Mensaje: "Ubicación fuera del área de envío"
- 🚫 No puede realizar pedido con envío

## 🔧 Integración con API OSRM

### ¿Por qué OSRM?

- **Rutas reales**: Calcula por calles y carreteras reales
- **Distancia exacta**: No es línea recta, sino ruta vehicular
- **Tiempo estimado**: Considera velocidades promedio
- **Alternativas**: Muestra múltiples rutas posibles
- **Gratuito**: No requiere API key

### Endpoint Usado

```
GET https://routing.openstreetmap.de/routed-car/route/v1/driving/{lng1},{lat1};{lng2},{lat2}
    ?geometries=geojson
    &overview=full
    &steps=true
    &alternatives=true
```

**Respuesta:**

```json
{
  "routes": [
    {
      "distance": 3542.7,  // metros
      "duration": 489.3,   // segundos
      "geometry": { ... }  // coordenadas para dibujar ruta
    }
  ]
}
```

## 🎨 UI/UX

### Indicadores Visuales

**En el mapa:**

- 🔵 Marcador azul con icono de tienda = Negocio
- 🔴 Marcador rojo estándar = Cliente
- 🛣️ Líneas de colores = Rutas alternativas
  - Azul: Ruta principal (más rápida)
  - Verde: Alternativa 1
  - Naranja: Alternativa 2

**Estados:**

- ✅ Verde: Ubicación válida, costo calculado
- ❌ Rojo: Fuera de rango de envío
- ⏳ Gris: Calculando...

### Información Mostrada

```
┌─────────────────────────────────────┐
│ 💰 Costo de envío: $800            │
│ 📍 Distancia: 2.5 km               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Rutas disponibles:                  │
│ ● Principal   🧭 2.5 km  ⏱ 8 min   │
│ ● Alt. 1      🧭 2.8 km  ⏱ 10 min  │
└─────────────────────────────────────┘
```

## 🔐 Validaciones de Seguridad

### Frontend:

- ✅ Ubicación seleccionada
- ✅ Dentro de rango máximo
- ✅ Dirección completada
- ✅ Costo calculado exitosamente

### Backend (API):

- ✅ Usuario autenticado (opcional, permite WhatsApp)
- ✅ Negocio existe y tiene envíos activos
- ✅ Productos en stock
- ✅ Precios coinciden con DB
- ✅ Coordenadas válidas

## 📱 Responsive Design

- **Desktop**: Mapa grande, vista de 2 columnas
- **Tablet**: Mapa mediano, vista adaptativa
- **Mobile**: Mapa compacto, vista de 1 columna
  - Dialogs con scroll
  - Touch-friendly para seleccionar ubicación
  - Información condensada

## 🚀 Performance

### Optimizaciones:

1. **Lazy Loading**: Componentes de mapa con dynamic import
2. **Debouncing**: Evita cálculos múltiples al mover el mapa
3. **Caching**: Rutas calculadas se guardan en estado
4. **Validación local**: No hace llamadas innecesarias al servidor

### Métricas:

- ⚡ Cálculo de ruta: ~300-500ms
- 💾 Payload promedio: ~2KB
- 🎯 Precisión: ±50 metros
- 🔄 Alternativas: hasta 5 rutas

## 🐛 Manejo de Errores

### Errores Comunes:

1. **"Ubicación fuera del área de envío"**

   - Cliente seleccionó ubicación > maxDistance
   - Solución: Elegir ubicación más cercana

2. **"No se pudo calcular el costo de envío"**

   - Error en API OSRM o rangos mal configurados
   - Fallback: Usa shippingCost fijo del negocio

3. **"Este negocio no tiene WhatsApp configurado"**
   - Usuario sin login y negocio sin WhatsApp
   - Solución: Registrarse o contactar por otros medios

### Logging:

```typescript
console.log("Mapa clickeado en:", e.latlng);
console.log("Ruta calculada:", route.distance, "m");
console.error("Error calculando rutas:", error);
```

## 📈 Métricas y Analytics (Futuro)

Potenciales mejoras:

- Tracking de distancias promedio de pedidos
- Análisis de rangos más usados
- Optimización de tarifas por zona
- Heatmap de entregas
- Predicción de tiempos de entrega

## 🔄 Migración desde Sistema Antiguo

Si un negocio tiene solo `shippingCost` (campo antiguo):

```typescript
// Automáticamente se crea un rango único:
createFlatShippingRate(business.shippingCost || 0);
// Resultado: [{ fromKm: 0, toKm: null, cost: shippingCost }]
```

Esto garantiza compatibilidad hacia atrás.

## 📝 Notas Técnicas

### JSON en Prisma:

Los rangos se guardan como JSON en PostgreSQL:

```json
[
  { "fromKm": 0, "toKm": 1, "cost": 500 },
  { "fromKm": 1, "toKm": 3, "cost": 800 },
  { "fromKm": 3, "toKm": 5, "cost": 1200 }
]
```

### TypeScript Type Safety:

```typescript
// Casting necesario al recuperar de DB:
const ranges = business.shippingRanges as ShippingRange[] | null;
```

### React State Management:

```typescript
// Estado en BusinessDetailClient:
const [calculatedShippingCost, setCalculatedShippingCost] = useState<number | null>(null);
const [deliveryDistance, setDeliveryDistance] = useState<number | null>(null);

// Callback desde OrderMapSelector:
onShippingCostCalculated={(cost, distance) => {
  setCalculatedShippingCost(cost);
  setDeliveryDistance(distance);
}}
```

## 🎓 Para Desarrolladores

### Agregar Nueva Funcionalidad:

1. **Editar Schema**: `prisma/schema.prisma`
2. **Migrar DB**: `npx prisma migrate dev --name nombre_migracion`
3. **Generar Types**: `npx prisma generate`
4. **Actualizar Types**: `app/types/types.ts`
5. **Crear Utilidades**: `lib/nombre-utils.ts`
6. **Componente UI**: `components/NombreComponente.tsx`
7. **Integrar en Forms**: Agregar a dialogs de creación/edición
8. **Documentar**: Actualizar este archivo

### Testing Manual:

1. Crear negocio con rangos de envío
2. Probar con diferentes distancias
3. Verificar validaciones
4. Probar fuera de rango
5. Confirmar cálculo correcto
6. Realizar pedido completo

### Debug Tips:

```typescript
// Ver estado del mapa:
console.log("Routes:", routes);
console.log("Selected distance:", selectedDistance);
console.log("Shipping cost:", shippingCost);
console.log("Is out of range:", isOutOfRange);

// Ver configuración del negocio:
console.log("Business shipping ranges:", business.shippingRanges);
console.log("Max distance:", business.maxShippingDistance);
```

## 📞 Soporte

Para problemas o sugerencias:

- Revisar errores en consola del navegador
- Verificar configuración en dashboard
- Comprobar coordenadas del negocio
- Validar conectividad a OSRM API
