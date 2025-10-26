# API de Administración de Usuarios - Implementación Completa

## Descripción General

Sistema completo de gestión de usuarios (CRUD) accesible únicamente para usuarios con rol **ADMINISTRADOR**.

## Endpoints Implementados

### 1. GET /api/admin/users

**Descripción**: Obtener lista de usuarios con filtros

**Permisos**: Solo ADMINISTRADOR

**Query Parameters**:

- `role` (opcional): Filtrar por rol (ADMINISTRADOR | PROPIETARIO | CLIENTE)
- `search` (opcional): Búsqueda por nombre, apellido, email o teléfono
- `isActive` (opcional): Filtrar por estado (true | false)
- `limit` (opcional): Limitar resultados

**Respuesta Exitosa** (200):

```json
[
  {
    "id": "clxxxx",
    "clerkId": "user_xxx",
    "email": "usuario@example.com",
    "name": "Juan",
    "lastName": "Pérez",
    "fullName": "Juan Pérez",
    "phone": "+54 9 11 1234-5678",
    "avatar": "https://...",
    "role": "CLIENTE",
    "address": "Calle Falsa 123",
    "city": "Buenos Aires",
    "province": "Buenos Aires",
    "isActive": true,
    "lastLogin": "2025-10-25T10:00:00.000Z",
    "createdAt": "2025-10-01T10:00:00.000Z",
    "updatedAt": "2025-10-25T10:00:00.000Z",
    "_count": {
      "businesses": 2,
      "orders": 15
    }
  }
]
```

**Ejemplos de Uso**:

```javascript
// Obtener todos los usuarios
const response = await fetch("/api/admin/users");

// Buscar propietarios activos
const response = await fetch("/api/admin/users?role=PROPIETARIO&isActive=true");

// Buscar por nombre o email
const response = await fetch("/api/admin/users?search=juan");

// Limitar resultados
const response = await fetch("/api/admin/users?limit=10");
```

---

### 2. POST /api/admin/users

**Descripción**: Crear un nuevo usuario manualmente

**Permisos**: Solo ADMINISTRADOR

**Body** (JSON):

```json
{
  "email": "nuevo@example.com", // REQUERIDO
  "name": "María",
  "lastName": "González",
  "phone": "+54 9 11 9876-5432",
  "role": "CLIENTE", // ADMINISTRADOR | PROPIETARIO | CLIENTE
  "address": "Av. Corrientes 1234",
  "city": "Buenos Aires",
  "province": "Buenos Aires",
  "postalCode": "1043",
  "documentId": "12345678",
  "isActive": true,
  "adminNotes": "Usuario creado para pruebas"
}
```

**Respuesta Exitosa** (201):

```json
{
  "id": "clxxxx",
  "email": "nuevo@example.com",
  "name": "María",
  "lastName": "González",
  "fullName": "María González",
  "role": "CLIENTE",
  "isActive": true,
  "createdAt": "2025-10-25T12:00:00.000Z",
  ...
}
```

**Errores Comunes**:

- `400`: Email requerido o ya está en uso
- `403`: Sin permisos (no es ADMINISTRADOR)

---

### 3. GET /api/admin/users/[id]

**Descripción**: Obtener detalles completos de un usuario específico

**Permisos**: Solo ADMINISTRADOR

**Respuesta Exitosa** (200):

```json
{
  "id": "clxxxx",
  "email": "usuario@example.com",
  "name": "Juan",
  "lastName": "Pérez",
  "fullName": "Juan Pérez",
  "phone": "+54 9 11 1234-5678",
  "role": "PROPIETARIO",
  "isActive": true,
  "businesses": [
    {
      "id": "biz_xxx",
      "name": "Mi Negocio",
      "slug": "mi-negocio",
      "rubro": "Gastronomía",
      "img": "https://...",
      "status": "ABIERTO"
    }
  ],
  "orders": [
    {
      "id": "ord_xxx",
      "total": 5000,
      "state": "ENTREGADA",
      "createdAt": "2025-10-20T10:00:00.000Z",
      "business": {
        "name": "Pizzería Roma"
      }
    }
  ],
  "_count": {
    "businesses": 1,
    "orders": 25
  },
  "createdAt": "2025-09-01T10:00:00.000Z",
  "updatedAt": "2025-10-25T10:00:00.000Z"
}
```

