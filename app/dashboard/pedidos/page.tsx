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
    // UI improved: Clean background
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            {role === "CLIENTE" ? "Mis Pedidos" : "Gestión de Pedidos"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {role === "CLIENTE"
              ? "Revisa el estado de tus pedidos realizados"
              : "Administra y procesa los pedidos recibidos"}
          </p>
        </div>

        {/* UI improved: Enhanced orders list */}
        <div className="space-y-4 sm:space-y-6">
          {pedidosEjemplo.map((pedido) => (
            <Card
              key={pedido.id}
              className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg sm:text-xl text-foreground truncate">
                        {pedido.negocio}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Pedido #{pedido.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={
                      pedido.estado === "Completado"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                    }
                  >
                    {pedido.estado === "Completado" ? (
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {pedido.estado}
                  </Badge>
                </div>
              </CardHeader>
              {/* UI improved: Enhanced content layout */}
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Products section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                      <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-orange-500/10">
                        <Package className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      </div>
                      Productos
                    </div>
                    <ul className="space-y-1.5">
                      {pedido.productos.map((producto) => (
                        <li
                          key={producto}
                          className="text-sm text-foreground pl-2 border-l-2 border-border"
                        >
                          {producto}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Details section */}
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Fecha:
                      </span>{" "}
                      {pedido.fecha}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Tipo:
                      </span>{" "}
                      {pedido.tipo}
                    </p>
                  </div>

                  {/* Total section */}
                  <div className="flex flex-col justify-center items-end p-4 bg-accent/50 rounded-xl">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      Total
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">
                      ${pedido.total}
                    </p>
                  </div>
                </div>

                {/* UI improved: Enhanced actions */}
                <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover:bg-accent transition-colors duration-200"
                  >
                    Ver detalles
                  </Button>
                  {role !== "CLIENTE" && pedido.estado !== "Completado" && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                    >
                      Marcar como completado
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* UI improved: Enhanced empty state */}
        {pedidosEjemplo.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No hay pedidos
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
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
