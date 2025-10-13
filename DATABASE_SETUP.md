# 🗄️ Configuración de la Base de Datos PostgreSQL

## ❌ Error Actual

```
Can't reach database server at `localhost:5432`
```

## ✅ Solución Implementada

He movido la lógica de base de datos a una API route para mejor manejo de errores:

- **API Route**: `/app/api/businesses/[slug]/route.ts`
- **Página Cliente**: `/app/businesses/[slug]/page.tsx` (ahora client-side)

## 🔧 Pasos para Iniciar PostgreSQL

### Opción 1: PostgreSQL Local

1. **Instalar PostgreSQL** (si no está instalado):

   - Descargar de: https://www.postgresql.org/download/
   - O usar el instalador de Windows

2. **Iniciar el servicio de PostgreSQL**:

   ```powershell
   # En Windows, buscar "Servicios" y buscar "PostgreSQL"
   # O usar el comando:
   net start postgresql-x64-14
   ```

3. **Crear la base de datos**:

   ```powershell
   # Abrir pgAdmin o usar la consola:
   psql -U postgres
   CREATE DATABASE negocios_db;
   \q
   ```

4. **Ejecutar migraciones de Prisma**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Opción 2: Docker (Recomendado)

1. **Crear archivo `docker-compose.yml`** en la raíz:

   ```yaml
   version: "3.8"
   services:
     postgres:
       image: postgres:14
       restart: always
       environment:
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: postgres
         POSTGRES_DB: negocios_db
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data

   volumes:
     postgres_data:
   ```

2. **Iniciar Docker**:

   ```bash
   docker-compose up -d
   ```

3. **Ejecutar migraciones**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Opción 3: Prisma Postgres (Cloud - Más Rápido)

1. **Usar la herramienta de Prisma**:

   ```bash
   npx prisma-postgres-create-database negocios-app
   ```

2. **Actualizar DATABASE_URL** en `.env` con la URL proporcionada

3. **Ejecutar migraciones**:
   ```bash
   npx prisma migrate dev
   ```

## 📝 Verificar Conexión

Después de iniciar PostgreSQL, verificar la conexión:

```bash
# Generar cliente de Prisma
npx prisma generate

# Verificar la conexión y ver la base de datos
npx prisma studio
```

## 🌐 Estados de la Aplicación

La página ahora maneja 3 estados:

1. **⏳ Cargando**: Muestra spinner mientras carga
2. **❌ Error**: Muestra mensaje de error con botón de reintentar
3. **✅ Éxito**: Muestra el negocio y sus productos

## 🔗 URL de Ejemplo

Una vez que la BD esté activa, podrás acceder a:

```
http://localhost:3000/businesses/[slug-del-negocio]
```

## 🚀 Próximos Pasos

1. Iniciar PostgreSQL (elegir una opción arriba)
2. Ejecutar migraciones: `npx prisma migrate dev`
3. Seed de datos (opcional): Crear script para datos de prueba
4. Reiniciar el servidor: `npm run dev`
