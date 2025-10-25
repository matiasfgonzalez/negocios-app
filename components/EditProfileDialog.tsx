"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Save } from "lucide-react";
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
import ImageSelector from "@/components/ImageSelector";

const MapSelector = dynamic<{
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}>(() => import("@/components/MapSelector"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-muted rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  ),
});

type AppUser = {
  id: string;
  name: string | null;
  lastName: string | null;
  phone: string | null;
  avatar: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  documentId: string | null;
  birthDate: Date | null;
};

interface EditProfileDialogProps {
  user: AppUser;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

export default function EditProfileDialog({
  user,
  triggerButton,
  onSuccess,
}: Readonly<EditProfileDialogProps>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    lastName: user.lastName || "",
    phone: user.phone || "",
    avatar: user.avatar || "",
    address: user.address || "",
    lat: user.lat?.toString() || "",
    lng: user.lng?.toString() || "",
    city: user.city || "",
    province: user.province || "",
    postalCode: user.postalCode || "",
    documentId: user.documentId || "",
    birthDate: user.birthDate
      ? new Date(user.birthDate).toISOString().split("T")[0]
      : "",
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
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lat: formData.lat || null,
          lng: formData.lng || null,
          birthDate: formData.birthDate || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el perfil");
      }

      setOpen(false);

      // Llamar a onSuccess para recargar los datos
      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "Error al actualizar el perfil"
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
        {triggerButton || (
          <Button variant="outline" className="w-full justify-start">
            <Pencil className="w-4 h-4 mr-2" />
            Editar información personal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="md:min-w-3xl max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Actualiza tu información personal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 mt-4">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Información Personal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-foreground"
                >
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-foreground"
                >
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+54 9 11 1234-5678"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="documentId"
                  className="text-sm font-medium text-foreground"
                >
                  Documento (DNI)
                </Label>
                <Input
                  id="documentId"
                  name="documentId"
                  value={formData.documentId}
                  onChange={handleChange}
                  placeholder="12345678"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="birthDate"
                className="text-sm font-medium text-foreground"
              >
                Fecha de Nacimiento
              </Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="bg-background border-border text-foreground"
              />
            </div>

            <ImageSelector
              value={formData.avatar}
              onChange={(url) => setFormData({ ...formData, avatar: url })}
              label="Foto de Perfil"
              placeholder="https://ejemplo.com/avatar.jpg"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Dirección
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-foreground"
              >
                Dirección Completa
              </Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle, número, piso, departamento"
                rows={2}
                className="bg-background border-border text-foreground resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-foreground"
                >
                  Ciudad
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Buenos Aires"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="province"
                  className="text-sm font-medium text-foreground"
                >
                  Provincia
                </Label>
                <Input
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  placeholder="Buenos Aires"
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="postalCode"
                  className="text-sm font-medium text-foreground"
                >
                  Código Postal
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="1000"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Ubicación en el Mapa
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                <MapSelector
                  onLocationSelect={handleLocationSelect}
                  initialLocation={
                    formData.lat && formData.lng
                      ? {
                          lat: Number.parseFloat(formData.lat),
                          lng: Number.parseFloat(formData.lng),
                        }
                      : undefined
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Haz clic en el mapa para seleccionar tu ubicación
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="flex-1 hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
