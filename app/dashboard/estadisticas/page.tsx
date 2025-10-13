import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EstadisticasPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR puede acceder
  if (role !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  // Datos de ejemplo para estadísticas
  const stats = {
    usuarios: {
      total: 156,
      nuevos: 23,
      crecimiento: 12.5,
    },
    negocios: {
      total: 42,
      activos: 38,
      crecimiento: 8.3,
    },
    pedidos: {
      total: 1248,
      completados: 1156,
      enProceso: 92,
    },
    ingresos: {
      total: 487500,
      esteMes: 89200,
      crecimiento: 15.7,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Estadísticas del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Visualiza métricas y análisis de rendimiento de la plataforma
          </p>
        </div>

        {/* Grid de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuarios */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Usuarios Totales
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.usuarios.total}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.usuarios.crecimiento}%
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  este mes
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Negocios */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Negocios Activos
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.negocios.activos}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.negocios.crecimiento}%
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  de {stats.negocios.total}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pedidos Totales
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.pedidos.total}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stats.pedidos.completados} completados
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Ingresos */}
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Ingresos Totales
              </CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ${stats.ingresos.total.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.ingresos.crecimiento}%
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  este mes
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Placeholder */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              Análisis de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Gráficos de estadísticas aquí
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Se pueden integrar librerías como Chart.js o Recharts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
