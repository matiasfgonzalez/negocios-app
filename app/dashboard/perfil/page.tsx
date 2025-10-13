import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, User, Mail, Shield, Calendar } from "lucide-react";
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

export default async function PerfilPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header con botón de regreso */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Información de tu cuenta y preferencias
          </p>
        </div>

        {/* Card de Información del Usuario */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl mb-6">
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900 dark:text-white mb-2">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                  {role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Correo Electrónico
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>

            {/* Rol */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rol en el Sistema
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {role}
                </p>
              </div>
            </div>

            {/* Fecha de Creación */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Miembro desde
                </p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {new Date(user.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Configuración
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Gestiona la configuración de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Editar información personal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cambiar contraseña
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Preferencias de notificaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
