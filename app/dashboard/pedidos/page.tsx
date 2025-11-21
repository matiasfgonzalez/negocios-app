"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BackButton from "@/components/BackButton";
import OrderCard from "@/components/OrderCard";

type Order = {
  id: string;
  businessId: string;
  customerId: string;
  total: number;
  shipping: boolean;
  lat: number | null;
  lng: number | null;
  addressText: string | null;
  state: string;
  paymentProof: string | null;
  note: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  business: {
    id: string;
    name: string;
    slug: string;
    aliasPago: string | null;
    whatsappPhone: string | null;
    img: string | null;
  };
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: Array<{
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      businessId: string;
      categoryId: string | null;
      name: string;
      description: string | null;
      price: number;
      stock: number;
      sku: string | null;
      available: boolean;
      images: unknown;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  events: Array<{
    id: string;
    orderId: string;
    actorId: string | null;
    type: string;
    note: string | null;
    createdAt: Date;
  }>;
};

export default function PedidosPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [currentAppUserId, setCurrentAppUserId] = useState<string>("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    fetchOrders();
  }, [user, isLoaded, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      // Obtener el rol del usuario desde la base de datos
      const userResponse = await fetch("/api/me");
      if (!userResponse.ok) {
        throw new Error("Error al obtener información del usuario");
      }
      const appUser = await userResponse.json();
      setUserRole(appUser.role);
      setCurrentAppUserId(appUser.id);

      const response = await fetch("/api/orders");

      if (!response.ok) {
        throw new Error("Error al cargar los pedidos");
      }

      const data = await response.json();

      // Convertir fechas de string a Date
      const ordersWithDates = data.map((order: Order) => {
        const events = order.events.map((event) => ({
          ...event,
          createdAt: new Date(event.createdAt),
        }));

        const items = order.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            createdAt: new Date(item.product.createdAt),
            updatedAt: new Date(item.product.updatedAt),
          },
        }));

        return {
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          events,
          items,
        };
      });

      setOrders(ordersWithDates);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <BackButton href="/dashboard" label="Volver al Dashboard" />

          <Card className="bg-card/50 backdrop-blur-sm border border-red-500/50">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Error al cargar pedidos
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-4">
                {error}
              </p>
              <Button
                onClick={() => globalThis.location.reload()}
                variant="outline"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    // UI improved: Clean background
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BackButton href="/dashboard" label="Volver al Dashboard" />

        {/* UI improved: Enhanced header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {userRole === "CLIENTE" ? "Mis Pedidos" : "Gestión de Pedidos"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {userRole === "CLIENTE"
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
              userRole={userRole}
              currentUserId={currentAppUserId}
              onOrderUpdated={fetchOrders}
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
                {userRole === "CLIENTE"
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
