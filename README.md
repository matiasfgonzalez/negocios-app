# Levantar PostgreSQL (Docker)

```
docker run --name pg-negocios -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=negocios_db -p 5432:5432 -d postgres:16
```
