"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Importar el mapa de forma dinámica para evitar problemas con SSR
const MapSelector = dynamic<{
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}>(() => import("@/components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Cargando mapa...</p>
    </div>
  ),
});

interface NuevoNegocioDialogProps {
  userId: string;
}

export default function NuevoNegocioDialog({
  userId,
}: NuevoNegocioDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rubro: "",
    description: "",
    img: "",
    whatsappPhone: "",
    aliasPago: "",
    addressText: "",
    lat: "",
    lng: "",
  });

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setFormData({
      ...formData,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ownerId: userId,
          lat: formData.lat ? parseFloat(formData.lat) : null,
          lng: formData.lng ? parseFloat(formData.lng) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear el negocio");
      }

      // Cerrar dialog y refrescar la página
      setOpen(false);
      setFormData({
        name: "",
        rubro: "",
        description: "",
        img: "",
        whatsappPhone: "",
        aliasPago: "",
        addressText: "",
        lat: "",
        lng: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Error al crear el negocio"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Negocio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Crear Nuevo Negocio
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Completa la información de tu negocio. Los campos marcados con * son
            obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 mt-4">
          {/* UI improved: Enhanced Basic Info Section */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Nombre del Negocio *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ej: Panadería El Hornero"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="rubro"
                className="text-sm font-medium text-foreground"
              >
                Rubro *
              </Label>
              <Input
                id="rubro"
                name="rubro"
                value={formData.rubro}
                onChange={handleChange}
                required
                placeholder="Ej: Panadería, Restaurante, Cafetería..."
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-foreground"
              >
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe tu negocio..."
                rows={3}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="img"
                className="text-sm font-medium text-foreground"
              >
                Imagen del Negocio (URL)
              </Label>
              <Input
                id="img"
                name="img"
                type="url"
                value={formData.img}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen-negocio.jpg"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                URL de la imagen o logo de tu negocio (opcional)
              </p>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contacto
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="whatsappPhone"
                className="text-gray-900 dark:text-white"
              >
                WhatsApp
              </Label>
              <Input
                id="whatsappPhone"
                name="whatsappPhone"
                value={formData.whatsappPhone}
                onChange={handleChange}
                placeholder="+54 9 11 1234-5678"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="aliasPago"
                className="text-gray-900 dark:text-white"
              >
                Alias de Pago
              </Label>
              <Input
                id="aliasPago"
                name="aliasPago"
                value={formData.aliasPago}
                onChange={handleChange}
                placeholder="tu.alias.mp"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ubicación
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="addressText"
                className="text-gray-900 dark:text-white"
              >
                Dirección
              </Label>
              <Input
                id="addressText"
                name="addressText"
                value={formData.addressText}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>

            {/* Mapa Interactivo */}
            <div className="space-y-2">
              <Label className="text-gray-900 dark:text-white">
                Selecciona la ubicación en el mapa
              </Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <MapSelector onLocationSelect={handleLocationSelect} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Haz clic en el mapa para seleccionar la ubicación exacta de tu
                negocio
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-gray-900 dark:text-white">
                  Latitud
                </Label>
                <Input
                  id="lat"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="-34.6037"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-gray-900 dark:text-white">
                  Longitud
                </Label>
                <Input
                  id="lng"
                  name="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={handleChange}
                  placeholder="-58.3816"
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  readOnly
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Las coordenadas se actualizan automáticamente al hacer clic en el
              mapa
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Negocio
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
