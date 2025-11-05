"use client";

import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { Payment } from "@/app/types/types";
import ReviewPaymentDialog from "@/components/ReviewPaymentDialog";

interface PagosAdminClientProps {
  readonly pendingPayments: Payment[];
  readonly reviewedPayments: Payment[];
}

export default function PagosAdminClient({
  pendingPayments,
  reviewedPayments,
}: PagosAdminClientProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
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

  const handleReview = (payment: Payment) => {
    setSelectedPayment(payment);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    // Refresh the page to get updated data
    globalThis.location.reload();
  };

  // Filter reviewed payments
  const filteredReviewedPayments = reviewedPayments.filter((payment) => {
    const matchesSearch =
      payment.owner?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.periodMonth.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pendientes ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <FileText className="w-4 h-4" />
            Revisados ({reviewedPayments.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Payments Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Pagos Pendientes de Revisión
              </CardTitle>
              <CardDescription>
                Pagos que requieren aprobación o rechazo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPayments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">
                    No hay pagos pendientes de revisión
                  </p>
                  <p className="text-sm mt-1">
                    Todos los pagos han sido procesados
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Propietario</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Fecha envío</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {payment.owner?.fullName || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.owner?.email || ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPeriod(payment.periodMonth)}
                          </TableCell>
                          <TableCell className="font-semibold text-primary">
                            ${payment.amount.toLocaleString("es-AR")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleReview(payment)}
                              size="sm"
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Revisar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviewed Payments Tab */}
        <TabsContent value="reviewed" className="space-y-4">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Historial de Pagos Revisados
              </CardTitle>
              <CardDescription>
                Todos los pagos aprobados y rechazados
              </CardDescription>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por propietario, email o período..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="APPROVED">Aprobados</SelectItem>
                      <SelectItem value="REJECTED">Rechazados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredReviewedPayments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No hay pagos revisados</p>
                  <p className="text-sm mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "No se encontraron pagos con los filtros aplicados"
                      : "Los pagos procesados aparecerán aquí"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Propietario</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Monto</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Revisado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviewedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {payment.owner?.fullName || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.owner?.email || ""}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPeriod(payment.periodMonth)}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${payment.amount.toLocaleString("es-AR")}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(payment.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {payment.reviewedAt
                              ? formatDate(payment.reviewedAt)
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selectedPayment && (
        <ReviewPaymentDialog
          payment={selectedPayment}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
