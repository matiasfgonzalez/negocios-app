"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type User = {
  id: string;
  clerkId: string | null;
  email: string | null;
  name: string | null;
  lastName: string | null;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
  role: "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE";
  address: string | null;
  city: string | null;
  province: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    businesses: number;
    orders: number;
  };
};

type Props = {
  usuarios: User[];
  onRefresh: () => Promise<void>;
};

export default function UsuariosClient({ usuarios, onRefresh }: Props) {
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    lastName: "",
    phone: "",
    role: "CLIENTE" as "ADMINISTRADOR" | "PROPIETARIO" | "CLIENTE",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    documentId: "",
    isActive: true,
    adminNotes: "",
  });

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      lastName: "",
      phone: "",
      role: "CLIENTE",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      documentId: "",
      isActive: true,
      adminNotes: "",
    });
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear usuario");
      }

      setShowNewDialog(false);
      resetForm();
      await onRefresh();
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error instanceof Error ? error.message : "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || "",
      name: user.name || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      role: user.role,
      address: user.address || "",
      city: user.city || "",
      province: user.province || "",
      postalCode: "",
      documentId: "",
      isActive: user.isActive,
      adminNotes: "",
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar usuario");
      }

      setShowEditDialog(false);
      setSelectedUser(null);
      resetForm();
      await onRefresh();
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        error instanceof Error ? error.message : "Error al actualizar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar usuario");
      }

      setShowDeleteDialog(false);
      setSelectedUser(null);
      await onRefresh();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(
        error instanceof Error ? error.message : "Error al eliminar usuario"
      );
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMINISTRADOR":
        return <Badge className="bg-purple-500">Administrador</Badge>;
      case "PROPIETARIO":
        return <Badge className="bg-green-500">Propietario</Badge>;
      case "CLIENTE":
        return <Badge className="bg-blue-500">Cliente</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                {usuarios.length}{" "}
                {usuarios.length === 1
                  ? "usuario registrado"
                  : "usuarios registrados"}
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Estadísticas</TableHead>
                  <TableHead>Fecha Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No hay usuarios para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.name?.[0]?.toUpperCase() ||
                              user.email?.[0]?.toUpperCase() ||
                              "U"}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.fullName || user.name || "Sin nombre"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                          {user.city && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {user.city}
                              {user.province ? `, ${user.province}` : ""}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-700 border-green-500/20"
                          >
                            Activo
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-700 border-red-500/20"
                          >
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>
                            {user._count.businesses}{" "}
                            {user._count.businesses === 1
                              ? "negocio"
                              : "negocios"}
                          </div>
                          <div className="text-muted-foreground">
                            {user._count.orders}{" "}
                            {user._count.orders === 1 ? "pedido" : "pedidos"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("es-AR")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Nuevo Usuario */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Agrega un nuevo usuario al sistema manualmente
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="usuario@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: typeof formData.role) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                  <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Juan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentId">DNI</Label>
              <Input
                id="documentId"
                value={formData.documentId}
                onChange={(e) =>
                  setFormData({ ...formData, documentId: e.target.value })
                }
                placeholder="12345678"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Calle Falsa 123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Buenos Aires"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
                placeholder="Buenos Aires"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Código Postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({ ...formData, postalCode: e.target.value })
                }
                placeholder="1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="adminNotes">Notas del Administrador</Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) =>
                  setFormData({ ...formData, adminNotes: e.target.value })
                }
                placeholder="Notas internas..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewDialog(false);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !formData.email}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Usuario */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rol *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: typeof formData.role) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                  <SelectItem value="PROPIETARIO">Propietario</SelectItem>
                  <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lastName">Apellido</Label>
              <Input
                id="edit-lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Teléfono</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-isActive">Estado</Label>
              <Select
                value={formData.isActive ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value === "true" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Dirección</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">Ciudad</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-province">Provincia</Label>
              <Input
                id="edit-province"
                value={formData.province}
                onChange={(e) =>
                  setFormData({ ...formData, province: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-adminNotes">Notas del Administrador</Label>
              <Textarea
                id="edit-adminNotes"
                value={formData.adminNotes}
                onChange={(e) =>
                  setFormData({ ...formData, adminNotes: e.target.value })
                }
                placeholder="Notas internas..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false);
                setSelectedUser(null);
                resetForm();
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={loading || !formData.email}
            >
              {loading ? "Actualizando..." : "Actualizar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Eliminar Usuario */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este usuario?
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="font-medium">
                  {selectedUser.fullName || selectedUser.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedUser.email}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {selectedUser._count.businesses}{" "}
                  {selectedUser._count.businesses === 1
                    ? "negocio"
                    : "negocios"}{" "}
                  • {selectedUser._count.orders}{" "}
                  {selectedUser._count.orders === 1 ? "pedido" : "pedidos"}
                </div>
              </div>
              {(selectedUser._count.businesses > 0 ||
                selectedUser._count.orders > 0) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ Este usuario tiene negocios o pedidos asociados. No se
                  puede eliminar. Considera desactivarlo en su lugar.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedUser(null);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                loading ||
                !selectedUser ||
                selectedUser._count.businesses > 0 ||
                selectedUser._count.orders > 0
              }
            >
              {loading ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
