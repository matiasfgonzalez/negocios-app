"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessDetailClient from "@/components/BusinessDetailClient";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BusinessData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  rubro: string;
  img: string | null;
  whatsappPhone: string | null;
  aliasPago: string | null;
  addressText: string | null;
  lat: number | null;
  lng: number | null;
  hasShipping: boolean;
  shippingCost: number | null;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    available: boolean;
    images: any;
  }>;
}

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBusiness() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/businesses/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Negocio no encontrado");
          } else {
            const data = await response.json();
            setError(data.error || "Error al cargar el negocio");
          }
          return;
        }

        const data = await response.json();
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Error de conexión. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchBusiness();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <Loader2 className="relative w-14 h-14 sm:w-16 sm:h-16 animate-spin text-primary mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl font-semibold text-foreground">
              Cargando negocio...
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Por favor espera un momento
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl shadow-xl border-border p-6 sm:p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-red-500/20">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                {error}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {error.includes("conexión")
                  ? "Verifica tu conexión a internet y que la base de datos esté activa."
                  : "El negocio que buscas no está disponible."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                Reintentar
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-accent"
                >
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card/50 backdrop-blur-xl rounded-2xl shadow-xl border-border p-6 sm:p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-muted-foreground/20 blur-2xl rounded-full"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-border">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Negocio no encontrado
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                El negocio que buscas no existe o no está disponible.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BusinessDetailClient business={business} />;
}
