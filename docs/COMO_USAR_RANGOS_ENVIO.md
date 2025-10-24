# Cómo Usar el Editor de Rangos de Envío

## Ubicación

El editor de rangos de envío se encuentra en:

- **Crear nuevo negocio**: Después de activar "El negocio ofrece servicio de envío a domicilio"
- **Editar negocio**: En la misma sección de envío

## Pasos para Configurar Rangos

### Opción 1: Costo Único (Tarifa Plana)

1. Haz clic en el botón **"Costo Único"**
2. Se creará automáticamente un rango de 0 km a ∞ (infinito)
3. Edita el campo **"Costo ($)"** con el valor deseado
4. Listo! Todos los envíos tendrán el mismo costo

**Ejemplo:**

```
0 km → ∞ : $1500
```

Todos los envíos cuestan $1500, sin importar la distancia.

---

### Opción 2: Rangos Múltiples (Costos por Distancia)

#### 1. Crear el Primer Rango

1. Haz clic en **"+ Agregar Rango"**
2. Se crea el primer rango que empieza en **0 km**
3. Define el campo **"Hasta (km)"**: Por ejemplo, `1` para 0-1 km
4. Define el **"Costo ($)"**: Por ejemplo, `1000`

**Estado actual:**

```
Rango 1: 0 km → 1 km : $1000
```

#### 2. Agregar Segundo Rango

1. Haz clic nuevamente en **"+ Agregar Rango"**
2. El nuevo rango empieza automáticamente donde terminó el anterior (**1 km**)
3. Define **"Hasta (km)"**: Por ejemplo, `2` para 1-2 km
4. Define el **"Costo ($)"**: Por ejemplo, `1500`

**Estado actual:**

```
Rango 1: 0 km → 1 km : $1000
Rango 2: 1 km → 2 km : $1500
```

#### 3. Agregar Más Rangos

Repite el proceso. Cada nuevo rango empieza donde termina el anterior.

**Ejemplo completo:**

```
Rango 1: 0 km → 1 km   : $1000
Rango 2: 1 km → 2 km   : $1500
Rango 3: 2 km → 4 km   : $2000
Rango 4: 4 km → ∞      : $3000
```

#### 4. Configurar el Último Rango como "Sin Límite"

El último rango puede tener:

- Un valor específico en "Hasta (km)": Por ejemplo `5` para aceptar hasta 5 km
- Infinito (∞): Haz clic en el botón **∞** o deja el campo vacío

---

## Características Importantes

### 📌 Campo "Desde (km)" - Automático

- El campo **"Desde (km)"** está **deshabilitado** (gris)
- Se calcula automáticamente basándose en el rango anterior
- No puedes editarlo manualmente
- Esto garantiza que no haya espacios vacíos entre rangos

### 📌 Campo "Hasta (km)" - Editable

- Define dónde termina este rango
- El siguiente rango empezará en este valor
- Si modificas este valor, el siguiente rango se ajusta automáticamente
- El último rango puede ser infinito (∞)

### 📌 Validaciones Automáticas

El sistema valida:

- ✅ El primer rango debe empezar en 0 km
- ✅ No puede haber espacios vacíos entre rangos
- ✅ Cada "Desde" debe ser menor que su "Hasta"
- ✅ Los costos deben ser positivos
- ✅ Solo el último rango puede tener infinito (∞)

Si hay errores, aparecerá un mensaje rojo indicando qué corregir.

### 📌 Vista Previa

Debajo de los rangos verás una vista previa en color verde mostrando:

```
✓ Vista previa:
• 0.0 - 1.0 km: $1.000,00
• 1.0 - 2.0 km: $1.500,00
• 2.0 - ∞ km: $2.000,00
```

Esta vista previa se actualiza en tiempo real mientras editas.

---

## Ejemplos Prácticos

### Ejemplo 1: Negocio Local (Solo área cercana)

```
Distancia máxima: 3 km

Rango 1: 0 km → 1 km   : $800
Rango 2: 1 km → 2 km   : $1200
Rango 3: 2 km → 3 km   : $1500
```

**Resultado:**

- 0-1 km: $800
- 1-2 km: $1200
- 2-3 km: $1500
- Más de 3 km: Rechazado (fuera del rango)

---

### Ejemplo 2: Delivery Amplio

```
Distancia máxima: (vacío = sin límite)

Rango 1: 0 km → 2 km   : $1000
Rango 2: 2 km → 5 km   : $1800
Rango 3: 5 km → ∞      : $2500
```

**Resultado:**

- 0-2 km: $1000
- 2-5 km: $1800
- Más de 5 km: $2500

---

### Ejemplo 3: Tarifa Plana + Límite

```
Distancia máxima: 10 km

Rango 1: 0 km → ∞      : $1500
```

**Resultado:**

- 0-10 km: $1500 (tarifa fija)
- Más de 10 km: Rechazado

---

## Modificar Rangos Existentes

### Editar un Rango

