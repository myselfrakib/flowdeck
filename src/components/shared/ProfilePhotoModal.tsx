import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  Image as ImageIcon,
  Sparkles,
  Move
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSave: (croppedDataUrl: string) => void;
}

export const ProfilePhotoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSave
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setZoom(1);
      setRotation(0);
      setPan({ x: 0, y: 0 });
      setUrlInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setSelectedImage(urlInput.trim());
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleExportCropped = () => {
    if (!selectedImage) {
      if (currentAvatar) {
        onSave(currentAvatar);
      }
      onClose();
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        onSave(selectedImage);
        onClose();
        return;
      }

      ctx.clearRect(0, 0, size, size);

      // Clip as circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.save();
      // Center of canvas
      ctx.translate(size / 2 + pan.x, size / 2 + pan.y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const aspect = img.width / img.height;
      let drawW = size;
      let drawH = size;
      if (aspect > 1) {
        drawW = size * aspect;
      } else {
        drawH = size / aspect;
      }
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      const finalUrl = canvas.toDataURL('image/jpeg', 0.92);
      onSave(finalUrl);
      onClose();
    };
    img.onerror = () => {
      onSave(selectedImage);
      onClose();
    };
    img.src = selectedImage;
  };

  const presets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Change Profile Photo</h3>
            <p className="text-xs text-slate-500 mt-0.5">Upload, zoom, and crop your user avatar</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Zoom & Crop Viewer */}
        <div className="flex flex-col items-center">
          <div 
            className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-blue-500 shadow-xl bg-slate-900 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {selectedImage || currentAvatar ? (
              <img
                ref={imageRef}
                src={selectedImage || currentAvatar}
                alt="Avatar Target"
                draggable={false}
                className="w-full h-full object-cover pointer-events-none transition-transform duration-75 origin-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon className="w-10 h-10 mb-1" />
                <span className="text-xs font-semibold">No Image</span>
              </div>
            )}

            {/* Inner Ring Overlay to show crop area */}
            <div className="absolute inset-0 pointer-events-none rounded-full border border-white/30" />
            
            {/* Drag hint overlay badge */}
            {selectedImage && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs pointer-events-none font-medium">
                <Move className="w-3 h-3" />
                <span>Drag to pan</span>
              </div>
            )}
          </div>

          {/* Zoom & Rotation Controls Bar */}
          {selectedImage && (
            <div className="w-full max-w-xs mt-3.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-2 px-1">
                <ZoomOut className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0.8"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-[11px] font-mono font-bold text-slate-600 w-9 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setRotation(0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 text-slate-400 hover:text-slate-700 text-[11px] font-medium"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload File or URL Options */}
        <div className="space-y-3 pt-2">
          {/* File input trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl border border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Upload Image from Device (JPG, PNG, WebP)</span>
          </button>

          {/* Image URL input */}
          <form onSubmit={handleUrlSubmit} className="flex items-center gap-1.5">
            <input
              type="url"
              placeholder="Or paste an image web link..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-blue-600 font-mono"
            />
            <button
              type="submit"
              disabled={!urlInput.trim()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold text-xs transition-colors shrink-0"
            >
              Load
            </button>
          </form>

          {/* Curated Presets */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Or pick a professional studio preset
            </span>
            <div className="flex items-center justify-between gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedImage(preset);
                    setZoom(1);
                    setRotation(0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === preset ? 'border-blue-600 ring-2 ring-blue-300 scale-105' : 'border-slate-200'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExportCropped}
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Complete Upload</span>
          </button>
        </div>

      </div>
    </div>
  );
};

