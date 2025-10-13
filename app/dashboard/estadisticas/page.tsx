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
    // UI improved: Clean background
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* UI improved: Enhanced back button */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-accent transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        {/* UI improved: Enhanced header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Estadísticas del Sistema
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visualiza métricas y análisis de rendimiento de la plataforma
          </p>
        </div>

        {/* UI improved: Enhanced statistics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* UI improved: Enhanced Users card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Usuarios Totales
              </CardTitle>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {stats.usuarios.total}
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.usuarios.crecimiento}%
                </span>
                <span className="text-muted-foreground">este mes</span>
              </div>
            </CardContent>
          </Card>

          {/* UI improved: Enhanced Business card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Negocios Activos
              </CardTitle>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {stats.negocios.activos}
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.negocios.crecimiento}%
                </span>
                <span className="text-muted-foreground">
                  de {stats.negocios.total}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* UI improved: Enhanced Orders card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Pedidos Totales
              </CardTitle>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                {stats.pedidos.total}
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {stats.pedidos.completados} completados
                </span>
              </div>
            </CardContent>
          </Card>

          {/* UI improved: Enhanced Revenue card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Ingresos Totales
              </CardTitle>
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                ${stats.ingresos.total.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-xs sm:text-sm">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  +{stats.ingresos.crecimiento}%
                </span>
                <span className="text-muted-foreground">este mes</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* UI improved: Enhanced Chart Placeholder */}
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Análisis de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border">
              <div className="text-center space-y-3">
                <BarChart3 className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/40 mx-auto" />
                <div>
                  <p className="text-sm sm:text-base text-muted-foreground font-medium">
                    Gráficos de estadísticas aquí
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1.5">
                    Se pueden integrar librerías como Chart.js o Recharts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
