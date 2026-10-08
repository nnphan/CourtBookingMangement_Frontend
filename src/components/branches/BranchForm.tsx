import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  Sparkles,
  UploadCloud,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { Branch, CreateBranchInput, PricingTier, CreateCourtInput } from '@/types/branch';
import { Button } from '@/components/ui/button';
import { BranchCourtDialog } from './BranchCourtDialog';
import { BranchAmenitySelector } from './BranchAmenitySelector';
import { branchFormSchema } from './branch-form.schema';
import { NEW_COURT_DEFAULTS, type BranchCourtDraft } from './branch-court';
import { DEFAULT_CLOSE_TIME, DEFAULT_OPEN_TIME, isCloseAfterOpen } from '@/lib/branch-hours';
import { useAmenities } from '@/features/amenities/hooks/useAmenities';
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
  'Hồ Chí Minh': [
    'Quận 1',
    'Quận 3',
    'Quận 7',
    'Quận 10',
    'Bình Thạnh',
    'Tân Bình',
    'Thành phố Thủ Đức',
    'Phú Nhuận',
    'Gò Vấp',
  ],
  'Hà Nội': [
    'Cầu Giấy',
    'Tây Hồ',
    'Đống Đa',
    'Thanh Xuân',
    'Nam Từ Liêm',
    'Ba Đình',
    'Hai Bà Trưng',
  ],
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
  const amenitiesQuery = useAmenities();
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
    resolver: zodResolver(branchFormSchema),
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
      amenityIds: initialData?.amenityIds ?? [],
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
        amenityIds: initialData.amenityIds ?? [],
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
  const watchedAmenityIds = watch('amenityIds') ?? [];
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
    return { ...NEW_COURT_DEFAULTS, name: '' };
  };

  const sections = [
    { id: 'general', title: t('form.sections.general'), icon: Building2 },
    { id: 'location', title: t('form.sections.location'), icon: MapPin },
    { id: 'operating-hours', title: t('form.sections.operatingHours'), icon: Clock },
    { id: 'images', title: t('form.sections.images'), icon: ImageIcon },
    { id: 'pricing', title: t('form.sections.pricing'), icon: DollarSign },
    { id: 'courts', title: t('form.sections.courts'), icon: Grid3X3 },
    { id: 'amenities', title: t('form.sections.amenities'), icon: Sparkles },
  ];

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Dirty state banner */}
      {isDirty && (
        <div className="animate-in fade-in slide-in-from-top-2 sticky top-16 z-20 flex items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/95 px-4 py-2.5 text-xs font-semibold text-amber-900 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-amber-600" />
            <span>{t('form.unsavedChanges')}</span>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit((data) => handleFormSubmit(data, false))}
            loading={isSubmitting || isLoading}
            className="h-7 rounded-lg bg-amber-600 px-3 text-xs text-white hover:bg-amber-700"
          >
            {t('actions.quickSave')}
          </Button>
        </div>
      )}

      {/* Navigation tabs for multi-section jump */}
      <div className="flex scrollbar-none items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-1">
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
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
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
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <Building2 className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.general.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.general.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Branch Name */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.branchName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('branchName', {
                required: 'validation.branchNameRequired',
                validate: (value) => value.trim().length > 0 || 'validation.branchNameRequired',
              })}
              placeholder={t('form.placeholders.branchName')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            {errors.branchName && (
              <p className="mt-1 text-xs text-red-500">{t(errors.branchName.message ?? '')}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('phone', {
                required: 'validation.phoneRequired',
                validate: (value) => value.trim().length > 0 || 'validation.phoneRequired',
              })}
              placeholder={t('form.placeholders.phone')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">{t(errors.phone.message ?? '')}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.status')}
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50/70 text-sm">
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
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.description')}
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder={t('form.placeholders.description')}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: Location */}
      <section
        id="location"
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <MapPin className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.location.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.location.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* City */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
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
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50/70 text-sm">
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
              <p className="mt-1 text-xs text-red-500">{t(errors.city.message ?? '')}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.district')} <span className="text-red-500">*</span>
            </label>
            <Controller
              name="district"
              control={control}
              rules={{ required: 'validation.districtRequired' }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-slate-50/70 text-sm">
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
              <p className="mt-1 text-xs text-red-500">{t(errors.district.message ?? '')}</p>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.address')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('address', {
                required: 'validation.addressRequired',
                validate: (value) => value.trim().length > 0 || 'validation.addressRequired',
              })}
              placeholder={t('form.placeholders.address')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-500">{t(errors.address.message ?? '')}</p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.latitude')}
            </label>
            <input
              type="number"
              step="any"
              {...register('latitude', { valueAsNumber: true })}
              placeholder={t('form.placeholders.latitude')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>

          {/* Longitude */}
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase">
              {t('form.fields.longitude')}
            </label>
            <input
              type="number"
              step="any"
              {...register('longitude', { valueAsNumber: true })}
              placeholder={t('form.placeholders.longitude')}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Operating Hours */}
      <section
        id="operating-hours"
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.hours.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.hours.description')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Opening time */}
          <div>
            <label
              htmlFor="branch-open-time"
              className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase"
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
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            {errors.openTime && (
              <p className="mt-1 text-xs text-red-500">{t(errors.openTime.message ?? '')}</p>
            )}
          </div>

          {/* Closing time */}
          <div>
            <label
              htmlFor="branch-close-time"
              className="mb-1.5 block text-xs font-bold tracking-wider text-slate-700 uppercase"
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
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
            />
            {errors.closeTime && (
              <p className="mt-1 text-xs text-red-500">{t(errors.closeTime.message ?? '')}</p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 4: Images */}
      <section
        id="images"
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="rounded-xl bg-purple-50 p-2 text-purple-600">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('form.images.title')}</h2>
            <p className="text-xs text-slate-500">{t('form.images.description')}</p>
          </div>
        </div>

        {/* URL Add Box */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder={t('form.images.urlPlaceholder')}
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddImage}
            className="h-10 rounded-xl border-slate-200 px-4 text-xs font-semibold text-slate-700"
          >
            <Plus className="mr-1.5 size-4" />
            {t('actions.addImageUrl')}
          </Button>
        </div>

        {/* Drag & Drop simulated upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            // Demo fallback sample image on drop
            setValue(
              'images',
              [
                ...currentImages,
                'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
              ],
              { shouldDirty: true },
            );
          }}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center transition-colors hover:border-emerald-500/60"
        >
          <UploadCloud className="mx-auto mb-2 size-8 text-slate-400" />
          <p className="text-xs font-bold text-slate-700">{t('form.images.dropzoneTitle')}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{t('form.images.dropzoneHint')}</p>
        </div>

        {/* Images Grid */}
        {currentImages.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {currentImages.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-xs"
              >
                <img
                  src={img}
                  alt={t('form.images.previewAlt', { index: idx + 1 })}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {idx === 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {t('form.images.cover')}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      title={t('actions.setCoverHint')}
                      className="rounded-lg bg-white/90 p-1.5 text-xs font-bold text-slate-800 shadow-xs transition-colors hover:bg-white"
                    >
                      {t('actions.makeCover')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title={t('actions.removeImage')}
                    aria-label={t('actions.removeImage')}
                    className="rounded-lg bg-red-600/90 p-1.5 text-white shadow-xs transition-colors hover:bg-red-700"
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
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
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
            <Plus className="mr-1 size-3.5" />
            {t('actions.addPricingTier')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {pricingFields.map((field, idx) => (
            <div
              key={field.id}
              className="group relative space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
            >
              <button
                type="button"
                onClick={() => removePricing(idx)}
                className="absolute top-3 right-3 p-1 text-slate-400 transition-colors hover:text-red-600"
                title={t('actions.deleteTier')}
                aria-label={t('actions.deleteTier')}
              >
                <Trash2 className="size-4" />
              </button>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('form.pricing.tierName')}
                </label>
                <input
                  type="text"
                  {...register(`pricing.${idx}.name` as const, { required: true })}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  {t('form.pricing.timeRange')}
                </label>
                <input
                  type="text"
                  {...register(`pricing.${idx}.timeRange` as const)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-900"
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
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-xs font-black text-emerald-700"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: Courts Section */}
      <section
        id="courts"
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
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
            <Plus className="mr-1 size-3.5" />
            {t('actions.addCourt')}
          </Button>
        </div>

        {courtFields.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{t('form.courts.empty')}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                      className="p-2 text-slate-400 transition-colors hover:text-slate-800"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCourt(idx)}
                      title={t('actions.removeCourt')}
                      aria-label={t('actions.removeCourt')}
                      className="p-2 text-slate-400 transition-colors hover:text-red-600"
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

      {/* SECTION 7: Amenities */}
      <section
        id="amenities"
        className="space-y-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('form.amenities.title')}</h2>
              <p className="text-xs text-slate-500">{t('form.amenities.description')}</p>
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-slate-500">
            {t('form.amenities.selectedCount', { count: watchedAmenityIds.length })}
          </span>
        </div>

        <Controller
          name="amenityIds"
          control={control}
          render={({ field }) => (
            <BranchAmenitySelector
              amenities={amenitiesQuery.data ?? []}
              value={field.value ?? []}
              onChange={field.onChange}
              isLoading={amenitiesQuery.isLoading}
              isError={amenitiesQuery.isError}
              onRetry={() => void amenitiesQuery.refetch()}
            />
          )}
        />
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
      <div className="sticky bottom-0 z-10 flex flex-col items-center justify-between gap-3 rounded-2xl border-t border-slate-200/90 bg-white/95 px-6 py-4 shadow-lg backdrop-blur-xs sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="w-full rounded-xl border-slate-200 text-xs font-semibold sm:w-auto"
        >
          {t('actions.cancel')}
        </Button>

        <div className="flex w-full items-center gap-2.5 sm:w-auto">
          {!isEditMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSubmit((data) => handleFormSubmit(data, true))}
              loading={isLoading || isSubmitting}
              className="flex-1 rounded-xl border-slate-200 text-xs font-bold sm:flex-none"
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
            className="flex-1 rounded-xl px-6 text-xs font-bold shadow-xs sm:flex-none"
          >
            <Save className="mr-1.5 size-4" />
            {isEditMode ? t('actions.updateBranch') : t('actions.saveBranch')}
          </Button>
        </div>
      </div>
    </form>
  );
};
