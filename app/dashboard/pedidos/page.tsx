import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PedidosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Datos de ejemplo para pedidos
  const pedidosEjemplo = [
    {
      id: "1",
      negocio: "Panadería El Hornero",
      productos: ["Pan Francés x2", "Medialunas x6"],
      total: 1500,
      estado: "Completado",
      fecha: "2025-10-10",
      tipo: "Retiro en local",
    },
    {
      id: "2",
      negocio: "Restaurante La Esquina",
      productos: ["Pizza Napolitana", "Empanadas x12"],
      total: 4500,
      estado: "En proceso",
      fecha: "2025-10-13",
      tipo: "Envío a domicilio",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            {role === "CLIENTE" ? "Mis Pedidos" : "Gestión de Pedidos"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {role === "CLIENTE"
              ? "Revisa el estado de tus pedidos realizados"
              : "Administra y procesa los pedidos recibidos"}
          </p>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-6">
          {pedidosEjemplo.map((pedido) => (
            <Card
              key={pedido.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                      <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        {pedido.negocio}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Pedido #{pedido.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      pedido.estado === "Completado"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }
                  >
                    {pedido.estado === "Completado" ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <Clock className="w-4 h-4 mr-1" />
                    )}
                    {pedido.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Productos */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 font-semibold">
                      <Package className="w-4 h-4 text-orange-500" />
                      Productos
                    </div>
                    <ul className="space-y-1">
                      {pedido.productos.map((producto) => (
                        <li
                          key={producto}
                          className="text-sm text-gray-900 dark:text-white"
                        >
                          • {producto}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Fecha:</span>{" "}
                      {pedido.fecha}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold">Tipo:</span> {pedido.tipo}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex flex-col justify-center items-end">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Total
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      ${pedido.total}
                    </p>
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Ver detalles
                  </Button>
                  {role !== "CLIENTE" && pedido.estado !== "Completado" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      Marcar como completado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State si no hay pedidos */}
        {pedidosEjemplo.length === 0 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay pedidos
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {role === "CLIENTE"
                  ? "Aún no has realizado ningún pedido"
                  : "No hay pedidos registrados en el sistema"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
