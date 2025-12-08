"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface BusinessSelectorProps {
  businesses: Array<{ id: string; name: string }>;
  selectedBusinessId: string;
}

export function BusinessSelector({
  businesses,
  selectedBusinessId,
}: BusinessSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleBusinessChange = (businessId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("businessId", businessId);
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="business-selector"
        className="block text-sm font-medium mb-2"
      >
        Negocio:
      </label>
      <select
        id="business-selector"
        value={selectedBusinessId}
        onChange={(e) => handleBusinessChange(e.target.value)}
        disabled={isPending}
        className="w-full max-w-md px-4 py-2 border rounded-lg bg-background disabled:opacity-50"
      >
        {businesses.map((business) => (
          <option key={business.id} value={business.id}>
            {business.name}
          </option>
        ))}
      </select>
    </div>
  );
}
