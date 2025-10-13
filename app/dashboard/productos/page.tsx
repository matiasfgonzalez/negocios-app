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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {role === "PROPIETARIO"
                ? "Mis Productos"
                : "Gestión de Productos"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {role === "PROPIETARIO"
                ? "Administra el catálogo de productos de tu negocio"
                : "Visualiza y gestiona todos los productos del sistema"}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {/* Grid de Productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosEjemplo.map((producto) => (
            <Card
              key={producto.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <Badge
                    className={
                      producto.disponible
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }
                  >
                    {producto.disponible ? "Disponible" : "No disponible"}
                  </Badge>
                </div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  {producto.nombre}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {producto.negocio}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {producto.descripcion}
                </p>

                {/* Precio y Stock */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Precio
                      </p>
                      <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                        ${producto.precio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Stock
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          producto.stock > 0
                            ? "text-secondary-600 dark:text-secondary-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {producto.stock}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700"
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
