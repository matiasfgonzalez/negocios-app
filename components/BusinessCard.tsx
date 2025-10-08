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
    <Card className="hover:shadow-lg dark:hover:shadow-soft-dark transition-all duration-300 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <CardHeader>
        <CardTitle className="text-neutral-900 dark:text-neutral-100">
          {business.name}
        </CardTitle>
        <p className="text-sm text-secondary-600 dark:text-secondary-400 font-medium">
          {business.category}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600 dark:text-neutral-300">
          {business.description || "Sin descripción disponible"}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => router.push(`/negocio/${business.id}`)}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white transition-colors"
        >
          Ver más
        </Button>
      </CardFooter>
    </Card>
  );
}
