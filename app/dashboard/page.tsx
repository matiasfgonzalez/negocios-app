import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Users,
  Store,
  Package,
  ShoppingBag,
  BarChart3,
  FileText,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const role = user.publicMetadata.role as string;

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
      allCards.pedidos,
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
      allCards.pedidos,
      allCards.perfil,
    ];
  } else if (role === "CLIENTE") {
    roleTitle = "Panel del Cliente";
    roleDescription = "Revisa tus pedidos y gestiona tu perfil";
    visibleCards = [allCards.pedidos, allCards.perfil];
  } else {
    return redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {roleTitle}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Bienvenido,{" "}
                <span className="font-semibold">{user.firstName}</span>
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            {roleDescription}
          </p>
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href}>
                <Card className="group h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Acceso Rápido
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
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
