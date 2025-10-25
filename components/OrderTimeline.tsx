"use client";

import {
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  CreditCard,
  Truck,
  XCircle,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type OrderEvent = {
  id: string;
  type: string;
  note: string | null;
  createdAt: Date;
};

interface OrderTimelineProps {
  events: OrderEvent[];
}

export default function OrderTimeline({
  events,
}: Readonly<OrderTimelineProps>) {
  if (events.length === 0) {
    return null;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "CREADA":
      case "REGISTRADA":
        return <Package className="w-4 h-4" />;
      case "PENDIENTE_PAGO":
        return <Clock className="w-4 h-4" />;
      case "PAGADA":
        return <CreditCard className="w-4 h-4" />;
      case "PREPARANDO":
        return <Package className="w-4 h-4" />;
      case "ENVIADA":
        return <Truck className="w-4 h-4" />;
      case "ENTREGADA":
        return <CheckCircle className="w-4 h-4" />;
      case "CANCELADA":
        return <XCircle className="w-4 h-4" />;
      case "NOTA":
        return <FileText className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "CREADA":
      case "REGISTRADA":
        return "text-blue-600 dark:text-blue-400 bg-blue-500/10";
      case "PENDIENTE_PAGO":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10";
      case "PAGADA":
        return "text-green-600 dark:text-green-400 bg-green-500/10";
      case "PREPARANDO":
        return "text-purple-600 dark:text-purple-400 bg-purple-500/10";
      case "ENVIADA":
        return "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10";
      case "ENTREGADA":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10";
      case "CANCELADA":
        return "text-red-600 dark:text-red-400 bg-red-500/10";
      case "NOTA":
        return "text-gray-600 dark:text-gray-400 bg-gray-500/10";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-500/10";
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case "CREADA":
        return "Pedido Creado";
      case "REGISTRADA":
        return "Pedido Registrado";
      case "PENDIENTE_PAGO":
        return "Pendiente de Pago";
      case "PAGADA":
        return "Pago Confirmado";
      case "PREPARANDO":
        return "En Preparación";
      case "ENVIADA":
        return "Pedido Enviado";
      case "ENTREGADA":
        return "Pedido Entregado";
      case "CANCELADA":
        return "Pedido Cancelado";
      case "NOTA":
        return "Nota agregada";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Ordenar eventos de más reciente a más antiguo
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mt-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="timeline"
          className="border border-border rounded-xl bg-accent/30"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary/10">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">
                Historial del Pedido ({sortedEvents.length})
              </h4>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-2">
              {sortedEvents.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor(
                        event.type
                      )}`}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    {index < sortedEvents.length - 1 && (
                      <div className="w-0.5 h-full min-h-[20px] bg-border mt-1" />
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="flex-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {getEventLabel(event.type)}
                        </p>
                        {event.note && (
                          <p className="text-xs text-muted-foreground mt-1 break-words">
                            {event.note}
                          </p>
                        )}
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(event.createdAt)}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
