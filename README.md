# BarrioMarket - Plataforma de Comercios Locales

Plataforma argentina que conecta comercios locales con clientes. Tu barrio, tu comercio.

---

## 📋 Características Principales

- 🏪 **Gestión de Negocios**: Crea y administra tu negocio local
- 📦 **Catálogo de Productos**: Sistema completo de inventario
- 🛒 **Pedidos Online**: Recepción y gestión de órdenes
- 💳 **Sistema de Suscripciones**: Pagos mensuales para propietarios
- 📧 **Notificaciones Automáticas**: Recordatorios de vencimiento de pagos
- 🗺️ **Geolocalización**: Ubicación de negocios en mapa interactivo
- 👥 **Sistema de Roles**: Administradores, Propietarios y Clientes
- 🔐 **Autenticación Segura**: Powered by Clerk

---

## 🚀 Inicio Rápido

### 1. Levantar PostgreSQL (Docker)

```bash
docker run --name pg-negocios \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=negocios_db \
  -p 5432:5432 \
  -d postgres:16
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Configurar Base de Datos

```bash
# Generar migración
npx prisma migrate dev --name init

# Regenerar Prisma Client
npx prisma generate

# (Opcional) Poblar con datos de prueba
npm run seed
```

### 5. Ejecutar Aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📧 Sistema de Notificaciones

El proyecto incluye un sistema automatizado de notificaciones por email para:

- ⏰ Recordatorios de fin de período de prueba
- 💳 Alertas de vencimiento de pagos
- ⚠️ Advertencias de suspensión
- 🚨 Notificaciones de cuenta suspendida

**Ver guía completa:** [NOTIFICATIONS_SETUP.md](./NOTIFICATIONS_SETUP.md)

---

## 📚 Documentación Adicional

- [Configuración de Notificaciones](./NOTIFICATIONS_SETUP.md)
- [Implementación del Dashboard](./DASHBOARD_DOCUMENTATION.md)
- [Sistema de Negocios](./NEGOCIOS_IMPLEMENTATION.md)
- [Selector de Mapas](./MAP_SELECTOR_IMPLEMENTATION.md)

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: Clerk
- **Emails**: Resend
- **Almacenamiento**: Cloudinary
- **UI**: Tailwind CSS + shadcn/ui
- **Mapas**: Leaflet + React Leaflet
- **Gestión de Estado**: Zustand

---
