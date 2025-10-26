"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
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

    fetchOrders();
  }, [user, isLoaded, router]);

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

  const role = user.publicMetadata.role as string;

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="mb-6 hover:bg-accent transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>

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
              currentUserId={user.id}
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
