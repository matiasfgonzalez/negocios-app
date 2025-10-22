# Sistema de Categorías de Productos

## Resumen de Cambios

Se ha implementado un sistema de categorías predefinidas para productos en la aplicación. Las categorías son globales del sistema y pueden ser reutilizadas por todos los negocios.

## Modelo de Datos

### ProductCategory

El nuevo modelo `ProductCategory` tiene los siguientes campos:

- `id`: Identificador único (cuid)
- `name`: Nombre de la categoría (único)
- `description`: Descripción opcional de la categoría
- `icon`: Emoji o icono representativo
- `order`: Orden de visualización (número)
- `products`: Relación con productos
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### Product (actualizado)

Se agregaron los siguientes campos:

- `categoryId`: ID de la categoría (opcional)
- `category`: Relación con ProductCategory

## Categorías Predefinidas (38 categorías)

### Comidas

1. 🥟 **Empanadas** - Empanadas de diferentes sabores y tipos
2. 🍕 **Pizzas** - Pizzas artesanales y tradicionales
3. 🍔 **Hamburguesas** - Hamburguesas caseras y gourmet
4. 🥪 **Sandwiches** - Sandwiches y sándwiches premium
5. 🍝 **Pastas** - Pastas frescas y salsas
6. 🥩 **Carnes** - Cortes de carne y parrilla
7. 🍗 **Pollo** - Platos con pollo y aves
8. 🐟 **Pescados y Mariscos** - Pescados frescos y mariscos
9. 🥗 **Ensaladas** - Ensaladas frescas y saludables
10. 🍲 **Sopas** - Sopas y caldos caseros
11. 🍽️ **Minutas** - Milanesas, papas fritas y minutas

### Postres y Dulces

12. 🍰 **Postres** - Postres, tortas y dulces
13. 🍦 **Helados** - Helados artesanales y comerciales
14. 🥐 **Panadería** - Pan, facturas y productos de panadería
15. 🎂 **Pastelería** - Tortas, tartas y productos de pastelería

### Bebidas

16. 🥤 **Bebidas Sin Alcohol** - Gaseosas, jugos, aguas
17. 🍺 **Bebidas Alcohólicas** - Cervezas, vinos, tragos
18. ☕ **Cafetería** - Café, té e infusiones

### Tipos de Comida

19. 🥞 **Desayunos y Meriendas** - Opciones para desayuno y merienda
20. 🌭 **Comida Rápida** - Comida rápida y snacks
21. 🥬 **Comida Vegana** - Opciones 100% veganas
22. 🥕 **Comida Vegetariana** - Opciones vegetarianas
23. 🥑 **Comida Saludable** - Opciones fitness y saludables

### Cocinas del Mundo

24. 🌍 **Comida Internacional** - Platos de cocinas del mundo
25. 🌮 **Comida Mexicana** - Tacos, burritos y más
26. 🥡 **Comida China** - Platos de cocina china
27. 🍱 **Comida Japonesa** - Sushi, ramen y más
28. 🇮🇹 **Comida Italiana** - Pastas, pizzas y más

### Snacks y Otros

29. 🥜 **Frutos Secos** - Almendras, nueces y frutos secos
30. 🍿 **Snacks** - Papas fritas, palitos y snacks

### Almacén y Supermercado

31. 🛒 **Productos de Almacén** - Productos de almacén y despensa
32. 🍎 **Frutas y Verduras** - Frutas y verduras frescas
33. 🥛 **Lácteos** - Leche, quesos y lácteos
34. 🧀 **Fiambrería** - Jamón, queso, salame y fiambres
35. ❄️ **Congelados** - Productos congelados

### Artículos del Hogar

36. 🧹 **Artículos de Limpieza** - Productos de limpieza para el hogar
37. 🧴 **Artículos de Higiene** - Productos de higiene personal

### Otros

38. 📦 **Otros** - Otros productos y servicios

## Migraciones Aplicadas

1. **20251020212254_add_product_category** - Creación inicial del modelo ProductCategory
2. **20251020212508_make_product_category_global** - Conversión de categorías de específicas por negocio a globales del sistema

## API Endpoints

### GET /api/categories

Obtiene todas las categorías con el conteo de productos asociados.

**Respuesta:**

```json
[
  {
    "id": "cat123",
    "name": "Empanadas",
    "description": "Empanadas de diferentes sabores y tipos",
    "icon": "🥟",
    "order": 1,
    "_count": {
      "products": 15
    },
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
]
```

### POST /api/products

Crear un producto con categoría.

**Body:**

```json
{
  "name": "Empanada de Carne",
  "description": "Empanada de carne cortada a cuchillo",
  "price": 500,
  "stock": 100,
  "businessId": "biz123",
  "categoryId": "cat123" // Opcional
}
```

### PUT /api/products/:id

Actualizar un producto incluyendo su categoría.

**Body:**

```json
{
  "name": "Empanada de Carne Premium",
  "price": 600,
  "categoryId": "cat123" // Opcional
}
```

## Uso en el Frontend

### Obtener y mostrar categorías

```typescript
const categories = await fetch("/api/categories").then((r) => r.json());

// Mostrar con iconos
categories.map((cat) => (
  <div key={cat.id}>
    <span>{cat.icon}</span>
    <span>{cat.name}</span>
    <span>({cat._count.products} productos)</span>
  </div>
));
```

### Selector de categoría en formulario de producto

```typescript
<select name="categoryId">
  <option value="">Sin categoría</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.icon} {cat.name}
    </option>
  ))}
</select>
```

### Filtrar productos por categoría

```typescript
// En la página del negocio
const productsByCategory = products.reduce((acc, product) => {
  const categoryName = product.category?.name || "Sin categoría";
  if (!acc[categoryName]) acc[categoryName] = [];
  acc[categoryName].push(product);
  return acc;
}, {});

// Mostrar agrupados
Object.entries(productsByCategory).map(([category, products]) => (
  <div key={category}>
    <h3>{category}</h3>
    {products.map((product) => (
      <ProductCard key={product.id} {...product} />
    ))}
  </div>
));
```

## Próximos Pasos Sugeridos

1. **UI para gestión de productos**:

   - Agregar selector de categoría en el formulario de crear/editar productos
   - Mostrar la categoría en la lista de productos del dashboard

2. **Página pública del negocio**:

   - Mostrar productos agrupados por categoría
   - Agregar filtros por categoría
   - Mostrar el ícono de la categoría

3. **Mejoras futuras**:
   - Permitir a administradores agregar/editar categorías
   - Agregar subcategorías (ej: Empanadas > Carne > Picante)
   - Agregar imágenes personalizadas por categoría
   - Estadísticas de productos por categoría

## Ejemplos de Uso

### Ejemplo 1: Empanadas

```
Categoría: 🥟 Empanadas
  - Empanada de Carne
  - Empanada de Pollo
  - Empanada de Jamón y Queso
  - Empanada de Verdura
```

### Ejemplo 2: Pizzería

```
Categoría: 🍕 Pizzas
  - Pizza Napolitana
  - Pizza Muzarella
  - Pizza Especial

Categoría: 🥤 Bebidas Sin Alcohol
  - Coca Cola
  - Sprite
  - Agua Mineral

Categoría: 🍰 Postres
  - Flan con dulce de leche
  - Helado
```

### Ejemplo 3: Almacén

```
Categoría: 🛒 Productos de Almacén
  - Arroz
  - Fideos
  - Aceite

Categoría: 🥛 Lácteos
  - Leche
  - Yogurt
  - Queso

Categoría: 🧹 Artículos de Limpieza
  - Lavandina
  - Detergente
```
