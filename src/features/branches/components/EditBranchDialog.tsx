import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  Grid3X3,
  DollarSign,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  BranchDetailDto,
  BranchCourtDto,
  BranchOperatingHourDto,
  BranchPricingDto,
  UpdateBranchRequest,
} from '../types/branch-detail.types';
import { normalizeBranchImages } from '../utils/branch-detail.mapper';
import { useUpdateBranch } from '../hooks/useUpdateBranch';
import { useAmenities } from '@/features/amenities/hooks/useAmenities';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface EditBranchDialogProps {
  branch: BranchDetailDto;
  isOpen: boolean;
  onClose: () => void;
}

export const EditBranchDialog: React.FC<EditBranchDialogProps> = ({
  branch,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation('branch');
  const { mutateAsync: updateBranchMutation, isPending } = useUpdateBranch();
  const { data: amenityCatalog = [] } = useAmenities();

  // Form State
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [timeZone, setTimeZone] = useState('Asia/Ho_Chi_Minh');
  const [supportsInstantBooking, setSupportsInstantBooking] = useState(true);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Operating Hours
  const [openTime, setOpenTime] = useState('05:30:00');
  const [closeTime, setCloseTime] = useState('23:30:00');

  // Courts
  const [courts, setCourts] = useState<BranchCourtDto[]>([]);
  const [newCourtName, setNewCourtName] = useState('');

  // Pricings
  const [normalPrice, setNormalPrice] = useState<number>(80000);
  const [peakPrice, setPeakPrice] = useState<number>(140000);
  const [weekendPrice, setWeekendPrice] = useState<number>(120000);

  // Sync state whenever branch changes or modal opens
  useEffect(() => {
    if (branch && isOpen) {
      setName(branch.name || '');
      setPhoneNumber(branch.phoneNumber || '');
      setDescription(branch.description || '');
      setAddress(branch.address || '');
      setCity(branch.city || '');
      setDistrict(branch.district || '');
      setLatitude(branch.latitude ?? 10.7303);
      setLongitude(branch.longitude ?? 106.7072);
      setTimeZone(branch.timeZone || 'Asia/Ho_Chi_Minh');
      setSupportsInstantBooking(branch.supportsInstantBooking ?? true);

      // Amenity IDs
      const initialAmenityIds =
        branch.amenityIds?.length
          ? branch.amenityIds
          : branch.amenities?.map((a) => a.id) || [];
      setSelectedAmenityIds(initialAmenityIds);

      // Images
      const normalizedImgs = normalizeBranchImages(branch.images);
      setImages(normalizedImgs.map((img) => img.imageUrl));

      // Operating Hours
      if (branch.operatingHours && branch.operatingHours.length > 0) {
        setOpenTime(branch.operatingHours[0]?.openTime || '05:30:00');
        setCloseTime(branch.operatingHours[0]?.closeTime || '23:30:00');
      } else {
        setOpenTime('05:30:00');
        setCloseTime('23:30:00');
      }

      // Courts
      if (branch.courts && branch.courts.length > 0) {
        setCourts(branch.courts);
      } else {
        setCourts([
          { courtNumber: 1, name: 'Sân 01', isActive: true },
          { courtNumber: 2, name: 'Sân 02', isActive: true },
        ]);
      }

      // Pricings
      if (branch.branchPricings && branch.branchPricings.length > 0) {
        const normal = branch.branchPricings.find((p) => p.pricingType?.toUpperCase() === 'NORMAL');
        const peak = branch.branchPricings.find((p) => p.pricingType?.toUpperCase() === 'PEAK');
        const weekend = branch.branchPricings.find((p) => p.pricingType?.toUpperCase() === 'WEEKEND');
        if (normal) setNormalPrice(normal.pricePerHour);
        if (peak) setPeakPrice(peak.pricePerHour);
        if (weekend) setWeekendPrice(weekend.pricePerHour);
      } else {
        setNormalPrice(80000);
        setPeakPrice(140000);
        setWeekendPrice(120000);
      }
    }
  }, [branch, isOpen]);

  // Amenity toggle
  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Court handlers
  const handleAddCourt = () => {
    if (!newCourtName.trim()) return;
    const nextNumber = courts.length + 1;
    setCourts((prev) => [
      ...prev,
      { courtNumber: nextNumber, name: newCourtName.trim(), isActive: true },
    ]);
    setNewCourtName('');
  };

  const handleRemoveCourt = (index: number) => {
    setCourts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleCourtActive = (index: number) => {
    setCourts((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, isActive: !c.isActive } : c)),
    );
  };

  // Image handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload: UpdateBranchRequest = {
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      district: district.trim(),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      phoneNumber: phoneNumber.trim(),
      timeZone: timeZone || 'Asia/Ho_Chi_Minh',
      supportsInstantBooking,
      amenityIds: selectedAmenityIds,
      images: images.map((url, idx) => ({
        imageUrl: url,
        sortOrder: idx,
      })),
      operatingHours: [
        {
          openTime: openTime.length === 5 ? `${openTime}:00` : openTime,
          closeTime: closeTime.length === 5 ? `${closeTime}:00` : closeTime,
          isClosed: false,
        } as BranchOperatingHourDto,
      ],
      courts,
      branchPricings: [
        {
          pricingType: 'NORMAL',
          startTime: '05:00:00',
          endTime: '17:00:00',
          pricePerHour: Number(normalPrice),
        },
        {
          pricingType: 'PEAK',
          startTime: '17:00:00',
          endTime: '23:30:00',
          pricePerHour: Number(peakPrice),
        },
        {
          pricingType: 'WEEKEND',
          startTime: '05:30:00',
          endTime: '23:30:00',
          pricePerHour: Number(weekendPrice),
        },
      ] as BranchPricingDto[],
    };

    try {
      await updateBranchMutation({
        branchId: branch.id,
        payload,
      });
      onClose();
    } catch {
      // Toast notification is managed by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Building2 className="size-5 text-emerald-600" />
            {t('page.editTitle', { name: branch.name, defaultValue: `Chỉnh sửa: ${branch.name}` })}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-3">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5">
              1. Thông tin chung
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Tên chi nhánh *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Số điện thoại *</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Địa chỉ cụ thể *</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-2.5 size-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tỉnh / Thành phố *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Quận / Huyện *</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700">Mô tả</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white focus:outline-none"
                  placeholder="Mô tả cơ sở..."
                />
              </div>
            </div>
          </div>

          {/* Section 2: Operating Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <Clock className="size-3.5 text-emerald-600" />
              2. Giờ hoạt động
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Giờ mở cửa</label>
                <input
                  type="time"
                  value={openTime.slice(0, 5)}
                  onChange={(e) => setOpenTime(`${e.target.value}:00`)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Giờ đóng cửa</label>
                <input
                  type="time"
                  value={closeTime.slice(0, 5)}
                  onChange={(e) => setCloseTime(`${e.target.value}:00`)}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-emerald-600" />
              3. Bảng giá thuê sân (VNĐ/giờ)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Giờ thường (05h-17h)</label>
                <input
                  type="number"
                  step="5000"
                  value={normalPrice}
                  onChange={(e) => setNormalPrice(Number(e.target.value))}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Giờ cao điểm (17h-23h)</label>
                <input
                  type="number"
                  step="5000"
                  value={peakPrice}
                  onChange={(e) => setPeakPrice(Number(e.target.value))}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Cuối tuần (T7, CN)</label>
                <input
                  type="number"
                  step="5000"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(Number(e.target.value))}
                  className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Courts */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5 flex items-center gap-1.5">
              <Grid3X3 className="size-3.5 text-emerald-600" />
              4. Danh sách sân ({courts.length})
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tên sân (vd: Sân 03)..."
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddCourt}>
                <Plus className="size-3.5 mr-1" />
                Thêm
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {courts.map((court, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-slate-800">{court.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleCourtActive(idx)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        court.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {court.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(idx)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Amenities */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5">
              5. Tiện ích
            </h4>

            <div className="flex flex-wrap gap-2">
              {amenityCatalog.map((amenity) => {
                const isSelected = selectedAmenityIds.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {amenity.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Images */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1.5">
              6. Hình ảnh ({images.length})
            </h4>

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Nhập đường dẫn hình ảnh (URL)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="h-9 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddImage}>
                <Plus className="size-3.5 mr-1" />
                Thêm ảnh
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 size-5 bg-black/60 rounded text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isPending}
              className="rounded-xl font-bold"
            >
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
