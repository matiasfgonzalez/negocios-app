// components/server/NuevaPromocionDialogServer.tsx
import { getProductsByBusinessId } from "@/app/actions/products";
import type { Product } from "@/app/types/types";
import NuevaPromocionDialog from "../NuevaPromocionDialog";

interface NuevaPromocionDialogServerProps {
  businessId: string;
  onSuccess?: () => void | Promise<void>;
}

export default async function NuevaPromocionDialogServer({
  businessId,
  onSuccess,
}: Readonly<NuevaPromocionDialogServerProps>) {
  const products: Product[] = await getProductsByBusinessId(businessId);

  return (
    <NuevaPromocionDialog
      businessId={businessId}
      products={products}
      loadingProducts={false}
      onSuccess={onSuccess}
    />
  );
}
