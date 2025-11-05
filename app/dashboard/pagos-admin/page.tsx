import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Clock, CheckCircle2, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Payment } from "@/app/types/types";
import PagosAdminClient from "./pagos-admin-client";

async function getPaymentsData() {
  const payments = await prisma.payment.findMany({
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
}

async function getStats() {
  const [
    totalPayments,
    pendingPayments,
    approvedThisMonth,
    totalRevenue,
    activeProprietors,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.count({
      where: { status: "PENDING" },
    }),
    prisma.payment.count({
      where: {
        status: "APPROVED",
        reviewedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.appUser.count({
      where: {
        role: "PROPIETARIO",
        subscriptionStatus: {
          in: ["TRIAL", "ACTIVE"],
        },
      },
    }),
  ]);

  return {
    totalPayments,
    pendingPayments,
    approvedThisMonth,
    totalRevenue: totalRevenue._sum.amount || 0,
    activeProprietors,
  };
}

export default async function PagosAdminPage() {
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

  const payments = await getPaymentsData();
  const stats = await getStats();

  // Convertir pagos a formato serializable
  const serializedPayments: Payment[] = payments.map((payment) => ({
    id: payment.id,
    ownerId: payment.ownerId,
    amount: payment.amount,
    periodMonth: payment.periodMonth,
    status: payment.status,
    proofUrl: payment.proofUrl,
    proofPublicId: payment.proofPublicId,
    ownerNote: payment.ownerNote,
    adminNote: payment.adminNote,
    reviewedBy: payment.reviewedBy,
    reviewedAt: payment.reviewedAt ? payment.reviewedAt.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    owner: payment.owner
      ? {
          id: payment.owner.id,
          fullName: payment.owner.fullName,
          email: payment.owner.email,
        }
      : undefined,
  }));

  const pendingPayments = serializedPayments.filter(
    (p) => p.status === "PENDING"
  );
  const reviewedPayments = serializedPayments.filter(
    (p) => p.status !== "PENDING"
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
            <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
            <p className="text-muted-foreground">
              Administra pagos y suscripciones de propietarios
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {stats.pendingPayments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requieren revisión
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Aprobados (mes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.approvedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Histórico</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              ${(stats.totalRevenue / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aprobados</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Propietarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {stats.activeProprietors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Con acceso</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table with Client Components */}
      <PagosAdminClient
        pendingPayments={pendingPayments}
        reviewedPayments={reviewedPayments}
      />
    </div>
  );
}
