"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Users,
  Shield,
  Store,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsuariosClient from "./usuarios-client";

type User = {
  id: string;
  clerkId: string | null;
  email: string | null;
  name: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE";
  address: string | null;
  city: string | null;
  province: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    businesses: number;
    orders: number;
  };
};

function UsuariosPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (roleFilter !== "all") {
        params.set("role", roleFilter);
      }

      if (statusFilter !== "all") {
        params.set("isActive", statusFilter);
      }

      if (searchTerm) {
        params.set("search", searchTerm);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar usuarios");
      }

      const data = await response.json();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    // Verificar rol desde la base de datos
    const checkRole = async () => {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) {
          router.push("/dashboard");
          return;
        }

        const appUser = await response.json();

        // Solo ADMINISTRADOR puede acceder
        if (appUser.role !== "ADMINISTRADOR") {
          router.push("/dashboard");
          return;
        }

        fetchData();
      } catch (error) {
        console.error("Error checking role:", error);
        router.push("/dashboard");
      }
    };

    checkRole();
  }, [user, isLoaded, router, fetchData]);

  // Calcular estadísticas
  const stats = {
    total: usuarios.length,
    admins: usuarios.filter((u) => u.role === "ADMINISTRADOR").length,
    propietarios: usuarios.filter((u) => u.role === "PROPIETARIO").length,
    clientes: usuarios.filter((u) => u.role === "CLIENTE").length,
    activos: usuarios.filter((u) => u.isActive).length,
    inactivos: usuarios.filter((u) => !u.isActive).length,
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
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
          <Button onClick={() => fetchData()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra todos los usuarios del sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activos} activos, {stats.inactivos} inactivos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Acceso total al sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propietarios</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.propietarios}</div>
            <p className="text-xs text-muted-foreground">Dueños de negocios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clientes}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios compradores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtra y busca usuarios en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, email, teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                  <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuarios */}
      <UsuariosClient usuarios={usuarios} onRefresh={fetchData} />
    </div>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      }
    >
      <UsuariosPageContent />
    </Suspense>
  );
}
