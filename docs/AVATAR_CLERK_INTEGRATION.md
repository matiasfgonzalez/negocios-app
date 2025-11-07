# Avatar Integration con Clerk

## 📋 Resumen

Se ha modificado el sistema de avatares para que utilice automáticamente la imagen de perfil que proporciona Clerk, eliminando la necesidad de que los usuarios suban manualmente su foto de perfil.

## ✅ Cambios Realizados

### 1. **Webhook de Clerk** (`app/api/webhooks/clerk/route.ts`)

- ✅ Ahora guarda automáticamente el `image_url` de Clerk en la columna `avatar` cuando se crea o actualiza un usuario
- ✅ El avatar se sincroniza en tiempo real con Clerk

### 2. **API de Perfil** (`app/api/profile/route.ts`)

- ✅ Eliminado el campo `avatar` del endpoint PUT
- ✅ El avatar ahora es **solo lectura** y se gestiona únicamente desde Clerk

### 3. **Componente EditProfileDialog** (`components/EditProfileDialog.tsx`)

- ✅ Eliminado el campo `ImageSelector` para avatar
- ✅ Eliminada la importación de `ImageSelector`
- ✅ El tipo `AppUser` ya no incluye `avatar` como campo editable
- ✅ Los usuarios ahora deben cambiar su foto de perfil desde Clerk

### 4. **Script de Sincronización** (`scripts/sync-avatars.ts`)

- ✅ Nuevo script para sincronizar avatares de usuarios existentes
- ✅ Consulta todos los usuarios de la base de datos
- ✅ Obtiene la imagen de Clerk para cada usuario
- ✅ Actualiza solo los avatares que hayan cambiado

## 🚀 Uso del Script de Sincronización

### Ejecutar el script:

```powershell
npm run sync-avatars
```

### ¿Cuándo ejecutar el script?

- **Después de implementar estos cambios** para sincronizar usuarios existentes
- **Después de que usuarios actualicen su foto en Clerk** (opcional, ya que el webhook lo hace automáticamente)
- **Para auditoría** de avatares sincronizados

### Salida del script:

```
🔄 Iniciando sincronización de avatares desde Clerk...

📊 Total de usuarios en la base de datos: 15

✅ Avatar actualizado para usuario@ejemplo.com
   Nuevo avatar: https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJod...

✓  Avatar ya está sincronizado para otro@ejemplo.com
⚠️  Usuario sin-clerk@ejemplo.com no tiene clerkId, saltando...

============================================================
📊 Resumen de sincronización:
============================================================
✅ Actualizados exitosamente: 8
⚠️  Saltados (sin cambios/sin clerkId): 6
❌ Errores: 0
============================================================

✨ Sincronización completada
```

## 📝 Flujo de Funcionamiento

### Para Nuevos Usuarios:

1. Usuario se registra con Clerk
2. Clerk envía webhook `user.created`
3. Sistema guarda automáticamente el `image_url` en la columna `avatar`
4. Usuario ve su foto de perfil inmediatamente

### Para Actualización de Avatar:

1. Usuario cambia su foto en Clerk (desde su perfil de Clerk)
2. Clerk envía webhook `user.updated`
3. Sistema actualiza automáticamente el `avatar` en la base de datos
4. Cambio se refleja en toda la aplicación

### Para Usuarios Existentes:

1. Ejecutar `npm run sync-avatars`
2. Script consulta Clerk por cada usuario
3. Actualiza avatares en la base de datos
4. Usuarios ven sus fotos sincronizadas

## 🎨 Visualización del Avatar

### Página de Perfil (`app/dashboard/perfil/page.tsx`):

```tsx
{
  appUser.avatar ? (
    <img
      src={appUser.avatar}
      alt={appUser.fullName || "Avatar"}
      className="w-full h-full object-cover"
    />
  ) : (
    <NextImage
      src="/logo.PNG"
      alt="BarrioMarket Logo"
      width={96}
      height={96}
      className="object-contain"
    />
  );
}
```

- Si el usuario tiene `avatar` (URL de Clerk) → Se muestra la foto
- Si no tiene `avatar` → Se muestra el logo de BarrioMarket

## 🔒 Ventajas de Este Enfoque

### ✅ **Automatización Total**

- No requiere subir imágenes manualmente
- Sincronización automática con Clerk
- Menos campos en formularios

### ✅ **Consistencia**

- Un único lugar para gestionar la foto de perfil (Clerk)
- No hay duplicación de imágenes
- Actualización inmediata en toda la aplicación

### ✅ **Rendimiento**

- No se almacenan imágenes en Cloudinary para avatares
- URLs optimizadas de Clerk
- Menos requests a servicios de terceros

### ✅ **UX Mejorado**

- Usuarios no necesitan subir foto dos veces
- Foto se sincroniza desde el registro
- Experiencia más simple y directa

## 🔄 Migración de Usuarios Existentes

Si tienes usuarios que ya subieron avatares manualmente:

1. **Ejecutar el script de sincronización:**

   ```powershell
   npm run sync-avatars
   ```

2. **Verificar que todos los usuarios tienen avatar:**

   ```sql
   SELECT id, email, avatar IS NOT NULL as has_avatar
   FROM "AppUser"
   WHERE "clerkId" IS NOT NULL;
   ```

3. **Opcional - Limpiar imágenes antiguas de Cloudinary:**
   - Las URLs antiguas ya no se usarán
   - Pueden eliminarse manualmente desde Cloudinary si se desea

## ⚙️ Variables de Entorno Requeridas

El script de sincronización requiere:

```env
# Clerk (ya configurado)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
WEBHOOK_SECRET=whsec_...

# Database (ya configurado)
DATABASE_URL=postgresql://...
```

## 🐛 Troubleshooting

### El avatar no se muestra:

1. Verificar que el usuario tiene `clerkId` en la base de datos
2. Ejecutar el script de sincronización: `npm run sync-avatars`
3. Verificar que el webhook de Clerk está funcionando

### El webhook no actualiza el avatar:

1. Verificar que el webhook está configurado en Clerk Dashboard
2. Confirmar que el `WEBHOOK_SECRET` está correcto
3. Revisar logs del webhook en Clerk Dashboard

### Script de sincronización falla:

1. Verificar las credenciales de Clerk
2. Confirmar conexión a la base de datos
3. Revisar logs de error del script

## 📚 Referencias

- [Clerk User Object](https://clerk.com/docs/references/backend/types/user)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
- [Clerk Image URL](https://clerk.com/docs/references/backend/types/user#image-url)
