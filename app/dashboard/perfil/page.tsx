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
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

        {/* UI improved: Enhanced title section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Información de tu cuenta y preferencias
          </p>
        </div>

        {/* UI improved: Enhanced user information card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-md">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl text-foreground mb-2">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* UI improved: Enhanced email section */}
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl transition-colors hover:bg-accent">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">
                  Correo Electrónico
                </p>
                <p className="text-sm sm:text-base text-foreground font-medium truncate">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>

            {/* UI improved: Enhanced role section */}
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl transition-colors hover:bg-accent">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">
                  Rol en el Sistema
                </p>
                <p className="text-sm sm:text-base text-foreground font-medium">
                  {role}
                </p>
              </div>
            </div>

            {/* UI improved: Enhanced date section */}
            <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl transition-colors hover:bg-accent">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">
                  Miembro desde
                </p>
                <p className="text-sm sm:text-base text-foreground font-medium">
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

        {/* UI improved: Enhanced settings card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground text-lg sm:text-xl">
              Configuración
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Gestiona la configuración de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-accent transition-colors duration-200"
            >
              Editar información personal
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-accent transition-colors duration-200"
            >
              Cambiar contraseña
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-accent transition-colors duration-200"
            >
              Preferencias de notificaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
