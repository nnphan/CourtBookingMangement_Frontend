import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs mb-6">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs text-slate-600 transition-all"
            >
              <Building2 className="size-3.5" />
              <span>{t('details.tabs.overview')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="courts"
              className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs text-slate-600 transition-all"
            >
              <Grid3X3 className="size-3.5" />
              <span>{t('details.tabs.courts', { count: courts.length })}</span>
            </TabsTrigger>
            <TabsTrigger
              value="hours"
              className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs text-slate-600 transition-all"
            >
              <Clock className="size-3.5" />
              <span>{t('details.tabs.hours')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs text-slate-600 transition-all"
            >
              <DollarSign className="size-3.5" />
              <span>{t('details.tabs.pricing')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs text-slate-600 transition-all"
            >
              <ImageIcon className="size-3.5" />
              <span>{t('details.tabs.images', { count: images.length })}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* General Info Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 className="size-4 text-emerald-600" />
                {t('details.overview.generalInfo')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t('details.overview.branchName')}
                  </span>
                  <span className="font-bold text-slate-900 text-base mt-0.5 block">
                    {branch.branchName}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t('details.overview.contactPhone')}
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block flex items-center gap-1.5">
                    <Phone className="size-4 text-emerald-600" />
                    {branch.phone}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t('details.overview.fullAddress')}
                  </span>
                  <span className="text-slate-800 font-medium mt-0.5 block flex items-start gap-1.5">
                    <MapPin className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    {branch.address}, {branch.district}, {branch.city}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t('details.overview.city')}
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {branch.city}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {t('details.overview.district')}
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {branch.district}
                  </span>
                </div>

                {branch.latitude && branch.longitude && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {t('details.overview.coordinates')}
                    </span>
                    <span className="font-mono text-xs text-slate-600 mt-0.5 block">
                      {t('details.overview.coordinatesValue', {
                        latitude: branch.latitude,
                        longitude: branch.longitude,
                      })}
                    </span>
                  </div>
                )}

                <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    {t('details.overview.description')}
                  </span>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    {branch.description || t('details.overview.noDescription')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metadata & Status Card */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
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
                <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs">
                  <div className="rounded-xl overflow-hidden aspect-video relative group">
                    <img
                      src={branch.coverImage}
                      alt={branch.branchName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setSelectedZoomImage(branch.coverImage || null)}
                        className="p-2 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5"
                      >
                        <Maximize2 className="size-3.5" />
                        {t('actions.zoom')}
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                    {t('details.overview.coverPhoto')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: COURTS */}
        <TabsContent value="courts" className="space-y-4 outline-none">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
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
                <Plus className="size-3.5 mr-1" />
                {t('actions.addCourt')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('details.courts.name')}</th>
                    <th className="py-3 px-4">{t('details.courts.surface')}</th>
                    <th className="py-3 px-4">{t('details.courts.category')}</th>
                    <th className="py-3 px-4">{t('details.courts.status')}</th>
                    <th className="py-3 px-4">{t('details.courts.standardRate')}</th>
                    <th className="py-3 px-4 text-right">{t('details.courts.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courts.map((court) => (
                    <tr key={court.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {court.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <span>{t(`court.surface.${court.surface}`)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          court.category === 'vip'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t(`court.category.${court.category}`)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={court.status === 'available' ? 'available' : 'maintenance'}>
                          {t(`court.status.${court.status}`)}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-700">
                        {formatNumber(court.pricePerHour || 120000)} {t('court.priceUnit')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">{t('details.hours.title')}</h3>
              <p className="text-xs text-slate-500">{t('details.hours.description')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t('details.hours.open')}
                </span>
                <span className="font-mono font-bold text-slate-900 text-2xl mt-1 block">
                  {branch.openTime}
                </span>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {t('details.hours.close')}
                </span>
                <span className="font-mono font-bold text-slate-900 text-2xl mt-1 block">
                  {branch.closeTime}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500">{t('details.hours.everyDay')}</p>
          </div>
        </TabsContent>

        {/* TAB 4: PRICING */}
        <TabsContent value="pricing" className="outline-none">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pricing.map((tier) => (
                <div
                  key={tier.id}
                  className="p-5 rounded-2xl border border-slate-200/80 bg-linear-to-b from-slate-50/80 to-white shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{tier.name}</h4>
                    <span className="size-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500">{tier.timeRange}</p>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-2xl font-black text-emerald-700 font-mono">
                      {formatNumber(tier.pricePerHour)}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold ml-1">
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100 shadow-xs cursor-pointer"
                  onClick={() => setSelectedZoomImage(img)}
                >
                  <img
                    src={img}
                    alt={t('details.images.photoAlt', { index: idx + 1 })}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      {t('details.images.cover')}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold flex items-center gap-1">
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
          <DialogContent className="max-w-4xl p-2 bg-black/90 border-black text-white">
            <img
              src={selectedZoomImage}
              alt={t('details.images.zoomAlt')}
              className="w-full max-h-[80vh] object-contain rounded-xl"
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
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase">
                {t('details.addCourt.surface')}
              </label>
              <select
                value={newCourtSurface}
                onChange={(e) => setNewCourtSurface(e.target.value as CourtItem['surface'])}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900 mt-1"
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
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white text-slate-900 mt-1"
              >
                {COURT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`court.category.${category}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-slate-100">
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
