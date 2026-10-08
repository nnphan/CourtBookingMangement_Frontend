import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Grid3X3,
  Image as ImageIcon,
  Plus,
  Maximize2,
} from 'lucide-react';
import type { Branch, CourtCategory, CourtItem, CourtSurface } from '@/types/branch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/management';
import { useAmenities } from '@/features/amenities/hooks/useAmenities';
import { getAmenityIcon } from '@/features/amenities/utils/getAmenityIcon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocaleFormatters } from '@/hooks/useLocaleFormatters';

const COURT_SURFACES: CourtSurface[] = ['bwf_mat', 'wood', 'acrylic', 'pvc'];
const COURT_CATEGORIES: CourtCategory[] = ['standard', 'vip', 'training'];

interface BranchDetailTabsProps {
  branch: Branch;
  onEdit: () => void;
  onAddCourt?: (court: Partial<CourtItem>) => void;
}

export const BranchDetailTabs: React.FC<BranchDetailTabsProps> = ({
  branch,
  onEdit,
  onAddCourt,
}) => {
  const { t } = useTranslation('branch');
  const { formatDate, formatNumber } = useLocaleFormatters();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedZoomImage, setSelectedZoomImage] = useState<string | null>(null);
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtSurface, setNewCourtSurface] = useState<CourtItem['surface']>('bwf_mat');
  const [newCourtCategory, setNewCourtCategory] = useState<CourtItem['category']>('standard');

  const courts = branch.courts || [];
  const pricing = branch.pricing || [];
  const images = branch.images || [];
  const { data: amenityCatalog = [] } = useAmenities();
  const amenities = useMemo(
    () =>
      (branch.amenityIds ?? []).flatMap((id) => {
        const amenity = amenityCatalog.find((item) => item.id === id);
        return amenity ? [amenity] : [];
      }),
    [amenityCatalog, branch.amenityIds],
  );

  const handleCreateCourt = () => {
    if (!newCourtName.trim()) return;
    if (onAddCourt) {
      onAddCourt({
        name: newCourtName.trim(),
        surface: newCourtSurface,
        category: newCourtCategory,
        status: 'available',
        pricePerHour: 120000,
      });
    }
    setNewCourtName('');
    setIsAddCourtModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Modern SaaS Folder Tabs Strip */}
        <div className="mb-6 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xs">
          <TabsList className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100/80 p-1 sm:grid-cols-5">
            <TabsTrigger
              value="overview"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Building2 className="size-3.5" />
              <span>{t('details.tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="courts"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Grid3X3 className="size-3.5" />
              <span>{t('details.tabs.courts', { count: courts.length })}</span>
            </TabsTrigger>
            <TabsTrigger
              value="hours"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <Clock className="size-3.5" />
              <span>{t('details.tabs.hours')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <DollarSign className="size-3.5" />
              <span>{t('details.tabs.pricing')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
            >
              <ImageIcon className="size-3.5" />
              <span>{t('details.tabs.images', { count: images.length })}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* General Info Card */}
            <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 lg:col-span-2">
              <h3 className="flex items-center gap-2 border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
                <Building2 className="size-4 text-emerald-600" />
                {t('details.overview.generalInfo')}
              </h3>

              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.branchName')}
                  </span>
                  <span className="mt-0.5 block text-base font-bold text-slate-900">
                    {branch.branchName}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.contactPhone')}
                  </span>
                  <span className="mt-0.5 block flex items-center gap-1.5 font-mono text-base font-bold text-slate-900">
                    <Phone className="size-4 text-emerald-600" />
                    {branch.phone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.fullAddress')}
                  </span>
                  <span className="mt-0.5 block flex items-start gap-1.5 font-medium text-slate-800">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    {branch.address}, {branch.district}, {branch.city}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.city')}
                  </span>
                  <span className="mt-0.5 block font-semibold text-slate-800">{branch.city}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.district')}
                  </span>
                  <span className="mt-0.5 block font-semibold text-slate-800">
                    {branch.district}
                  </span>
                </div>

                {branch.latitude && branch.longitude && (
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                      {t('details.overview.coordinates')}
                    </span>
                    <span className="mt-0.5 block font-mono text-xs text-slate-600">
                      {t('details.overview.coordinatesValue', {
                        latitude: branch.latitude,
                        longitude: branch.longitude,
                      })}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-2 sm:col-span-2">
                  <span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.amenities')}
                  </span>
                  {amenities.length === 0 ? (
                    <p className="text-sm text-slate-500">{t('details.overview.noAmenities')}</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => {
                        const Icon = getAmenityIcon(amenity.icon);
                        return (
                          <li
                            key={amenity.id}
                            className="border-brand-100 bg-brand-50 text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                          >
                            <Icon aria-hidden className="size-3.5" />
                            {amenity.name}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-2 sm:col-span-2">
                  <span className="mb-1 block text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t('details.overview.description')}
                  </span>
                  <p className="rounded-xl border border-slate-200/60 bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600">
                    {branch.description || t('details.overview.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metadata & Status Card */}
            <div className="space-y-4">
              <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <h3 className="border-b border-slate-100 pb-2.5 text-sm font-bold text-slate-900">
                  {t('details.overview.recordMetadata')}
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('details.overview.status')}</span>
                    <StatusBadge status={branch.status === 'active' ? 'active' : 'inactive'}>
                      {branch.status === 'active' ? t('status.active') : t('status.inactive')}
                    </StatusBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('details.overview.totalCourts')}</span>
                    <span className="font-bold text-slate-900">{formatNumber(courts.length)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('details.overview.createdAt')}</span>
                    <span className="font-mono text-slate-700">
                      {formatDate(branch.createdAt, { withTime: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">{t('details.overview.updatedAt')}</span>
                    <span className="font-mono text-slate-700">
                      {formatDate(branch.updatedAt, { withTime: true })}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="w-full rounded-xl border-slate-200 text-xs font-bold"
                >
                  {t('actions.editInfo')}
                </Button>
              </div>

              {/* Cover Image Preview */}
              {branch.coverImage && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
                  <div className="group relative aspect-video overflow-hidden rounded-xl">
                    <img
                      src={branch.coverImage}
                      alt={branch.branchName}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setSelectedZoomImage(branch.coverImage || null)}
                        className="flex items-center gap-1.5 rounded-xl bg-white/90 p-2 text-xs font-bold text-slate-900 shadow-md"
                      >
                        <Maximize2 className="size-3.5" />
                        {t('actions.zoom')}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-center text-[11px] font-medium text-slate-400">
                    {t('details.overview.coverPhoto')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: COURTS */}
        <TabsContent value="courts" className="space-y-4 outline-none">
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('details.courts.title')}</h3>
                <p className="text-xs text-slate-500">{t('details.courts.description')}</p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsAddCourtModalOpen(true)}
                className="rounded-xl text-xs font-bold"
              >
                <Plus className="mr-1 size-3.5" />
                {t('actions.addCourt')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold tracking-wider text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">{t('details.courts.name')}</th>
                    <th className="px-4 py-3">{t('details.courts.surface')}</th>
                    <th className="px-4 py-3">{t('details.courts.category')}</th>
                    <th className="px-4 py-3">{t('details.courts.status')}</th>
                    <th className="px-4 py-3">{t('details.courts.standardRate')}</th>
                    <th className="px-4 py-3 text-right">{t('details.courts.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courts.map((court) => (
                    <tr key={court.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{court.name}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600">
                        <span>{t(`court.surface.${court.surface}`)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                            court.category === 'vip'
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t(`court.category.${court.category}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          status={court.status === 'available' ? 'available' : 'maintenance'}
                        >
                          {t(`court.status.${court.status}`)}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-700">
                        {formatNumber(court.pricePerHour || 120000)} {t('court.priceUnit')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onEdit}
                          className="h-8 px-2.5 text-xs text-slate-600 hover:text-slate-900"
                        >
                          {t('actions.configure')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: OPERATING HOURS */}
        <TabsContent value="hours" className="outline-none">
          <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{t('details.hours.title')}</h3>
              <p className="text-xs text-slate-500">{t('details.hours.description')}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {t('details.hours.open')}
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold text-slate-900">
                  {branch.openTime}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <span className="block text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {t('details.hours.close')}
                </span>
                <span className="mt-1 block font-mono text-2xl font-bold text-slate-900">
                  {branch.closeTime}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">{t('details.hours.everyDay')}</p>
          </div>
        </TabsContent>

        {/* TAB 4: PRICING */}
        <TabsContent value="pricing" className="outline-none">
          <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('details.pricing.title')}</h3>
                <p className="text-xs text-slate-500">{t('details.pricing.description')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="rounded-xl border-slate-200 text-xs font-semibold"
              >
                {t('actions.modifyPricing')}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {pricing.map((tier) => (
                <div
                  key={tier.id}
                  className="space-y-3 rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 to-white p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{tier.name}</h4>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500">{tier.timeRange}</p>
                  <div className="border-t border-slate-100 pt-2">
                    <span className="font-mono text-2xl font-black text-emerald-700">
                      {formatNumber(tier.pricePerHour)}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-slate-500">
                      {t('court.priceUnit')}
                    </span>
                  </div>
                  {tier.description && (
                    <p className="text-[11px] text-slate-400 italic">{tier.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: IMAGES */}
        <TabsContent value="images" className="outline-none">
          <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t('details.images.title')}</h3>
                <p className="text-xs text-slate-500">{t('details.images.description')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="rounded-xl border-slate-200 text-xs font-semibold"
              >
                {t('actions.managePhotos')}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
                  onClick={() => setSelectedZoomImage(img)}
                >
                  <img
                    src={img}
                    alt={t('details.images.photoAlt', { index: idx + 1 })}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      {t('details.images.cover')}
                    </span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1 text-xs font-bold text-white">
                      <Maximize2 className="size-4" />
                      {t('actions.zoom')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Zoom Modal */}
      {selectedZoomImage && (
        <Dialog open={Boolean(selectedZoomImage)} onOpenChange={() => setSelectedZoomImage(null)}>
          <DialogContent className="max-w-4xl border-black bg-black/90 p-2 text-white">
            <img
              src={selectedZoomImage}
              alt={t('details.images.zoomAlt')}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Add Court Modal */}
      <Dialog open={isAddCourtModalOpen} onOpenChange={setIsAddCourtModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {t('details.addCourt.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">
                {t('details.addCourt.name')}
              </label>
              <input
                type="text"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                placeholder={t('details.addCourt.namePlaceholder')}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">
                {t('details.addCourt.surface')}
              </label>
              <select
                value={newCourtSurface}
                onChange={(e) => setNewCourtSurface(e.target.value as CourtItem['surface'])}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
              >
                {COURT_SURFACES.map((surface) => (
                  <option key={surface} value={surface}>
                    {t(`court.surface.${surface}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">
                {t('details.addCourt.category')}
              </label>
              <select
                value={newCourtCategory}
                onChange={(e) => setNewCourtCategory(e.target.value as CourtItem['category'])}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
              >
                {COURT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`court.category.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddCourtModalOpen(false)}
              className="rounded-xl border-slate-200"
            >
              {t('actions.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateCourt}
              className="rounded-xl font-bold"
            >
              {t('actions.addCourt')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
