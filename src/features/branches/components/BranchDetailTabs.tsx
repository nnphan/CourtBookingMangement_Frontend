import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Grid3X3,
  Clock,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import type { BranchDetailDto } from '../types/branch-detail.types';
import { normalizeBranchImages } from '../utils/branch-detail.mapper';
import { OverviewTab } from './OverviewTab';
import { CourtsTab } from './CourtsTab';
import { OperatingHoursTab } from './OperatingHoursTab';
import { PricingTab } from './PricingTab';
import { ImagesTab } from './ImagesTab';
import { EditBranchDialog } from './EditBranchDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export interface BranchDetailTabsProps {
  branch: BranchDetailDto;
  onEdit?: () => void;
  canEdit?: boolean;
}

export const BranchDetailTabs: React.FC<BranchDetailTabsProps> = ({
  branch,
  onEdit,
  canEdit = true,
}) => {
  const { t } = useTranslation('branch');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const courtsCount = branch.courts?.length ?? 0;
  const normalizedImages = normalizeBranchImages(branch.images);
  const imagesCount = normalizedImages.length;

  const handleOpenEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation Tabs Bar */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs">
          <TabsList className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100/80 p-1 sm:grid-cols-5">
            {/* Overview */}
            <TabsTrigger
              value="overview"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Building2 className="size-3.5" />
              <span>{t('details.tabs.overview', 'Tổng quan')}</span>
            </TabsTrigger>

            {/* Courts */}
            <TabsTrigger
              value="courts"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Grid3X3 className="size-3.5" />
              <span>
                {t('details.tabs.courts', {
                  count: courtsCount,
                  defaultValue: `Sân (${courtsCount})`,
                })}
              </span>
            </TabsTrigger>

            {/* Operating Hours */}
            <TabsTrigger
              value="hours"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Clock className="size-3.5" />
              <span>{t('details.tabs.hours', 'Giờ hoạt động')}</span>
            </TabsTrigger>

            {/* Pricing */}
            <TabsTrigger
              value="pricing"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <DollarSign className="size-3.5" />
              <span>{t('details.tabs.pricing', 'Bảng giá')}</span>
            </TabsTrigger>

            {/* Images */}
            <TabsTrigger
              value="images"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <ImageIcon className="size-3.5" />
              <span>
                {t('details.tabs.images', {
                  count: imagesCount,
                  defaultValue: `Hình ảnh (${imagesCount})`,
                })}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="outline-none">
          <OverviewTab
            branch={branch}
            onEdit={canEdit ? handleOpenEdit : undefined}
            onZoomImage={setSelectedZoomImage}
          />
        </TabsContent>

        {/* Tab 2: Courts */}
        <TabsContent value="courts" className="outline-none">
          <CourtsTab
            courts={branch.courts}
            onAddCourt={canEdit ? handleOpenEdit : undefined}
            canEdit={canEdit}
          />
        </TabsContent>

        {/* Tab 3: Operating Hours */}
        <TabsContent value="hours" className="outline-none">
          <OperatingHoursTab operatingHours={branch.operatingHours} />
        </TabsContent>

        {/* Tab 4: Pricing */}
        <TabsContent value="pricing" className="outline-none">
          <PricingTab
            branchPricings={branch.branchPricings}
            onEdit={canEdit ? handleOpenEdit : undefined}
            canEdit={canEdit}
          />
        </TabsContent>

        {/* Tab 5: Images */}
        <TabsContent value="images" className="outline-none">
          <ImagesTab images={branch.images} />
        </TabsContent>
      </Tabs>

      {/* Global Image Zoom Modal */}
      {selectedZoomImage && (
        <Dialog open={Boolean(selectedZoomImage)} onOpenChange={() => setSelectedZoomImage(null)}>
          <DialogContent className="max-w-4xl border-black bg-black/90 p-2 text-white">
            <img
              src={selectedZoomImage}
              alt="Zoomed View"
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Inline Edit Dialog */}
      <EditBranchDialog
        branch={branch}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </div>
  );
};
