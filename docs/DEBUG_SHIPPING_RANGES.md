# Debug Guide - Shipping Ranges System

## 🔍 Cómo Probar el Sistema

### 1. Probar Creación de Negocio con Rangos

**Pasos:**

1. Ir a http://localhost:3000/dashboard/negocios
2. Click en "Nuevo Negocio"
3. Llenar campos básicos (nombre, rubro)
4. Activar checkbox "El negocio ofrece servicio de envío a domicilio"
5. Ingresar "Distancia Máxima de Envío": 10 km
6. En "Rangos de Costo de Envío":
   - **Opción A - Costo Único:**
     - Marcar checkbox "Costo Único"
     - Ingresar costo: 1000
   - **Opción B - Rangos Múltiples:**
     - Dejar checkbox desmarcado
     - Rango 1: 0-2 km = $500
     - Click "Agregar Rango"
     - Rango 2: 2-5 km = $800
     - Click "Agregar Rango"
     - Rango 3: 5-10 km = $1200
7. Click "Crear Negocio"

**Verificar en Console (F12):**

```javascript
// El payload debería incluir:
{
  "shippingRanges": [
    { "fromKm": 0, "toKm": 2, "cost": 500 },
    { "fromKm": 2, "toKm": 5, "cost": 800 },
    { "fromKm": 5, "toKm": 10, "cost": 1200 }
  ],
  "maxShippingDistance": 10
}
```

### 2. Probar Edición de Negocio

**Pasos:**

1. En la lista de negocios, click en "Editar"
2. Verificar que los rangos existentes se cargan correctamente
3. Modificar rangos:
   - Cambiar costos
   - Agregar nuevo rango
   - Eliminar rango
4. Click "Actualizar Negocio"

**Verificar:**

- Los cambios se reflejan inmediatamente
- No se pierden datos al cerrar y reabrir el dialog

### 3. Verificar en Base de Datos

**Usando Prisma Studio:**

```bash
npx prisma studio
```

1. Abrir tabla `Business`
2. Buscar el negocio creado/editado
3. Verificar campos:
   - `maxShippingDistance`: número (ej: 10)
   - `shippingRanges`: JSON array con estructura correcta

**Usando SQL directo:**

```sql
SELECT
  name,
  "maxShippingDistance",
  "shippingRanges"
FROM "Business"
WHERE "hasShipping" = true;
```

### 4. Verificar en Página del Negocio

**Pasos:**

1. Ir a la página pública del negocio: http://localhost:3000/businesses/[slug]
2. Verificar sección "Envíos a Domicilio"
3. Click en "Ver tarifas"
4. Verificar que muestra correctamente:
   - Distancia máxima
   - Rangos con precios
5. Agregar productos al carrito
6. Seleccionar "Envío a domicilio"
7. Click en el mapa para seleccionar ubicación
8. **Verificar cálculo automático:**
   - Se muestra distancia calculada
   - Se muestra costo según el rango
   - Si está fuera de rango, muestra alerta

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "Los rangos no se guardan"

**Síntomas:**

- Al crear/editar negocio, los rangos desaparecen
- La base de datos muestra `null` en `shippingRanges`

**Verificación:**

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Filtrar por `/api/businesses`
4. Ver el payload del POST/PUT
5. Verificar que incluye `shippingRanges`

**Causa posible:**

- ❌ API no está recibiendo los campos
- ✅ **SOLUCIONADO**: Agregados `maxShippingDistance` y `shippingRanges` a APIs

**Solución aplicada:**

```typescript
// En /api/businesses/route.ts y /api/businesses/[id]/route.ts
const {
  // ... otros campos
  maxShippingDistance,
  shippingRanges,
  // ...
} = body;

// En create:
maxShippingDistance: hasShipping && maxShippingDistance ? maxShippingDistance : null,
shippingRanges: hasShipping && shippingRanges ? shippingRanges : null,

// En update:
maxShippingDistance: maxShippingDistance === undefined
  ? existingBusiness.maxShippingDistance
  : hasShipping && maxShippingDistance ? maxShippingDistance : null,
shippingRanges: shippingRanges === undefined
  ? existingBusiness.shippingRanges
  : hasShipping && shippingRanges ? shippingRanges : null,
```

