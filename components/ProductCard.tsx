"use client";
import { useCart } from "@/lib/store/cart";

export default function ProductCard({ product }: Readonly<{ product: any }>) {
  const add = useCart((s) => s.addItem);
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button
        onClick={() =>
          add({
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: 1,
          })
        }
      >
        Agregar
      </button>
    </div>
  );
}
