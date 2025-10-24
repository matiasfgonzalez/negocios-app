"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Image as ImageIcon,
  Loader2,
  Check,
  ExternalLink,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UploadedImage = {
  id: string;
  url: string;
  publicId: string;
  createdAt: string;
  uploader: {
    id: string;
    name: string | null;
    email: string;
  };
};

interface MultiImageSelectorProps {
  value: string; // URLs separadas por coma
  onChange: (urls: string) => void;
  maxImages?: number;
  label?: string;
  placeholder?: string;
}

export default function MultiImageSelector({
  value,
  onChange,
  maxImages = 3,
  label = "URLs de Imágenes",
  placeholder = "https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg",
}: Readonly<MultiImageSelectorProps>) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/images/list");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchImages();
    }
  }, [isDialogOpen]);

  // Sincronizar con el valor del formulario
  useEffect(() => {
    const urls = value
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
    setSelectedUrls(urls);
  }, [value]);

  const handleToggleImage = (url: string) => {
    let newUrls: string[];

    if (selectedUrls.includes(url)) {
      // Deseleccionar
      newUrls = selectedUrls.filter((u) => u !== url);
    } else {
      // Seleccionar solo si no se alcanzó el máximo
      if (selectedUrls.length >= maxImages) {
        alert(`Solo puedes seleccionar hasta ${maxImages} imágenes`);
        return;
      }
      newUrls = [...selectedUrls, url];
    }

    setSelectedUrls(newUrls);
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const newUrls = selectedUrls.filter((url) => url !== urlToRemove);
    setSelectedUrls(newUrls);
    onChange(newUrls.join(", "));
  };

  const handleApplySelection = () => {
    onChange(selectedUrls.join(", "));
    setIsDialogOpen(false);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      month: "short",
      day: "numeric",
    });
  };

  const currentUrls = value
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="images" className="text-sm font-medium text-foreground">
          {label}
        </Label>
        <Badge variant="outline" className="text-xs">
          {currentUrls.length}/{maxImages}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Textarea
          id="images"
          value={value}
          onChange={handleManualInput}
          placeholder={placeholder}
          rows={2}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none break-all flex-1"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-border hover:bg-accent whitespace-nowrap self-start"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Seleccionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-card border-border flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Seleccionar Imágenes
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Selecciona hasta {maxImages} imágenes para tu producto.{" "}
                <a
                  href="/dashboard/images"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Subir nuevas
                  <ExternalLink className="w-3 h-3" />
                </a>
              </DialogDescription>
            </DialogHeader>

            {/* Contador de selección */}
            <div className="flex items-center justify-between px-1 py-2 bg-accent/50 rounded-lg">
              <p className="text-sm text-foreground">
                {selectedUrls.length} de {maxImages} seleccionadas
              </p>
              {selectedUrls.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUrls([])}
                  className="text-xs h-7"
                >
                  Limpiar selección
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-16">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No hay imágenes disponibles
                  </p>
                  <a
                    href="/dashboard/images"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="border-border hover:bg-accent"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Ir a Gestor de Imágenes
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img) => {
                    const isSelected = selectedUrls.includes(img.url);
                    const selectionIndex = selectedUrls.indexOf(img.url);

                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleToggleImage(img.url)}
                        className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                          isSelected
                            ? "border-primary shadow-md scale-105 ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={img.url}
                          alt="Opción de imagen"
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay con información */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="absolute bottom-0 left-0 right-0 p-2">
                            <p className="text-white text-xs font-medium truncate">
                              {img.uploader.name || img.uploader.email}
                            </p>
                            <p className="text-white/70 text-xs">
                              {formatDate(img.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Badge con número de selección */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-primary-foreground text-sm font-bold">
                              {selectionIndex + 1}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 border-border hover:bg-accent"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleApplySelection}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                Aplicar Selección
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview de las imágenes seleccionadas */}
      {currentUrls.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-foreground">
            Imágenes seleccionadas ({currentUrls.length}):
          </p>
          <div className="grid grid-cols-3 gap-2">
            {currentUrls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-accent/50"
              >
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Número de orden */}
                <div className="absolute top-1 left-1 w-5 h-5 bg-primary/90 rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-bold">
                    {index + 1}
                  </span>
                </div>
                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemoveUrl(url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive/90 hover:bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Separa múltiples URLs con comas. Máximo {maxImages} imágenes.
      </p>
    </div>
  );
}