1. Encuentra el rango que quieres editar
2. Cambia el valor **"Hasta (km)"** o **"Costo ($)"**
3. Si cambias "Hasta", el siguiente rango se ajusta automáticamente
4. La vista previa se actualiza al instante

### Eliminar un Rango

1. Haz clic en el ícono de basura (🗑️) a la derecha del rango
2. El rango se elimina
3. Los rangos siguientes se reajustan automáticamente
4. No puedes eliminar el último rango si es el único

### Convertir a Costo Único

1. Haz clic en **"Costo Único"**
2. Todos los rangos se reemplazan por uno solo
3. El costo se mantiene del primer rango
4. Puedes editar el costo después

---

## Tips y Mejores Prácticas

### ✨ Tip 1: Empieza Simple

- Comienza con 2-3 rangos
- Puedes agregar más después si lo necesitas
- Es más fácil empezar simple y crecer

### ✨ Tip 2: Usa Incrementos Redondos

- 0-1, 1-2, 2-5, 5-10 km
- Más fácil de entender para los clientes
- Más fácil de calcular manualmente

### ✨ Tip 3: Define la Distancia Máxima

- Si solo entregas en un área específica, configúrala
- Evita pedidos que no puedes cumplir
- Los clientes verán el mensaje antes de ordenar

### ✨ Tip 4: Revisa la Vista Previa

- Siempre verifica la vista previa verde
- Asegúrate que los rangos y costos sean correctos
- Es lo que verán tus clientes

### ✨ Tip 5: Considera tus Costos Reales

- Calcula el costo de combustible por km
- Incluye el tiempo del repartidor
- No olvides el desgaste del vehículo

---

## Solución de Problemas

### ❌ "El primer rango debe comenzar en 0 km"

**Causa:** El sistema detectó que el primer rango no empieza en 0.

**Solución:** Elimina todos los rangos y empieza de nuevo, o haz clic en "Costo Único" y luego agrega rangos.

---

### ❌ "Hay un gap entre el rango X y Y"

**Causa:** Hay un espacio vacío entre dos rangos.

**Ejemplo:**

```
Rango 1: 0 → 1 km
Rango 2: 2 → 3 km  ← Falta el rango 1-2 km
```

**Solución:** Edita el "Hasta (km)" del rango anterior para que conecte con el siguiente.

---

### ❌ "El rango X tiene fromKm >= toKm"

**Causa:** El valor "Hasta" es igual o menor que "Desde".

**Ejemplo:**

```
Rango 1: 1 km → 0.5 km  ← ERROR: 1 >= 0.5
```

**Solución:** El valor "Hasta" debe ser mayor que "Desde". Aumenta el valor de "Hasta (km)".

---

### ❌ No puedo agregar más rangos

**Causa:** El último rango tiene infinito (∞).

**Solución:**

1. Ve al último rango
2. Cambia el infinito (∞) por un número específico
3. Ahora podrás agregar un nuevo rango

---

### ❌ El botón "Agregar Rango" está deshabilitado

**Causa:** El último rango ya tiene infinito (∞).

**Solución:** No puedes agregar rangos después de infinito. Si necesitas más rangos, edita el último para que tenga un valor específico en lugar de infinito.

---

## Preguntas Frecuentes

### ❓ ¿Puedo tener un solo rango?

✅ Sí, puedes tener un solo rango con costo único (0 → ∞).

---

### ❓ ¿Cuántos rangos puedo tener?

✅ No hay límite, pero recomendamos entre 3-5 rangos para mantenerlo simple.

---

### ❓ ¿Puedo cambiar los rangos después de crear el negocio?

✅ Sí, puedes editar los rangos en cualquier momento desde "Editar Negocio".

---

### ❓ ¿Qué pasa si no configuro distancia máxima?

✅ Aceptarás pedidos sin límite de distancia. Útil si tienes cobertura amplia.

---

### ❓ ¿Los clientes ven estos rangos?

✅ Sí, cuando seleccionen su ubicación de entrega, verán el costo calculado según la distancia.

---

### ❓ ¿Puedo tener diferentes costos para diferentes días?

❌ No actualmente. Los rangos aplican todos los días por igual. Esta funcionalidad podría agregarse en el futuro.

---

## Flujo Completo: De la Configuración al Pedido

1. **Propietario configura rangos** en Crear/Editar Negocio
2. **Sistema guarda** los rangos en la base de datos
3. **Cliente ve el negocio** y decide ordenar con envío
4. **Cliente selecciona ubicación** en el mapa
5. **Sistema calcula distancia** entre negocio y cliente
6. **Sistema busca el rango** que corresponde a esa distancia
7. **Sistema aplica el costo** de ese rango al total
8. **Cliente ve el total** con costo de envío incluido
9. **Cliente confirma** y realiza el pedido

---

## Soporte

Si tienes problemas con el editor de rangos:

1. Revisa la vista previa verde
2. Lee los mensajes de error rojos
3. Consulta esta guía
4. Intenta usar "Costo Único" primero para probar

¡Listo! Ahora sabes cómo configurar rangos de envío para tu negocio. 🚀
