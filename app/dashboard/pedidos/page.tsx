import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import OrderCard from "@/components/OrderCard";

export default async function PedidosPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata.role as string;

  // Obtener el usuario de la base de datos
  const appUser = await prisma.appUser.findUnique({
    where: { clerkId: user.id },
  });

  if (!appUser) {
    redirect("/sign-in");
  }

  // Obtener pedidos según el rol
  let orders;

  if (role === "ADMINISTRADOR") {
    // Administrador ve todos los pedidos
    orders = await prisma.order.findMany({
      include: {
        business: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else if (role === "PROPIETARIO") {
    // Propietario ve pedidos de sus negocios
    orders = await prisma.order.findMany({
      where: {
        business: {
          ownerId: appUser.id,
        },
      },
      include: {
        business: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } else {
    // Cliente ve solo sus propios pedidos
    orders = await prisma.order.findMany({
      where: {
        customerId: appUser.id,
      },
      include: {
        business: true,
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

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
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              userRole={role}
              currentUserId={appUser.id}
            />
          ))}
        </div>

        {/* UI improved: Enhanced empty state */}
        {orders.length === 0 && (
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
