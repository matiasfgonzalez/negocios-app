"use client";
import { useCart } from "@/lib/store/cart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function ProductCard({ product }: Readonly<{ product: any }>) {
  const add = useCart((s) => s.addItem);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 group">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xl sm:text-2xl font-bold text-primary">
          ${product.price}
        </p>
        <Button
          onClick={() =>
            add({
              productId: product.id,
              name: product.name,
              unitPrice: product.price,
              quantity: 1,
            })
          }
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all"
          size="sm"
        >
          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
          Agregar
        </Button>
      </CardContent>
    </Card>
  );
}
