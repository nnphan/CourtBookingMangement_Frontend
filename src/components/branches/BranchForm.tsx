import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  MapPin,
  Clock,
  Image as ImageIcon,
  DollarSign,
  Grid3X3,
  Plus,
  Trash2,
  Pencil,
  UploadCloud,
  AlertCircle,
  Save,
} from 'lucide-react';
import type {
  Branch,
  CreateBranchInput,
  PricingTier,
  CreateCourtInput,
} from '@/types/branch';
import { Button } from '@/components/ui/button';
import { BranchCourtDialog, type BranchCourtDraft } from './BranchCourtDialog';
import { DEFAULT_CLOSE_TIME, DEFAULT_OPEN_TIME, isCloseAfterOpen } from '@/lib/branch-hours';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BranchFormProps {
  initialData?: Branch | null;
  isLoading?: boolean;
  onSubmit: (data: CreateBranchInput, continueEditing?: boolean) => Promise<void>;
  onCancel: () => void;
  isEditMode?: boolean;
}

const DEFAULT_PRICING_TIERS = [
  { id: 'prc-weekday', key: 'weekday', pricePerHour: 110000 },
  { id: 'prc-peak', key: 'peak', pricePerHour: 160000 },
  { id: 'prc-weekend', key: 'weekend', pricePerHour: 150000 },
] as const;

const DEFAULT_COURT_PRESETS: Omit<CreateCourtInput, 'name'>[] = [
  { surface: 'bwf_mat', category: 'standard', status: 'available', pricePerHour: 120000 },
  { surface: 'bwf_mat', category: 'standard', status: 'available', pricePerHour: 120000 },
  { surface: 'wood', category: 'vip', status: 'available', pricePerHour: 150000 },
];


const PRESET_CITIES = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương'];

const CITY_DISTRICT_MAP: Record<string, string[]> = {
  'Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Tân Bình', 'Thành phố Thủ Đức', 'Phú Nhuận', 'Gò Vấp'],
  'Hà Nội': ['Cầu Giấy', 'Tây Hồ', 'Đống Đa', 'Thanh Xuân', 'Nam Từ Liêm', 'Ba Đình', 'Hai Bà Trưng'],
  'Đà Nẵng': ['Hải Châu', 'Sơn Trà', 'Thanh Khê', 'Ngũ Hành Sơn'],
  'Bình Dương': ['Dĩ An', 'Thuận An', 'Thủ Dầu Một'],
};

