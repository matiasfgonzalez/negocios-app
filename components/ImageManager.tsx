"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Check,
  AlertCircle,
  Eye,
  Copy,
  Download,
  User,
  Calendar,
} from "lucide-react";

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

export default function ImageManager() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null
  );
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
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
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tamaño (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError("El archivo no debe superar los 5MB");
        return;
      }

      // Validar tipo
      if (!selectedFile.type.startsWith("image/")) {
        setUploadError("Solo se permiten archivos de imagen");
        return;
      }

      setFile(selectedFile);
      setUploadError(null);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async () => {
    if (!file) {
      setUploadError("Por favor selecciona una imagen");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      // Mostrar éxito
      setUploadSuccess(true);
      clearSelection();
      await fetchImages();

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Error al subir la imagen"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (id: string) => {
    setDeletingId(id);

    try {
      const res = await fetch(`/api/images/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar la imagen");
      }

      await fetchImages();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error al eliminar la imagen"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      deleteImage(id);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = globalThis.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* File Input */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="bg-background border-border text-foreground cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </div>
              {file && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="border-border hover:bg-accent"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={uploadImage}
                disabled={!file || isUploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all min-w-[120px]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Imagen
                  </>
                )}
              </Button>
            </div>

            {/* Preview */}
            {preview && (
              <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-border bg-accent/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">
                    Vista previa:
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {(file!.size / 1024).toFixed(0)} KB
                  </Badge>
                </div>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-md"
                />
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  ¡Imagen subida exitosamente!
                </p>
              </div>
            )}

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {uploadError}
                </p>
              </div>
            )}

            {/* Info */}
            <p className="text-xs text-muted-foreground">
              Tamaño máximo: 5MB. Formatos soportados: JPG, PNG, GIF, WebP.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Mis Imágenes ({images.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <Card className="bg-card/50 border-border">
            <CardContent className="py-16 text-center">
              <ImageIcon className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay imágenes cargadas todavía
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Sube tu primera imagen usando el formulario de arriba
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((img) => (
              <Card
                key={img.id}
                className="group bg-card/50 backdrop-blur-sm border-border hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <div className="relative aspect-video overflow-hidden bg-accent/50">
                  <img
                    src={img.url}
                    alt="Uploaded"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
                      onClick={() => copyToClipboard(img.url)}
                    >
                      {copiedUrl === img.url ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === img.id}
                      onClick={() => handleDelete(img.id)}
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="truncate">
                        {img.uploader.name || img.uploader.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(img.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Detail Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Detalles de la Imagen
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Información completa y opciones de descarga
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="rounded-lg overflow-hidden border border-border bg-accent/50">
                <img
                  src={selectedImage.url}
                  alt="Preview"
                  className="w-full max-h-96 object-contain"
                />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Subido por
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedImage.uploader.name ||
                      selectedImage.uploader.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Fecha de carga
                  </p>
                  <p className="text-sm text-foreground">
                    {formatDate(selectedImage.createdAt)}
                  </p>
                </div>
                <div className="space-y-1 col-span-full">
                  <p className="text-xs font-medium text-muted-foreground">
                    URL
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={selectedImage.url}
                      readOnly
                      className="bg-background border-border text-foreground text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(selectedImage.url)}
                      className="border-border hover:bg-accent"
                    >
                      {copiedUrl === selectedImage.url ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadImage(
                      selectedImage.url,
                      `image-${selectedImage.id}.jpg`
                    )
                  }
                  className="flex-1 border-border hover:bg-accent"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedImage.id);
                    setSelectedImage(null);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
