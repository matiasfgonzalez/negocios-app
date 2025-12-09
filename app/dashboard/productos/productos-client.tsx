"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  DollarSign,
  Archive,
  Search,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MultiImageSelector from "@/components/MultiImageSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryCombobox } from "@/components/ui/category-combobox";
import { CategoryFilterCombobox } from "@/components/ui/category-filter-combobox";
import { Business } from "@/app/types/types";

type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  order: number;
};

type Producto = {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string | null;
  available: boolean;
  images: string[] | null;
  createdAt: string;
  updatedAt: string;
  business: {
    id: string;
    name: string;
    slug: string;
    img: string | null;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
};

type Negocio = Pick<Business, "id" | "name">;

type ProductosClientProps = {
  productos: Producto[];
  negocios: Negocio[];
  categorias: ProductCategory[];
  role: string;
  negocioIdFromUrl?: string;
  onRefresh?: () => Promise<void>;
};

// Componente de Carrusel de Imágenes (Estilo Flowbite)
type ImageCarouselProps = {
  images: string[];
  productName: string;
};

function ImageCarousel({ images, productName }: Readonly<ImageCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-48 md:h-56 overflow-hidden group">
      {/* Carousel wrapper */}
      <div className="relative h-full overflow-hidden rounded-t-lg">
        {images.map((url, index) => (
          <div
            key={`${productName}-${index}-${url.substring(url.length - 20)}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={url}
              alt={`${productName} - Imagen ${index + 1}`}
              className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
          </div>
        ))}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Slider indicators */}
      {images.length > 1 && (
        <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
          {images.map((url, idx) => (
            <button
              key={`${productName}-indicator-${idx}-${url.substring(
                url.length - 10
              )}`}
              type="button"
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-current={idx === currentIndex}
              aria-label={`Slide ${idx + 1}`}
              onClick={(e) => goToImage(idx, e)}
            />
          ))}
        </div>
      )}

      {/* Slider controls */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/prev focus:outline-none"
            onClick={prevImage}
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/prev:bg-white/50 dark:group-hover/prev:bg-gray-800/60 group-focus/prev:ring-4 group-focus/prev:ring-white dark:group-focus/prev:ring-gray-800/70 group-focus/prev:outline-none">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
              <span className="sr-only">Previous</span>
            </span>
          </button>
          <button
            type="button"
            className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group/next focus:outline-none"
            onClick={nextImage}
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover/next:bg-white/50 dark:group-hover/next:bg-gray-800/60 group-focus/next:ring-4 group-focus/next:ring-white dark:group-focus/next:ring-gray-800/70 group-focus/next:outline-none">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="sr-only">Next</span>
            </span>
          </button>
        </>
      )}
    </div>
  );
}

export default function ProductosClient({
  productos,
  negocios,
  categorias,
  role,
  negocioIdFromUrl,
  onRefresh,
}: Readonly<ProductosClientProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 9;

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = productos.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "sin-categoria" && !p.categoryId) ||
      p.categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    available: "true",
    images: "",
    businessId: negocioIdFromUrl || "",
    categoryId: "",
  });

  const handleOpenDialog = (product?: Producto) => {
    if (product) {
      setIsEditMode(true);
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        available: product.available.toString(),
        images: product.images ? product.images.join(", ") : "",
        businessId: product.businessId,
        categoryId: product.categoryId || "",
      });
    } else {
      setIsEditMode(false);
      setSelectedProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        available: "true",
        images: "",
        businessId: negocioIdFromUrl || "",
        categoryId: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode
        ? `/api/products/${selectedProduct?.id}`
        : "/api/products";
      const method = isEditMode ? "PUT" : "POST";

      // Procesar las imágenes (separadas por comas)
      const imageUrls = formData.images
        ? formData.images
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : [];

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: Number.parseFloat(formData.price),
          stock: Number.parseInt(formData.stock),
          available: formData.available === "true",
          images: imageUrls.length > 0 ? imageUrls : null,
          categoryId: formData.categoryId || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el producto");
      }

      setIsDialogOpen(false);
      if (onRefresh) {
        await onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      if (onRefresh) {
        await onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el producto");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <BackButton href="/dashboard" label="Volver al Dashboard" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              {role === "PROPIETARIO"
                ? "Mis Productos"
                : "Gestión de Productos"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {role === "PROPIETARIO"
                ? "Administra el catálogo de productos de tu negocio"
                : "Visualiza y gestiona todos los productos del sistema"}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="md:min-w-3xl max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {isEditMode ? "Editar Producto" : "Crear Nuevo Producto"}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                  {isEditMode
                    ? "Modifica la información del producto"
                    : "Completa la información del nuevo producto"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Seleccionar Negocio */}
                {!negocioIdFromUrl && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="businessId"
                      className="text-sm font-medium text-foreground"
                    >
                      Negocio *
                    </Label>
                    <Select
                      value={formData.businessId}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, businessId: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecciona un negocio" />
                      </SelectTrigger>
                      <SelectContent>
                        {negocios.map((negocio) => (
                          <SelectItem key={negocio.id} value={negocio.id}>
                            {negocio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Categoría */}
                <div className="space-y-2">
                  <Label
                    htmlFor="categoryId"
                    className="text-sm font-medium text-foreground"
                  >
                    Categoría
                  </Label>
                  <CategoryCombobox
                    categories={categorias}
                    value={formData.categoryId || null}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value || "" })
                    }
                    placeholder="Sin categoría"
                    searchPlaceholder="Buscar categoría..."
                    emptyMessage="No se encontraron categorías."
                    clearLabel="Sin categoría"
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Nombre del Producto *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Ej: Pan Francés"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-foreground"
                  >
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe el producto..."
                    rows={3}
                    className="bg-background border-border text-foreground resize-none break-all"
                  />
                </div>

                {/* Precio y Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-foreground"
                    >
                      Precio *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                      placeholder="0.00"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="stock"
                      className="text-sm font-medium text-foreground"
                    >
                      Stock *
                    </Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                      placeholder="0"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                {/* Disponibilidad */}
                <div className="space-y-2">
                  <Label
                    htmlFor="available"
                    className="text-sm font-medium text-foreground"
                  >
                    Disponibilidad *
                  </Label>
                  <Select
                    value={formData.available}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, available: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Disponible</SelectItem>
                      <SelectItem value="false">No disponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Imágenes */}
                <MultiImageSelector
                  value={formData.images}
                  onChange={(urls) =>
                    setFormData({ ...formData, images: urls })
                  }
                  maxImages={3}
                  label="Imágenes del Producto"
                  placeholder="https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg"
                />

                {/* Preview del Carrusel */}
                {formData.images.trim() && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-foreground mb-2">
                      Vista previa del carrusel:
                    </p>
                    <div className="rounded-lg overflow-hidden border border-border">
                      <ImageCarousel
                        images={formData.images
                          .split(",")
                          .map((url) => url.trim())
                          .filter((url) => url.length > 0)}
                        productName={formData.name || "Producto"}
                      />
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border-border hover:bg-accent"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Guardando..."
                      : isEditMode
                      ? "Actualizar"
                      : "Crear Producto"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, negocio o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-background border-border text-foreground"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro de Categorías */}
          <CategoryFilterCombobox
            categories={categorias}
            value={selectedCategory}
            onValueChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            placeholder="Filtrar por categoría..."
            searchPlaceholder="Buscar categoría..."
            allLabel="Todas las categorías"
            noCategoryLabel="Sin categoría"
          />
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-
          {Math.min(endIndex, filteredProducts.length)} de{" "}
          {filteredProducts.length} productos
        </div>

        {/* Products Grid */}
        {currentProducts.length === 0 ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-12 text-center">
              <Package className="w-14 h-14 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground">
                {searchTerm
                  ? "No se encontraron productos con ese criterio"
                  : "No hay productos registrados"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {currentProducts.map((producto) => (
              <Card
                key={producto.id}
                className="bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                {/* Carrusel de Imágenes del Producto */}
                {producto.images && producto.images.length > 0 && (
                  <ImageCarousel
                    images={producto.images}
                    productName={producto.name}
                  />
                )}

                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <Badge
                      className={
                        producto.available
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {producto.available ? "Disponible" : "No disponible"}
                    </Badge>
                  </div>
                  <CardTitle className="text-base sm:text-lg text-foreground">
                    {producto.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {producto.business.name}
                  </CardDescription>
                  {producto.category && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {producto.category.icon} {producto.category.name}
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {producto.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {producto.description}
                    </p>
                  )}

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10">
                        <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Precio</p>
                        <p className="text-lg sm:text-xl font-bold text-primary">
                          ${producto.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10">
                        <Archive className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p
                          className={`text-lg sm:text-xl font-bold ${
                            producto.stock > 0
                              ? "text-foreground"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {producto.stock}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SKU if available */}
                  {producto.sku && (
                    <div className="text-xs text-muted-foreground">
                      SKU: {producto.sku}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(producto)}
                      className="flex-1 hover:bg-accent transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(producto.id)}
                      className="flex-1 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-border hover:bg-accent"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-border hover:bg-accent"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
