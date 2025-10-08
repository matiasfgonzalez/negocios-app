// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import BusinessCard from "@/components/BusinessCard";
import MapView from "@/components/MapView";

type Business = {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
};

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
    <div className="space-y-12">
      {/* HERO SECTION */}
      <section className="text-center py-16 bg-white dark:bg-neutral-800 rounded-xl shadow-soft dark:shadow-soft-dark border border-neutral-100 dark:border-neutral-700">
        <h1 className="text-4xl font-bold mb-4 text-primary-600 dark:text-primary-400">
          Descubrí los mejores negocios cerca tuyo
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Filtrá, explorá y realizá pedidos fácilmente desde nuestra plataforma.
        </p>
      </section>

      {/* LISTADO DE NEGOCIOS */}
      <section id="negocios">
        <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Negocios registrados
        </h2>
        {loading ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            Cargando negocios...
          </p>
        ) : businesses.length === 0 ? (
          <p className="text-neutral-600 dark:text-neutral-400">
            No hay negocios registrados aún.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        )}
      </section>

      {/* MAPA */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
          Mapa de negocios
        </h2>
        <MapView businesses={businesses} />
      </section>
    </div>
  );
}
