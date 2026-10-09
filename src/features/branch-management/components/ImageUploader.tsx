import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  X,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SelectedImageItem } from '../types/branch.types';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: SelectedImageItem[];
  onChange: (images: SelectedImageItem[]) => void;
  error?: string;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  error,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    const remainingSlots = 10 - images.length;
    if (remainingSlots <= 0) return;

    const incomingFiles = Array.from(files).slice(0, remainingSlots);
    const validImageFiles = incomingFiles.filter((file) => file.type.startsWith('image/'));

    const newItems: SelectedImageItem[] = validImageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    onChange([...images, ...newItems]);

    // Reset file input value so same files can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (disabled) return;
    const itemToRemove = images[indexToRemove];
    if (itemToRemove) {
      URL.revokeObjectURL(itemToRemove.previewUrl);
    }
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (disabled || toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    if (!moved) return;
    reordered.splice(toIndex, 0, moved);
    onChange(reordered);
  };

  // Drag and drop reordering handlers
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleItemDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleItemDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === targetIndex || disabled) {
      setDraggedIndex(null);
      return;
    }
    handleMove(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Dropzone for adding new files
  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFilesSelected(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ImageIcon className="size-4.5 text-emerald-600" />
            Hình ảnh chi nhánh
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {images.length}/10 ảnh
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn từ 1 đến 10 hình ảnh. Kéo thả để sắp xếp thứ tự hiển thị (Ảnh đầu tiên sẽ làm ảnh bìa chính).
          </p>
        </div>

        {images.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50"
          >
            <UploadCloud className="size-4 mr-1.5 text-emerald-600" />
            Thêm ảnh ({10 - images.length} ảnh còn lại)
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFilesSelected(e.target.files)}
      />

      {/* Drop zone when no images or to add more */}
      {images.length === 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDropzoneDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400',
            error && 'border-rose-400 bg-rose-50/30',
          )}
        >
          <div className="size-14 mx-auto rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-3.5 shadow-xs">
            <UploadCloud className="size-7 stroke-[2]" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Kéo thả hình ảnh vào đây hoặc nhấp để chọn tệp
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hỗ trợ PNG, JPG, JPEG, WEBP. Chọn tối thiểu 1 ảnh và tối đa 10 ảnh (kích thước khuyến nghị dưới 10MB/ảnh).
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            className="mt-4 rounded-xl border-slate-200 text-xs font-semibold"
          >
            Chọn ảnh từ thiết bị
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {images.map((img, index) => {
            const isCover = index === 0;
            const isDragging = draggedIndex === index;
            const isTarget = dragOverIndex === index;

            return (
              <div
                key={img.id}
                draggable={!disabled}
                onDragStart={(e) => handleItemDragStart(e, index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragLeave={handleItemDragLeave}
                onDrop={(e) => handleItemDrop(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  'group relative rounded-xl overflow-hidden border bg-white shadow-xs transition-all duration-150 select-none',
                  isCover
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300',
                  isDragging && 'opacity-40 scale-95 border-dashed border-emerald-400',
                  isTarget && 'scale-105 border-emerald-600 ring-4 ring-emerald-500/30 z-10',
                )}
              >
                {/* Image preview */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={img.previewUrl}
                    alt={img.file.name}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase shadow-xs flex items-center gap-1',
                        isCover
                          ? 'bg-emerald-600 text-white'
                          : 'bg-black/60 text-white backdrop-blur-xs',
                      )}
                    >
                      {isCover ? (
                        <>
                          <CheckCircle2 className="size-3" />
                          Ảnh bìa
                        </>
                      ) : (
                        `#${index + 1}`
                      )}
                    </span>
                  </div>

                  {/* Drag Grip Indicator */}
                  <div className="absolute top-2 right-2 size-6 rounded-md bg-black/50 text-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripVertical className="size-3.5" />
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    title="Xóa ảnh này"
                    className="absolute bottom-2 right-2 size-7 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center transition-transform hover:scale-110 shadow-xs"
                  >
                    <X className="size-4 stroke-[2.5]" />
                  </button>

                  {/* Reorder Buttons (accessible for touch/clicks) */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, index - 1);
                        }}
                        title="Đẩy lên trước"
                        className="size-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                      >
                        <ArrowLeft className="size-3.5" />
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(index, index + 1);
                        }}
                        title="Đẩy ra sau"
                        className="size-6 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
                      >
                        <ArrowRight className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* File info footer */}
                <div className="p-2 bg-white">
                  <p className="text-[11px] font-medium text-slate-700 truncate" title={img.file.name}>
                    {img.file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(img.file.size / (1024 * 1024)).toFixed(2)} MB • Thứ tự: {index}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Plus Add Button placeholder if under 10 */}
          {images.length < 10 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDropzoneDrop}
              className="aspect-4/3 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 p-3 text-center group"
            >
              <div className="size-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-1.5">
                <UploadCloud className="size-4" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-emerald-800">
                Thêm ảnh ({images.length}/10)
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Kéo thả hoặc nhấp</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
