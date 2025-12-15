"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type ImageViewerProps = {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function ImageViewer({ src, alt, isOpen, onClose }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  // Zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  // Reset zoom y posición
  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Fit to screen
  const handleFitToScreen = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const imgNaturalWidth = imageRef.current.naturalWidth;
    const imgNaturalHeight = imageRef.current.naturalHeight;

    const scaleX = (container.width * 0.9) / imgNaturalWidth;
    const scaleY = (container.height * 0.9) / imgNaturalHeight;
    const fitZoom = Math.min(scaleX, scaleY, MAX_ZOOM);

    setZoom(Math.max(fitZoom, MIN_ZOOM));
    setPosition({ x: 0, y: 0 });
  }, []);

  // Manejo del scroll del mouse para zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((prev) => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  // Agregar event listener con passive: false para permitir preventDefault
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isOpen) return;

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isOpen, handleWheel]);

  // Inicio del drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [zoom, position]
  );

  // Durante el drag
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  // Fin del drag
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch events para móvil
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom <= 1 || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    },
    [zoom, position]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Double click para toggle zoom
  const handleDoubleClick = useCallback(() => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [zoom]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          handleReset();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleReset]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>Visor de imagen: {alt}</DialogTitle>
          <DialogDescription>
            Imagen ampliada con controles de zoom. Use scroll para zoom,
            arrastre para mover.
          </DialogDescription>
        </VisuallyHidden>

        {/* Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              title="Alejar (tecla -)"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              title="Acercar (tecla +)"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={handleFitToScreen}
              title="Ajustar a pantalla"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={handleReset}
              title="Restablecer (tecla 0)"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <div className="w-px h-6 bg-white/20 mx-2" />
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 h-10 w-10"
              onClick={onClose}
              title="Cerrar (Esc)"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image container */}
        <div
          ref={containerRef}
          className={cn(
            "w-full h-full flex items-center justify-center overflow-hidden",
            zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="max-w-none select-none transition-transform duration-150"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
            draggable={false}
          />
        </div>

        {/* Instructions hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="text-white/60 text-xs bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            Doble clic para zoom • Scroll para ajustar • Arrastra para mover
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
