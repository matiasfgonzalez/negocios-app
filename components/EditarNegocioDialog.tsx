"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Business, BusinessStatus } from "@/app/types/types";
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
import ShippingRangesEditor from "@/components/ShippingRangesEditor";
import ImageSelector from "@/components/ImageSelector";
import {
  BusinessSchedule,
  SpecialClosedDay,
  defaultSchedule,
} from "@/lib/business-hours";
import { ShippingRange, createFlatShippingRate } from "@/lib/shipping-utils";
import { reverseGeocode } from "@/lib/geocoding";

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

interface EditarNegocioDialogProps {
  business: Business;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void | Promise<void>;
}

export default function EditarNegocioDialog({
  business,
  triggerButton,
  onSuccess,
}: Readonly<EditarNegocioDialogProps>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: business.name,
    rubro: business.rubro,
    description: business.description || "",
    img: business.img || "",
    whatsappPhone: business.whatsappPhone || "",
    aliasPago: business.aliasPago || "",
    hasShipping: business.hasShipping,
    shippingCost: business.shippingCost?.toString() || "0",
    maxShippingDistance: business.maxShippingDistance?.toString() || "",
    addressText: business.addressText || "",
    lat: business.lat?.toString() || "",
    lng: business.lng?.toString() || "",
    status: business.status || "ABIERTO",
    closedReason: business.closedReason || "",
    acceptOrdersOutsideHours: business.acceptOrdersOutsideHours || false,
    preparationTime: business.preparationTime?.toString() || "30",
  });
  const [schedule, setSchedule] = useState<BusinessSchedule>(
    (business.schedule as BusinessSchedule) || defaultSchedule
  );
  const [specialClosedDays, setSpecialClosedDays] = useState<
    SpecialClosedDay[]
  >((business.specialClosedDays as SpecialClosedDay[]) || []);
  const [shippingRanges, setShippingRanges] = useState<ShippingRange[]>(
    (business.shippingRanges as ShippingRange[]) ||
      createFlatShippingRate(business.shippingCost || 0)
  );

  // Actualizar formData cuando cambie el negocio
  useEffect(() => {
    setFormData({
      name: business.name,
      rubro: business.rubro,
      description: business.description || "",
      img: business.img || "",
      whatsappPhone: business.whatsappPhone || "",
      aliasPago: business.aliasPago || "",
      hasShipping: business.hasShipping,
      shippingCost: business.shippingCost?.toString() || "0",
      maxShippingDistance: business.maxShippingDistance?.toString() || "",
      addressText: business.addressText || "",
      lat: business.lat?.toString() || "",
      lng: business.lng?.toString() || "",
      status: business.status || "ABIERTO",
      closedReason: business.closedReason || "",
      acceptOrdersOutsideHours: business.acceptOrdersOutsideHours || false,
      preparationTime: business.preparationTime?.toString() || "30",
    });
    setSchedule((business.schedule as BusinessSchedule) || defaultSchedule);
    setSpecialClosedDays(
      (business.specialClosedDays as SpecialClosedDay[]) || []
    );
    setShippingRanges(
      (business.shippingRanges as ShippingRange[]) ||
        createFlatShippingRate(business.shippingCost || 0)
    );
  }, [business]);

  const handleLocationSelect = async (location: {
    lat: number;
    lng: number;
  }) => {
    setFormData({
      ...formData,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
    });

    // Obtener dirección automáticamente usando geocodificación inversa
    try {
      const addressData = await reverseGeocode(location.lat, location.lng);
      if (addressData.fullAddress) {
        setFormData((prev) => ({
          ...prev,
          lat: location.lat.toString(),
          lng: location.lng.toString(),
          addressText: addressData.fullAddress,
        }));
      }
    } catch (error) {
      console.error("Error al obtener dirección:", error);
      // Si falla, solo actualizar las coordenadas
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/businesses/${business.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          hasShipping: formData.hasShipping,
          shippingCost:
            formData.hasShipping && formData.shippingCost
              ? Number.parseFloat(formData.shippingCost)
              : 0,
          maxShippingDistance:
            formData.hasShipping && formData.maxShippingDistance
              ? Number.parseFloat(formData.maxShippingDistance)
              : null,
          shippingRanges: formData.hasShipping ? shippingRanges : null,
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
        throw new Error(error.error || "Error al actualizar el negocio");
      }

      // Cerrar dialog y refrescar la página
      setOpen(false);

      // Llamar al callback onSuccess si existe
      if (onSuccess) {
        await onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar el negocio"
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
          <Button
            variant="outline"
            size="sm"
            className="w-full hover:bg-accent border-border"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="md:min-w-3xl max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Editar Negocio
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-muted-foreground">
            Actualiza la información de tu negocio. Los campos marcados con *
            son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 mt-4">
          {/* Información Básica */}
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

            <ImageSelector
              value={formData.img}
              onChange={(url) => setFormData({ ...formData, img: url })}
              label="Imagen del Negocio"
              placeholder="https://ejemplo.com/imagen-negocio.jpg"
            />
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
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="maxShippingDistance"
                    className="text-sm font-medium text-foreground"
                  >
                    Distancia Máxima de Envío (km)
                  </Label>
                  <Input
                    id="maxShippingDistance"
                    name="maxShippingDistance"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.maxShippingDistance}
                    onChange={handleChange}
                    placeholder="5.0"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Distancia máxima en kilómetros que aceptas para envíos
                    (dejar vacío para sin límite)
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <ShippingRangesEditor
                    ranges={shippingRanges}
                    onChange={setShippingRanges}
                    maxDistance={
                      formData.maxShippingDistance
                        ? Number.parseFloat(formData.maxShippingDistance)
                        : null
                    }
                  />
                </div>
              </>
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
                Haz clic en el mapa para actualizar la ubicación de tu negocio
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
                  Actualizando...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Actualizar Negocio
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