### Problema 2: "No puedo agregar rangos"

**Síntomas:**

- Botón "Agregar Rango" deshabilitado
- No pasa nada al hacer click

**Causas posibles:**

1. Checkbox "Costo Único" está marcado
2. Ya se alcanzó la distancia máxima
3. Último rango tiene `toKm = null`

**Solución:**

- Desmarcar "Costo Único" para habilitar múltiples rangos
- Asegurar que el último rango no alcanza `maxShippingDistance`

### Problema 3: "Error de validación al guardar"

**Síntomas:**

- Panel rojo con errores
- Ejemplos:
  - "El primer rango debe comenzar en 0 km"
  - "Hay un gap entre el rango X y el rango Y"

**Solución:**

1. Revisar que primer rango empieza en 0
2. Verificar que no hay gaps entre rangos
3. El componente auto-conecta rangos, pero si editas manualmente puede haber problemas

### Problema 4: "Los rangos no se cargan al editar"

**Síntomas:**

- Al abrir dialog de edición, los rangos aparecen vacíos
- Se pierde la configuración existente

**Verificación:**

```typescript
// En EditarNegocioDialog.tsx, verificar:
const [shippingRanges, setShippingRanges] = useState<ShippingRange[]>(
  (business.shippingRanges as ShippingRange[]) ||
    createFlatShippingRate(business.shippingCost || 0)
);

// useEffect debe actualizar cuando cambie business:
useEffect(() => {
  setShippingRanges(
    (business.shippingRanges as ShippingRange[]) ||
      createFlatShippingRate(business.shippingCost || 0)
  );
}, [business]);
```

### Problema 5: "El cálculo de costo no funciona en la página del negocio"

**Síntomas:**

- Al seleccionar ubicación en el mapa, no se calcula el costo
- Muestra "Calculando..." indefinidamente

**Verificación:**

1. Abrir Console (F12)
2. Buscar errores de OSRM
3. Verificar que `OrderMapSelector` recibe las props correctas:

```tsx
<OrderMapSelector
  onLocationSelect={setDeliveryLocation}
  businessLocation={{ lat: business.lat, lng: business.lng }}
  shippingRanges={business.shippingRanges as ShippingRange[] | null}
  maxShippingDistance={business.maxShippingDistance}
  onShippingCostCalculated={(cost, distance) => {
    setCalculatedShippingCost(cost);
    setDeliveryDistance(distance);
  }}
/>
```

## 📋 Checklist de Verificación Completa

### Backend (APIs)

- [x] POST `/api/businesses` acepta `maxShippingDistance`
- [x] POST `/api/businesses` acepta `shippingRanges`
- [x] PUT `/api/businesses/[id]` acepta `maxShippingDistance`
- [x] PUT `/api/businesses/[id]` acepta `shippingRanges`
- [x] Campos se guardan correctamente en la base de datos
- [x] GET endpoints retornan los campos correctamente

### Frontend - Formularios

- [ ] NuevoNegocioDialog muestra ShippingRangesEditor
- [ ] EditarNegocioDialog carga rangos existentes
- [ ] Checkbox "Costo Único" funciona correctamente
- [ ] Agregar/eliminar rangos funciona
- [ ] Validación en tiempo real funciona
- [ ] Submit envía datos correctamente

### Frontend - Visualización

- [ ] BusinessDetailClient muestra rangos en tarjeta de envío
- [ ] ShippingRangesDisplay muestra dialog con tarifas
- [ ] OrderMapSelector calcula costo automáticamente
- [ ] Se muestra alerta si está fuera de rango
- [ ] Costo calculado se usa en el total del pedido

### Base de Datos

