# 🧹 Script de Limpieza de Base de Datos

Este script resetea completamente la base de datos, eliminando todos los datos y dejando solo la configuración genérica del sistema.

## ⚠️ ADVERTENCIA

**Este script eliminará TODOS los datos de la base de datos:**

- ✅ Usuarios (clientes, propietarios, administradores)
- ✅ Negocios
- ✅ Productos
- ✅ Órdenes y sus items
- ✅ Pagos de suscripciones
- ✅ Solicitudes de rol
- ✅ Imágenes subidas
- ✅ Todo el historial

**Datos que se mantienen/recrean:**

- ✅ Categorías de productos (25 categorías predefinidas)
- ✅ Configuración de pagos (con datos de ejemplo)

## 🚀 Uso

### Ejecutar el script

```bash
npm run db:reset
```

O usando PowerShell directamente:

```powershell
npx tsx prisma/reset.ts
```

## 📋 Proceso del Script

1. **Eliminación de datos** (en orden correcto para respetar relaciones):

   - OrderEvents
   - OrderItems
   - Orders
   - Products
   - Businesses
   - Payments
   - RoleRequests
   - UploadedImages
   - AppUsers
   - ProductCategories

2. **Recreación de datos genéricos**:
   - 25 categorías de productos
   - Configuración de pagos con datos de ejemplo

## 💡 Casos de Uso

### Desarrollo Local

```bash
# Limpiar base de datos de pruebas
npm run db:reset

# Luego crear usuarios de prueba manualmente o con seed
npm run seed  # Si quieres datos de prueba
```

### Antes de Deploy a Producción

```bash
# Asegurarse de tener base limpia
npm run db:reset

# NO ejecutar seed con datos de prueba en producción
```

### Testing

```bash
# Resetear antes de cada suite de tests
npm run db:reset

# Ejecutar tests con base limpia
npm test
```

## 🔍 Verificación Post-Ejecución

Después de ejecutar el script, deberías ver:

```
✅ Base de datos inicializada correctamente!

📊 Resumen:
   - 25 categorías de productos
   - 1 configuración de pagos
   - 0 usuarios (base limpia)
   - 0 negocios (base limpia)
   - 0 productos (base limpia)
   - 0 órdenes (base limpia)

🎉 ¡Listo! La base de datos está limpia y lista para usar.
```

## 🛠️ Configuración de Pagos Creada

El script crea una configuración de pagos con estos valores de ejemplo:

```javascript
{
  monthlyFee: 5000,
  bankName: "Banco Ejemplo",
  bankAlias: "BARRIOMARKET.PAGOS",
  bankCbu: "0000000000000000000000",
  accountHolder: "BarrioMarket S.A.",
  accountType: "Cuenta Corriente",
  supportEmail: "pagos@barriomarket.com",
  supportPhone: "5491123456789"
}
```

**IMPORTANTE:** Debes modificar estos valores con los datos reales desde el panel de administración en `/dashboard/configuracion-pagos`.

## 📦 Categorías de Productos Creadas

Se crean 25 categorías predefinidas:

1. 🥟 Empanadas
2. 🍕 Pizzas
3. 🍔 Hamburguesas
4. 🥪 Sandwiches
5. 🍝 Pastas
6. 🥩 Carnes
7. 🍗 Pollo
8. 🐟 Pescados y Mariscos
9. 🥗 Ensaladas
10. 🍰 Postres
11. 🍦 Helados
12. 🥤 Bebidas
13. ☕ Cafetería
14. 🥖 Panadería
15. 🎂 Pastelería
16. 🌭 Comida Rápida
17. 🥙 Comida Vegetariana
18. 🍣 Sushi
19. 🥡 Comida China
20. 🌮 Comida Mexicana
21. 🧀 Picadas
22. 🍖 Milanesas
23. 🥧 Tartas y Quiches
24. 🍲 Sopas
25. 🍽️ Otros

## ⚙️ Próximos Pasos Después del Reset

### 1. Crear Usuario Administrador

- Registrate en la aplicación
- Ve a la base de datos y cambia manualmente el rol a `ADMINISTRADOR`
- O usa Clerk Dashboard para asignar el rol en `publicMetadata`

### 2. Configurar Pagos

- Accede a `/dashboard/configuracion-pagos`
- Actualiza los datos bancarios reales
- Configura el monto mensual correcto

### 3. Crear Categorías Personalizadas (Opcional)

- Las 25 categorías predefinidas deberían cubrir la mayoría de casos
- Puedes agregar más desde el código si es necesario

### 4. Permitir Registro de Propietarios

- Los usuarios pueden solicitar ser propietarios desde su perfil
- Como admin, aprueba las solicitudes en `/dashboard/solicitudes-admin`

## 🔒 Seguridad

**NUNCA ejecutes este script en producción sin backup previo.**

```bash
# Hacer backup antes de ejecutar (PostgreSQL)
pg_dump -U usuario -d nombre_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Ejecutar reset
npm run db:reset

# Si algo sale mal, restaurar desde backup
psql -U usuario -d nombre_db < backup_YYYYMMDD_HHMMSS.sql
```

## ❓ Troubleshooting

### Error: "Foreign key constraint failed"

- El script elimina en el orden correcto, pero si aparece este error:
  - Verifica que no haya otras tablas o relaciones personalizadas
  - Ejecuta el script nuevamente

### Error: "Table doesn't exist"

- Ejecuta las migraciones primero:

```bash
npx prisma migrate deploy
```

### Error de conexión a base de datos

- Verifica que `DATABASE_URL` esté configurado en `.env`
- Asegúrate de que la base de datos esté corriendo

## 📝 Notas Técnicas

- El script usa `deleteMany()` para cada tabla
- Las eliminaciones respetan el orden de dependencias
- Usa `upsert()` para PaymentConfig (por si ya existe)
- Usa `createMany()` para las categorías (más eficiente)
- Incluye contador de registros eliminados/creados
- Maneja errores y desconecta Prisma correctamente

---

**¿Necesitas ayuda?** Revisa la documentación de Prisma: https://www.prisma.io/docs
