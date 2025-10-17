"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateOrderWhatsAppMessage } from "@/lib/whatsapp-utils";
import { Order } from "@/app/types/types";

interface ContactBusinessButtonProps {
  readonly order: Order & {
    readonly customer: {
      readonly name: string | null;
      readonly email: string | null;
      readonly phone: string | null;
    };
    readonly business: {
      readonly name: string;
      readonly whatsappPhone: string | null;
    };
    readonly items: ReadonlyArray<{
      readonly quantity: number;
      readonly unitPrice: number;
      readonly product: {
        readonly name: string;
      };
    }>;
  };
}

export default function ContactBusinessButton({
  order,
}: Readonly<ContactBusinessButtonProps>) {
  if (!order.business.whatsappPhone) {
    return null;
  }

  const message = generateOrderWhatsAppMessage(order);
  const phoneNumber = order.business.whatsappPhone.replaceAll(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <Link href={whatsappUrl} target="_blank">
      <Button
        variant="outline"
        size="sm"
        className="hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/50 transition-colors duration-200"
      >
        <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
        Consultar al negocio
      </Button>
    </Link>
  );
}
