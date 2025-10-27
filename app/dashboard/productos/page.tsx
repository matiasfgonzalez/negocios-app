"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductosClient from "./productos-client";

type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
};

type Product = {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  available: boolean;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    slug: string;
    img: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
};

type Business = {
  id: string;
  name: string;
};

function ProductosPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const negocioId = searchParams.get("negocioId");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Obtener categorías
      const categoriasRes = await fetch("/api/categories");
      if (!categoriasRes.ok) throw new Error("Error al cargar categorías");
      const categoriasData = await categoriasRes.json();
      setCategorias(categoriasData);

      // Obtener negocios
      const negociosRes = await fetch("/api/businesses?forManagement=true");
      if (!negociosRes.ok) throw new Error("Error al cargar negocios");
      const negociosData = await negociosRes.json();
      setNegocios(
        negociosData.map((n: { id: string; name: string }) => ({
          id: n.id,
          name: n.name,
        }))
      );

      // Obtener productos
      const params = new URLSearchParams();
      params.set("forManagement", "true");
      if (negocioId) {
        params.set("businessId", negocioId);
      }

      const productosRes = await fetch(`/api/products?${params.toString()}`);
      if (!productosRes.ok) throw new Error("Error al cargar productos");
      const productosData = await productosRes.json();
      setProductos(productosData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [negocioId]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Verificar rol desde la base de datos
    const checkRoleAndFetchData = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) {
          router.push("/dashboard");
          return;
        }

        const appUser = await response.json();

        // Solo ADMINISTRADOR y PROPIETARIO pueden acceder
        if (
          appUser.role !== "ADMINISTRADOR" &&
          appUser.role !== "PROPIETARIO"
        ) {
          router.push("/dashboard");
          return;
        }

        setUserRole(appUser.role);
        fetchData();
      } catch (error) {
        console.error("Error checking role:", error);
        router.push("/dashboard");
      }
    };

    checkRoleAndFetchData();
  }, [user, isLoaded, router, negocioId, fetchData]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => globalThis.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProductosClient
      productos={productos}
      negocios={negocios}
      categorias={categorias}
      role={userRole}
      negocioIdFromUrl={negocioId || undefined}
      onRefresh={fetchData}
    />
  );
}

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      }
    >
      <ProductosPageContent />
    </Suspense>
  );
}
