"use client";

import { useState } from "react";
import { Clock, Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  BusinessSchedule,
  DayOfWeek,
  SpecialClosedDay,
  TimeSlot,
  defaultSchedule,
  isValidTimeRange,
} from "@/lib/business-hours";

interface BusinessScheduleEditorProps {
  schedule: BusinessSchedule | null;
  specialClosedDays: SpecialClosedDay[];
  onScheduleChange: (schedule: BusinessSchedule) => void;
  onSpecialDaysChange: (days: SpecialClosedDay[]) => void;
}

export default function BusinessScheduleEditor({
  schedule,
  specialClosedDays,
  onScheduleChange,
  onSpecialDaysChange,
}: Readonly<BusinessScheduleEditorProps>) {
  const [currentSchedule, setCurrentSchedule] = useState<BusinessSchedule>(
    schedule || defaultSchedule
  );

  const days: { key: DayOfWeek; label: string }[] = [
    { key: "lunes", label: "Lunes" },
    { key: "martes", label: "Martes" },
    { key: "miercoles", label: "Miércoles" },
    { key: "jueves", label: "Jueves" },
    { key: "viernes", label: "Viernes" },
    { key: "sabado", label: "Sábado" },
    { key: "domingo", label: "Domingo" },
  ];

  const handleDayToggle = (day: DayOfWeek) => {
    const updated = {
      ...currentSchedule,
      [day]: {
        ...currentSchedule[day],
        enabled: !currentSchedule[day]?.enabled,
      },
    };
    setCurrentSchedule(updated);
    onScheduleChange(updated);
  };

  const handleTimeSlotChange = (
    day: DayOfWeek,
    slotIndex: number,
    field: "open" | "close",
    value: string
  ) => {
    const daySchedule = currentSchedule[day];
    if (!daySchedule) return;

    const updatedSlots = [...daySchedule.timeSlots];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      [field]: value,
    };

    const updated = {
      ...currentSchedule,
      [day]: {
        ...daySchedule,
        timeSlots: updatedSlots,
      },
    };
    setCurrentSchedule(updated);
    onScheduleChange(updated);
  };

  const handleAddTimeSlot = (day: DayOfWeek) => {
    const daySchedule = currentSchedule[day];
    if (!daySchedule) return;

    // Agregar una nueva franja horaria con valores por defecto
    const newSlot: TimeSlot = { open: "09:00", close: "18:00" };
    const updated = {
      ...currentSchedule,
      [day]: {
        ...daySchedule,
        timeSlots: [...daySchedule.timeSlots, newSlot],
      },
    };
    setCurrentSchedule(updated);
    onScheduleChange(updated);
  };

  const handleRemoveTimeSlot = (day: DayOfWeek, slotIndex: number) => {
    const daySchedule = currentSchedule[day];
    if (!daySchedule || daySchedule.timeSlots.length <= 1) return; // Mínimo 1 franja

    const updated = {
      ...currentSchedule,
      [day]: {
        ...daySchedule,
        timeSlots: daySchedule.timeSlots.filter((_, i) => i !== slotIndex),
      },
    };
    setCurrentSchedule(updated);
    onScheduleChange(updated);
  };

  const handleAddSpecialDay = () => {
    const newDay: SpecialClosedDay = {
      date: new Date().toISOString().split("T")[0],
      reason: "",
    };
    onSpecialDaysChange([...specialClosedDays, newDay]);
  };

  const handleRemoveSpecialDay = (index: number) => {
    onSpecialDaysChange(specialClosedDays.filter((_, i) => i !== index));
  };

  const handleSpecialDayChange = (
    index: number,
    field: keyof SpecialClosedDay,
    value: string
  ) => {
    const updated = [...specialClosedDays];
    updated[index] = { ...updated[index], [field]: value };
    onSpecialDaysChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Horario Semanal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h4 className="text-base font-semibold text-foreground">
            Horario de Atención Semanal
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Puedes agregar múltiples franjas horarias por día (ej: 10:00-15:00 y
          20:00-24:00)
        </p>

        <div className="space-y-3">
          {days.map(({ key, label }) => {
            const daySchedule = currentSchedule[key];
            const isEnabled = daySchedule?.enabled || false;
            const timeSlots = daySchedule?.timeSlots || [];

            return (
              <div key={key} className="p-3 bg-muted/50 rounded-lg space-y-2">
                {/* Toggle del día */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      id={`day-${key}`}
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleDayToggle(key)}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-2 focus:ring-primary/20"
                    />
                    <Label
                      htmlFor={`day-${key}`}
                      className="text-sm font-medium text-foreground cursor-pointer"
                    >
                      {label}
                    </Label>
                  </div>

                  {isEnabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddTimeSlot(key)}
                      className="h-7 text-xs hover:bg-primary/10"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Agregar franja
                    </Button>
                  )}
                </div>

                {/* Franjas horarias */}
                {isEnabled && (
                  <div className="space-y-2 pl-7">
                    {timeSlots.map((slot, slotIndex) => {
                      const hasError = !isValidTimeRange(slot.open, slot.close);
                      const canRemove = timeSlots.length > 1;

                      return (
                        <div
                          key={`${key}-${slotIndex}`}
                          className="flex items-center gap-2"
                        >
                          <Input
                            type="time"
                            value={slot.open}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                key,
                                slotIndex,
                                "open",
                                e.target.value
                              )
                            }
                            className="bg-background border-border text-foreground"
                          />
                          <span className="text-muted-foreground">a</span>
                          <Input
                            type="time"
                            value={slot.close}
                            onChange={(e) =>
                              handleTimeSlotChange(
                                key,
                                slotIndex,
                                "close",
                                e.target.value
                              )
                            }
                            className="bg-background border-border text-foreground"
                          />

                          {canRemove && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveTimeSlot(key, slotIndex)
                              }
                              className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}

                          {hasError && (
                            <span className="text-xs text-destructive whitespace-nowrap">
                              Hora inválida
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isEnabled && (
                  <div className="pl-7">
                    <span className="text-sm text-muted-foreground">
                      Cerrado
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Días Especiales de Cierre */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground">
              Días Especiales de Cierre
            </h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSpecialDay}
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Agrega fechas especiales en las que el negocio estará cerrado
          (vacaciones, feriados, etc.)
        </p>

        {specialClosedDays.length > 0 && (
          <div className="space-y-2">
            {specialClosedDays.map((day, index) => (
              <div
                key={`${day.date}-${index}`}
                className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/50 rounded-lg"
              >
                <Input
                  type="date"
                  value={day.date}
                  onChange={(e) =>
                    handleSpecialDayChange(index, "date", e.target.value)
                  }
                  className="bg-background border-border text-foreground"
                />
                <Input
                  type="text"
                  value={day.reason}
                  onChange={(e) =>
                    handleSpecialDayChange(index, "reason", e.target.value)
                  }
                  placeholder="Motivo del cierre"
                  className="bg-background border-border text-foreground flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSpecialDay(index)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
