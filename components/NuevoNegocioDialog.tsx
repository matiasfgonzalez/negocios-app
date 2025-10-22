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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BusinessScheduleEditor from "@/components/BusinessScheduleEditor";
import {
  BusinessSchedule,
  SpecialClosedDay,
  defaultSchedule,
} from "@/lib/business-hours";
import { BusinessStatus } from "@/app/types/types";

// Importar el mapa de forma dinámica para evitar problemas con SSR
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

interface NuevoNegocioDialogProps {
  userId: string;
}

export default function NuevoNegocioDialog({
  userId,
}: Readonly<NuevoNegocioDialogProps>) {
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
    hasShipping: false,
    shippingCost: "",
    addressText: "",
    lat: "",
    lng: "",
    status: "ABIERTO" as BusinessStatus,
    closedReason: "",
    acceptOrdersOutsideHours: false,
    preparationTime: "30",
  });
  const [schedule, setSchedule] = useState<BusinessSchedule>(defaultSchedule);
  const [specialClosedDays, setSpecialClosedDays] = useState<
    SpecialClosedDay[]
  >([]);

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
          hasShipping: formData.hasShipping,
          shippingCost:
            formData.hasShipping && formData.shippingCost
              ? Number.parseFloat(formData.shippingCost)
              : 0,
          lat: formData.lat ? Number.parseFloat(formData.lat) : null,
          lng: formData.lng ? Number.parseFloat(formData.lng) : null,
          status: formData.status,
          closedReason: formData.closedReason || null,
          schedule: schedule,
          specialClosedDays: specialClosedDays,
          acceptOrdersOutsideHours: formData.acceptOrdersOutsideHours,
          preparationTime: formData.preparationTime
            ? Number.parseInt(formData.preparationTime)
            : null,
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
        hasShipping: false,
        shippingCost: "",
        addressText: "",
        lat: "",
        lng: "",
        status: "ABIERTO" as BusinessStatus,
        closedReason: "",
        acceptOrdersOutsideHours: false,
        preparationTime: "30",
      });
      setSchedule(defaultSchedule);
      setSpecialClosedDays([]);
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
      <DialogContent className="md:min-w-3xl max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border">
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
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                URL de la imagen o logo de tu negocio (opcional)
              </p>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Contacto
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="whatsappPhone"
                className="text-sm font-medium text-foreground"
              >
                WhatsApp
              </Label>
              <Input
                id="whatsappPhone"
                name="whatsappPhone"
                value={formData.whatsappPhone}
                onChange={handleChange}
                placeholder="+54 9 11 1234-5678"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="aliasPago"
                className="text-sm font-medium text-foreground"
              >
                Alias de Pago
              </Label>
              <Input
                id="aliasPago"
                name="aliasPago"
                value={formData.aliasPago}
                onChange={handleChange}
                placeholder="tu.alias.mp"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <input
                  id="hasShipping"
                  name="hasShipping"
                  type="checkbox"
                  checked={formData.hasShipping}
                  onChange={(e) =>
                    setFormData({ ...formData, hasShipping: e.target.checked })
                  }
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary/20"
                />
                <Label
                  htmlFor="hasShipping"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  El negocio ofrece servicio de envío a domicilio
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-7">
                Si está activado, los clientes podrán solicitar envío a
                domicilio
              </p>
            </div>

            {formData.hasShipping && (
              <div className="space-y-2">
                <Label
                  htmlFor="shippingCost"
                  className="text-sm font-medium text-foreground"
                >
                  Costo de Envío *
                </Label>
                <Input
                  id="shippingCost"
                  name="shippingCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required={formData.hasShipping}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Valor que se sumará al total cuando el cliente seleccione
                  envío a domicilio
                </p>
              </div>
            )}
          </div>

          {/* Estado y Operación */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Estado y Operación
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-foreground"
              >
                Estado del Negocio *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: BusinessStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABIERTO">Abierto</SelectItem>
                  <SelectItem value="CERRADO_TEMPORAL">
                    Cerrado Temporalmente
                  </SelectItem>
                  <SelectItem value="CERRADO_PERMANENTE">
                    Cerrado Permanentemente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.status === "CERRADO_TEMPORAL" ||
              formData.status === "CERRADO_PERMANENTE") && (
              <div className="space-y-2">
                <Label
                  htmlFor="closedReason"
                  className="text-sm font-medium text-foreground"
                >
                  Motivo del Cierre
                </Label>
                <Input
                  id="closedReason"
                  name="closedReason"
                  value={formData.closedReason}
                  onChange={handleChange}
                  placeholder="Ej: Vacaciones, renovación, etc."
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="preparationTime"
                className="text-sm font-medium text-foreground"
              >
                Tiempo de Preparación (minutos)
              </Label>
              <Input
                id="preparationTime"
                name="preparationTime"
                type="number"
                min="0"
                step="5"
                value={formData.preparationTime}
                onChange={handleChange}
                placeholder="30"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Tiempo estimado que toma preparar un pedido
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <input
                  id="acceptOrdersOutsideHours"
                  name="acceptOrdersOutsideHours"
                  type="checkbox"
                  checked={formData.acceptOrdersOutsideHours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      acceptOrdersOutsideHours: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary/20"
                />
                <Label
                  htmlFor="acceptOrdersOutsideHours"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Aceptar pedidos fuera del horario de atención
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-7">
                Si está activado, los clientes podrán realizar pedidos incluso
                cuando el negocio esté cerrado
              </p>
            </div>
          </div>

          {/* Horarios de Atención */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Horarios de Atención
            </h3>
            <BusinessScheduleEditor
              schedule={schedule}
              specialClosedDays={specialClosedDays}
              onScheduleChange={setSchedule}
              onSpecialDaysChange={setSpecialClosedDays}
            />
          </div>

          {/* Ubicación */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">
              Ubicación
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="addressText"
                className="text-sm font-medium text-foreground"
              >
                Dirección
              </Label>
              <Input
                id="addressText"
                name="addressText"
                value={formData.addressText}
                onChange={handleChange}
                placeholder="Calle Principal 123, Ciudad"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Mapa Interactivo */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Selecciona la ubicación en el mapa
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg overflow-hidden">
                <MapSelector onLocationSelect={handleLocationSelect} />
              </div>
              <p className="text-xs text-muted-foreground">
                Haz clic en el mapa para seleccionar la ubicación exacta de tu
                negocio
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="lat"
                  className="text-sm font-medium text-foreground"
                >
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lng"
                  className="text-sm font-medium text-foreground"
                >
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
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  readOnly
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Las coordenadas se actualizan automáticamente al hacer clic en el
              mapa
            </p>
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
