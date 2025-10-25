# Levantar PostgreSQL (Docker)

```
docker run --name pg-negocios -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=negocios_db -p 5432:5432 -d postgres:16
```

# 1. Generar migración

npx prisma migrate dev --name add_user_fields

# 2. Actualizar base de datos

# (Se ejecuta automáticamente con el comando anterior)

# 3. Regenerar Prisma Client

npx prisma generate
