import React, { memo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, MapPin, FileText, Calendar, Lock } from 'lucide-react';
import type { Customer, CustomerCreateInput, Gender, MemberType, CustomerStatus } from '../types/customer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import dayjs from '@/lib/dayjs';

// Vietnam Phone Number validation regex (accepts 09..., 03..., 07..., 08..., 05... or +84...)
const VIETNAM_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;

const customerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ và tên cần ít nhất 2 ký tự')
    .max(100, 'Họ và tên không quá 100 ký tự'),
  phoneNumber: z
    .string()
    .min(10, 'Số điện thoại gồm 10 chữ số')
    .regex(VIETNAM_PHONE_REGEX, 'Số điện thoại không đúng định dạng Việt Nam (VD: 0903xxxxxx)'),
  email: z
    .string()
    .email('Địa chỉ email không đúng định dạng')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']),
  birthday: z.string().optional().or(z.literal('')),
  address: z.string().max(250, 'Địa chỉ tối đa 250 ký tự').optional().or(z.literal('')),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().or(z.literal('')),
  memberType: z.enum(['standard', 'bronze', 'silver', 'gold', 'platinum']),
  status: z.enum(['active', 'inactive', 'blocked']),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: Customer | null;
  onSubmit: (data: CustomerCreateInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = memo(
  ({ initialData, onSubmit, onCancel, isLoading = false }) => {
    const { t } = useTranslation();
    const isEditing = Boolean(initialData);

    const {
      register,
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<CustomerFormValues>({
      resolver: zodResolver(customerSchema),
      defaultValues: {
        fullName: initialData?.fullName ?? '',
        phoneNumber: initialData?.phoneNumber ?? '',
        email: initialData?.email ?? '',
        gender: initialData?.gender ?? 'other',
        birthday: initialData?.birthday ?? '',
        address: initialData?.address ?? '',
        notes: initialData?.notes ?? '',
        memberType: initialData?.memberType ?? 'standard',
        status: initialData?.status ?? 'active',
      },
    });

    const handleFormSubmit = async (values: CustomerFormValues) => {
      await onSubmit({
        fullName: values.fullName.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email?.trim() || undefined,
        gender: values.gender as Gender,
        birthday: values.birthday || undefined,
        address: values.address?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
        memberType: values.memberType as MemberType,
        status: values.status as CustomerStatus,
      });
    };

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Read-Only Info banner if Editing */}
        {isEditing && initialData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="size-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">
                  {t('customer.table.code', 'Mã khách hàng')}:
                </span>{' '}
                <span className="font-mono font-bold text-slate-800">
                  {initialData.customerCode}
                </span>{' '}
                <span className="text-[10px] text-slate-400">(Chỉ đọc)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">
                  {t('customer.table.createdDate', 'Ngày tạo')}:
                </span>{' '}
                <span className="font-semibold text-slate-800">
                  {dayjs(initialData.createdDate).format('DD/MM/YYYY HH:mm')}
                </span>{' '}
                <span className="text-[10px] text-slate-400">(Chỉ đọc)</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <User className="size-3.5 text-slate-400" />
              <span>{t('customer.fields.fullName', 'Họ và tên (*)')}</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Nguyễn Văn A..."
              {...register('fullName')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Phone className="size-3.5 text-slate-400" />
              <span>{t('customer.fields.phone', 'Số điện thoại (*)')}</span>
            </label>
            <input
              type="tel"
              placeholder="0903xxxxxx"
              {...register('phoneNumber')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {errors.phoneNumber && (
              <p className="text-[11px] text-rose-500 font-medium">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Mail className="size-3.5 text-slate-400" />
              <span>{t('customer.fields.email', 'Email (tùy chọn)')}</span>
            </label>
            <input
              type="email"
              placeholder="tenkhachhang@domain.com"
              {...register('email')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {errors.email && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {t('customer.fields.gender', 'Giới tính')}
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {t('customer.fields.birthday', 'Ngày sinh')}
            </label>
            <input
              type="date"
              {...register('birthday')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Member Type */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {t('customer.fields.memberType', 'Hạng thành viên')}
            </label>
            <Controller
              name="memberType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Chọn hạng thành viên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Tiêu chuẩn (Standard)</SelectItem>
                    <SelectItem value="bronze">Hạng Đồng (Bronze)</SelectItem>
                    <SelectItem value="silver">Hạng Bạc (Silver)</SelectItem>
                    <SelectItem value="gold">Hạng Vàng (Gold - VIP)</SelectItem>
                    <SelectItem value="platinum">Hạng Bạch Kim (Platinum)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              {t('customer.fields.status', 'Trạng thái')}
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10 text-sm rounded-xl">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Hoạt động (Active)
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <span className="size-2 rounded-full bg-amber-500" />
                        Ngừng hoạt động (Inactive)
                      </span>
                    </SelectItem>
                    <SelectItem value="blocked">
                      <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                        <span className="size-2 rounded-full bg-rose-500" />
                        Bị khóa (Blocked)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Address */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <MapPin className="size-3.5 text-slate-400" />
              <span>{t('customer.fields.address', 'Địa chỉ')}</span>
            </label>
            <input
              type="text"
              placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
              {...register('address')}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <FileText className="size-3.5 text-slate-400" />
              <span>{t('customer.fields.notes', 'Ghi chú về khách hàng')}</span>
            </label>
            <textarea
              rows={3}
              placeholder="Sở thích sân, huấn luyện viên, khung giờ thường chơi..."
              {...register('notes')}
              className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl px-5 text-xs sm:text-sm font-semibold"
          >
            {t('common.cancel', 'Hủy')}
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="rounded-xl px-6 font-semibold text-xs sm:text-sm shadow-sm"
          >
            {isEditing
              ? t('customer.saveChanges', 'Lưu thay đổi')
              : t('customer.createSubmit', 'Tạo khách hàng')}
          </Button>
        </div>
      </form>
    );
  },
);

CustomerForm.displayName = 'CustomerForm';
