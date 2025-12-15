"use client";

import { startTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
import { DialogFooter } from "@/components/ui/dialog";
import ImageSelector from "@/components/ImageSelector";
import {
  createPromotion,
  type CreatePromotionState,
} from "@/app/actions/promotions";
import { Product } from "@/app/types/types";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";
import { createPromotionSchema } from "@/lib/schemas/promotion";

interface NuevaPromocionFormClientProps {
  businessId: string;
  products: Product[];
  loadingProducts?: boolean;
  onSuccess?: () => void | Promise<void>;
}

interface ProductSelection {
  productId: string;
  quantity: number;
  product?: Product;
}

const initialState: CreatePromotionState = {
  success: false,
  error: undefined,
};

export function NuevaPromocionFormClient({
  businessId,
  products,
  loadingProducts = false,
  onSuccess,
}: Readonly<NuevaPromocionFormClientProps>) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createPromotion,
    initialState
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>(
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    isActive: true,
    startDate: "",
    endDate: "",
    stock: "",
  });

  useEffect(() => {
    if (state.success) {
      // Resetear formulario
      setFormData({
        name: "",
        description: "",
        price: "",
        image: "",
        isActive: true,
        startDate: "",
        endDate: "",
        stock: "",
      });
      setSelectedProducts([]);

      if (onSuccess) {
        onSuccess();
      }

      router.refresh();
    }
  }, [state.success, onSuccess, router]);

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (selectedProducts.find((p) => p.productId === productId)) {
      setClientError("Este producto ya está agregado");
      return;
    }

    setClientError(null);
    setSelectedProducts([
      ...selectedProducts,
      { productId, quantity: 1, product },
    ]);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(
      selectedProducts.filter((p) => p.productId !== productId)
    );
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.productId === productId ? { ...p, quantity } : p
      )
    );
  };

  const getTotalIndividualPrice = () => {
    return selectedProducts.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError(null);

    // Preparar datos para validación
    const dataToValidate = {
      businessId,
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      image: formData.image || null,
      isActive: formData.isActive,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null,
      stock: formData.stock ? parseInt(formData.stock) : null,
      products: selectedProducts,
    };

    // Validar con Zod en el cliente
    const validation = createPromotionSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      setClientError(firstError.message);
      return;
    }

    // Validación adicional: precio debe ser menor al total individual
    if (selectedProducts.length > 0) {
      const promotionPrice = parseFloat(formData.price);
      const totalIndividual = getTotalIndividualPrice();

      if (promotionPrice >= totalIndividual) {
        setClientError(
          `El precio de la promoción ($${promotionPrice}) debe ser menor al total individual ($${totalIndividual.toFixed(
            2
          )})`
        );
        return;
      }
    }

    // Crear FormData y enviar
    const formDataToSubmit = new FormData(e.currentTarget);

    startTransition(() => {
      formAction(formDataToSubmit);
    });
  };

  const availableProducts = products.filter(
    (p) => !selectedProducts.find((sp) => sp.productId === p.id)
  );

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="businessId" value={businessId} />
      <input
        type="hidden"
        name="products"
        value={JSON.stringify(selectedProducts)}
      />
      <div className="grid gap-4 py-4">
        {(state.error || clientError) && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {clientError || state.error}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="name">Nombre de la Promoción *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Promo noche de sábado"
            required
            disabled={isPending}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe la promoción..."
            rows={3}
            disabled={isPending}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Precio Promocional *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0.00"
              required
              disabled={isPending}
            />
            {selectedProducts.length > 0 && formData.price && (
              <p className="text-xs text-muted-foreground">
                Total individual: {formatPrice(getTotalIndividualPrice())}
                <br />
                Ahorro:{" "}
                {formatPrice(
                  getTotalIndividualPrice() - parseFloat(formData.price)
                )}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Stock (opcional)</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="Ilimitado"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <ImageSelector
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            label="Imagen de la Promoción"
            placeholder="https://ejemplo.com/imagen-promocion.jpg"
          />
          <input type="hidden" name="image" value={formData.image} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              disabled={isPending}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">Fecha de Fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              disabled={isPending}
              className="mr-2"
            />
            Promoción activa
          </Label>
          <input
            type="hidden"
            name="isActive"
            value={formData.isActive.toString()}
          />
        </div>

        {/* Productos */}
        <div className="grid gap-3">
          <Label>Productos en la Promoción *</Label>

          {/* Lista de productos seleccionados */}
          {selectedProducts.length > 0 && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              {selectedProducts.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-2 bg-background p-2 rounded"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.product?.price || 0)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.productId,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-16 h-8 text-center"
                      disabled={isPending}
                    />
                    <span className="text-xs text-muted-foreground">x</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(item.productId)}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selector para agregar productos */}
          {loadingProducts ? (
            <div className="text-sm text-muted-foreground">
              Cargando productos...
            </div>
          ) : (
            availableProducts.length > 0 && (
              <Select onValueChange={handleAddProduct} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Agregar producto..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatPrice(product.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          )}

          {selectedProducts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Agregue al menos un producto a la promoción
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando..." : "Crear Promoción"}
        </Button>
      </DialogFooter>
    </form>
  );
}
