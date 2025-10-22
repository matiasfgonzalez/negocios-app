# Sistema de Roles - NeoBiz Pulse

## 📋 Descripción General

El sistema implementa un **doble sistema de roles**:

1. **Roles en PostgreSQL**: Para control de permisos del lado del servidor
2. **Roles en Clerk (publicMetadata)**: Para acceso desde el frontend

## 🔄 Flujo de Asignación de Roles

### Nuevo Usuario se Registra:

```
1. Usuario se registra en Clerk
   ↓
2. UserSync detecta nuevo usuario
   ↓
3. Llama a /api/user/metadata
   ↓
4. Asigna rol "CLIENTE" en Clerk publicMetadata
   ↓
5. Llama a /api/me
   ↓
6. Crea usuario en PostgreSQL con rol "PROPIETARIO"
   ↓
7. Usuario puede crear negocios y productos ✅
```

## 🎯 Configuración de Roles

### En PostgreSQL (Base de Datos):

| Rol               | Crear Negocios | Crear Productos | Gestionar Pedidos |
| ----------------- | -------------- | --------------- | ----------------- |
| **CLIENTE**       | ❌             | ❌              | ✅ Solo realizar  |
| **PROPIETARIO**   | ✅             | ✅              | ✅ Completo       |
| **ADMINISTRADOR** | ✅             | ✅              | ✅ Completo       |

**Configurado en**: `app/api/me/route.ts`

```typescript
create: {
  clerkId,
  email: email || "",
  name: fullName || "",
  role: "PROPIETARIO", // Rol por defecto en BD
}
```

### En Clerk (publicMetadata):

El rol en Clerk es principalmente para uso en el frontend y visualización.

**Configurado en**: `app/api/user/metadata/route.ts`

```typescript
await client.users.updateUserMetadata(userId, {
  publicMetadata: {
    role: "CLIENTE", // Rol por defecto en Clerk
  },
});
```

## 🔍 ¿Por qué Dos Roles Diferentes?

### Razones del Diseño:

1. **Separación de Responsabilidades**:

   - PostgreSQL: Control de permisos real (backend)
   - Clerk: Información visible para el usuario (frontend)

2. **Seguridad**:

   - El rol de PostgreSQL es la fuente de verdad
   - Clerk solo muestra información, no controla permisos reales

3. **Flexibilidad**:
   - Puedes mostrar "CLIENTE" en el perfil
   - Mientras tiene permisos de "PROPIETARIO" internamente

## 📝 Cómo Acceder a los Roles

### En el Frontend (Client Component):

```typescript
import { useUser } from "@clerk/nextjs";

export default function MyComponent() {
  const { user } = useUser();

  // Obtener rol desde Clerk
  const clerkRole = user?.publicMetadata?.role;

  console.log("Rol en Clerk:", clerkRole); // "CLIENTE"

  return <div>Tu rol es: {clerkRole}</div>;
}
```

### En el Backend (API Route):

```typescript
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  // Obtener rol desde PostgreSQL
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });

  const dbRole = appUser?.role;

  console.log("Rol en BD:", dbRole); // "PROPIETARIO"

  // Usar rol de BD para control de acceso
  if (dbRole !== "PROPIETARIO" && dbRole !== "ADMINISTRADOR") {
    return Response.json({ error: "Sin permisos" }, { status: 403 });
  }
}
```

## 🔧 Archivos del Sistema de Roles

### 1. `components/UserSync.tsx`

Componente que sincroniza usuario al iniciar sesión.

**Responsabilidades**:

- Detectar nuevo usuario
- Llamar a endpoints de sincronización
- Asignar roles automáticamente

### 2. `app/api/user/metadata/route.ts`

Endpoint para gestionar metadata de Clerk.

**Responsabilidades**:

- Asignar rol "CLIENTE" en Clerk publicMetadata
- Verificar si el usuario ya tiene rol
- Solo asignar si es primera vez

### 3. `app/api/me/route.ts`

Endpoint para sincronizar usuario en base de datos.

**Responsabilidades**:

- Crear/actualizar usuario en PostgreSQL
- Asignar rol "PROPIETARIO" en base de datos
- Manejar datos del perfil

### 4. `app/api/products/route.ts`, `app/api/businesses/route.ts`, etc.

Endpoints protegidos que verifican permisos.

**Responsabilidades**:

- Verificar rol desde PostgreSQL
- Denegar acceso si no tiene permisos
- Permitir acciones según rol

## 🚀 Modificar el Sistema de Roles

### Cambiar Rol por Defecto en PostgreSQL:

Edita `app/api/me/route.ts`:

```typescript
create: {
  clerkId,
  email: email || "",
  name: fullName || "",
  role: "CLIENTE", // Cambiar aquí
}
```

### Cambiar Rol por Defecto en Clerk:

Edita `app/api/user/metadata/route.ts`:

```typescript
publicMetadata: {
  role: "PROPIETARIO", // Cambiar aquí
}
```

### Agregar Nuevos Roles:

1. Edita `prisma/schema.prisma`:

```prisma
enum Role {
  ADMINISTRADOR
  PROPIETARIO
  CLIENTE
  MODERADOR  // Nuevo rol
}
```

2. Ejecuta migración:

```bash
npx prisma migrate dev --name add_moderador_role
```

3. Actualiza lógica de permisos en APIs

## 🧪 Probar el Sistema de Roles

### Test 1: Verificar Rol en Clerk

```javascript
// En la consola del navegador (F12)
console.log("Rol en Clerk:", window.Clerk.user.publicMetadata.role);
```

### Test 2: Verificar Rol en Base de Datos

```sql
-- En tu cliente SQL
SELECT "clerkId", email, name, role
FROM "AppUser"
WHERE email = 'tu-email@ejemplo.com';
```

### Test 3: Crear Producto (Test de Permisos)

1. Inicia sesión
2. Ve a `/dashboard/productos`
3. Intenta crear un producto
4. Debería funcionar si tienes rol PROPIETARIO en BD

## 📊 Diagrama del Sistema

```
┌─────────────────┐
│  Usuario Nuevo  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Clerk Auth     │ ◄─── Autenticación
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   UserSync      │ ◄─── Detecta usuario autenticado
└────────┬────────┘
         │
         ├─────────────────────────┬─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ /api/user/       │    │   /api/me        │    │  PostgreSQL      │
│  metadata        │    │                  │    │                  │
│                  │    │                  │    │  AppUser         │
│ Asigna:          │    │ Asigna:          │    │  - clerkId       │
│ publicMetadata   │    │ role: PROPIETARIO│    │  - role: PROPIETA│
│ role: CLIENTE    │    │                  │    │  - email         │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

## ✅ Ventajas de Este Diseño

- ✅ **Seguridad**: Control real desde PostgreSQL
- ✅ **Flexibilidad**: Mostrar información diferente en frontend
- ✅ **Escalabilidad**: Fácil agregar nuevos roles
- ✅ **Mantenibilidad**: Separación clara de responsabilidades
- ✅ **UX**: Usuario ve su rol en Clerk, sistema usa rol de BD

---

**Fecha**: 21 de Octubre, 2025
**Versión**: 1.0