---

### 4. PUT /api/admin/users/[id]

**Descripción**: Actualizar un usuario existente

**Permisos**: Solo ADMINISTRADOR

**Body** (JSON):

```json
{
  "email": "nuevo-email@example.com",
  "name": "Juan Actualizado",
  "lastName": "Pérez",
  "phone": "+54 9 11 9999-8888",
  "role": "PROPIETARIO",
  "address": "Nueva Dirección 456",
  "lat": -34.6037,
  "lng": -58.3816,
  "city": "CABA",
  "province": "Buenos Aires",
  "postalCode": "1000",
  "documentId": "98765432",
  "birthDate": "1990-01-15",
  "isActive": false,
  "adminNotes": "Usuario suspendido temporalmente",
  "avatar": "https://nuevo-avatar.com/imagen.jpg"
}
```

**Nota**: Todos los campos son opcionales. Solo se actualizan los campos enviados.

**Respuesta Exitosa** (200):

```json
{
  "id": "clxxxx",
  "email": "nuevo-email@example.com",
  "name": "Juan Actualizado",
  "fullName": "Juan Actualizado Pérez",
  ...
}
```

**Errores Comunes**:

- `400`: Email ya está en uso por otro usuario
- `404`: Usuario no encontrado
- `403`: Sin permisos

---

### 5. DELETE /api/admin/users/[id]

**Descripción**: Eliminar un usuario del sistema

**Permisos**: Solo ADMINISTRADOR

**Restricciones**:

- No se puede eliminar un usuario con negocios asociados
- No se puede eliminar un usuario con pedidos asociados
- No se puede eliminar a sí mismo

**Respuesta Exitosa** (200):

```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Errores Comunes**:

- `400`: No se puede eliminar (tiene negocios/pedidos o intenta eliminarse a sí mismo)
- `404`: Usuario no encontrado
- `403`: Sin permisos

---

## Página de Administración

**Ruta**: `/dashboard/usuarios`

### Características

#### 1. **Estadísticas en Dashboard**

- Total de usuarios (activos/inactivos)
- Contador de administradores
- Contador de propietarios
- Contador de clientes

#### 2. **Filtros Avanzados**

- **Búsqueda**: Por nombre, apellido, email o teléfono
- **Rol**: Filtrar por tipo de usuario
- **Estado**: Activos/Inactivos/Todos

#### 3. **Tabla de Usuarios**

Muestra para cada usuario:

- Avatar y nombre completo
- Email y datos de contacto
- Rol con badge de color
- Estado (activo/inactivo)
- Estadísticas (cantidad de negocios y pedidos)
- Fecha de registro
- Acciones (editar/eliminar)

#### 4. **Diálogo de Creación**

Formulario completo con:

- Email (requerido)
- Rol (requerido)
- Nombre y apellido
- Teléfono y DNI
- Dirección completa (calle, ciudad, provincia, código postal)
- Estado inicial (activo/inactivo)
- Notas del administrador

#### 5. **Diálogo de Edición**

Permite modificar todos los campos del usuario, incluyendo:

- Cambio de rol
- Activación/desactivación
- Actualización de datos personales
- Notas administrativas

#### 6. **Diálogo de Eliminación**

- Muestra información del usuario
- Alerta si tiene negocios o pedidos asociados
- Previene eliminación si tiene relaciones
- Sugiere desactivación como alternativa

---

## Seguridad Implementada

### 1. **Autenticación**

- Verificación de sesión con Clerk
- Validación de token en cada request

### 2. **Autorización**

- Solo usuarios con rol ADMINISTRADOR pueden acceder
- Verificación de permisos en cada endpoint
- Respuesta 403 (Forbidden) si no tiene permisos

### 3. **Validaciones**

- Email único en el sistema
- Email requerido para creación
- Prevención de auto-eliminación
- Prevención de eliminación en cascada (usuarios con relaciones)

### 4. **Integridad de Datos**

- Generación automática de `fullName`
- Validación de cambios de email (unicidad)
- Manejo de campos opcionales vs requeridos

---

## Tipos TypeScript

```typescript
type User = {
  id: string;
  clerkId: string | null;
  email: string | null;
  name: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE";
  address: string | null;
  city: string | null;
  province: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    businesses: number;
    orders: number;
  };
};
```

---

## Mensajes de Error

### Errores de Autenticación

- `401 Unauthorized`: "No autenticado"
- `404 Not Found`: "Usuario no encontrado" (el usuario autenticado no existe en DB)
- `403 Forbidden`: "No tienes permisos para..."

### Errores de Validación

- `400 Bad Request`: "El email es requerido"
- `400 Bad Request`: "El email ya está en uso"
- `400 Bad Request`: "No puedes eliminarte a ti mismo"
- `400 Bad Request`: "No se puede eliminar un usuario con negocios o pedidos asociados"

### Errores del Servidor

- `500 Internal Server Error`: "Error al obtener/crear/actualizar/eliminar usuario"

---

## Testing Manual

### 1. Verificar Permisos

```bash
# Como CLIENTE o PROPIETARIO (debe fallar con 403)
curl http://localhost:3000/api/admin/users

