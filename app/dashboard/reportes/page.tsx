import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, FileText, Download, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function ReportesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // Obtener usuario de la base de datos para verificar rol
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    redirect("/sign-in");
  }

  // Solo ADMINISTRADOR puede acceder
  if (appUser.role !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  // Tipos de reportes disponibles
  const reportes = [
    {
      id: "1",
      titulo: "Reporte de Ventas Mensual",
      descripcion: "Resumen completo de todas las ventas del mes actual",
      tipo: "Ventas",
      formato: "PDF / Excel",
      ultimaGeneracion: "2025-10-10",
    },
    {
      id: "2",
      titulo: "Reporte de Usuarios Activos",
      descripcion: "Lista detallada de usuarios registrados y su actividad",
      tipo: "Usuarios",
      formato: "PDF / CSV",
      ultimaGeneracion: "2025-10-08",
    },
    {
      id: "3",
      titulo: "Reporte de Negocios",
      descripcion: "Estadísticas y métricas de todos los negocios registrados",
      tipo: "Negocios",
      formato: "PDF / Excel",
      ultimaGeneracion: "2025-10-05",
    },
    {
      id: "4",
      titulo: "Reporte de Productos",
      descripcion: "Inventario completo y análisis de productos más vendidos",
      tipo: "Productos",
      formato: "Excel / CSV",
      ultimaGeneracion: "2025-10-12",
    },
    {
      id: "5",
      titulo: "Reporte Financiero",
      descripcion: "Análisis de ingresos, transacciones y comisiones",
      tipo: "Finanzas",
      formato: "PDF / Excel",
      ultimaGeneracion: "2025-10-11",
    },
    {
      id: "6",
      titulo: "Reporte de Pedidos",
      descripcion: "Detalle completo de todos los pedidos y su estado",
      tipo: "Pedidos",
      formato: "PDF / CSV",
      ultimaGeneracion: "2025-10-13",
    },
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Ventas":
        return "from-green-500 to-emerald-500";
      case "Usuarios":
        return "from-purple-500 to-pink-500";
      case "Negocios":
        return "from-blue-500 to-cyan-500";
      case "Productos":
        return "from-orange-500 to-amber-500";
      case "Finanzas":
        return "from-indigo-500 to-blue-500";
      case "Pedidos":
        return "from-red-500 to-rose-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* UI improved: Enhanced Header */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Reportes del Sistema
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Genera y descarga reportes detallados de la plataforma
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>

        {/* UI improved: Enhanced Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reportes.map((reporte) => (
            <Card
              key={reporte.id}
              className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 group"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${getTipoColor(
                      reporte.tipo
                    )} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}
                  >
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground bg-accent/50 px-2.5 py-1 rounded-md border border-border">
                    {reporte.tipo}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                  {reporte.titulo}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  {reporte.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del reporte */}
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                    <span className="text-muted-foreground">Formato:</span>
                    <span className="text-foreground font-medium">
                      {reporte.formato}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground p-2">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Última: {reporte.ultimaGeneracion}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
                    size="sm"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-accent border-border"
                  >
                    Vista previa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* UI improved: Enhanced Info Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all mt-8">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  Generación de Reportes
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Los reportes se generan automáticamente cada día. Puedes
                  descargarlos en diferentes formatos según tus necesidades. Los
                  datos se mantienen actualizados en tiempo real.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
