"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product } from "@/app/types/types";
import { NuevaPromocionFormClient } from "./NuevaPromocionFormClient";
import { getProductsByBusinessId } from "@/app/actions/products";

interface NuevaPromocionDialogProps {
  businessId: string;
  onSuccess?: () => void | Promise<void>;
}

export default function NuevaPromocionDialog({
  businessId,
  onSuccess,
}: Readonly<NuevaPromocionDialogProps>) {
  const [open, setOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
const [isPending, startTransition] = useTransition();

  const handleSuccess = async () => {
    setOpen(false);
    if (onSuccess) {
      await onSuccess();
    }
  };

   useEffect(() => {
    // al montar el componente o si cambia el businessId
    startTransition(async () => {
      const result = await getProductsByBusinessId(businessId);
      setProducts(result);
    });
  }, [businessId]); 

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nueva Promoción
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Promoción</DialogTitle>
          <DialogDescription>
            Complete los datos de la promoción. Los productos deben pertenecer
            al negocio seleccionado.
          </DialogDescription>
        </DialogHeader>

        <NuevaPromocionFormClient
          businessId={businessId}
          products={products}
          loadingProducts={isPending}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