- [ ] Campos `maxShippingDistance` y `shippingRanges` existen
- [ ] Migración aplicada correctamente
- [ ] Datos se persisten correctamente
- [ ] JSON structure es correcta

## 🔧 Herramientas de Debug

### 1. Console Logs

**En el componente ShippingRangesEditor:**

```typescript
console.log("Current ranges:", ranges);
console.log("Is flat rate:", isFlatRate);
console.log("Can add range:", canAddRange);
```

**En los formularios (NuevoNegocioDialog/EditarNegocioDialog):**

```typescript
// Antes del fetch
console.log("Submitting data:", {
  shippingRanges,
  maxShippingDistance,
  hasShipping: formData.hasShipping,
});
```

**En las APIs:**

```typescript
// En route.ts
console.log("Received body:", body);
console.log("maxShippingDistance:", maxShippingDistance);
console.log("shippingRanges:", shippingRanges);
```

### 2. React DevTools

1. Instalar extensión React DevTools
2. Inspeccionar componente EditarNegocioDialog
3. Ver state:
   - `shippingRanges`
   - `formData.maxShippingDistance`
   - `formData.hasShipping`

### 3. Network Inspector

**Payload esperado en POST/PUT:**

```json
{
  "name": "Pizzería Don José",
  "hasShipping": true,
  "maxShippingDistance": 10,
  "shippingRanges": [
    { "fromKm": 0, "toKm": 2, "cost": 500 },
    { "fromKm": 2, "toKm": 5, "cost": 800 },
    { "fromKm": 5, "toKm": 10, "cost": 1200 }
  ]
}
```

### 4. Prisma Studio

```bash
npx prisma studio
```

- Verificar directamente en la base de datos
- Ver estructura JSON completa
- Editar manualmente si es necesario para probar

## 📝 Ejemplo de Test Manual Completo

### Caso 1: Negocio Nuevo con Rangos Múltiples

1. ✅ Crear negocio
2. ✅ Activar envío a domicilio
3. ✅ Distancia máxima: 8 km
4. ✅ Desmarcar "Costo Único"
5. ✅ Agregar rango 0-3 km: $600
6. ✅ Agregar rango 3-6 km: $900
7. ✅ Agregar rango 6-8 km: $1300
8. ✅ Guardar

**Verificar:**

- Base de datos tiene 3 rangos
- Página del negocio muestra "Ver tarifas"
- Dialog muestra los 3 rangos correctamente
- Seleccionar ubicación a 4 km calcula $900
- Seleccionar ubicación a 9 km muestra "fuera de rango"

### Caso 2: Editar Negocio y Cambiar a Costo Único

1. ✅ Abrir negocio existente para editar
2. ✅ Verificar que carga rangos existentes
3. ✅ Marcar checkbox "Costo Único"
4. ✅ Ingresar costo: $1000
5. ✅ Guardar

**Verificar:**

- Base de datos tiene 1 solo rango con toKm = null o maxDistance
- Página muestra tarifa única
- Cualquier distancia dentro del máximo cobra $1000

### Caso 3: Desactivar Envío

1. ✅ Editar negocio
2. ✅ Desmarcar "El negocio ofrece servicio de envío a domicilio"
3. ✅ Guardar

**Verificar:**

- `maxShippingDistance` = null
- `shippingRanges` = null
- Página no muestra opción de envío

## 🎯 Métricas de Éxito

El sistema funciona correctamente cuando:

✅ **Formularios:**

- Se pueden crear negocios con rangos
- Se pueden editar rangos existentes
- No se pierden datos al guardar
- Validación muestra errores claros

✅ **Base de Datos:**

- Campos se guardan en formato JSON correcto
- No hay nulls inesperados
- Estructura de rangos es válida

✅ **Visualización:**

- Tarifas se muestran correctamente al público
- Cálculo de costo es automático y preciso
- Alertas de fuera de rango funcionan

✅ **UX:**

- Checkbox "Costo Único" es intuitivo
- Agregar/eliminar rangos es fácil
- No hay comportamientos inesperados
