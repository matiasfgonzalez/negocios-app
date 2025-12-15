"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Product, PromotionWithProducts } from "@/app/types/types";
import { Switch } from "@/components/ui/switch";
import { formatPrice } from "@/lib/utils";

interface EditarPromocionDialogProps {
  promotion: PromotionWithProducts;
  onSuccess?: () => void | Promise<void>;
}

interface ProductSelection {
  productId: string;
  quantity: number;
  product?: Product;
}

export default function EditarPromocionDialog({
  promotion,
  onSuccess,
}: Readonly<EditarPromocionDialogProps>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductSelection[]>(
    []
  );

  const [formData, setFormData] = useState({
    name: promotion.name,
    description: promotion.description || "",
    price: promotion.price.toString(),
    image: promotion.image || "",
    isActive: promotion.isActive,
    startDate: promotion.startDate
      ? new Date(promotion.startDate).toISOString().split("T")[0]
      : "",
    endDate: promotion.endDate
      ? new Date(promotion.endDate).toISOString().split("T")[0]
      : "",
    stock: promotion.stock?.toString() || "",
  });

  useEffect(() => {
    if (open) {
      fetchProducts();
      // Inicializar productos seleccionados
      setSelectedProducts(
        promotion.products.map((p) => ({
          productId: p.productId,
          quantity: p.quantity,
          product: p.product,
        }))
      );
    }
  }, [open, promotion]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        `/api/products?businessId=${promotion.businessId}`
      );
      if (!response.ok) throw new Error("Error al cargar productos");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (selectedProducts.some((p) => p.productId === productId)) {
      alert("Este producto ya está agregado");
      return;
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      alert("Debe agregar al menos un producto a la promoción");
      return;
    }

    const promotionPrice = Number.parseFloat(formData.price);
    const totalIndividual = getTotalIndividualPrice();

    if (promotionPrice >= totalIndividual) {
      alert(
        `El precio de la promoción ($${promotionPrice}) debe ser menor al total individual ($${totalIndividual.toFixed(
          2
        )})`
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/promotions/${promotion.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: Number.parseFloat(formData.price),
          image: formData.image || null,
          isActive: formData.isActive,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null,
          stock: formData.stock ? Number.parseInt(formData.stock) : null,
          products: selectedProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar promoción");
      }

      setOpen(false);

      if (onSuccess) {
        await onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error al actualizar promoción:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al actualizar la promoción. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const availableProducts = products.filter(
    (p) => !selectedProducts.find((sp) => sp.productId === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-primary/10">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Promoción</DialogTitle>
          <DialogDescription>
            Modifica los datos de la promoción {promotion.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre de la Promoción *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Promo noche de sábado"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe la promoción..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Precio Promocional *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
                {selectedProducts.length > 0 && formData.price && (
                  <p className="text-xs text-muted-foreground">
                    Total individual: {formatPrice(getTotalIndividualPrice())}
                    <br />
                    Ahorro:{" "}
                    {formatPrice(
                      getTotalIndividualPrice() -
                        Number.parseFloat(formData.price)
                    )}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-stock">Stock (opcional)</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-image">URL de Imagen</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Fecha de Inicio</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">Fecha de Fin</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-isActive" className="cursor-pointer">
                Promoción activa
              </Label>
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
                        <p className="font-medium text-sm">
                          {item.product?.name}
                        </p>
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
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                          className="w-16 h-8 text-center"
                        />
                        <span className="text-xs text-muted-foreground">x</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(item.productId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selector para agregar productos */}
              {availableProducts.length > 0 && (
                <Select onValueChange={handleAddProduct}>
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
              )}

              {selectedProducts.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Agregue al menos un producto a la promoción
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
