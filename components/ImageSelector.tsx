"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Loader2, Check, ExternalLink } from "lucide-react";
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

interface ImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageSelector({
  value,
  onChange,
  label = "Imagen (URL)",
  placeholder = "https://ejemplo.com/imagen.jpg",
}: Readonly<ImageSelectorProps>) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(value);

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

  useEffect(() => {
    setSelectedUrl(value);
  }, [value]);

  const handleSelectImage = (url: string) => {
    setSelectedUrl(url);
    onChange(url);
    setIsDialogOpen(false);
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setSelectedUrl(url);
    onChange(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="img" className="text-sm font-medium text-foreground">
        {label}
      </Label>

      <div className="flex gap-2">
        <Input
          id="img"
          type="url"
          value={selectedUrl}
          onChange={handleManualInput}
          placeholder={placeholder}
          className="bg-background border-border text-foreground placeholder:text-muted-foreground flex-1"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="border-border hover:bg-accent whitespace-nowrap"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Seleccionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden bg-card border-border flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Seleccionar Imagen
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Elige una imagen de tu galería o{" "}
                <a
                  href="/dashboard/images"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  sube una nueva
                  <ExternalLink className="w-3 h-3" />
                </a>
              </DialogDescription>
            </DialogHeader>

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
                  {images.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectImage(img.url)}
                      className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        selectedUrl === img.url
                          ? "border-primary shadow-md scale-105"
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

                      {/* Checkmark si está seleccionada */}
                      {selectedUrl === img.url && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview de la imagen seleccionada */}
      {selectedUrl && (
        <div className="mt-2 relative rounded-lg overflow-hidden border border-border bg-accent/50 p-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-foreground">Vista previa:</p>
            <Badge variant="outline" className="text-xs">
              Seleccionada
            </Badge>
          </div>
          <img
            src={selectedUrl}
            alt="Preview"
            className="w-full max-h-40 object-contain rounded-md bg-background"
            onError={(e) => {
              e.currentTarget.src = "";
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Puedes pegar una URL directamente o seleccionar de tus imágenes cargadas
      </p>
    </div>
  );
}
