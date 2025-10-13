import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Store, MapPin, Phone, DollarSign } from "lucide-react";
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
import { prisma } from "@/lib/prisma";
import NuevoNegocioDialog from "@/components/NuevoNegocioDialog";

export default async function NegociosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
  if (role !== "ADMINISTRADOR" && role !== "PROPIETARIO") {
    redirect("/dashboard");
  }

  // Obtener el usuario de la base de datos
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    redirect("/dashboard");
  }

  // Obtener negocios según el rol
  const negocios =
    role === "ADMINISTRADOR"
      ? await prisma.business.findMany({
          include: {
            owner: true,
            _count: {
              select: { products: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : await prisma.business.findMany({
          where: { ownerId: appUser.id },
          include: {
            owner: true,
            _count: {
              select: { products: true },
            },
          },
          orderBy: { createdAt: "desc" },
        });

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

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {role === "PROPIETARIO" ? "Mi Negocio" : "Gestión de Negocios"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {role === "PROPIETARIO"
                ? "Administra la información y productos de tu negocio"
                : "Visualiza y gestiona todos los negocios registrados"}
            </p>
          </div>
          <NuevoNegocioDialog userId={appUser.id} />
        </div>

        {/* Grid de Negocios */}
        {negocios.length === 0 ? (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay negocios registrados
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {role === "PROPIETARIO"
                  ? "Crea tu primer negocio para comenzar a vender"
                  : "Aún no hay negocios registrados en el sistema"}
              </p>
              <NuevoNegocioDialog userId={appUser.id} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {negocios.map((negocio) => (
              <Card
                key={negocio.id}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {negocio.img ? (
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-lg flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                          <img
                            src={negocio.img}
                            alt={`Logo de ${negocio.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <Store className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl text-gray-900 dark:text-white truncate">
                          {negocio.name}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {negocio.rubro}
                        </CardDescription>
                        {role === "ADMINISTRADOR" && negocio.owner.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Propietario: {negocio.owner.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
                      Activo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información del negocio */}
                  <div className="space-y-3">
                    {negocio.addressText && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-900 dark:text-white break-words">
                          {negocio.addressText}
                        </span>
                      </div>
                    )}
                    {negocio.whatsappPhone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                        <a
                          href={`https://wa.me/${negocio.whatsappPhone.replace(
                            /\D/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 dark:text-white hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors"
                        >
                          {negocio.whatsappPhone}
                        </a>
                      </div>
                    )}
                    {negocio.aliasPago && (
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-gray-900 dark:text-white">
                          Alias: {negocio.aliasPago}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700 dark:to-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Productos
                      </p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {negocio._count.products}
                      </p>
                    </div>
                    <Link href={`/businesses/${negocio.slug}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Ver Negocio
                      </Button>
                    </Link>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3 pt-2">
                    <Link
                      href={`/dashboard/negocios/${negocio.id}/editar`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Editar
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/productos?negocioId=${negocio.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Productos
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
