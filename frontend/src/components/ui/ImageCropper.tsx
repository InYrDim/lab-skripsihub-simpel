import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedUrl: string) => void;
  onCancel: () => void;
  outputSize?: number; // px, default 400
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCrop,
  onCancel,
  outputSize = 400,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState(300);

  // Clamp offset so image always fills the crop square
  const clampOffset = useCallback((ox: number, oy: number, s: number, image: HTMLImageElement) => {
    const imgW = image.width * s;
    const imgH = image.height * s;
    // Image right edge must be >= container right edge => ox + imgW >= containerSize => ox >= containerSize - imgW
    // Image left edge must be <= 0 => ox <= 0
    const clampedX = Math.min(0, Math.max(containerSize - imgW, ox));
    const clampedY = Math.min(0, Math.max(containerSize - imgH, oy));
    return { x: clampedX, y: clampedY };
  }, [containerSize]);

  // Load image
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImg(image);
      // Set initial scale so the smaller dimension fills the crop area
      const minDim = Math.min(image.width, image.height);
      const initialScale = containerSize / minDim;
      setScale(initialScale);
      // Center the image
      const ox = (containerSize - image.width * initialScale) / 2;
      const oy = (containerSize - image.height * initialScale) / 2;
      setOffset(clampOffset(ox, oy, initialScale, image));
    };
    image.src = imageUrl;
  }, [imageUrl, containerSize, clampOffset]);

  // Resize container based on viewport
  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 80, 400);
      setContainerSize(size);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw preview
  useEffect(() => {
    if (!img || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = containerSize;
    canvasRef.current.height = containerSize;

    ctx.clearRect(0, 0, containerSize, containerSize);

    // Draw image
    ctx.drawImage(
      img,
      offset.x,
      offset.y,
      img.width * scale,
      img.height * scale
    );

    // Square border (shadow for contrast)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, containerSize, containerSize);
    // Inner white border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, containerSize - 4, containerSize - 4);
  }, [img, scale, offset, containerSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
    const point = 'touches' in e ? e.touches[0] : e;
    setDragStart({ x: point.clientX - offset.x, y: point.clientY - offset.y });
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !img) return;
    e.preventDefault();
    const point = 'touches' in e ? e.touches[0] : e;
    const rawX = point.clientX - dragStart.x;
    const rawY = point.clientY - dragStart.y;
    setOffset(clampOffset(rawX, rawY, scale, img));
  }, [dragging, dragStart, img, scale, clampOffset]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Minimum scale: smaller dimension must fill container
  const getMinScale = useCallback((image: HTMLImageElement) => {
    const minDim = Math.min(image.width, image.height);
    return containerSize / minDim;
  }, [containerSize]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!img) return;
    const minScale = getMinScale(img);
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const newScale = Math.max(minScale, Math.min(5, scale + delta));

    // Zoom toward center
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const newOffsetX = cx - ((cx - offset.x) / scale) * newScale;
    const newOffsetY = cy - ((cy - offset.y) / scale) * newScale;

    setScale(newScale);
    setOffset(clampOffset(newOffsetX, newOffsetY, newScale, img));
  }, [img, scale, offset, containerSize, clampOffset, getMinScale]);

  const adjustScale = (delta: number) => {
    if (!img) return;
    const minScale = getMinScale(img);
    const newScale = Math.max(minScale, Math.min(5, scale + delta));
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const newOffsetX = cx - ((cx - offset.x) / scale) * newScale;
    const newOffsetY = cy - ((cy - offset.y) / scale) * newScale;
    setScale(newScale);
    setOffset(clampOffset(newOffsetX, newOffsetY, newScale, img));
  };

  const handleCrop = () => {
    if (!img) return;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outputSize;
    outCanvas.height = outputSize;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Map the visible crop area back to image coordinates
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sSize = containerSize / scale;

    ctx.drawImage(
      img,
      sx, sy, sSize, sSize,
      0, 0, outputSize, outputSize
    );

    const dataUrl = outCanvas.toDataURL('image/jpeg', 0.9);
    onCrop(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in">
      <div className="bg-white dark:bg-zinc-950 rounded border border-zinc-200 dark:border-zinc-800 shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Atur Foto Profil</h3>
          <button
            onClick={onCancel}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-zinc-500">Geser dan zoom gambar untuk mengatur bagian yang diinginkan.</p>

        {/* Crop Area */}
        <div className="flex justify-center">
          <div
            ref={containerRef}
            style={{ width: containerSize, height: containerSize }}
            className="relative cursor-grab active:cursor-grabbing select-none rounded overflow-hidden bg-zinc-900"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
            onWheel={handleWheel}
          >
            <canvas
              ref={canvasRef}
              width={containerSize}
              height={containerSize}
              className="block"
            />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustScale(-0.1)}
            className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <div className="w-32 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-orange-500 rounded-full"
              style={{ width: `${Math.min(100, ((scale - 0.1) / 4.9) * 100)}%` }}
            />
          </div>
          <button
            onClick={() => adjustScale(0.1)}
            className="p-2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Batal
          </button>
          <button
            onClick={handleCrop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <Check size={14} /> Gunakan Foto Ini
          </button>
        </div>
      </div>
    </div>
  );
};
