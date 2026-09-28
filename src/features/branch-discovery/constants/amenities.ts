import type { BranchAmenity, BranchAmenityId } from '../types/branch';

export const AMENITIES_LIST: BranchAmenity[] = [
  {
    id: 'air_conditioning',
    name: 'Máy lạnh',
    icon: 'AirVent',
    description: 'Hệ thống điều hòa và làm mát trung tâm',
  },
  {
    id: 'lighting_bwf',
    name: 'Đèn BWF chống chói',
    icon: 'SunMedium',
    description: 'Chiếu sáng tiêu chuẩn thi đấu quốc tế, không lóa mắt',
  },
  {
    id: 'parking',
    name: 'Bãi đỗ ô tô & xe máy',
    icon: 'Car',
    description: 'Bãi xe rộng rãi, có bảo vệ trông giữ 24/7',
  },
  {
    id: 'shower',
    name: 'Phòng tắm nóng lạnh',
    icon: 'ShowerHead',
    description: 'Phòng thay đồ và tắm riêng biệt nam nữ',
  },
  {
    id: 'pro_shop',
    name: 'Pro Shop thể thao',
    icon: 'ShoppingBag',
    description: 'Bán vợt, giày, cầu, quấn cán chính hãng',
  },
  {
    id: 'stringing',
    name: 'Đan vợt lấy ngay',
    icon: 'Wrench',
    description: 'Máy đan điện tử chuẩn 4 nút Yonex, Victor, Lining',
  },
  {
    id: 'canteen',
    name: 'Canteen & Nước giải khát',
    icon: 'Coffee',
    description: 'Cung cấp nước điện giải, đồ ăn nhẹ phục vụ vận động viên',
  },
  {
    id: 'wifi',
    name: 'Wi-Fi tốc độ cao',
    icon: 'Wifi',
    description: 'Kết nối miễn phí toàn bộ khuôn viên câu lạc bộ',
  },
  {
    id: 'coaching',
    name: 'HLV chuyên nghiệp',
    icon: 'GraduationCap',
    description: 'Nhận huấn luyện kỹ thuật cá nhân và nhóm',
  },
  {
    id: 'water_dispenser',
    name: 'Nước uống miễn phí',
    icon: 'GlassWater',
    description: 'Cây lọc nước nóng lạnh tự phục vụ',
  },
];

export const AMENITIES_MAP: Record<BranchAmenityId, BranchAmenity> = AMENITIES_LIST.reduce(
  (acc, amenity) => {
    acc[amenity.id] = amenity;
    return acc;
  },
  {} as Record<BranchAmenityId, BranchAmenity>,
);

export const POPULAR_LOCATIONS = [
  { label: 'Tất cả khu vực', value: 'all', count: 12 },
  { label: 'Quận 1, TP.HCM', value: 'Quận 1', count: 3 },
  { label: 'Quận 7, TP.HCM', value: 'Quận 7', count: 2 },
  { label: 'Tân Bình, TP.HCM', value: 'Tân Bình', count: 3 },
  { label: 'Thủ Đức, TP.HCM', value: 'TP. Thủ Đức', count: 2 },
  { label: 'Bình Thạnh, TP.HCM', value: 'Bình Thạnh', count: 2 },
];

export const TIME_SLOT_OPTIONS = [
  { id: 'all', label: 'Cả ngày', hours: '05:00 - 24:00' },
  { id: 'morning', label: 'Sáng sớm', hours: '05:00 - 12:00' },
  { id: 'afternoon', label: 'Buổi chiều', hours: '12:00 - 17:00' },
  { id: 'evening', label: 'Giờ vàng tối', hours: '17:00 - 22:00' },
  { id: 'night', label: 'Khuya', hours: '22:00 - 24:00' },
] as const;

export const COURT_SURFACE_LABELS: Record<string, string> = {
  all: 'Tất cả loại sân',
  bwf_mat: 'Thảm thi đấu BWF',
  wood: 'Sàn gỗ thể thao',
  pvc: 'Thảm PVC chống trượt',
  acrylic: 'Sơn Acrylic chuyên dụng',
};
