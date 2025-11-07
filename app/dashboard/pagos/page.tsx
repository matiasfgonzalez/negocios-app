import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubscriptionStatusCard from "@/components/SubscriptionStatusCard";
import PaymentInfoCard from "@/components/PaymentInfoCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Payment } from "@/app/types/types";

async function getPaymentHistory(userId: string): Promise<Payment[]> {
  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return user?.payments || [];
}

export default async function PagosPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
    select: {
      role: true,
      becameOwnerAt: true,
      subscriptionStatus: true,
      subscriptionPaidUntil: true,
    },
  });

  if (!user?.role || user.role !== "PROPIETARIO") {
    redirect("/dashboard");
  }

  // Calculate subscription data
  const now = new Date();
  const becameOwnerAt = user.becameOwnerAt || now;
  const trialEndDate = new Date(becameOwnerAt);
  trialEndDate.setMonth(trialEndDate.getMonth() + 1);
  const isInTrial = now < trialEndDate;

  let status = user.subscriptionStatus;
  let canAccessOwnerFeatures = true;
  let daysRemaining = null;
  let daysOverdue = null;
  let nextPaymentDue = null;

  if (isInTrial) {
    daysRemaining = Math.ceil(
      (trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const nextMonth = new Date(trialEndDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextPaymentDue = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
  } else if (user.subscriptionPaidUntil) {
    const paidUntil = new Date(user.subscriptionPaidUntil);
    const diffDays = Math.ceil(
      (now.getTime() - paidUntil.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 0) {
      daysOverdue = diffDays;
      if (diffDays <= 7) {
        status = "OVERDUE";
      } else {
        status = "SUSPENDED";
        canAccessOwnerFeatures = false;
      }
    } else {
      status = "ACTIVE";
    }

    const nextMonth = new Date(paidUntil);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextPaymentDue = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 0);
  }

  const subscriptionData = {
    status,
    canAccessOwnerFeatures,
    becameOwnerAt: becameOwnerAt.toISOString(),
    subscriptionPaidUntil: user.subscriptionPaidUntil?.toISOString() || null,
    trialEndsAt: isInTrial ? trialEndDate.toISOString() : null,
    nextPaymentDue: nextPaymentDue?.toISOString() || null,
    daysRemaining,
    daysOverdue,
  };

  const payments = await getPaymentHistory(userId);

  // Obtener configuración de pagos
  let paymentConfig = await prisma.paymentConfig.findUnique({
    where: { id: "payment_config" },
  });

  // Si no existe, crear con valores por defecto
  if (!paymentConfig) {
    paymentConfig = await prisma.paymentConfig.create({
      data: {
        id: "payment_config",
      },
    });
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPeriod = (periodMonth: string) => {
    const [year, month] = periodMonth.split("-");
    const date = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      1
    );
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pendiente
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="gap-1 bg-green-600">
            <CheckCircle2 className="w-3 h-3" />
            Aprobado
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Rechazado
          </Badge>
        );
    }
  };

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
              Administrá tu suscripción y pagos mensuales
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Subscription Status */}
        <div className="lg:col-span-2 space-y-6">
          <SubscriptionStatusCard
            status={subscriptionData.status}
            canAccessOwnerFeatures={subscriptionData.canAccessOwnerFeatures}
            becameOwnerAt={subscriptionData.becameOwnerAt}
            subscriptionPaidUntil={subscriptionData.subscriptionPaidUntil}
            trialEndsAt={subscriptionData.trialEndsAt}
            nextPaymentDue={subscriptionData.nextPaymentDue}
            daysRemaining={subscriptionData.daysRemaining}
            daysOverdue={subscriptionData.daysOverdue}
          />

          {/* Payment History */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Historial de Pagos
              </CardTitle>
              <CardDescription>
                Todos los pagos registrados y su estado actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">
                    No hay pagos registrados
                  </p>
                  <p className="text-sm mt-1">
                    Registrá tu primer pago para mantener activa tu suscripción
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment, index) => (
                        <>
                          <TableRow key={`${payment.id}`}>
                            <TableCell className="font-medium">
                              {formatPeriod(payment.periodMonth)}
                            </TableCell>
                            <TableCell>
                              ${payment.amount.toLocaleString("es-AR")}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(payment.status)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(payment.createdAt.toString())}
                            </TableCell>
                            <TableCell className="text-right">
                              {payment.proofUrl && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a
                                    href={payment.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver comprobante
                                  </a>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          {payment.adminNote && (
                            <TableRow key={`${payment.id}-note`}>
                              <TableCell
                                colSpan={5}
                                className="bg-muted/50 border-l-4 border-l-primary"
                              >
                                <div className="py-2 px-3">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                                    Nota del administrador
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {payment.adminNote}
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Info & Action */}
        <div className="space-y-6">
          {/* Payment Info Card */}
          <PaymentInfoCard
            monthlyFee={paymentConfig.monthlyFee}
            bankName={paymentConfig.bankName}
            bankAlias={paymentConfig.bankAlias}
            bankCbu={paymentConfig.bankCbu}
            accountHolder={paymentConfig.accountHolder}
            accountType={paymentConfig.accountType}
          />

          {/* Help Card */}
          <Card className="shadow-md bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">¿Necesitás ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Si tenés problemas con tu pago o necesitás asistencia,
                contactanos:
              </p>
              <div className="space-y-1 pt-2">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <a
                    href={`mailto:${paymentConfig.supportEmail}`}
                    className="text-primary hover:underline"
                  >
                    {paymentConfig.supportEmail}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${paymentConfig.supportPhone}`}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +{paymentConfig.supportPhone}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
