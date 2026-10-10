import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Maximize2 } from 'lucide-react';
import type { BranchImageDto } from '../types/branch-detail.types';
import { normalizeBranchImages } from '../utils/branch-detail.mapper';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface ImagesTabProps {
  images?: (BranchImageDto | string)[] | null;
}

export const ImagesTab: React.FC<ImagesTabProps> = ({ images = [] }) => {
  const { t } = useTranslation('branch');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);

  const normalizedImages = normalizeBranchImages(images);

  return (
    <div className="space-y-4 outline-none">
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="size-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <ImageIcon className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('details.images.title', 'Hình ảnh cơ sở')} ({normalizedImages.length})
            </h3>
            <p className="text-xs text-slate-500">
              {t('details.images.description', 'Bộ sưu tập hình ảnh sân bãi và không gian cơ sở')}
            </p>
          </div>
        </div>

        {normalizedImages.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-sm text-slate-500 italic">
              {t('details.images.empty', 'Chưa có hình ảnh.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {normalizedImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs transition-shadow hover:shadow-md"
                onClick={() => setSelectedZoomImage(img.imageUrl)}
              >
                <img
                  src={img.imageUrl}
                  alt={t('details.images.photoAlt', {
                    index: idx + 1,
                    defaultValue: `Hình ảnh ${idx + 1}`,
                  })}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {idx === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-emerald-700 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {t('details.images.cover', 'Ảnh đại diện')}
                  </span>
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-900 shadow-md">
                    <Maximize2 className="size-3.5" />
                    {t('actions.zoom', 'Phóng to')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Zoom Dialog */}
      {selectedZoomImage && (
        <Dialog open={Boolean(selectedZoomImage)} onOpenChange={() => setSelectedZoomImage(null)}>
          <DialogContent className="max-w-4xl border-black bg-black/90 p-2 text-white">
            <img
              src={selectedZoomImage}
              alt="Zoomed Branch View"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
