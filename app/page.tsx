// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import BusinessCard from "@/components/BusinessCard";
import MapView from "@/components/MapView";
import { Business } from "./types/types";
import { Store, Sparkles, MapPin, Loader2 } from "lucide-react";

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const res = await fetch("/api/businesses");
        const data = await res.json();
        setBusinesses(data);
      } catch (err) {
        console.error("Error cargando negocios:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
  }, []);

  return (
    <div className="space-y-16">
      {/* UI improved: Enhanced HERO SECTION with modern gradient and better spacing */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/0 to-secondary/5 dark:from-primary/10 dark:via-primary/0 dark:to-secondary/10 rounded-3xl" />

        <div className="relative text-center py-20 px-6 sm:py-24 bg-card/50 dark:bg-card/30 backdrop-blur-sm rounded-3xl border border-border shadow-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-primary/10 dark:bg-primary/20 text-primary rounded-full text-sm font-medium border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Plataforma de Negocios Locales</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
            Descubrí los mejores
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              negocios cerca tuyo
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Filtrá, explorá y realizá pedidos fácilmente desde nuestra
            plataforma.
            <br className="hidden sm:block" />
            Conectá con comercios locales de forma simple y rápida.
          </p>
        </div>
      </section>

      {/* UI improved: Enhanced BUSINESS LISTING SECTION */}
      <section id="negocios" className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Negocios registrados
            </h2>
            <p className="text-sm text-muted-foreground">
              Explorá nuestra selección de comercios locales
            </p>
          </div>
        </div>

        {/* UI improved: Better loading and empty states */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground text-center">
              Cargando negocios disponibles...
            </p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/50 rounded-2xl border border-border">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Store className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay negocios registrados
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              Sé el primero en registrar tu negocio y llegar a más clientes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>

      {/* UI improved: Enhanced MAP SECTION */}
      <section className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <MapPin className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Mapa de negocios
            </h2>
            <p className="text-sm text-muted-foreground">
              Ubicá los comercios más cercanos a vos
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-lg">
          <MapView businesses={businesses} />
        </div>
      </section>
    </div>
  );
}
