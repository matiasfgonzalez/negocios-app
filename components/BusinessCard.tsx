// src/components/BusinessCard.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Business = {
  id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
};

export default function BusinessCard({ business }: { business: Business }) {
  const router = useRouter();

  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <CardTitle>{business.name}</CardTitle>
        <p className="text-sm text-gray-500">{business.category}</p>
      </CardHeader>
      <CardContent>
        <p>{business.description || "Sin descripción disponible"}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => router.push(`/negocio/${business.id}`)}>
          Ver más
        </Button>
      </CardFooter>
    </Card>
  );
}
