# 📊 Dashboard - Documentación

## Estructura Implementada

Se ha creado un sistema de dashboard con tarjetas elegantes que adaptan su contenido según el rol del usuario.

### 🎨 Características del Dashboard

#### Diseño Visual

- **Gradientes modernos**: Fondos con efecto glass-morphism
- **Animaciones suaves**: Hover effects con escala y sombras
- **Dark/Light mode**: Completamente adaptado a ambos temas
- **Responsive**: Funciona perfectamente en móvil, tablet y desktop

#### Sistema de Tarjetas

Cada tarjeta incluye:

- ícono con gradiente distintivo
- Título y descripción
- Flecha de navegación animada
- Hover effect con escala y sombras
- Link directo a la página correspondiente

---

## 📋 Distribución de Funcionalidades por Rol

### 👤 CLIENTE (2 tarjetas)

- **Pedidos**: Ver historial de pedidos realizados
- **Perfil**: Gestionar información personal

### 🏪 PROPIETARIO (4 tarjetas)

- **Negocios**: Administrar su negocio
- **Productos**: Gestionar catálogo de productos
- **Pedidos**: Ver pedidos recibidos
- **Perfil**: Gestionar información personal

### 👑 ADMINISTRADOR (7 tarjetas - acceso total)

- **Usuarios**: Administrar usuarios y permisos
- **Negocios**: Ver y gestionar todos los negocios
- **Productos**: Administrar todos los productos
- **Pedidos**: Ver todos los pedidos del sistema
- **Estadísticas**: Métricas y análisis de rendimiento
- **Reportes**: Generar y descargar reportes
- **Perfil**: Gestionar información personal

---

## 🗂️ Páginas Creadas

### 1. `/dashboard` (Principal)

Muestra tarjetas según el rol del usuario con:

- Header personalizado con saludo
- Grid responsivo de tarjetas
- Footer informativo

### 2. `/dashboard/perfil`

Información del usuario:

- Datos personales (nombre, email, rol)
- Fecha de registro
- Opciones de configuración (placeholder)

### 3. `/dashboard/pedidos`

Gestión de pedidos:

- Lista de pedidos con estado
- Información detallada (productos, total, fecha)
- Acciones según el rol (ver, completar)
- Estado visual con badges

### 4. `/dashboard/negocios`

Gestión de negocios:

- Grid de tarjetas de negocios
- Información (dirección, teléfono, productos)
- Botón para crear nuevo negocio
- Acceso rápido a editar o ver productos

### 5. `/dashboard/productos`

Catálogo de productos:

- Grid de tarjetas de productos
- Precio y stock destacados
- Estado visual (disponible/no disponible)
- Acciones de edición y eliminación

### 6. `/dashboard/usuarios` (Solo ADMINISTRADOR)

Gestión de usuarios:

- Lista detallada de usuarios
- Badges para rol y estado
- Acciones de edición y desactivación
- Estadísticas resumidas (total, propietarios, clientes)

### 7. `/dashboard/estadisticas` (Solo ADMINISTRADOR)

Métricas del sistema:

- 4 tarjetas principales (usuarios, negocios, pedidos, ingresos)
- Indicadores de crecimiento
- Placeholder para gráficos
- Sugerencia para integrar Chart.js o Recharts

### 8. `/dashboard/reportes` (Solo ADMINISTRADOR)

Generación de reportes:

- 6 tipos de reportes predefinidos
- Opciones de descarga en múltiples formatos
- Información de última generación
- Vista previa disponible

---

## 🎨 Paleta de Colores por Funcionalidad

| Funcionalidad | Gradiente         | Uso              |
| ------------- | ----------------- | ---------------- |
| Perfil        | Azul → Cyan       | User management  |
| Usuarios      | Púrpura → Rosa    | Admin functions  |
| Negocios      | Verde → Esmeralda | Business data    |
| Productos     | Naranja → Ámbar   | Product catalog  |
| Pedidos       | Rojo → Rosa       | Order management |
| Estadísticas  | Índigo → Azul     | Analytics        |
| Reportes      | Teal → Cyan       | Reports          |

---

## 🔒 Control de Acceso

Cada página implementa verificación de rol:

```typescript
const role = user.publicMetadata.role as string;

if (role !== "ADMINISTRADOR") {
  redirect("/dashboard");
}
```

**Protecciones implementadas:**

- CLIENTE: Solo puede acceder a Pedidos y Perfil
- PROPIETARIO: Puede acceder a Negocios, Productos, Pedidos y Perfil
- ADMINISTRADOR: Acceso completo a todas las páginas

---

## 📊 Datos de Ejemplo

Todas las páginas incluyen datos de ejemplo para visualización:

- **Negocios**: Panadería El Hornero, Restaurante La Esquina
- **Productos**: Pan Francés, Medialunas, Pizza, Empanadas
- **Pedidos**: Ejemplos con diferentes estados
- **Usuarios**: Ejemplos con diferentes roles
- **Estadísticas**: Métricas ficticias con crecimiento
- **Reportes**: 6 tipos de reportes predefinidos

---

## 🚀 Próximos Pasos

### Funcionalidades pendientes:

1. **CRUD completo**: Implementar creación, edición y eliminación real
2. **Conexión con Prisma**: Reemplazar datos de ejemplo con queries reales
3. **Gráficos**: Integrar Chart.js o Recharts en Estadísticas
4. **Reportes reales**: Implementar generación de PDF/Excel
5. **Filtros**: Agregar búsqueda y filtrado en todas las listas
6. **Paginación**: Para listas largas de datos
7. **Notificaciones**: Sistema de alertas y notificaciones
8. **Permisos granulares**: Control más fino de acceso

### Mejoras visuales opcionales:

- Skeleton loaders durante carga de datos
- Animaciones de entrada para las tarjetas
- Modales para acciones rápidas
- Drag & drop para ordenar elementos
- Tooltips informativos

---

## 🎯 Rutas Disponibles

```
/dashboard                    → Dashboard principal
/dashboard/perfil            → Información del usuario
/dashboard/pedidos           → Gestión de pedidos
/dashboard/negocios          → Gestión de negocios (PROPIETARIO+)
/dashboard/productos         → Gestión de productos (PROPIETARIO+)
/dashboard/usuarios          → Gestión de usuarios (ADMIN)
/dashboard/estadisticas      → Métricas del sistema (ADMIN)
/dashboard/reportes          → Reportes del sistema (ADMIN)
```

---

## 💡 Notas Técnicas

- Todas las páginas son **Server Components** para mejor performance
- Verificación de autenticación con `currentUser()` de Clerk
- Redirecciones automáticas si no hay acceso
- Estilos consistentes usando Tailwind CSS
- Componentes de shadcn/ui para elementos reutilizables
- Dark mode implementado con clases `dark:`
