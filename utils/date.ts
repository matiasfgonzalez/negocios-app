// utils/date.ts
import { fromZonedTime, format } from "date-fns-tz";

const monthsMap: Record<string, string> = {
  January: "Enero",
  February: "Febrero",
  March: "Marzo",
  April: "Abril",
  May: "Mayo",
  June: "Junio",
  July: "Julio",
  August: "Agosto",
  September: "Septiembre",
  October: "Octubre",
  November: "Noviembre",
  December: "Diciembre",
  Jan: "Ene",
  Feb: "Feb",
  Mar: "Mar",
  Apr: "Abr",
  Jun: "Jun",
  Jul: "Jul",
  Aug: "Ago",
  Sep: "Sep",
  Oct: "Oct",
  Nov: "Nov",
  Dec: "Dic",
};

export function formatDateToLocal(date: Date, pattern = "dd/MM/yyyy HH:mm") {
  const timeZone = "America/Argentina/Buenos_Aires";
  const zoned = fromZonedTime(date, timeZone);
  let formatted = format(zoned, pattern, { timeZone });

  // Reemplazar meses en inglés por español
  Object.entries(monthsMap).forEach(([english, spanish]) => {
    formatted = formatted.replace(english, spanish);
  });

  return formatted;
}
