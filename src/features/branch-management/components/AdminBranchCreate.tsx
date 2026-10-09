import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/management';
import { paths } from '@/app/router/paths';
import { toast } from '@/lib/toast';

import {
  createBranchFormSchema,
  type CreateBranchFormValues,
} from '../validators/createBranch.schema';
import type {
  CreateBranchRequest,
  CreateBranchImage,
  SelectedImageItem,
} from '../types/branch.types';
import { useUploadImage } from '../hooks/useUploadImage';
import { useCreateBranch } from '../hooks/useCreateBranch';

import { BasicInfoSection } from './BasicInfoSection';
import { AmenitiesSection } from './AmenitiesSection';
import { ImageUploader } from './ImageUploader';
import { OperatingHoursSection } from './OperatingHoursSection';
import { CourtsSection } from './CourtsSection';
import { PricingSection } from './PricingSection';
import { StickyActionFooter } from './StickyActionFooter';

// Helper to ensure "HH:mm:ss" format for backend API
const formatTimeToSeconds = (timeStr: string): string => {
  if (!timeStr) return '00:00:00';
  const parts = timeStr.trim().split(':');
  if (parts.length === 2) {
    return `${parts[0]?.padStart(2, '0')}:${parts[1]?.padStart(2, '0')}:00`;
  }
  if (parts.length === 3) {
    return `${parts[0]?.padStart(2, '0')}:${parts[1]?.padStart(2, '0')}:${parts[2]?.padStart(2, '0')}`;
  }
  return timeStr;
};

