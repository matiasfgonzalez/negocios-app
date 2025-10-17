import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  User,
  Phone,
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
import { prisma } from "@/lib/prisma";
import OrderStateSelector from "@/components/OrderStateSelector";
import OrderDetailsDialog from "@/components/OrderDetailsDialog";
import DeleteOrderDialog from "@/components/DeleteOrderDialog";
import ContactBusinessButton from "@/components/ContactBusinessButton";
import PaymentAliasDisplay from "@/components/PaymentAliasDisplay";

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
          {orders.map((order) => {
            const getStateColor = (state: string) => {
              switch (state) {
                case "REGISTRADA":
                  return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
                case "PENDIENTE_PAGO":
                  return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
                case "PAGADA":
                  return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
                case "PREPARANDO":
                  return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
                case "ENVIADA":
                  return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20";
                case "ENTREGADA":
                  return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
                case "CANCELADA":
                  return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
                default:
                  return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
              }
            };

            const getStateIcon = (state: string) => {
              switch (state) {
                case "ENTREGADA":
                  return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />;
                case "ENVIADA":
                  return <Truck className="w-3.5 h-3.5 mr-1.5" />;
                default:
                  return <Clock className="w-3.5 h-3.5 mr-1.5" />;
              }
            };

            return (
              <Card
                key={order.id}
                className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:border-primary/50 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-lg sm:text-xl text-foreground truncate">
                          {order.business.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          Pedido #{order.id.substring(0, 8).toUpperCase()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {role !== "CLIENTE" ? (
                        <OrderStateSelector
                          orderId={order.id}
                          currentState={order.state}
                        />
                      ) : (
                        <Badge className={getStateColor(order.state)}>
                          {getStateIcon(order.state)}
                          {order.state.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {/* UI improved: Enhanced content layout */}
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Products section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                        <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-orange-500/10">
                          <Package className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                        </div>
                        Productos ({order.items.length})
                      </div>
                      <ul className="space-y-1.5">
                        {order.items.slice(0, 3).map((item) => (
                          <li
                            key={item.id}
                            className="text-sm text-foreground pl-2 border-l-2 border-border"
                          >
                            {item.quantity}x {item.product.name}
                          </li>
                        ))}
                        {order.items.length > 3 && (
                          <li className="text-xs text-muted-foreground pl-2">
                            +{order.items.length - 3} más...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Details section */}
                    <div className="space-y-3">
                      {role !== "CLIENTE" && (
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Cliente
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {order.customer.name || order.customer.email}
                            </p>
                            {order.customer.phone && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {order.customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha</p>
                        <p className="text-sm text-foreground font-medium">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-AR",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="text-sm text-foreground font-medium flex items-center gap-1">
                          {order.shipping ? (
                            <>
                              <Truck className="w-3.5 h-3.5 text-accent" />
                              Envío a domicilio
                            </>
                          ) : (
                            <>
                              <Package className="w-3.5 h-3.5" />
                              Retiro en local
                            </>
                          )}
                        </p>
                        {order.shipping && order.addressText && (
                          <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {order.addressText}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Total section */}
                    <div className="flex flex-col justify-center items-end p-4 bg-accent/50 rounded-xl">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Alias - mostrar si existe */}
                  {order.business.aliasPago && (
                    <div className="mt-4">
                      <PaymentAliasDisplay
                        aliasPago={order.business.aliasPago}
                        businessName={order.business.name}
                      />
                    </div>
                  )}

                  {/* UI improved: Enhanced actions */}
                  <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
                    <OrderDetailsDialog order={order} userRole={role} />

                    {/* Botón para contactar al negocio por WhatsApp */}
                    <ContactBusinessButton order={order} />

                    {/* Botón para que el propietario contacte al cliente */}
                    {role !== "CLIENTE" &&
                      order.business.whatsappPhone &&
                      order.customer.phone && (
                        <Link
                          href={`https://wa.me/${order.customer.phone.replace(
                            /[^0-9]/g,
                            ""
                          )}`}
                          target="_blank"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 transition-colors duration-200"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1.5" />
                            Contactar cliente
                          </Button>
                        </Link>
                      )}
                    {/* Botón de eliminar - solo para REGISTRADA o PENDIENTE_PAGO */}
                    {(order.state === "REGISTRADA" ||
                      order.state === "PENDIENTE_PAGO") &&
                      (role === "ADMINISTRADOR" ||
                        order.customerId === appUser.id) && (
                        <DeleteOrderDialog
                          orderId={order.id}
                          orderNumber={order.id.substring(0, 8).toUpperCase()}
                          businessName={order.business.name}
                        />
                      )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
