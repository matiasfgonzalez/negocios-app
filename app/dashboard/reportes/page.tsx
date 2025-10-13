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

export default async function ReportesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR puede acceder
  if (role !== "ADMINISTRADOR") {
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Reportes del Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Genera y descarga reportes detallados de la plataforma
            </p>
          </div>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>

        {/* Grid de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportes.map((reporte) => (
            <Card
              key={reporte.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${getTipoColor(
                      reporte.tipo
                    )} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {reporte.tipo}
                  </span>
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {reporte.titulo}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {reporte.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del reporte */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Formato:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {reporte.formato}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Última: {reporte.ultimaGeneracion}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Vista previa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info adicional */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generación de Reportes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
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
