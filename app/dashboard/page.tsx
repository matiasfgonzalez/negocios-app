import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import {
  User,
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  ArrowRight,
  Image,
  CreditCard,
  Settings,
  Bell,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

interface DashboardCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  gradient: string;
}

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Obtener usuario de la base de datos para verificar rol
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    redirect("/sign-in");
  }

  const role = appUser.role;

  // Definir las tarjetas disponibles
  const allCards: Record<string, DashboardCard> = {
    perfil: {
      title: "Perfil",
      description: "Gestiona tu información personal y preferencias",
      icon: User,
      href: "/dashboard/perfil",
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-cyan-500",
    },
    usuarios: {
      title: "Usuarios",
      description: "Administra usuarios y permisos del sistema",
      icon: Users,
      href: "/dashboard/usuarios",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-pink-500",
    },
    negocios: {
      title: "Negocios",
      description: "Gestiona los negocios registrados en la plataforma",
      icon: Store,
      href: "/dashboard/negocios",
      color: "text-green-600 dark:text-green-400",
      gradient: "from-green-500 to-emerald-500",
    },
    productos: {
      title: "Productos",
      description: "Administra el catálogo de productos",
      icon: Package,
      href: "/dashboard/productos",
      color: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500 to-amber-500",
    },
    promociones: {
      title: "Promociones",
      description: "Crea y gestiona ofertas especiales",
      icon: Tag,
      href: "/dashboard/promociones",
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      gradient: "from-fuchsia-500 to-pink-500",
    },
    pedidos: {
      title: "Pedidos",
      description: "Revisa y gestiona los pedidos realizados",
      icon: ShoppingBag,
      href: "/dashboard/pedidos",
      color: "text-red-600 dark:text-red-400",
      gradient: "from-red-500 to-rose-500",
    },
    estadisticas: {
      title: "Estadísticas",
      description: "Visualiza métricas y análisis de rendimiento",
      icon: BarChart3,
      href: "/dashboard/estadisticas",
      color: "text-indigo-600 dark:text-indigo-400",
      gradient: "from-indigo-500 to-blue-500",
    },
    reportes: {
      title: "Reportes",
      description: "Genera y descarga reportes detallados",
      icon: FileText,
      href: "/dashboard/reportes",
      color: "text-teal-600 dark:text-teal-400",
      gradient: "from-teal-500 to-cyan-500",
    },
    imagenes: {
      title: "Imágenes",
      description: "Sube y gestiona imágenes para tus productos",
      icon: Image,
      href: "/dashboard/images",
      color: "text-pink-600 dark:text-pink-400",
      gradient: "from-purple-500 to-pink-500",
    },
    solicitudes: {
      title: "Mis Solicitudes",
      description: "Gestiona tus solicitudes de cambio de rol",
      icon: FileText,
      href: "/dashboard/solicitudes",
      color: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-cyan-500",
    },
    solicitudesAdmin: {
      title: "Gestión de Solicitudes",
      description: "Revisa solicitudes de cambio de rol",
      icon: Users,
      href: "/dashboard/solicitudes-admin",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-indigo-500",
    },
    pagos: {
      title: "Mis Pagos",
      description: "Gestiona tu suscripción y pagos mensuales",
      icon: CreditCard,
      href: "/dashboard/pagos",
      color: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500 to-teal-500",
    },
    pagosAdmin: {
      title: "Gestión de Pagos",
      description: "Revisa y aprueba pagos de propietarios",
      icon: CreditCard,
      href: "/dashboard/pagos-admin",
      color: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500 to-green-500",
    },
    configuracionPagos: {
      title: "Configuración de Pagos",
      description: "Administra montos y datos bancarios",
      icon: Settings,
      href: "/dashboard/configuracion-pagos",
      color: "text-indigo-600 dark:text-indigo-400",
      gradient: "from-indigo-500 to-purple-500",
    },
    notificacionesPreview: {
      title: "Preview de Notificaciones",
      description: "Vista previa de notificaciones automáticas",
      icon: Bell,
      href: "/dashboard/notificaciones-preview",
      color: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-pink-500",
    },
  };

  // Determinar qué tarjetas mostrar según el rol
  let visibleCards: DashboardCard[] = [];
  let roleTitle = "";
  let roleDescription = "";

  if (role === "ADMINISTRADOR") {
    roleTitle = "Panel del Administrador";
    roleDescription = "Acceso completo a todas las funcionalidades del sistema";
    visibleCards = [
      allCards.usuarios,
      allCards.negocios,
      allCards.productos,
      allCards.promociones,
      allCards.pedidos,
      allCards.solicitudesAdmin,
      allCards.pagosAdmin,
      allCards.configuracionPagos,
      allCards.notificacionesPreview,
      allCards.imagenes,
      allCards.estadisticas,
      allCards.reportes,
      allCards.perfil,
    ];
  } else if (role === "PROPIETARIO") {
    roleTitle = "Panel del Propietario";
    roleDescription = "Gestiona tu negocio, productos y pedidos";
    visibleCards = [
      allCards.negocios,
      allCards.productos,
      allCards.promociones,
      allCards.pedidos,
      allCards.pagos,
      allCards.imagenes,
      allCards.perfil,
    ];
  } else if (role === "CLIENTE") {
    roleTitle = "Panel del Cliente";
    roleDescription = "Revisa tus pedidos y gestiona tu perfil";
    visibleCards = [allCards.pedidos, allCards.solicitudes, allCards.perfil];
  } else {
    return redirect("/sign-in");
  }

  return (
    // UI improved: Clean background without gradient overlay
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* UI improved: Enhanced header with better responsive design */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-white rounded-2xl overflow-hidden shadow-md p-2">
              <NextImage
                src="/logo.PNG"
                alt="BarrioMarket Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                {roleTitle}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-1">
                Bienvenido,{" "}
                <span className="font-semibold text-foreground">
                  {user.firstName}
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            {roleDescription}
          </p>
        </div>

        {/* UI improved: Enhanced cards grid with better hover effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group relative h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden">
                  {/* UI improved: Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-secondary/5 dark:group-hover:from-primary/10 dark:group-hover:to-secondary/10 transition-all duration-300 pointer-events-none" />

                  <CardHeader className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* UI improved: Enhanced footer info card */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border shadow-md">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                Acceso Rápido
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Selecciona cualquier tarjeta para acceder a la funcionalidad
                correspondiente. Cada sección está diseñada para facilitar la
                gestión de tu{" "}
                {role === "ADMINISTRADOR"
                  ? "plataforma"
                  : role === "PROPIETARIO"
                  ? "negocio"
                  : "experiencia"}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
