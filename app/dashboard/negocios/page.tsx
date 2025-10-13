import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Store, MapPin, Phone, Plus } from "lucide-react";
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

export default async function NegociosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
  if (role !== "ADMINISTRADOR" && role !== "PROPIETARIO") {
    redirect("/dashboard");
  }

  // Datos de ejemplo para negocios
  const negociosEjemplo = [
    {
      id: "1",
      nombre: "Panadería El Hornero",
      rubro: "Panadería",
      direccion: "Av. Principal 123",
      telefono: "+54 9 11 1234-5678",
      estado: "Activo",
      productos: 12,
    },
    {
      id: "2",
      nombre: "Restaurante La Esquina",
      rubro: "Restaurante",
      direccion: "Calle Secundaria 456",
      telefono: "+54 9 11 8765-4321",
      estado: "Activo",
      productos: 25,
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {role === "PROPIETARIO" ? "Mi Negocio" : "Gestión de Negocios"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {role === "PROPIETARIO"
                ? "Administra la información y productos de tu negocio"
                : "Visualiza y gestiona todos los negocios registrados"}
            </p>
          </div>
          <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Negocio
          </Button>
        </div>

        {/* Grid de Negocios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {negociosEjemplo.map((negocio) => (
            <Card
              key={negocio.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Store className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        {negocio.nombre}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {negocio.rubro}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {negocio.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Información del negocio */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">
                      {negocio.direccion}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white">
                      {negocio.telefono}
                    </span>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Productos
                    </p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {negocio.productos}
                    </p>
                  </div>
                  <Link
                    href={`/businesses/${negocio.nombre
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <Button variant="outline" size="sm">
                      Ver Negocio
                    </Button>
                  </Link>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-2">
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
                    className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Productos
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
