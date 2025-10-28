"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import NextImage from "next/image";
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Cake,
  Loader2,
  Home,
  Globe,
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
import EditProfileDialog from "@/components/EditProfileDialog";

// Importar UserLocationMap dinámicamente
const UserLocationMap = dynamic(() => import("@/components/UserLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

type AppUser = {
  id: string;
  clerkId: string | null;
  email: string | null;
  name: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  documentId: string | null;
  birthDate: Date | null;
  isActive: boolean;
  lastLogin: Date | null;
  preferences: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setAppUser(data);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    loadProfile();
  }, [user, isLoaded, router]);

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !appUser) {
    return null;
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "No especificada";
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-accent transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Mi Perfil
          </h1>
          <p className="text-muted-foreground">
            Información de tu cuenta y preferencias
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {appUser.avatar ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                  <img
                    src={appUser.avatar}
                    alt={appUser.fullName || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
                  <NextImage
                    src="/logo.PNG"
                    alt="BarrioMarket Logo"
                    width={96}
                    height={96}
                    className="object-contain"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl text-foreground mb-2 truncate">
                  {appUser.fullName || appUser.name || "Usuario"}
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {appUser.role}
                  </Badge>
                  {appUser.isActive ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-lg sm:text-xl flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem
                icon={<User className="w-5 h-5 text-primary" />}
                label="Nombre Completo"
                value={
                  appUser.fullName ||
                  `${appUser.name || ""} ${appUser.lastName || ""}`.trim() ||
                  "No especificado"
                }
              />
              <InfoItem
                icon={<Mail className="w-5 h-5 text-primary" />}
                label="Correo Electrónico"
                value={appUser.email || "No especificado"}
              />
              <InfoItem
                icon={
                  <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                }
                label="Teléfono"
                value={appUser.phone || "No especificado"}
              />
              <InfoItem
                icon={
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                }
                label="Documento"
                value={appUser.documentId || "No especificado"}
              />
              <InfoItem
                icon={
                  <Cake className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                }
                label="Fecha de Nacimiento"
                value={formatDate(appUser.birthDate)}
              />
              <InfoItem
                icon={
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                }
                label="Rol"
                value={appUser.role}
              />
            </CardContent>
          </Card>

          {/* Dirección */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-lg sm:text-xl flex items-center gap-2">
                <Home className="w-5 h-5" />
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem
                icon={
                  <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                }
                label="Dirección"
                value={appUser.address || "No especificada"}
              />
              <InfoItem
                icon={
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                }
                label="Ciudad"
                value={appUser.city || "No especificada"}
              />
              <InfoItem
                icon={
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                }
                label="Provincia"
                value={appUser.province || "No especificada"}
              />
              <InfoItem
                icon={
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                }
                label="Código Postal"
                value={appUser.postalCode || "No especificado"}
              />
              {appUser.lat && appUser.lng && (
                <InfoItem
                  icon={
                    <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                  }
                  label="Coordenadas"
                  value={`${appUser.lat.toFixed(6)}, ${appUser.lng.toFixed(6)}`}
                />
              )}
            </CardContent>
          </Card>

          {/* Mapa de Ubicación */}
          {appUser.lat && appUser.lng && (
            <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-foreground text-lg sm:text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ubicación en el Mapa
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Tu ubicación guardada para envíos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border border-border">
                  <UserLocationMap
                    lat={appUser.lat}
                    lng={appUser.lng}
                    name={appUser.fullName || "Mi ubicación"}
                    address={appUser.address || undefined}
                  />
                </div>
                <div className="mt-3 p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Coordenadas: {appUser.lat.toFixed(6)},{" "}
                    {appUser.lng.toFixed(6)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card className="bg-card/50 backdrop-blur-sm border-border shadow-lg">
            <CardHeader>
              <CardTitle className="text-foreground text-lg sm:text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem
                icon={
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                }
                label="Miembro desde"
                value={formatDate(appUser.createdAt)}
              />
              <InfoItem
                icon={
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                }
                label="Última actualización"
                value={formatDate(appUser.updatedAt)}
              />
              {appUser.lastLogin && (
                <InfoItem
                  icon={
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  }
                  label="Último acceso"
                  value={formatDate(appUser.lastLogin)}
                />
              )}
            </CardContent>
          </Card>

          {/* Acciones */}
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
              <EditProfileDialog user={appUser} onSuccess={loadProfile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
}>) {
  return (
    <div className="flex items-start gap-4 p-3 bg-accent/50 rounded-xl transition-colors hover:bg-accent">
      <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm sm:text-base text-foreground font-medium break-words">
          {value}
        </p>
      </div>
    </div>
  );
}