export const BranchForm: React.FC<BranchFormProps> = ({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
  isEditMode = false,
}) => {
  const { t } = useTranslation('branch');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [courtDialog, setCourtDialog] = useState<
    { mode: 'create' } | { mode: 'edit'; index: number } | null
  >(null);

  // Localized defaults are resolved once so a language switch never overwrites form state.
  const [defaults] = useState(() => ({
    pricing: DEFAULT_PRICING_TIERS.map<PricingTier>((tier) => ({
      id: tier.id,
      name: t(`form.defaults.${tier.key}.name`),
      timeRange: t(`form.defaults.${tier.key}.timeRange`),
      pricePerHour: tier.pricePerHour,
      description: t(`form.defaults.${tier.key}.description`),
    })),
    courts: DEFAULT_COURT_PRESETS.map<CreateCourtInput>((court, idx) => ({
      ...court,
      name: t('form.courts.defaultName', { index: idx + 1 }),
    })),
  }));
  const [activeSection, setActiveSection] = useState<string>('general');

  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CreateBranchInput>({
    defaultValues: {
      branchName: initialData?.branchName ?? '',
      phone: initialData?.phone ?? '',
      description: initialData?.description ?? '',
      city: initialData?.city ?? 'Hồ Chí Minh',
      district: initialData?.district ?? 'Quận 7',
      address: initialData?.address ?? '',
      latitude: initialData?.latitude ?? 10.7303,
      longitude: initialData?.longitude ?? 106.7072,
      openTime: initialData?.openTime ?? DEFAULT_OPEN_TIME,
      closeTime: initialData?.closeTime ?? DEFAULT_CLOSE_TIME,
      images: initialData?.images?.length
        ? initialData.images
        : [
            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80',
          ],
      pricing: initialData?.pricing?.length ? initialData.pricing : defaults.pricing,
      courts: initialData?.courts?.length ? initialData.courts : defaults.courts,
      status: initialData?.status ?? 'active',
    },
  });

  // Re-sync form when initialData loads asynchronously
  useEffect(() => {
    if (initialData) {
      reset({
        branchName: initialData.branchName,
        phone: initialData.phone,
        description: initialData.description || '',
        city: initialData.city,
        district: initialData.district,
        address: initialData.address,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        openTime: initialData.openTime || DEFAULT_OPEN_TIME,
        closeTime: initialData.closeTime || DEFAULT_CLOSE_TIME,
        images: initialData.images || [],
        pricing: initialData.pricing || defaults.pricing,
        courts: initialData.courts || defaults.courts,
        status: initialData.status || 'active',
      });
    }
  }, [initialData, reset, defaults]);

  // Warn before leaving if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Courts Field Array
  const {
    fields: courtFields,
    append: appendCourt,
    update: updateCourt,
    remove: removeCourt,
  } = useFieldArray({
    control,
    name: 'courts',
  });

  // Pricing Field Array
  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({
    control,
    name: 'pricing',
  });

  const selectedCity = watch('city');
  const availableDistricts = CITY_DISTRICT_MAP[selectedCity] || [
    'Quận 1',
    'Quận 7',
    'Bình Thạnh',
    'Tân Bình',
  ];

  const watchedImages = watch('images');
  const currentImages = useMemo(() => watchedImages ?? [], [watchedImages]);

  const handleAddImage = useCallback(() => {
    if (newImageUrl.trim()) {
      setValue('images', [...currentImages, newImageUrl.trim()], { shouldDirty: true });
      setNewImageUrl('');
    }
  }, [newImageUrl, currentImages, setValue]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      const updated = currentImages.filter((_, i) => i !== index);
      setValue('images', updated, { shouldDirty: true });
    },
    [currentImages, setValue],
  );

  const handleSetCover = useCallback(
    (index: number) => {
      if (index === 0) return;
      const target = currentImages[index];
      const rest = currentImages.filter((_, i) => i !== index);
      setValue('images', [target, ...rest], { shouldDirty: true });
    },
    [currentImages, setValue],
  );

  const handleFormSubmit = async (data: CreateBranchInput, continueEditing = false) => {
    await onSubmit(data, continueEditing);
  };

  const closeCourtDialog = useCallback(() => setCourtDialog(null), []);

  const handleSubmitCourt = useCallback(
    (court: BranchCourtDraft) => {
      if (courtDialog?.mode === 'edit') {
        updateCourt(courtDialog.index, court);
      } else {
        appendCourt(court);
      }
      setCourtDialog(null);
    },
    [courtDialog, appendCourt, updateCourt],
  );

  const courtDialogInitial = (): BranchCourtDraft => {
    if (courtDialog?.mode === 'edit') {
      return getValues(`courts.${courtDialog.index}`);
    }
    return {
      name: t('form.courts.defaultName', { index: courtFields.length + 1 }),
      surface: 'bwf_mat',
      category: 'standard',
      status: 'available',
      pricePerHour: 120000,
    };
  };

  const sections = [
    { id: 'general', title: t('form.sections.general'), icon: Building2 },
    { id: 'location', title: t('form.sections.location'), icon: MapPin },
    { id: 'operating-hours', title: t('form.sections.operatingHours'), icon: Clock },
    { id: 'images', title: t('form.sections.images'), icon: ImageIcon },
    { id: 'pricing', title: t('form.sections.pricing'), icon: DollarSign },
    { id: 'courts', title: t('form.sections.courts'), icon: Grid3X3 },
  ];

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Dirty state banner */}
      {isDirty && (
        <div className="sticky top-16 z-20 flex items-center justify-between gap-3 bg-amber-50/95 backdrop-blur-xs border border-amber-200/90 text-amber-900 px-4 py-2.5 rounded-2xl shadow-xs text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-amber-600 shrink-0" />
            <span>{t('form.unsavedChanges')}</span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit((data) => handleFormSubmit(data, false))}
            loading={isSubmitting || isLoading}
            className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs"
          >
            {t('actions.quickSave')}
          </Button>
        </div>
      )}

      {/* Navigation tabs for multi-section jump */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {sections.map((sec) => {
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveSection(sec.id);
                const el = document.getElementById(sec.id);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <sec.icon className="size-3.5" />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: General Information */}
      <section
        id="general"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.general.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.general.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Branch Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.branchName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('branchName', {
                required: 'validation.branchNameRequired',
                validate: (value) => value.trim().length > 0 || 'validation.branchNameRequired',
              })}
              placeholder={t('form.placeholders.branchName')}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
            />
            {errors.branchName && (
              <p className="text-xs text-red-500 mt-1">{t(errors.branchName.message ?? '')}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('phone', {
                required: 'validation.phoneRequired',
                validate: (value) => value.trim().length > 0 || 'validation.phoneRequired',
              })}
              placeholder={t('form.placeholders.phone')}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-mono"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{t(errors.phone.message ?? '')}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.status')}
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/70 text-sm">
                    <SelectValue placeholder={t('form.placeholders.status')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="active">{t('status.active')}</SelectItem>
                    <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.description')}
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder={t('form.placeholders.description')}
              className="w-full p-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 resize-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Location */}
      <section
        id="location"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <MapPin className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.location.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.location.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.city')} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="city"
              control={control}
              rules={{ required: 'validation.cityRequired' }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    // auto pick first district
                    const dists = CITY_DISTRICT_MAP[val] || [];
                    if (dists.length > 0) {
                      setValue('district', dists[0]!, { shouldDirty: true });
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/70 text-sm">
                    <SelectValue placeholder={t('form.placeholders.city')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {PRESET_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{t(errors.city.message ?? '')}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.district')} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="district"
              control={control}
              rules={{ required: 'validation.districtRequired' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 bg-slate-50/70 text-sm">
                    <SelectValue placeholder={t('form.placeholders.district')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    {availableDistricts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.district && (
              <p className="text-xs text-red-500 mt-1">{t(errors.district.message ?? '')}</p>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.address')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('address', {
                required: 'validation.addressRequired',
                validate: (value) => value.trim().length > 0 || 'validation.addressRequired',
              })}
              placeholder={t('form.placeholders.address')}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{t(errors.address.message ?? '')}</p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.latitude')}
            </label>
            <input
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              placeholder={t('form.placeholders.latitude')}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-mono"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('form.fields.longitude')}
            </label>
            <input
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              placeholder={t('form.placeholders.longitude')}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-mono"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Operating Hours */}
      <section
        id="operating-hours"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.hours.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.hours.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Opening time */}
          <div>
            <label
              htmlFor="branch-open-time"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t('form.hours.open')} <span className="text-red-500">*</span>
            </label>
            <input
              id="branch-open-time"
              type="time"
              step={900}
              {...register('openTime', {
                required: 'validation.openTimeRequired',
                deps: ['closeTime'],
              })}
              aria-invalid={Boolean(errors.openTime)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-mono"
            />
            {errors.openTime && (
              <p className="text-xs text-red-500 mt-1">{t(errors.openTime.message ?? '')}</p>
            )}
          </div>

          {/* Closing time */}
          <div>
            <label
              htmlFor="branch-close-time"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              {t('form.hours.close')} <span className="text-red-500">*</span>
            </label>
            <input
              id="branch-close-time"
              type="time"
              step={900}
              {...register('closeTime', {
                required: 'validation.closeTimeRequired',
                validate: (value, values) =>
                  isCloseAfterOpen(values.openTime, value) || 'validation.closeAfterOpen',
              })}
              aria-invalid={Boolean(errors.closeTime)}
              className="w-full h-11 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 font-mono"
            />
            {errors.closeTime && (
              <p className="text-xs text-red-500 mt-1">{t(errors.closeTime.message ?? '')}</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: Images */}
      <section
        id="images"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.images.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.images.description')}</p>
          </div>
        </div>

        {/* URL Add Box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder={t('form.images.urlPlaceholder')}
            className="flex-1 h-10 px-3.5 text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddImage}
            className="rounded-xl border-slate-200 h-10 px-4 font-semibold text-xs text-slate-700"
          >
            <Plus className="size-4 mr-1.5" />
            {t('actions.addImageUrl')}
          </Button>
        </div>

        {/* Drag & Drop simulated upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            // Demo fallback sample image on drop
            setValue('images', [
              ...currentImages,
              'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
            ], { shouldDirty: true });
          }}
          className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 transition-colors p-6 rounded-2xl text-center bg-slate-50/50 cursor-pointer"
        >
          <UploadCloud className="size-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-700">{t('form.images.dropzoneTitle')}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{t('form.images.dropzoneHint')}</p>
        </div>

        {/* Images Grid */}
        {currentImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {currentImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-xs"
              >
                <img
                  src={img}
                  alt={t('form.images.previewAlt', { index: idx + 1 })}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                    {t('form.images.cover')}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      title={t('actions.setCoverHint')}
                      className="p-1.5 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-bold shadow-xs transition-colors"
                    >
                      {t('actions.makeCover')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title={t('actions.removeImage')}
                    aria-label={t('actions.removeImage')}
                    className="p-1.5 rounded-lg bg-red-600/90 text-white hover:bg-red-700 shadow-xs transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 5: Pricing */}
      <section
        id="pricing"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('form.pricing.title')}</h2>
              <p className="text-xs text-slate-500">{t('form.pricing.description')}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendPricing({
                id: `prc-${Date.now()}`,
                name: t('form.defaults.custom.name'),
                timeRange: t('form.defaults.custom.timeRange'),
                pricePerHour: 130000,
                description: t('form.defaults.custom.description'),
              })
            }
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            <Plus className="size-3.5 mr-1" />
            {t('actions.addPricingTier')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingFields.map((field, idx) => (
            <div
              key={field.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group"
            >
              <button
                type="button"
                onClick={() => removePricing(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-600 transition-colors p-1"
                title={t('actions.deleteTier')}
                aria-label={t('actions.deleteTier')}
              >
                <Trash2 className="size-4" />
              </button>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('form.pricing.tierName')}</label>
                <input
                  type="text"
                  {...register(`pricing.${idx}.name` as const, { required: true })}
                  className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-bold mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">{t('form.pricing.timeRange')}</label>
                <input
                  type="text"
                  {...register(`pricing.${idx}.timeRange` as const)}
                  className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('form.pricing.pricePerHour')}
                </label>
                <input
                  type="number"
                  step="5000"
                  {...register(`pricing.${idx}.pricePerHour` as const, { valueAsNumber: true })}
                  className="w-full h-9 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-emerald-700 font-black mt-1 font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: Courts Section */}
      <section
        id="courts"
        className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Grid3X3 className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('form.courts.title')}</h2>
              <p className="text-xs text-slate-500">{t('form.courts.description')}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCourtDialog({ mode: 'create' })}
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            <Plus className="size-3.5 mr-1" />
            {t('actions.addCourt')}
          </Button>
        </div>

        {courtFields.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">{t('form.courts.empty')}</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {courtFields.map((field, idx) => {
              const court = watch(`courts.${idx}`);
              const isActive = court?.status === 'available';

              return (
                <li
                  key={field.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <button
                    type="button"
                    onClick={() => setCourtDialog({ mode: 'edit', index: idx })}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span aria-hidden className="text-xl leading-none">
                      🏸
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-slate-900">
                        {court?.name}
                      </span>
                      <span
                        className={`mt-0.5 flex items-center gap-1.5 text-xs font-semibold ${
                          isActive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        <span
                          aria-hidden
                          className={`size-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        {isActive ? t('form.courts.active') : t('form.courts.inactive')}
                      </span>
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => setCourtDialog({ mode: 'edit', index: idx })}
                      title={t('actions.editCourt')}
                      aria-label={t('actions.editCourt')}
                      className="p-2 text-slate-400 hover:text-slate-800 transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourt(idx)}
                      title={t('actions.removeCourt')}
                      aria-label={t('actions.removeCourt')}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {courtDialog && (
        <BranchCourtDialog
          mode={courtDialog.mode}
          initialCourt={courtDialogInitial()}
          onSubmit={handleSubmitCourt}
          onClose={closeCourtDialog}
        />
      )}

      {/* FOOTER SAVE ACTIONS */}
      <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-xs border-t border-slate-200/90 py-4 px-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="w-full sm:w-auto rounded-xl border-slate-200 text-xs font-semibold"
        >
          {t('actions.cancel')}
        </Button>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSubmit((data) => handleFormSubmit(data, true))}
              loading={isLoading || isSubmitting}
              className="flex-1 sm:flex-none rounded-xl border-slate-200 text-xs font-bold"
            >
              {t('actions.saveAndContinue')}
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit((data) => handleFormSubmit(data, false))}
            loading={isLoading || isSubmitting}
            className="flex-1 sm:flex-none rounded-xl text-xs font-bold shadow-xs px-6"
          >
            <Save className="size-4 mr-1.5" />
            {isEditMode ? t('actions.updateBranch') : t('actions.saveBranch')}
          </Button>
        </div>
      </div>
    </form>
  );
};
