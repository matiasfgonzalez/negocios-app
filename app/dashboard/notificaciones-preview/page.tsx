"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NotificationPreview = {
  email: string;
  fullName: string | null;
  status: string;
  daysRemaining?: number;
  daysOverdue?: number;
  daysSinceTrialEnd?: number;
  action: "notify" | "skip";
};

type AnalysisResult = {
  totalOwners: number;
  wouldNotify: number;
  analysis: NotificationPreview[];
};

export default function NotificacionesPreviewPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados para envío de email de prueba
  const [selectedOwner, setSelectedOwner] = useState<string>("none");
  const [customEmail, setCustomEmail] = useState<string>("");
  const [notificationType, setNotificationType] =
    useState<string>("trial_ending_3");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const role = user?.publicMetadata?.role as string;

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (role !== "ADMINISTRADOR") {
      router.push("/dashboard");
      return;
    }

    fetchAnalysis();
  }, [user, isLoaded, role, router]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/notifications/check", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener análisis de notificaciones");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalysis();
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);
      setTestResult(null);

      // Determinar el email a usar y el nombre
      let emailToSend = customEmail.trim();
      let ownerName = "Usuario de Prueba";

      if (selectedOwner && selectedOwner !== "none" && analysis) {
        const owner = analysis.analysis.find((o) => o.email === selectedOwner);
        if (owner) {
          emailToSend = owner.email;
          ownerName = owner.fullName || "Usuario de Prueba";
        }
      }

      if (!emailToSend) {
        setTestResult({
          success: false,
          message: "Debes seleccionar un propietario o ingresar un email",
        });
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailToSend)) {
        setTestResult({
          success: false,
          message: "El email ingresado no es válido",
        });
        return;
      }

      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailToSend,
          notificationType,
          ownerName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `Email de prueba enviado correctamente a ${emailToSend}`,
        });
        // Limpiar formulario
        setSelectedOwner("none");
        setCustomEmail("");
      } else {
        setTestResult({
          success: false,
          message: data.error || "Error al enviar email de prueba",
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setTestResult({
        success: false,
        message: "Error al enviar email de prueba",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: React.ReactNode }
    > = {
      trial: {
        label: "En período de prueba",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        icon: <Clock className="w-3 h-3" />,
      },
      payment_due_soon: {
        label: "Pago próximo a vencer",
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        icon: <AlertCircle className="w-3 h-3" />,
      },
      overdue: {
        label: "Pago vencido",
        className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
        icon: <XCircle className="w-3 h-3" />,
      },
      suspended: {
        label: "Suspendido",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: <XCircle className="w-3 h-3" />,
      },
      suspended_no_payment: {
        label: "Suspendido (sin pago)",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: <XCircle className="w-3 h-3" />,
      },
      active: {
        label: "Activo",
        className: "bg-green-500/10 text-green-600 border-green-500/20",
        icon: <CheckCircle2 className="w-3 h-3" />,
      },
      no_date: {
        label: "Sin fecha",
        className: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };

    const config = statusConfig[status] || statusConfig.no_date;

    return (
      <Badge variant="outline" className={`gap-1 ${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getActionBadge = (action: "notify" | "skip") => {
    if (action === "notify") {
      return (
        <Badge className="gap-1 bg-purple-600">
          <Bell className="w-3 h-3" />
          Se enviará
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Mail className="w-3 h-3" />
        No se enviará hoy
      </Badge>
    );
  };

  const getDetailText = (item: NotificationPreview) => {
    if (item.daysRemaining !== undefined) {
      return `Quedan ${item.daysRemaining} días`;
    }
    if (item.daysOverdue !== undefined) {
      return `${item.daysOverdue} días de retraso`;
    }
    if (item.daysSinceTrialEnd !== undefined) {
      return `${item.daysSinceTrialEnd} días desde fin de trial`;
    }
    return "";
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Analizando notificaciones...</p>
        </div>
      </div>
    );
  }

  if (!user || role !== "ADMINISTRADOR") {
    return null;
  }

  const notificationsToSend =
    analysis?.analysis.filter((item) => item.action === "notify") || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className="mb-6 hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Preview de Notificaciones
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Vista previa de las notificaciones que se enviarán en la próxima
              ejecución del cron
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDescription className="ml-2 text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        {analysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Propietarios
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analysis.totalOwners}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Propietarios activos en el sistema
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Notificaciones a Enviar
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analysis.wouldNotify}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se enviarán en la próxima ejecución
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sin Notificaciones
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analysis.totalOwners - analysis.wouldNotify}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No requieren notificación hoy
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Info Alert */}
            <Alert className="mb-6 border-blue-500/50 bg-blue-500/10">
              <Calendar className="h-5 w-5 text-blue-600" />
              <AlertDescription className="ml-2 text-blue-800 dark:text-blue-200">
                Esta vista muestra qué notificaciones se enviarían si se
                ejecutara el cron ahora mismo (
                {new Date().toLocaleString("es-AR")}).
              </AlertDescription>
            </Alert>

            {/* Notifications to Send */}
            {notificationsToSend.length > 0 && (
              <Card className="mb-6 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    Notificaciones que se Enviarán ({notificationsToSend.length}
                    )
                  </CardTitle>
                  <CardDescription>
                    Estos propietarios recibirán un email cuando se ejecute el
                    cron
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notificationsToSend.map((item, index) => (
                    <Card
                      key={index}
                      className="border-purple-500/20 bg-purple-500/5"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground">
                                {item.fullName || "Sin nombre"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.email}
                              </p>
                              {getDetailText(item) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {getDetailText(item)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:items-end">
                            {getStatusBadge(item.status)}
                            {getActionBadge(item.action)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* All Owners Table */}
            <Card>
              <CardHeader>
                <CardTitle>Todos los Propietarios</CardTitle>
                <CardDescription>
                  Estado completo de todos los propietarios en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.analysis.map((item, index) => (
                    <Card
                      key={index}
                      className={
                        item.action === "notify"
                          ? "border-purple-500/20"
                          : "border-border"
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                item.action === "notify"
                                  ? "bg-purple-100 dark:bg-purple-900/20"
                                  : "bg-muted"
                              }`}
                            >
                              <User
                                className={`w-5 h-5 ${
                                  item.action === "notify"
                                    ? "text-purple-600"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground">
                                {item.fullName || "Sin nombre"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {item.email}
                              </p>
                              {getDetailText(item) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {getDetailText(item)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 sm:items-end">
                            {getStatusBadge(item.status)}
                            {getActionBadge(item.action)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sección de Prueba de Emails */}
            <Card className="border-green-500/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-green-600">
                      Enviar Email de Prueba
                    </CardTitle>
                    <CardDescription>
                      Envía un email de prueba para validar la configuración
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {testResult && (
                  <Alert
                    className={
                      testResult.success
                        ? "border-green-500/20 bg-green-500/10"
                        : "border-red-500/20 bg-red-500/10"
                    }
                  >
                    <AlertDescription
                      className={
                        testResult.success ? "text-green-600" : "text-red-600"
                      }
                    >
                      {testResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="owner-select">
                      Seleccionar Propietario (Opcional)
                    </Label>
                    <Select
                      value={selectedOwner}
                      onValueChange={(value) => {
                        if (value === "none") {
                          setSelectedOwner("");
                        } else {
                          setSelectedOwner(value);
                        }
                        setCustomEmail(""); // Limpiar email manual si se selecciona propietario
                      }}
                    >
                      <SelectTrigger id="owner-select">
                        <SelectValue placeholder="Selecciona un propietario..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          Ninguno (usar email manual)
                        </SelectItem>
                        {analysis?.analysis.map((owner) => (
                          <SelectItem key={owner.email} value={owner.email}>
                            {owner.fullName || "Sin nombre"} ({owner.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-email">
                      O Ingresar Email Manual
                    </Label>
                    <Input
                      id="custom-email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        if (e.target.value) {
                          setSelectedOwner("none"); // Limpiar selección si se ingresa email
                        }
                      }}
                      disabled={selectedOwner !== "none"}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-type">
                    Tipo de Notificación
                  </Label>
                  <Select
                    value={notificationType}
                    onValueChange={setNotificationType}
                  >
                    <SelectTrigger id="notification-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial_ending_3">
                        Período de prueba terminando (3 días)
                      </SelectItem>
                      <SelectItem value="trial_ending_1">
                        Período de prueba terminando (1 día)
                      </SelectItem>
                      <SelectItem value="payment_due_soon">
                        Pago próximo a vencer (3 días)
                      </SelectItem>
                      <SelectItem value="payment_overdue_1">
                        Pago vencido (1 día)
                      </SelectItem>
                      <SelectItem value="payment_overdue_3">
                        Pago vencido (3 días)
                      </SelectItem>
                      <SelectItem value="payment_overdue_5">
                        Pago vencido (5 días)
                      </SelectItem>
                      <SelectItem value="suspension_warning">
                        Advertencia de suspensión (7 días)
                      </SelectItem>
                      <SelectItem value="suspended">
                        Cuenta suspendida
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSendTestEmail}
                  disabled={
                    sendingTest ||
                    (selectedOwner === "none" && !customEmail.trim())
                  }
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {sendingTest ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Email de Prueba
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
