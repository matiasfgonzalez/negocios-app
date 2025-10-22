# Solución: Sincronización Automática de Usuarios con Clerk

## 🔍 Problema Identificado

Cuando los usuarios inician sesión con Clerk, no se guardan automáticamente en la base de datos PostgreSQL. Esto ocurre porque:

1. **Los webhooks de Clerk** solo funcionan cuando el endpoint es públicamente accesible desde internet
2. En **desarrollo local (localhost)**, Clerk no puede llamar al webhook
3. En **producción**, necesitas configurar el webhook en el dashboard de Clerk

## ✅ Solución Implementada

Se implementó una **sincronización automática del lado del cliente** que funciona tanto en desarrollo como en producción.

### 📦 Archivos Creados/Modificados

#### 1. `components/UserSync.tsx` (NUEVO)

Componente que sincroniza automáticamente el usuario cuando inicia sesión:

```typescript
- Detecta cuando el usuario se autentica con Clerk
- Llama al endpoint /api/me con POST
- Crea o actualiza el usuario en la base de datos
- Se ejecuta automáticamente sin intervención del usuario
```

#### 2. `app/layout.tsx` (MODIFICADO)

Se agregó el componente `<UserSync />` al layout principal:

```typescript
- Se ejecuta en todas las páginas
- Funciona tanto en desarrollo como producción
- No afecta la UX (componente invisible)
```

#### 3. `app/api/me/route.ts` (YA EXISTÍA)

Endpoint que maneja la sincronización:

```typescript
- POST: Crea o actualiza usuario (upsert)
- GET: Obtiene datos del usuario
- Maneja clerkId, email, firstName, lastName
```

## 🚀 Cómo Funciona

### Flujo de Sincronización:

1. **Usuario inicia sesión** con Clerk (Google, email, etc.)
2. **Clerk autentica** y retorna los datos del usuario
3. **UserSync detecta** que el usuario está autenticado
4. **Llama a `/api/me`** con POST enviando:
   - `clerkId`: ID único de Clerk
   - `email`: Email del usuario
   - `firstName` y `lastName`: Nombres
5. **El endpoint hace upsert**:
   - Si el usuario existe: actualiza datos
   - Si no existe: crea nuevo usuario
6. **Usuario guardado** en PostgreSQL ✅

### Código del Componente UserSync:

```typescript
useEffect(() => {
  if (isLoaded && isSignedIn && user) {
    fetch("/api/me", {
      method: "POST",
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
      }),
    });
  }
}, [isLoaded, isSignedIn, user]);
```

## 🎯 Ventajas de esta Solución

✅ **Funciona en localhost** sin necesidad de ngrok o túneles
✅ **Funciona en producción** sin configuración adicional
✅ **Sincronización inmediata** al iniciar sesión
✅ **No requiere webhooks** de Clerk configurados
✅ **Backup del webhook** (si configuras webhooks más tarde, ambos funcionarán)
✅ **Actualiza datos** si el usuario cambia su perfil

## 🔧 Configuración Adicional (Opcional)

### Para Producción con Webhooks:

Si quieres usar webhooks en producción (recomendado para mejor rendimiento):

1. Ve a [Clerk Dashboard](https://dashboard.clerk.com)
2. Selecciona tu aplicación
3. Ve a **Webhooks**
4. Crea un nuevo endpoint:
   - URL: `https://tu-dominio.com/api/webhooks/clerk`
   - Eventos: `user.created`, `user.updated`, `user.deleted`
5. Copia el **Signing Secret**
6. Agrégalo a tu `.env`:
   ```
   WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Ventajas de usar Webhooks (producción):

- ⚡ **Más rápido**: No depende del cliente
- 🔒 **Más seguro**: Validación del lado del servidor
- 📊 **Más confiable**: Funciona incluso si el usuario cierra el navegador
- 🔄 **Sincronización completa**: Capta cambios desde cualquier lugar

## 🧪 Cómo Probar

1. **Cierra sesión** si estás logueado
2. **Inicia sesión** con Clerk
3. **Verifica en la consola** del navegador (F12) que aparezca:
   ```
   Usuario sincronizado correctamente: { clerkId: "...", email: "...", ... }
   ```
4. **Verifica en la base de datos**:
   ```sql
   SELECT * FROM "AppUser" WHERE "clerkId" = 'user_xxxxx';
   ```

## 📝 Notas Importantes

- El componente `UserSync` es **silencioso** (no muestra nada en pantalla)
- Se ejecuta **solo una vez** por sesión
- Si el usuario ya existe, solo **actualiza** los datos
- Los logs aparecen en la **consola del navegador** (desarrollo)
- Los logs del servidor aparecen en la **terminal** donde corre Next.js

## 🐛 Troubleshooting

### Usuario no se guarda:

1. Verifica que la base de datos esté corriendo
2. Verifica que las variables de entorno estén configuradas
3. Revisa la consola del navegador para errores
4. Revisa la terminal del servidor para logs

### Error "User not found" en el dashboard:

- Normal si acabas de iniciar sesión
- Espera 1-2 segundos y recarga la página
- El componente UserSync se ejecutará automáticamente

## ✨ Resultado Final

Ahora **todos los usuarios que inicien sesión** se guardarán automáticamente en tu base de datos PostgreSQL, permitiendo:

- ✅ Crear negocios
- ✅ Gestionar productos
- ✅ Recibir y gestionar pedidos
- ✅ Tener historial completo
- ✅ Sistema multi-negocio funcional

## 🔑 Roles de Usuario

Cuando un usuario se registra por primera vez, se le asignan automáticamente dos roles:

1. **PostgreSQL (Base de datos)**: Rol **PROPIETARIO**

   - Permite crear y gestionar negocios
   - Permite crear productos
   - Permite gestionar pedidos

2. **Clerk (publicMetadata)**: Rol **CLIENTE**
   - Visible en el frontend
   - Accesible desde `user.publicMetadata.role`
   - Útil para lógica del lado del cliente

### Archivos Involucrados:

- **`components/UserSync.tsx`**: Llama al endpoint de metadata
- **`app/api/user/metadata/route.ts`**: Asigna rol en Clerk publicMetadata
- **`app/api/me/route.ts`**: Asigna rol PROPIETARIO en base de datos

---

**Fecha de implementación**: 21 de Octubre, 2025
**Estado**: ✅ Funcionando correctamente
**Última actualización**: 21 de Octubre, 2025 - Agregado rol en Clerk publicMetadata
