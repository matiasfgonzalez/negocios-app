"use client";

import { useState } from "react";
import { Clock, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Business } from "@/app/types/types";
import {
  BusinessSchedule,
  formatFullSchedule,
  getBusinessHoursMessage,
  isBusinessOpen,
} from "@/lib/business-hours";

interface BusinessHoursDialogProps {
  business: Business;
}

export default function BusinessHoursDialog({
  business,
}: Readonly<BusinessHoursDialogProps>) {
  const [open, setOpen] = useState(false);

  const schedule = business.schedule as BusinessSchedule | null;
  const specialClosedDays = business.specialClosedDays as Array<{
    date: string;
    reason: string;
  }> | null;

  const { isOpen: businessIsOpen, reason } = schedule
    ? isBusinessOpen(schedule, business.status, specialClosedDays || [])
    : { isOpen: false, reason: "Horario no especificado" };

  const hoursMessage = schedule
    ? getBusinessHoursMessage(schedule, business.status)
    : "Horario no especificado";

  const fullSchedule = schedule ? formatFullSchedule(schedule) : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 hover:bg-primary/10"
        >
          <Info className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw] max-h-[90vh] bg-card border-border flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Horarios de Atención
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6 overflow-y-auto flex-1">
          {/* Estado Actual */}
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-2">Estado actual</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  businessIsOpen ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <p className="font-medium text-foreground">
                {businessIsOpen ? "Abierto ahora" : "Cerrado"}
              </p>
            </div>
            {!businessIsOpen && reason && (
              <p className="text-sm text-muted-foreground mt-1">{reason}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">{hoursMessage}</p>
          </div>

          {/* Horario Semanal */}
          {fullSchedule.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Horario Semanal
              </h3>
              <div className="space-y-2">
                {fullSchedule.map((daySchedule, index) => {
                  const [day, hours] = daySchedule.split(": ");
                  const isClosed = hours === "Cerrado";

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {day}
                      </span>
                      <span
                        className={`text-sm ${
                          isClosed
                            ? "text-muted-foreground"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {hours}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Días Especiales de Cierre */}
          {specialClosedDays && specialClosedDays.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Cierres Especiales
              </h3>
              <div className="space-y-2">
                {specialClosedDays.map((specialDay, index) => {
                  const date = new Date(specialDay.date);
                  const formattedDate = date.toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "long",
                  });

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-red-500/10 rounded-lg border border-red-500/20"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {formattedDate}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {specialDay.reason}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Información Adicional */}
          {business.preparationTime && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Tiempo de preparación estimado
              </p>
              <p className="text-sm font-medium text-foreground mt-1">
                {business.preparationTime} minutos
              </p>
            </div>
          )}

          {business.acceptOrdersOutsideHours && (
            <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                ℹ️ Este negocio acepta pedidos fuera del horario de atención
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
