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
            Gestión de Usuarios
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Administra usuarios y sus permisos en el sistema
          </p>
        </div>

        {/* UI improved: Enhanced users list */}
        <div className="space-y-4">
          {usuariosEjemplo.map((usuario) => (
            <Card
              key={usuario.id}
              className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* UI improved: User info section */}
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                        {usuario.nombre}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{usuario.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{usuario.fechaRegistro}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UI improved: Role and status badges */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Badge className={getRoleBadgeColor(usuario.rol)}>
                      <Shield className="w-3 h-3 mr-1" />
                      {usuario.rol}
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                      {usuario.estado}
                    </Badge>
                  </div>

                  {/* UI improved: Enhanced actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-accent transition-colors duration-200"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/20 transition-colors duration-200"
                    >
                      Desactivar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* UI improved: Enhanced statistics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground font-medium">
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {usuariosEjemplo.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground font-medium">
                Propietarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                {usuariosEjemplo.filter((u) => u.rol === "PROPIETARIO").length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm text-muted-foreground font-medium">
                Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {usuariosEjemplo.filter((u) => u.rol === "CLIENTE").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
