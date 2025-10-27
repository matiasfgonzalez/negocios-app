# 🏪 BarrioMarket - Tu barrio, tu comercio

**BarrioMarket** es una plataforma digital argentina que conecta comercios locales con clientes de su zona. Comprá fácil, rápido y apoyá a los negocios de tu barrio.

---

## 🎯 ¿Qué es BarrioMarket?

BarrioMarket es más que una app de compras, es el puente entre el comerciante que te conoce y la comodidad de comprar online.

### Para Clientes 🛒

- 🏪 Descubrí negocios cerca tuyo
- 📱 Pedí desde tu celular
- 🚚 Envío a domicilio o retiro en local
- 💳 Múltiples formas de pago
- 🤝 Apoyá la economía local

### Para Comerciantes 🏪

- 🆓 Registro y uso gratuito
- 📊 Dashboard completo de gestión
- 📦 Control de stock automático
- 💰 Comisiones justas (5-10%)
- 🚀 Más clientes, más ventas

---

## 🚀 Características Principales

✅ **Mapa interactivo** - Visualizá todos los negocios de tu zona  
✅ **Búsqueda avanzada** - Filtros por rubro, productos, ubicación  
✅ **Gestión de pedidos** - Sistema completo para comerciantes  
✅ **WhatsApp integrado** - Contacto directo con comercios  
✅ **Múltiples roles** - Cliente, Propietario, Administrador  
✅ **100% Responsive** - Funciona perfecto en cualquier dispositivo  
✅ **Dark Mode** - Tema claro u oscuro

---

## 🛠️ Tecnologías

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes, Prisma ORM
- **Base de Datos:** PostgreSQL (Neon)
- **Autenticación:** Clerk
- **UI:** Tailwind CSS 4, shadcn/ui, Radix UI
- **Mapas:** Leaflet, React-Leaflet
- **Imágenes:** Cloudinary
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod

---

## 📦 Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- PostgreSQL (o cuenta en Neon)
- Cuenta de Clerk
- Cuenta de Cloudinary (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/barriomarket.git
cd barriomarket
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudinary (opcional)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Configurar base de datos

```bash
# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de ejemplo (opcional)
npm run seed
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentación

- **[BRANDING.md](./BRANDING.md)** - Identidad de marca, mensajes clave, paleta de colores
- **[MARKETING_IDEAS.md](./MARKETING_IDEAS.md)** - Estrategias de marketing y publicidad
- **[PITCH_DECK.md](./PITCH_DECK.md)** - Presentación para inversores
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Configuración de base de datos
- **[DASHBOARD_DOCUMENTATION.md](./DASHBOARD_DOCUMENTATION.md)** - Guía del panel de administración

---

## 🗂️ Estructura del Proyecto

```
barriomarket/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Panel de administración
│   ├── businesses/        # Páginas de negocios
│   ├── about/            # Sobre nosotros
│   └── page.tsx          # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de shadcn/ui
│   └── ...               # Componentes personalizados
├── lib/                   # Utilidades y helpers
├── prisma/               # Schema y migraciones
└── public/               # Archivos estáticos
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Equipo

Desarrollado con 💚 por el equipo de BarrioMarket

---

## 📞 Contacto

- **Web:** [www.barriomarket.com](https://www.barriomarket.com)
- **Email:** contacto@barriomarket.com
- **Instagram:** [@barriomarket](https://instagram.com/barriomarket)
- **Facebook:** [BarrioMarket](https://facebook.com/barriomarket)

---

## 🌟 Apóyanos

Si te gusta el proyecto:

- ⭐ Dale una estrella en GitHub
- 🔄 Compartilo en redes sociales
- 🗣️ Recomendalo a comerciantes y vecinos
- 🤝 Contribuí con código o ideas

---

**BarrioMarket - Porque tu barrio importa**

---

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo

# Build
npm run build            # Generar build de producción
npm start                # Iniciar servidor de producción

# Base de datos
npx prisma studio        # Abrir Prisma Studio
npx prisma migrate dev   # Crear y aplicar migración
npx prisma generate      # Generar Prisma Client
npm run seed             # Poblar base de datos

# Linting
npm run lint             # Ejecutar ESLint
```

---

## 📋 Roadmap

### ✅ Completado

- [x] Sistema de autenticación
- [x] Gestión de negocios
- [x] Catálogo de productos
- [x] Sistema de pedidos
- [x] Dashboard completo
- [x] Mapa interactivo
- [x] Gestión de usuarios
- [x] Roles y permisos
- [x] Integración con WhatsApp

### 🔜 Próximamente

- [ ] App móvil nativa
- [ ] Sistema de notificaciones push
- [ ] Programa de fidelización
- [ ] Reseñas y calificaciones
- [ ] Sistema de cupones/descuentos
- [ ] Integración con pasarelas de pago
- [ ] Delivery tracking en tiempo real
- [ ] Multi-idioma

---

## 🐛 Reporte de Bugs

¿Encontraste un bug? Abrí un issue en GitHub con:

- Descripción detallada del problema
- Pasos para reproducirlo
- Screenshots (si aplica)
- Información del navegador/dispositivo

---

## 💡 Sugerencias

¿Tenés una idea para mejorar BarrioMarket? ¡Nos encantaría escucharla!
Abrí un issue con el tag "enhancement"

---

**Versión actual: 1.0.0**  
**Última actualización: Octubre 2025**
