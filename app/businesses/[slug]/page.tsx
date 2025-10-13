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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full animate-pulse"></div>
            <Loader2 className="relative w-16 h-16 animate-spin text-primary-500 mx-auto" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              Cargando negocio...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Por favor espera un momento
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {error}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {error.includes("conexión")
                  ? "Verifica tu conexión a internet y que la base de datos esté activa."
                  : "El negocio que buscas no está disponible."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Reintentar
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-6">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gray-400/20 blur-2xl rounded-full"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="w-10 h-10 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Negocio no encontrado
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                El negocio que buscas no existe o no está disponible.
              </p>
            </div>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
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