export const AdminBranchCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: uploadImageMutation } = useUploadImage();
  const { mutateAsync: createBranchMutation, isPending: isCreatingBranch } = useCreateBranch();

  // Local state for images & submission progress
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [submitProgressText, setSubmitProgressText] = useState<string | null>(null);

  // Clean up object URLs on unmount to avoid memory leaks
  const imagesRef = React.useRef(selectedImages);
  imagesRef.current = selectedImages;
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchFormSchema),
    defaultValues: {
      name: '',
      description: '',
      phoneNumber: '',
      address: '',
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      latitude: 10.7303,
      longitude: 106.7072,
      timeZone: 'Asia/Ho_Chi_Minh',
      supportsInstantBooking: true,
      amenityIds: [],
      operatingHours: [
        {
          openTime: '05:30',
          closeTime: '23:30',
          isClosed: false,
        },
      ],
      courts: [
        { courtNumber: 1, name: 'Sân 01', isActive: true },
        { courtNumber: 2, name: 'Sân 02', isActive: true },
        { courtNumber: 3, name: 'Sân 03', isActive: true },
        { courtNumber: 4, name: 'Sân 04', isActive: true },
      ],
      branchPricings: [
        {
          pricingType: 'NORMAL',
          startTime: '05:00',
          endTime: '17:00',
          pricePerHour: 80000,
        },
        {
          pricingType: 'PEAK',
          startTime: '17:00',
          endTime: '23:30',
          pricePerHour: 140000,
        },
        {
          pricingType: 'WEEKEND',
          startTime: '05:30',
          endTime: '23:30',
          pricePerHour: 120000,
        },
      ],
    },
  });

  const courtsWatch = watch('courts') || [];
  const pricingsWatch = watch('branchPricings') || [];
  const amenityIdsWatch = watch('amenityIds') || [];

  const handleImagesChange = (newImages: SelectedImageItem[]) => {
    setSelectedImages(newImages);
    if (newImages.length > 0) {
      setImageError(null);
    }
  };

  const handleAmenityChange = (ids: string[]) => {
    setValue('amenityIds', ids, { shouldValidate: true, shouldDirty: true });
  };

  // Main Submit Handler executing the complete workflow
  const onSubmit = async (formData: CreateBranchFormValues) => {
    // 1. Image validation: At least 1 image required
    if (selectedImages.length === 0) {
      setImageError('Vui lòng chọn ít nhất 1 hình ảnh cho chi nhánh.');
      const imageEl = document.getElementById('section-images');
      imageEl?.scrollIntoView({ behavior: 'smooth' });
      toast.error('Thiếu hình ảnh', 'Vui lòng chọn ít nhất 1 hình ảnh để làm ảnh bìa.');
      return;
    }

    const isSubmittingNow = isUploadingImages || isCreatingBranch;
    if (isSubmittingNow) return;

    try {
      // 2. Upload Images to Cloudinary first
      setIsUploadingImages(true);
      const uploadedImages: CreateBranchImage[] = [];

      for (let i = 0; i < selectedImages.length; i++) {
        setSubmitProgressText(`Uploading image ${i + 1}/${selectedImages.length}...`);
        try {
          const uploadRes = await uploadImageMutation({
            file: selectedImages[i]!.file,
            category: 'branch',
          });
          uploadedImages.push({
            imageUrl: uploadRes.url,
            sortOrder: i,
          });
        } catch {
          // Requirement 14: Image upload failure should stop Create Branch process. Do NOT continue.
          // Note: Error toast "Cannot upload image" is dispatched automatically by useUploadImage hook.
          setIsUploadingImages(false);
          setSubmitProgressText(null);
          return;
        }
      }

      setIsUploadingImages(false);

      // 3. Build Create Branch Request payload
      setSubmitProgressText('Creating branch...');

      const payload: CreateBranchRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        address: formData.address.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        phoneNumber: formData.phoneNumber.trim(),
        timeZone: formData.timeZone,
        supportsInstantBooking: formData.supportsInstantBooking,
        amenityIds: formData.amenityIds,
        images: uploadedImages,
        operatingHours: formData.operatingHours.map((h) => ({
          openTime: formatTimeToSeconds(h.openTime),
          closeTime: formatTimeToSeconds(h.closeTime),
          isClosed: Boolean(h.isClosed),
        })),
        courts: formData.courts.map((c) => ({
          courtNumber: Number(c.courtNumber),
          name: c.name.trim(),
          isActive: Boolean(c.isActive),
        })),
        branchPricings: formData.branchPricings.map((p) => ({
          pricingType: p.pricingType,
          startTime: formatTimeToSeconds(p.startTime),
          endTime: formatTimeToSeconds(p.endTime),
          pricePerHour: Number(p.pricePerHour),
        })),
      };

      // 4. Call POST /api/branches
      await createBranchMutation(payload);

      // Clean up object URLs
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));

      // 5. Navigate to Branch List
      navigate(paths.adminBranches);
    } catch {
      // Note: Error toast "Cannot create branch" is dispatched automatically by useCreateBranch hook.
    } finally {
      setIsUploadingImages(false);
      setSubmitProgressText(null);
    }
  };

  const isProcessing = isUploadingImages || isCreatingBranch;

  return (
    <div className="w-full min-h-screen bg-slate-50/60 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-8 space-y-6">
        {/* Page Header */}
        <PageHeader
          leading={
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => navigate(paths.adminBranches)}
              className="size-10 shrink-0 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors shadow-2xs"
            >
              <ArrowLeft className="size-5 stroke-[2.2]" />
            </button>
          }
          icon={Building2}
          title="Tạo chi nhánh mới"
          description="Thiết lập cơ sở cầu lông mới với hình ảnh, tiện ích, giờ hoạt động, danh sách sân và bảng giá."
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => navigate(paths.adminBranches)}
              className="rounded-xl border-slate-200 text-xs font-semibold"
            >
              Hủy bỏ
            </Button>
          }
        />

        {/* Informative Workflow Banner */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 shadow-2xs flex items-start gap-3.5">
          <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="size-5" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold text-emerald-950 text-sm">
              Quy trình tải lên hình ảnh & Khởi tạo chi nhánh
            </h4>
            <p className="text-emerald-800/80 mt-0.5 leading-relaxed">
              Hình ảnh chi nhánh sẽ được tự động tải lên Cloudinary trước khi tạo dữ liệu chi nhánh.
              Vui lòng hoàn tất cấu hình các thẻ thông tin bên dưới và nhấn <strong>Tạo chi nhánh mới</strong>.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Basic Information */}
          <section
            id="section-basic"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <BasicInfoSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              disabled={isProcessing}
            />
          </section>

          {/* Section 2: Amenities */}
          <section
            id="section-amenities"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <AmenitiesSection
              value={amenityIdsWatch}
              onChange={handleAmenityChange}
              disabled={isProcessing}
            />
          </section>

          {/* Section 3: Images */}
          <section
            id="section-images"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <ImageUploader
              images={selectedImages}
              onChange={handleImagesChange}
              error={imageError || undefined}
              disabled={isProcessing}
            />
          </section>

          {/* Section 4: Operating Hours */}
          <section
            id="section-hours"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <OperatingHoursSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              disabled={isProcessing}
            />
          </section>

          {/* Section 5: Courts */}
          <section
            id="section-courts"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <CourtsSection
              control={control}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              disabled={isProcessing}
            />
          </section>

          {/* Section 6: Branch Pricing */}
          <section
            id="section-pricing"
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs space-y-6"
          >
            <PricingSection
              control={control}
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
              disabled={isProcessing}
            />
          </section>
        </form>
      </div>

      {/* Sticky Action Footer */}
      <StickyActionFooter
        onCancel={() => navigate(paths.adminBranches)}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isProcessing}
        submitProgressText={submitProgressText}
        courtsCount={courtsWatch.length}
        pricingsCount={pricingsWatch.length}
        imagesCount={selectedImages.length}
        amenitiesCount={amenityIdsWatch.length}
        disabled={isProcessing}
      />
    </div>
  );
};

export default AdminBranchCreate;
