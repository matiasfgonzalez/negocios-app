import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Package, Plus, DollarSign, Archive } from "lucide-react";
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

export default async function ProductosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
  if (role !== "ADMINISTRADOR" && role !== "PROPIETARIO") {
    redirect("/dashboard");
  }

  // Datos de ejemplo para productos
  const productosEjemplo = [
    {
      id: "1",
      nombre: "Pan Francés",
      descripcion: "Pan artesanal recién horneado",
      precio: 350,
      stock: 50,
      negocio: "Panadería El Hornero",
      disponible: true,
    },
    {
      id: "2",
      nombre: "Medialunas",
      descripcion: "Medialunas de manteca dulces",
      precio: 150,
      stock: 120,
      negocio: "Panadería El Hornero",
      disponible: true,
    },
    {
      id: "3",
      nombre: "Pizza Napolitana",
      descripcion: "Pizza con mozzarella, tomate y albahaca",
      precio: 2800,
      stock: 15,
      negocio: "Restaurante La Esquina",
      disponible: true,
    },
    {
      id: "4",
      nombre: "Empanadas de Carne",
      descripcion: "Empanadas criollas jugosas",
      precio: 300,
      stock: 0,
      negocio: "Restaurante La Esquina",
      disponible: false,
    },
  ];

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

        {/* UI improved: Enhanced header with responsive layout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {role === "PROPIETARIO"
                ? "Mis Productos"
                : "Gestión de Productos"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {role === "PROPIETARIO"
                ? "Administra el catálogo de productos de tu negocio"
                : "Visualiza y gestiona todos los productos del sistema"}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {/* UI improved: Enhanced products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {productosEjemplo.map((producto) => (
            <Card
              key={producto.id}
              className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    className={
                      producto.disponible
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                        : "bg-muted text-muted-foreground border-border"
                    }
                  >
                    {producto.disponible ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg text-foreground">
                  {producto.nombre}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {producto.negocio}
                </CardDescription>
              </CardHeader>
              {/* UI improved: Enhanced content */}
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {producto.descripcion}
                </p>

                {/* UI improved: Enhanced price and stock section */}
                <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10">
                      <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Precio</p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        ${producto.precio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
                      <Archive className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Stock</p>
                      <p
                        className={`text-lg sm:text-xl font-bold ${
                          producto.stock > 0
                            ? "text-foreground"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {producto.stock}
                      </p>
                    </div>
                  </div>
                </div>

                {/* UI improved: Enhanced actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-accent transition-colors duration-200"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/20 transition-colors duration-200"
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
