import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ConfiguracionPagosClient from "./configuracion-pagos-client";

export default async function ConfiguracionPagosPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!user?.role || user.role !== "ADMINISTRADOR") {
    redirect("/dashboard");
  }

  // Obtener o crear configuración
  let config = await prisma.paymentConfig.findUnique({
    where: { id: "payment_config" },
  });

  if (!config) {
    config = await prisma.paymentConfig.create({
      data: {
        id: "payment_config",
      },
    });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard">
            <Image
              src="/logo.PNG"
              alt="BarrioMarket"
              width={50}
              height={50}
              className="bg-white rounded-lg p-1"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Configuración de Pagos</h1>
            <p className="text-muted-foreground">
              Administra los datos bancarios y montos de suscripción
            </p>
          </div>
        </div>
      </div>

      <ConfiguracionPagosClient initialConfig={config} />
    </div>
  );
}
