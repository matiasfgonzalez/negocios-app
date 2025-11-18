"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessDetailClient from "@/components/BusinessDetailClient";
import { Business, Product, PromotionWithProducts } from "@/app/types/types";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type BusinessWithProducts = Business & {
  products: Product[];
  promotions?: PromotionWithProducts[];
};

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<Business | null>(null);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto shadow-2xl">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-md w-full">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-6 sm:p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-xl border-2 border-red-500/30">
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
                onClick={() => globalThis.location.reload()}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Reintentar
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-border/50 hover:bg-accent/50 hover:border-primary/30 transition-all"
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-md w-full">
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-6 sm:p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center mx-auto shadow-xl border-2 border-border">
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
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <BusinessDetailClient business={business as BusinessWithProducts} />;
}
