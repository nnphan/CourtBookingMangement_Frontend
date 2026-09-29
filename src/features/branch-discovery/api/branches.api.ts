import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  BadmintonBranch,
  BranchSearchParams,
  BranchBookingRequest,
  BranchBookingResult,
  BranchAmenityId,
  BranchCourtSummary,
  BranchOperatingHours,
} from '../types/branch';
import { createSuccessResponse } from '@/mocks/shared/mock-api-response';
import { mockDelay } from '@/mocks/shared/mock-delay';

// Mock Dataset of Badminton Clubs & Branches
export const SEED_BRANCHES: BadmintonBranch[] = [
  {
    id: 'branch-001',
    slug: 'alobo-arena-quan-1',
    name: 'ALOBO Arena Badminton Club - Quận 1',
    tagline: 'Cụm sân cầu lông tiêu chuẩn BWF 5 sao ngay trung tâm Sài Gòn',
    address: '123 Huỳnh Thúc Kháng, Phường Bến Nghé',
    ward: 'Bến Nghé',
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    distanceKm: 0.8,
    coordinates: { lat: 10.7725, lng: 106.7012 },
    phone: '0903 757 746',
    hotline: '1900 6868',
    rating: 4.95,
    reviewCount: 342,
    images: [
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'air_conditioning',
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'stringing',
      'canteen',
      'wifi',
      'coaching',
      'water_dispenser',
    ],
    courtsCount: 12,
    availableCourtsCount: 6,
    priceRange: { min: 110000, max: 180000, currency: 'VND' },
    operatingHours: { open: '05:30', close: '23:30', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    isFeatured: true,
    isPromoted: true,
    description:
      'ALOBO Arena Quận 1 tự hào là cụm sân cầu lông chất lượng hàng đầu thành phố với 12 sân trải thảm Yonex BWF cao cấp. Hệ thống điều hòa làm mát liên tục duy trì nhiệt độ 24°C, trần cao 11 mét thoáng đãng và hệ thống đèn LED gián tiếp chống lóa tối đa.',
    rules: [
      'Bắt buộc mang giày đế cao su non chuyên dụng sân cầu lông (non-marking).',
      'Không mang đồ ăn và nước có màu vào trong khu vực thảm thi đấu.',
      'Vui lòng đến trước giờ đặt 10 phút để nhận sân đúng giờ.',
      'Chính sách hủy sân: Miễn phí trước 4 tiếng, sau 4 tiếng tính 50% phí đặt.',
    ],
    courts: [
      {
        id: 'c1-1',
        name: 'Sân 1 (VIP Center)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Yonex BWF Pro',
        category: 'vip',
        pricePerHour: 180000,
        isAvailableNow: true,
        availableSlotCount: 8,
      },
      {
        id: 'c1-2',
        name: 'Sân 2 (VIP Center)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Yonex BWF Pro',
        category: 'vip',
        pricePerHour: 180000,
        isAvailableNow: true,
        availableSlotCount: 6,
      },
      {
        id: 'c1-3',
        name: 'Sân 3 (Tiêu chuẩn)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Enlio 5.0mm',
        category: 'standard',
        pricePerHour: 130000,
        isAvailableNow: true,
        availableSlotCount: 10,
      },
      {
        id: 'c1-4',
        name: 'Sân 4 (Tiêu chuẩn)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Enlio 5.0mm',
        category: 'standard',
        pricePerHour: 130000,
        isAvailableNow: false,
        availableSlotCount: 2,
      },
      {
        id: 'c1-5',
        name: 'Sân 5 (Tập luyện)',
        surface: 'pvc',
        surfaceLabel: 'Thảm PVC đàn hồi cao',
        category: 'training',
        pricePerHour: 110000,
        isAvailableNow: true,
        availableSlotCount: 12,
      },
    ],
  },
  {
    id: 'branch-002',
    slug: 'tan-binh-pro-court-center',
    name: 'Tân Bình Pro Court Badminton Club',
    tagline: 'Cụm 16 sân rộng nhất khu vực Sân Bay - Sàn gỗ lót thảm giảm chấn',
    address: '456 Hoàng Văn Thụ, Phường 4',
    ward: 'Phường 4',
    district: 'Tân Bình',
    city: 'Hồ Chí Minh',
    distanceKm: 3.4,
    coordinates: { lat: 10.7998, lng: 106.6575 },
    phone: '0912 345 678',
    hotline: '1900 5588',
    rating: 4.88,
    reviewCount: 278,
    images: [
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'stringing',
      'canteen',
      'wifi',
      'water_dispenser',
    ],
    courtsCount: 16,
    availableCourtsCount: 9,
    priceRange: { min: 95000, max: 150000, currency: 'VND' },
    operatingHours: { open: '05:00', close: '24:00', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    isFeatured: true,
    description:
      'Tọa lạc gần ngã tư Bảy Hiền, Tân Bình Pro Court sở hữu bãi giữ xe ô tô hơn 40 chỗ cùng khu căn tin phục vụ thức uống giải khát mát lạnh. Các sân có khoảng cách an toàn rộng 2m giữa hai sân, tránh va chạm khi đánh đôi.',
    rules: [
      'Giữ gìn vệ sinh chung, không hút thuốc trong khu vực nhà thi đấu.',
      'Sử dụng đúng ô sân đã đăng ký với ban quản lý.',
    ],
    courts: [
      {
        id: 'c2-1',
        name: 'Sân 1 (Khu A)',
        surface: 'wood',
        surfaceLabel: 'Sàn gỗ Maple giảm áp lực khớp',
        category: 'vip',
        pricePerHour: 150000,
        isAvailableNow: true,
        availableSlotCount: 5,
      },
      {
        id: 'c2-2',
        name: 'Sân 2 (Khu A)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Yonex tiêu chuẩn BWF',
        category: 'standard',
        pricePerHour: 120000,
        isAvailableNow: true,
        availableSlotCount: 9,
      },
      {
        id: 'c2-3',
        name: 'Sân 3 (Khu B)',
        surface: 'pvc',
        surfaceLabel: 'Thảm PVC độ bám cao',
        category: 'standard',
        pricePerHour: 95000,
        isAvailableNow: true,
        availableSlotCount: 14,
      },
    ],
  },
  {
    id: 'branch-003',
    slug: 'nam-sai-gon-court-quan-7',
    name: 'CLB Cầu Lông Nam Sài Gòn - Quận 7',
    tagline: 'Khu liên hợp thể thao hiện đại kế bên Phú Mỹ Hưng',
    address: '789 Nguyễn Thị Thập, Phường Tân Phong',
    ward: 'Tân Phong',
    district: 'Quận 7',
    city: 'Hồ Chí Minh',
    distanceKm: 5.2,
    coordinates: { lat: 10.7324, lng: 106.7118 },
    phone: '0988 776 655',
    hotline: '028 3775 8899',
    rating: 4.91,
    reviewCount: 195,
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'air_conditioning',
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'canteen',
      'wifi',
      'coaching',
      'water_dispenser',
    ],
    courtsCount: 10,
    availableCourtsCount: 4,
    priceRange: { min: 120000, max: 170000, currency: 'VND' },
    operatingHours: { open: '06:00', close: '23:00', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    description:
      'CLB Nam Sài Gòn mang phong cách thiết kế mở hiện đại, trần cao thông gió tự nhiên kết hợp quạt đối lưu công nghiệp. Có sẵn HLV đội tuyển quốc gia nhận kèm 1:1 hoặc nhóm học viên phong trào.',
    rules: ['Đặt cọc trước 30% khi đặt cố định tháng hoặc tổ chức giải nội bộ.'],
    courts: [
      {
        id: 'c3-1',
        name: 'Sân 1 (Đặc Biệt)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Alite Pro BWF',
        category: 'vip',
        pricePerHour: 170000,
        isAvailableNow: true,
        availableSlotCount: 6,
      },
      {
        id: 'c3-2',
        name: 'Sân 2',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Alite BWF',
        category: 'standard',
        pricePerHour: 135000,
        isAvailableNow: false,
        availableSlotCount: 0,
      },
    ],
  },
  {
    id: 'branch-004',
    slug: 'thu-duc-sports-hub',
    name: 'Thủ Đức Sports Hub - Badminton Zone',
    tagline: 'Tổ hợp cầu lông sinh viên & doanh nghiệp công nghệ cao',
    address: '88 Võ Văn Ngân, Phường Linh Chiểu',
    ward: 'Linh Chiểu',
    district: 'TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    distanceKm: 8.6,
    coordinates: { lat: 10.8504, lng: 106.7719 },
    phone: '0933 221 100',
    hotline: '028 3896 1122',
    rating: 4.82,
    reviewCount: 164,
    images: [
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'stringing',
      'canteen',
      'wifi',
      'water_dispenser',
    ],
    courtsCount: 14,
    availableCourtsCount: 8,
    priceRange: { min: 80000, max: 140000, currency: 'VND' },
    operatingHours: { open: '05:00', close: '23:00', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    description:
      'Địa điểm quen thuộc của các giải đấu học sinh, sinh viên và nhân viên văn phòng làng đại học Thủ Đức. Giá ưu đãi đặc biệt cho học sinh - sinh viên vào khung giờ ban ngày (08:00 - 16:00).',
    rules: [
      'Xuất trình thẻ học sinh sinh viên để nhận giảm giá 20% khung giờ sáng.',
    ],
    courts: [
      {
        id: 'c4-1',
        name: 'Sân 1',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Enlio 4.5mm',
        category: 'standard',
        pricePerHour: 110000,
        isAvailableNow: true,
        availableSlotCount: 7,
      },
    ],
  },
  {
    id: 'branch-005',
    slug: 'binh-thanh-elite-badminton',
    name: 'Bình Thạnh Elite Badminton Complex',
    tagline: 'Không gian đẳng cấp với phòng thay đồ & xông hơi cao cấp',
    address: '240 Chu Văn An, Phường 26',
    ward: 'Phường 26',
    district: 'Bình Thạnh',
    city: 'Hồ Chí Minh',
    distanceKm: 2.9,
    coordinates: { lat: 10.8142, lng: 106.7088 },
    phone: '0977 112 233',
    hotline: '1900 7799',
    rating: 4.96,
    reviewCount: 410,
    images: [
      'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'air_conditioning',
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'stringing',
      'canteen',
      'wifi',
      'coaching',
      'water_dispenser',
    ],
    courtsCount: 8,
    availableCourtsCount: 3,
    priceRange: { min: 130000, max: 200000, currency: 'VND' },
    operatingHours: { open: '05:30', close: '23:30', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    isFeatured: true,
    description:
      'Bình Thạnh Elite trang bị 100% thảm sân đạt chứng chỉ BWF Grade 1 chuyên phục vụ các tay vợt bán chuyên và chuyên nghiệp. Có quầy nước ép hoa quả nguyên chất và máy căng vợt tự động cao cấp.',
    rules: [
      'Vui lòng dọn rác và vỏ cầu sau khi kết thúc buổi chơi.',
      'Sân VIP có kèm nước suối và khăn lạnh miễn phí.',
    ],
    courts: [
      {
        id: 'c5-1',
        name: 'Sân Kim Cương (VIP)',
        surface: 'bwf_mat',
        surfaceLabel: 'Thảm Yonex BWF Grade 1',
        category: 'vip',
        pricePerHour: 200000,
        isAvailableNow: true,
        availableSlotCount: 4,
      },
    ],
  },
  {
    id: 'branch-006',
    slug: 'cau-long-tan-phu-vstar',
    name: 'VStar Badminton Center - Tân Phú',
    tagline: 'Sân giá tốt, đặt sân linh hoạt, cộng đồng giao lưu sôi nổi',
    address: '32 Tân Hương, Phường Tân Quý',
    ward: 'Tân Quý',
    district: 'Tân Phú',
    city: 'Hồ Chí Minh',
    distanceKm: 6.8,
    coordinates: { lat: 10.7892, lng: 106.6214 },
    phone: '0908 889 999',
    hotline: '028 3847 6655',
    rating: 4.79,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1200&auto=format&fit=crop',
    ],
    coverImage:
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1200&auto=format&fit=crop',
    amenities: [
      'lighting_bwf',
      'parking',
      'shower',
      'pro_shop',
      'canteen',
      'wifi',
      'water_dispenser',
    ],
    courtsCount: 10,
    availableCourtsCount: 7,
    priceRange: { min: 85000, max: 130000, currency: 'VND' },
    operatingHours: { open: '05:00', close: '23:00', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: true,
    description:
      'Điểm hẹn giao lưu cầu lông lý tưởng cho mọi trình độ từ Newbie đến phong trào. Có nhóm ghép kèo tự động hàng ngày cho người đi đánh đơn lẻ.',
    rules: ['Thành viên câu lạc bộ được giảm 10% khi nạp tài khoản trên 1.000.000đ.'],
    courts: [
      {
        id: 'c6-1',
        name: 'Sân 1',
        surface: 'pvc',
        surfaceLabel: 'Thảm PVC thể thao',
        category: 'standard',
        pricePerHour: 95000,
        isAvailableNow: true,
        availableSlotCount: 8,
      },
    ],
  },
];

export const normalizeBranch = (
  raw: Partial<BadmintonBranch> & Record<string, unknown>,
): BadmintonBranch => {
  const rawPriceRange = raw.priceRange as { min?: number; max?: number } | undefined;
  const minPrice =
    typeof rawPriceRange?.min === 'number'
      ? rawPriceRange.min
      : typeof raw.minPrice === 'number'
        ? raw.minPrice
        : typeof raw.pricePerHour === 'number'
          ? raw.pricePerHour
          : 90000;

  const maxPrice =
    typeof rawPriceRange?.max === 'number'
      ? rawPriceRange.max
      : typeof raw.maxPrice === 'number'
        ? raw.maxPrice
        : typeof raw.pricePerHour === 'number'
          ? Math.round(Number(raw.pricePerHour) * 1.5)
          : 170000;

  const images =
    Array.isArray(raw.images) && raw.images.length > 0
      ? (raw.images as string[])
      : typeof raw.coverImage === 'string'
        ? [raw.coverImage]
        : [
            'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?q=80&w=1200&auto=format&fit=crop',
          ];

  return {
    id: String(raw.id ?? `branch-${Math.random().toString(36).slice(2, 7)}`),
    slug:
      typeof raw.slug === 'string'
        ? raw.slug
        : String(raw.name ?? 'club')
            .toLowerCase()
            .replace(/\s+/g, '-'),
    name: typeof raw.name === 'string' ? raw.name : 'Câu lạc bộ cầu lông ALOBO',
    tagline:
      typeof raw.tagline === 'string'
        ? raw.tagline
        : 'Cụm sân cầu lông tiêu chuẩn chất lượng cao',
    address: typeof raw.address === 'string' ? raw.address : 'Hồ Chí Minh',
    ward: typeof raw.ward === 'string' ? raw.ward : '',
    district: typeof raw.district === 'string' ? raw.district : 'Quận 1',
    city: typeof raw.city === 'string' ? raw.city : 'Hồ Chí Minh',
    distanceKm: typeof raw.distanceKm === 'number' ? raw.distanceKm : 1.2,
    coordinates:
      raw.coordinates && typeof raw.coordinates === 'object'
        ? (raw.coordinates as { lat: number; lng: number })
        : { lat: 10.7725, lng: 106.7012 },
    phone: typeof raw.phone === 'string' ? raw.phone : '0903 757 746',
    hotline: typeof raw.hotline === 'string' ? raw.hotline : '1900 6868',
    rating: typeof raw.rating === 'number' ? raw.rating : 4.9,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : 128,
    images,
    coverImage: typeof raw.coverImage === 'string' ? raw.coverImage : images[0]!,
    amenities: Array.isArray(raw.amenities)
      ? (raw.amenities as BranchAmenityId[])
      : ['air_conditioning', 'lighting_bwf', 'parking', 'shower', 'wifi'],
    courtsCount: typeof raw.courtsCount === 'number' ? raw.courtsCount : 10,
    availableCourtsCount:
      typeof raw.availableCourtsCount === 'number' ? raw.availableCourtsCount : 5,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      currency: 'VND',
    },
    operatingHours:
      raw.operatingHours && typeof raw.operatingHours === 'object'
        ? (raw.operatingHours as BranchOperatingHours)
        : { open: '05:30', close: '23:30', daysDescription: 'Thứ 2 - Chủ Nhật' },
    isOpenNow: typeof raw.isOpenNow === 'boolean' ? raw.isOpenNow : true,
    isFeatured: typeof raw.isFeatured === 'boolean' ? raw.isFeatured : true,
    isPromoted: typeof raw.isPromoted === 'boolean' ? raw.isPromoted : false,
    description:
      typeof raw.description === 'string'
        ? raw.description
        : 'Cụm sân cầu lông tiêu chuẩn chất lượng cao với hệ thống đèn chống lóa và thảm thi đấu chuyên nghiệp.',
    rules:
      Array.isArray(raw.rules) && raw.rules.length > 0
        ? (raw.rules as string[])
        : ['Mang giày đế cao su non chuyên dụng sân cầu lông', 'Đến trước 10 phút để nhận sân'],
    courts:
      Array.isArray(raw.courts) && raw.courts.length > 0
        ? (raw.courts as BranchCourtSummary[])
        : [
            {
              id: `${raw.id || 'b'}-c1`,
              name: 'Sân 1 (VIP)',
              surface: 'bwf_mat',
              surfaceLabel: 'Thảm Yonex BWF Pro',
              category: 'vip',
              pricePerHour: maxPrice,
              isAvailableNow: true,
              availableSlotCount: 6,
            },
            {
              id: `${raw.id || 'b'}-c2`,
              name: 'Sân 2',
              surface: 'bwf_mat',
              surfaceLabel: 'Thảm tiêu chuẩn BWF',
              category: 'standard',
              pricePerHour: minPrice,
              isAvailableNow: true,
              availableSlotCount: 8,
            },
          ],
  };
};

export const branchesApi = {
  /**
   * Search & browse badminton clubs with filters
   */
  getBranches: async (params?: BranchSearchParams): Promise<ApiResponse<BadmintonBranch[]>> => {
    try {
      const res = await http.get<Record<string, unknown> | unknown[]>('/branches', { params });
      const rawData = res.data;
      const rawList: (Partial<BadmintonBranch> & Record<string, unknown>)[] | null = Array.isArray(
        rawData,
      )
        ? (rawData as (Partial<BadmintonBranch> & Record<string, unknown>)[])
        : typeof rawData === 'object' &&
            rawData !== null &&
            'data' in rawData &&
            Array.isArray((rawData as { data: unknown }).data)
          ? ((rawData as { data: unknown[] })
              .data as (Partial<BadmintonBranch> & Record<string, unknown>)[])
          : null;

      if (rawList && rawList.length > 0) {
        const normalized = rawList.map(normalizeBranch);
        return createSuccessResponse(normalized, {
          pageNumber: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          totalCount: normalized.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        });
      }

      // If backend returns empty array or unexpected format, use rich seed dataset
      throw new Error('Fallback to rich seed dataset');
    } catch {
      await mockDelay(250);

      let list = [...SEED_BRANCHES];

      if (params?.keyword?.trim()) {
        const q = params.keyword.toLowerCase().trim();
        list = list.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.address.toLowerCase().includes(q) ||
            b.district.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q) ||
            b.tagline.toLowerCase().includes(q),
        );
      }

      if (params?.district && params.district !== 'all') {
        list = list.filter((b) => b.district.toLowerCase() === params.district?.toLowerCase());
      }

      if (params?.city && params.city !== 'all') {
        list = list.filter((b) => b.city.toLowerCase().includes(params.city!.toLowerCase()));
      }

      if (params?.amenities && params.amenities.length > 0) {
        list = list.filter((b) =>
          params.amenities!.every((reqAmenity) => b.amenities.includes(reqAmenity)),
        );
      }

      if (params?.onlyOpenNow) {
        list = list.filter((b) => b.isOpenNow);
      }

      if (params?.courtSurface && params.courtSurface !== 'all') {
        list = list.filter((b) => b.courts.some((c) => c.surface === params.courtSurface));
      }

      if (params?.minPrice !== undefined && params.minPrice > 0) {
        list = list.filter((b) => b.priceRange.max >= params.minPrice!);
      }

      if (params?.maxPrice !== undefined && params.maxPrice < 500000) {
        list = list.filter((b) => b.priceRange.min <= params.maxPrice!);
      }

      // Sort
      const sortBy = params?.sortBy ?? 'recommended';
      list.sort((a, b) => {
        if (sortBy === 'rating_desc') return b.rating - a.rating;
        if (sortBy === 'price_asc') return a.priceRange.min - b.priceRange.min;
        if (sortBy === 'price_desc') return b.priceRange.max - a.priceRange.max;
        if (sortBy === 'distance_asc') return (a.distanceKm ?? 99) - (b.distanceKm ?? 99);
        if (sortBy === 'courts_desc') return b.courtsCount - a.courtsCount;
        // recommended
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating;
      });

      return createSuccessResponse(list, {
        pageNumber: params?.page ?? 1,
        pageSize: params?.pageSize ?? 20,
        totalCount: list.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      });
    }
  },

  /**
   * Get single branch detail by id or slug
   */
  getBranchById: async (idOrSlug: string): Promise<ApiResponse<BadmintonBranch>> => {
    try {
      const res = await http.get<ApiResponse<BadmintonBranch>>(`/branches/${idOrSlug}`);
      return res.data;
    } catch {
      await mockDelay(180);
      const branch = SEED_BRANCHES.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
      if (!branch) {
        throw new Error(`Branch with identifier "${idOrSlug}" was not found.`);
      }
      return createSuccessResponse(branch);
    }
  },

  /**
   * Quick court booking online
   */
  createQuickBooking: async (
    booking: BranchBookingRequest,
  ): Promise<ApiResponse<BranchBookingResult>> => {
    try {
      const res = await http.post<ApiResponse<BranchBookingResult>>('/bookings/quick', booking);
      return res.data;
    } catch {
      await mockDelay(300);
      const bookingCode = `BK-${Date.now().toString().slice(-6)}`;
      const result: BranchBookingResult = {
        bookingId: `res-${Date.now()}`,
        bookingCode,
        status: 'confirmed',
        branchName: booking.branchName,
        courtName: booking.courtName,
        bookingTime: `${booking.date} (${booking.startTime} - ${booking.endTime})`,
        totalPrice: booking.totalPrice,
        createdAt: new Date().toISOString(),
      };
      return createSuccessResponse(
        result,
        null,
        `Đặt sân ${booking.courtName} tại ${booking.branchName} thành công! Mã đặt chỗ: ${bookingCode}`,
      );
    }
  },
};