# Como ADMINISTRADOR (debe funcionar)
curl http://localhost:3000/api/admin/users
```

### 2. Crear Usuario

```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test",
    "role": "CLIENTE"
  }'
```

### 3. Actualizar Usuario

```bash
curl -X PUT http://localhost:3000/api/admin/users/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "isActive": false
  }'
```

### 4. Eliminar Usuario

```bash
curl -X DELETE http://localhost:3000/api/admin/users/[id]
```

---

## Mejoras Futuras

1. **Paginación**: Implementar paginación en el endpoint GET
2. **Ordenamiento**: Agregar parámetros de ordenamiento (por fecha, nombre, etc.)
3. **Exportación**: Permitir exportar lista de usuarios a CSV/Excel
4. **Auditoría**: Registrar cambios en un log de auditoría
5. **Bulk Actions**: Permitir acciones en lote (activar/desactivar múltiples usuarios)
6. **Email Notifications**: Notificar a usuarios cuando son creados/modificados
7. **Password Reset**: Integración con Clerk para reseteo de contraseñas
8. **Soft Delete**: Implementar eliminación lógica en lugar de física
9. **Advanced Filters**: Más filtros (rango de fechas, última actividad, etc.)
10. **User Details Page**: Página dedicada para ver detalles completos de un usuario

---

## Archivos Creados/Modificados

### Nuevos Archivos

1. `/app/api/admin/users/route.ts` - Endpoints GET y POST
2. `/app/api/admin/users/[id]/route.ts` - Endpoints GET, PUT y DELETE
3. `/app/dashboard/usuarios/usuarios-client.tsx` - Componente cliente con tabla y diálogos
4. `/components/ui/table.tsx` - Componente de tabla reutilizable

### Archivos Modificados

1. `/app/dashboard/usuarios/page.tsx` - Convertido a Client Component con API
2. `/prisma/schema.prisma` - Ya tenía el modelo AppUser completo

---

## Checklist de Implementación

- ✅ API GET /api/admin/users con filtros
- ✅ API POST /api/admin/users para crear usuarios
- ✅ API GET /api/admin/users/[id] para detalles
- ✅ API PUT /api/admin/users/[id] para actualizar
- ✅ API DELETE /api/admin/users/[id] para eliminar
- ✅ Validación de permisos (solo ADMINISTRADOR)
- ✅ Página de administración en /dashboard/usuarios
- ✅ Estadísticas de usuarios
- ✅ Filtros y búsqueda
- ✅ Tabla con todos los datos
- ✅ Diálogo de creación
- ✅ Diálogo de edición
- ✅ Diálogo de eliminación con validaciones
- ✅ Auto-refresh después de CRUD
- ✅ Manejo de errores
- ✅ Loading states
- ✅ Validación de integridad de datos
- ✅ Prevención de eliminación en cascada
- ✅ Type safety completo
- ✅ Componente Table reutilizable
- ✅ Suspense boundary para SEO
