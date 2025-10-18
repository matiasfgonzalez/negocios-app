// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BusinessCard from "@/components/BusinessCard";
import { Business } from "./types/types";
import {
  Store,
  Sparkles,
  MapPin,
  Loader2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Cargar MapView solo en el cliente (no en SSR)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-soft dark:shadow-soft-dark flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [rubroFilter, setRubroFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Obtener rubros únicos
  const rubros = Array.from(new Set(businesses.map((b) => b.rubro))).sort(
    (a, b) => a.localeCompare(b)
  );

  // Filtrar negocios
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.rubro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRubro =
      rubroFilter === "all" || business.rubro === rubroFilter;

    return matchesSearch && matchesRubro;
  });

  // Paginación
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  // Reset página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rubroFilter]);

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

        {/* Filtros y Buscador */}
        {!loading && businesses.length > 0 && (
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Buscador */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, descripción o rubro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 bg-background border-border text-foreground"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filtro por Rubro */}
              <Select value={rubroFilter} onValueChange={setRubroFilter}>
                <SelectTrigger className="w-full sm:w-[200px] bg-background border-border text-foreground">
                  <SelectValue placeholder="Todos los rubros" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los rubros</SelectItem>
                  {rubros.map((rubro) => (
                    <SelectItem key={rubro} value={rubro}>
                      {rubro}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contador de resultados */}
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, filteredBusinesses.length)} de{" "}
              {filteredBusinesses.length} negocio
              {filteredBusinesses.length !== 1 ? "s" : ""}
              {(searchTerm || rubroFilter !== "all") && (
                <span> (filtrados de {businesses.length} totales)</span>
              )}
            </div>
          </div>
        )}

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
        ) : filteredBusinesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card/50 rounded-2xl border border-border">
            <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              No hay negocios que coincidan con tu búsqueda
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setRubroFilter("all");
              }}
              variant="outline"
              className="border-border hover:bg-accent"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border hover:bg-accent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={
                          currentPage === page
                            ? "bg-primary text-primary-foreground"
                            : "border-border hover:bg-accent"
                        }
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="border-border hover:bg-accent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* UI improved: Enhanced MAP SECTION */}
      <section className="scroll-mt-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-secondary/10 rounded-xl">
            <MapPin className="w-6 h-6 text-black dark:text-white" />
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
