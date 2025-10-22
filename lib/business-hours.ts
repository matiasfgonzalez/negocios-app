// lib/business-hours.ts
/**
 * Utilidades para gestionar horarios de negocio
 */

export type DayOfWeek =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export interface TimeSlot {
  open: string; // Formato: "HH:mm"
  close: string; // Formato: "HH:mm"
}

export interface DaySchedule {
  enabled: boolean;
  timeSlots: TimeSlot[]; // Ahora soporta múltiples franjas horarias
}

export interface BusinessSchedule {
  lunes?: DaySchedule;
  martes?: DaySchedule;
  miercoles?: DaySchedule;
  jueves?: DaySchedule;
  viernes?: DaySchedule;
  sabado?: DaySchedule;
  domingo?: DaySchedule;
}

export interface SpecialClosedDay {
  date: string; // Formato: "YYYY-MM-DD"
  reason: string;
}

/**
 * Horario por defecto para un negocio (Lunes a Viernes 9:00-18:00)
 */
export const defaultSchedule: BusinessSchedule = {
  lunes: { enabled: true, timeSlots: [{ open: "09:00", close: "18:00" }] },
  martes: { enabled: true, timeSlots: [{ open: "09:00", close: "18:00" }] },
  miercoles: { enabled: true, timeSlots: [{ open: "09:00", close: "18:00" }] },
  jueves: { enabled: true, timeSlots: [{ open: "09:00", close: "18:00" }] },
  viernes: { enabled: true, timeSlots: [{ open: "09:00", close: "18:00" }] },
  sabado: { enabled: false, timeSlots: [{ open: "09:00", close: "13:00" }] },
  domingo: { enabled: false, timeSlots: [{ open: "09:00", close: "13:00" }] },
};

/**
 * Obtener el día de la semana en español
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const today = new Date().getDay();
  return days[today];
}

/**
 * Verificar si un negocio está abierto ahora
 */
export function isBusinessOpen(
  schedule: BusinessSchedule | null,
  status: string,
  specialClosedDays?: SpecialClosedDay[]
): { isOpen: boolean; reason?: string } {
  // Si el negocio está cerrado permanentemente
  if (status === "CERRADO_PERMANENTE") {
    return { isOpen: false, reason: "Negocio cerrado permanentemente" };
  }

  // Si el negocio está cerrado temporalmente
  if (status === "CERRADO_TEMPORAL") {
    return { isOpen: false, reason: "Cerrado temporalmente" };
  }

  // Si no hay horario configurado, asumimos que está abierto
  if (!schedule) {
    return { isOpen: true };
  }

  const now = new Date();
  const currentDay = getCurrentDayOfWeek();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;
  const currentDate = now.toISOString().split("T")[0];

  // Verificar si es un día especial de cierre
  if (specialClosedDays) {
    const todayClosed = specialClosedDays.find(
      (day) => day.date === currentDate
    );
    if (todayClosed) {
      return { isOpen: false, reason: todayClosed.reason };
    }
  }

  // Obtener el horario del día actual
  const daySchedule = schedule[currentDay];

  // Si el día no está habilitado
  if (!daySchedule || !daySchedule.enabled) {
    return { isOpen: false, reason: "Cerrado hoy" };
  }

  // Verificar si está dentro de alguna franja horaria
  for (const slot of daySchedule.timeSlots) {
    if (currentTime >= slot.open && currentTime <= slot.close) {
      return { isOpen: true };
    }
  }

  // Encontrar la próxima apertura
  const nextSlot = daySchedule.timeSlots.find(
    (slot) => currentTime < slot.open
  );
  if (nextSlot) {
    return { isOpen: false, reason: `Abre a las ${nextSlot.open}` };
  }

  return { isOpen: false, reason: "Cerrado" };
}

/**
 * Obtener mensaje de horario para mostrar al usuario
 */
export function getBusinessHoursMessage(
  schedule: BusinessSchedule | null,
  status: string
): string {
  if (status === "CERRADO_PERMANENTE") {
    return "Cerrado permanentemente";
  }

  if (status === "CERRADO_TEMPORAL") {
    return "Cerrado temporalmente";
  }

  if (!schedule) {
    return "Horario no especificado";
  }

  const currentDay = getCurrentDayOfWeek();
  const daySchedule = schedule[currentDay];

  if (!daySchedule || !daySchedule.enabled) {
    return "Cerrado hoy";
  }

  // Si hay una sola franja horaria
  if (daySchedule.timeSlots.length === 1) {
    const slot = daySchedule.timeSlots[0];
    return `Abierto hoy de ${slot.open} a ${slot.close}`;
  }

  // Si hay múltiples franjas horarias
  const slots = daySchedule.timeSlots
    .map((slot) => `${slot.open}-${slot.close}`)
    .join(", ");
  return `Abierto hoy: ${slots}`;
}

/**
 * Formatear horario completo para mostrar
 */
export function formatFullSchedule(
  schedule: BusinessSchedule | null
): string[] {
  if (!schedule) {
    return ["Horario no especificado"];
  }

  const days: DayOfWeek[] = [
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ];
  const dayNames = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo",
  };

  return days.map((day) => {
    const daySchedule = schedule[day];
    if (!daySchedule || !daySchedule.enabled) {
      return `${dayNames[day]}: Cerrado`;
    }
    const slots = daySchedule.timeSlots
      .map((slot) => `${slot.open}-${slot.close}`)
      .join(", ");
    return `${dayNames[day]}: ${slots}`;
  });
}

/**
 * Validar formato de hora (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validar que la hora de cierre sea posterior a la de apertura
 */
export function isValidTimeRange(open: string, close: string): boolean {
  if (!isValidTimeFormat(open) || !isValidTimeFormat(close)) {
    return false;
  }
  return open < close;
}
