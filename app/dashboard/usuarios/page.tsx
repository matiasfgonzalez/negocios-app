import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Users, Shield, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UsuariosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR puede acceder
  if (role !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  // Datos de ejemplo para usuarios
  const usuariosEjemplo = [
    {
      id: "1",
      nombre: "Juan Propietario",
      email: "juan@example.com",
      rol: "PROPIETARIO",
      fechaRegistro: "2025-09-15",
      estado: "Activo",
    },
    {
      id: "2",
      nombre: "María Cliente",
      email: "maria@example.com",
      rol: "CLIENTE",
      fechaRegistro: "2025-10-01",
      estado: "Activo",
    },
    {
      id: "3",
      nombre: "Carlos Admin",
      email: "carlos@example.com",
      rol: "ADMINISTRADOR",
      fechaRegistro: "2025-08-01",
      estado: "Activo",
    },
  ];

  const getRoleBadgeColor = (rol: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "PROPIETARIO":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "CLIENTE":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

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
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Administra usuarios y sus permisos en el sistema
          </p>
        </div>

        {/* Lista de Usuarios */}
        <div className="space-y-4">
          {usuariosEjemplo.map((usuario) => (
            <Card
              key={usuario.id}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info del usuario */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {usuario.nombre}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          {usuario.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {usuario.fechaRegistro}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rol y estado */}
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeColor(usuario.rol)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {usuario.rol}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {usuario.estado}
                    </Badge>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Desactivar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {usuariosEjemplo.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                Propietarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {usuariosEjemplo.filter((u) => u.rol === "PROPIETARIO").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600 dark:text-gray-400">
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {usuariosEjemplo.filter((u) => u.rol === "CLIENTE").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
