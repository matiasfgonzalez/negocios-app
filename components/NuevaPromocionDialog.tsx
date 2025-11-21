"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
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
import { Product } from "@/app/types/types";
import ImageSelector from "@/components/ImageSelector";

interface NuevaPromocionDialogProps {
  businessId: string;
  onSuccess?: () => void | Promise<void>;
}

interface ProductSelection {
  productId: string;
  quantity: number;
  product?: Product;
}

export default function NuevaPromocionDialog({
  businessId,
  onSuccess,
}: Readonly<NuevaPromocionDialogProps>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
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
    if (open) {
      fetchProducts();
    }
  }, [open, businessId]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?businessId=${businessId}`);
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

    if (selectedProducts.find((p) => p.productId === productId)) {
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

    const promotionPrice = parseFloat(formData.price);
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
      const response = await fetch("/api/promotions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear promoción");
      }

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

      setOpen(false);

      if (onSuccess) {
        await onSuccess();
      }

      router.refresh();
    } catch (error) {
      console.error("Error al crear promoción:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al crear la promoción. Por favor, intente nuevamente."
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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Promoción *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Promo noche de sábado"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
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
                <Label htmlFor="price">Precio Promocional *</Label>
                <Input
                  id="price"
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
                    Total individual: ${getTotalIndividualPrice().toFixed(2)}
                    <br />
                    Ahorro: $
                    {(
                      getTotalIndividualPrice() - parseFloat(formData.price)
                    ).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">Stock (opcional)</Label>
                <Input
                  id="stock"
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

            <ImageSelector
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              label="Imagen de la Promoción"
              placeholder="https://ejemplo.com/imagen-promocion.jpg"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">Fecha de Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
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
                          ${item.product?.price.toFixed(2)} c/u
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
                        {product.name} - ${product.price.toFixed(2)}
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
              {isLoading ? "Creando..." : "Crear Promoción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
