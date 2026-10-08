import { http } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  Branch,
  BranchSearchParams,
  BranchStats,
  CreateBranchInput,
  CourtItem,
  PricingTier,
} from '@/types/branch';
import { createSuccessResponse } from '@/mocks/shared/mock-api-response';
import { createErrorResponse } from '@/mocks/shared/mock-error';
import { mockDelay } from '@/mocks/shared/mock-delay';
import { DEFAULT_CLOSE_TIME, DEFAULT_OPEN_TIME } from '@/lib/branch-hours';

const DEFAULT_AMENITY_IDS: string[] = [];

const DEFAULT_PRICING: PricingTier[] = [
  {
    id: 'prc-weekday',
    name: 'Weekday Regular',
    timeRange: '06:00 - 17:00 (Mon - Fri)',
    pricePerHour: 110000,
    description: 'Giờ thường ngày trong tuần',
  },
  {
    id: 'prc-peak',
    name: 'Peak Hour',
    timeRange: '17:00 - 22:00 (Daily)',
    pricePerHour: 160000,
    description: 'Giờ cao điểm chiều tối',
  },
  {
    id: 'prc-weekend',
    name: 'Weekend',
    timeRange: '06:00 - 23:00 (Sat - Sun)',
    pricePerHour: 150000,
    description: 'Cuối tuần Thứ 7 & Chủ Nhật',
  },
];

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521537634581-0dced2fedc60?auto=format&fit=crop&w=1200&q=80',
];

const generateInitialCourts = (count: number): CourtItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `court-${i + 1}`,
    name: `Court ${i + 1}`,
    surface: (i % 3 === 0 ? 'bwf_mat' : i % 2 === 0 ? 'wood' : 'pvc') as CourtItem['surface'],
    category: (i === 0 ? 'vip' : i % 4 === 0 ? 'vip' : 'standard') as CourtItem['category'],
    status: (i === 4 ? 'maintenance' : 'available') as CourtItem['status'],
    pricePerHour: 120000 + (i % 3) * 20000,
  }));
};

// Seed 53 realistic branches as highlighted in the UX requirement ("Showing 1-10 of 53 branches")
const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-01',
    branchName: 'ALOBO Arena District 7',
    slug: 'alobo-arena-district-7',
    phone: '0901234567',
    description:
      'Sân cầu lông tiêu chuẩn thi đấu quốc tế BWF với hệ thống thảm chuyên dụng 5 lớp và điều hòa trung tâm.',
    city: 'Hồ Chí Minh',
    district: 'Quận 7',
    address: '123 Nguyễn Văn Linh, Phường Tân Phong',
    latitude: 10.7303,
    longitude: 106.7072,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[0],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(12),
    totalCourts: 12,
    status: 'active',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2026-03-20T10:15:00.000Z',
  },
  {
    id: 'branch-02',
    branchName: 'ALOBO Prime Thảo Điền',
    slug: 'alobo-prime-thao-dien',
    phone: '0908765432',
    description:
      'Cơ sở cao cấp khu vực Thảo Điền, phục vụ cộng đồng expat và các giải đấu phong trào.',
    city: 'Hồ Chí Minh',
    district: 'Thành phố Thủ Đức',
    address: '45 Xuân Thủy, Phường Thảo Điền',
    latitude: 10.8038,
    longitude: 106.7328,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[1],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(8),
    totalCourts: 8,
    status: 'active',
    createdAt: '2025-02-10T09:30:00.000Z',
    updatedAt: '2026-03-18T14:20:00.000Z',
  },
  {
    id: 'branch-03',
    branchName: 'ALOBO Central Sport Quận 1',
    slug: 'alobo-central-sport-quan-1',
    phone: '0912334455',
    description:
      'Tổ hợp thể thao trung tâm thành phố, thuận tiện đi lại cho dân văn phòng sau giờ làm.',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    address: '88 Lê Thị Riêng, Phường Bến Thành',
    latitude: 10.7712,
    longitude: 106.6914,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[2],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(6),
    totalCourts: 6,
    status: 'active',
    createdAt: '2025-03-05T07:15:00.000Z',
    updatedAt: '2026-03-15T09:00:00.000Z',
  },
  {
    id: 'branch-04',
    branchName: 'ALOBO Park Bình Thạnh',
    slug: 'alobo-park-binh-thanh',
    phone: '0933445566',
    description:
      'Không gian thoáng đãng cạnh sông Sài Gòn, bãi đỗ xe ô tô rộng rãi, pro-shop đầy đủ phụ kiện.',
    city: 'Hồ Chí Minh',
    district: 'Bình Thạnh',
    address: '210 Ung Văn Khiêm, Phường 25',
    latitude: 10.8062,
    longitude: 106.7175,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[3],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(10),
    totalCourts: 10,
    status: 'active',
    createdAt: '2025-04-12T11:00:00.000Z',
    updatedAt: '2026-03-10T16:45:00.000Z',
  },
  {
    id: 'branch-05',
    branchName: 'ALOBO West Star Tân Bình',
    slug: 'alobo-west-star-tan-binh',
    phone: '0977889900',
    description: 'Gần sân bay Tân Sơn Nhất, sàn gỗ phong Bắc Mỹ chống trơn trượt đạt chuẩn BWF.',
    city: 'Hồ Chí Minh',
    district: 'Tân Bình',
    address: '15 Hoàng Hoa Thám, Phường 13',
    latitude: 10.8015,
    longitude: 106.6492,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[0],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(14),
    totalCourts: 14,
    status: 'active',
    createdAt: '2025-05-18T10:00:00.000Z',
    updatedAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'branch-06',
    branchName: 'ALOBO Elite Cầu Giấy',
    slug: 'alobo-elite-cau-giay',
    phone: '0988112233',
    description:
      'Cơ sở flagship tại Thủ đô Hà Nội với hệ thống camera live streaming và phân tích cú đánh AI.',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    address: '68 Duy Tân, Phường Dịch Vọng Hậu',
    latitude: 21.0315,
    longitude: 105.7831,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[1],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(16),
    totalCourts: 16,
    status: 'active',
    createdAt: '2025-06-01T08:30:00.000Z',
    updatedAt: '2026-03-22T08:00:00.000Z',
  },
  {
    id: 'branch-07',
    branchName: 'ALOBO Riverside Tây Hồ',
    slug: 'alobo-riverside-tay-ho',
    phone: '0944556611',
    description: 'View Hồ Tây cực đẹp, hệ thống lọc không khí và phòng tắm nước nóng chuẩn 5 sao.',
    city: 'Hà Nội',
    district: 'Tây Hồ',
    address: '250 Lạc Long Quân, Phường Bưởi',
    latitude: 21.0543,
    longitude: 105.8112,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[2],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(8),
    totalCourts: 8,
    status: 'active',
    createdAt: '2025-07-20T14:00:00.000Z',
    updatedAt: '2026-02-15T11:20:00.000Z',
  },
  {
    id: 'branch-08',
    branchName: 'ALOBO Grand Hải Châu',
    slug: 'alobo-grand-hai-chau',
    phone: '0922334455',
    description:
      'Tọa lạc tại trung tâm Đà Nẵng, điểm đến quen thuộc của các vận động viên miền Trung.',
    city: 'Đà Nẵng',
    district: 'Hải Châu',
    address: '102 Bạch Đằng, Phường Thạch Thang',
    latitude: 16.0718,
    longitude: 108.2235,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[3],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(10),
    totalCourts: 10,
    status: 'active',
    createdAt: '2025-08-15T09:00:00.000Z',
    updatedAt: '2026-02-28T15:30:00.000Z',
  },
  {
    id: 'branch-09',
    branchName: 'ALOBO Sunrise Sơn Trà',
    slug: 'alobo-sunrise-son-tra',
    phone: '0911223388',
    description:
      'Sân cầu lông gần bãi biển Mỹ Khê, dịch vụ nước giải khát dinh dưỡng và thuê vợt cao cấp.',
    city: 'Đà Nẵng',
    district: 'Sơn Trà',
    address: '42 Võ Nguyên Giáp, Phường Phước Mỹ',
    latitude: 16.0612,
    longitude: 108.2435,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[0],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(6),
    totalCourts: 6,
    status: 'inactive',
    createdAt: '2025-09-01T10:00:00.000Z',
    updatedAt: '2026-01-10T17:00:00.000Z',
  },
  {
    id: 'branch-10',
    branchName: 'ALOBO Complex Dĩ An',
    slug: 'alobo-complex-di-an',
    phone: '0966778899',
    description:
      'Trung tâm thể thao Dĩ An giáp ranh TP.HCM, quy mô 18 sân tổ chức sự kiện và giao lưu doanh nghiệp.',
    city: 'Bình Dương',
    district: 'Dĩ An',
    address: '89 Quốc Lộ 1K, Phường Đông Hòa',
    latitude: 10.8924,
    longitude: 106.7812,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[1],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(18),
    totalCourts: 18,
    status: 'active',
    createdAt: '2025-10-10T08:00:00.000Z',
    updatedAt: '2026-03-12T13:40:00.000Z',
  },
];

// Generate additional branches to reach total of 53
const CITIES_DISTRICTS: { city: string; districts: string[] }[] = [
  {
    city: 'Hồ Chí Minh',
    districts: [
      'Quận 7',
      'Quận 1',
      'Quận 3',
      'Quận 10',
      'Bình Thạnh',
      'Tân Bình',
      'Thành phố Thủ Đức',
      'Phú Nhuận',
      'Gò Vấp',
    ],
  },
  {
    city: 'Hà Nội',
    districts: [
      'Cầu Giấy',
      'Tây Hồ',
      'Đống Đa',
      'Thanh Xuân',
      'Nam Từ Liêm',
      'Ba Đình',
      'Hai Bà Trưng',
    ],
  },
  { city: 'Đà Nẵng', districts: ['Hải Châu', 'Sơn Trà', 'Thanh Khê', 'Ngũ Hành Sơn'] },
  { city: 'Bình Dương', districts: ['Dĩ An', 'Thuận An', 'Thủ Dầu Một'] },
];

for (let i = 11; i <= 53; i++) {
  const cd = CITIES_DISTRICTS[(i - 11) % CITIES_DISTRICTS.length]!;
  const district = cd.districts[(i - 11) % cd.districts.length]!;
  const courtCount = 6 + (i % 8) * 2;
  const isActive = i % 7 !== 0; // occasional inactive branch

  INITIAL_BRANCHES.push({
    id: `branch-${i.toString().padStart(2, '0')}`,
    branchName: `ALOBO Badminton Club #${i} (${district})`,
    slug: `alobo-badminton-club-${i}-${district.toLowerCase().replace(/\s+/g, '-')}`,
    phone: `090${(1000000 + i * 1793).toString().slice(0, 7)}`,
    description: `Cụm sân cầu lông tiêu chuẩn cao tại ${district}, ${cd.city}. Trang bị hệ thống chiếu sáng chống chói mắt tiêu chuẩn BWF.`,
    city: cd.city,
    district,
    address: `${20 + i * 3} Đường số ${(i % 15) + 1}, ${district}`,
    latitude: 10.7 + (i % 10) * 0.02,
    longitude: 106.6 + (i % 10) * 0.02,
    openTime: DEFAULT_OPEN_TIME,
    closeTime: DEFAULT_CLOSE_TIME,
    amenityIds: DEFAULT_AMENITY_IDS,
    images: SAMPLE_IMAGES,
    coverImage: SAMPLE_IMAGES[i % SAMPLE_IMAGES.length],
    pricing: DEFAULT_PRICING,
    courts: generateInitialCourts(courtCount),
    totalCourts: courtCount,
    status: isActive ? 'active' : 'inactive',
    createdAt: new Date(Date.now() - (60 - i) * 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - (i % 10) * 86400000).toISOString(),
  });
}

// In-memory persistent database for stateful mutations
const inMemoryBranches: Branch[] = [...INITIAL_BRANCHES];

export const branchService = {
  /**
   * Get paginated branches with search, city, district, and status filtering
   */
  getBranches: async (params: BranchSearchParams = {}): Promise<ApiResponse<Branch[]>> => {
    try {
      const res = await http.get<ApiResponse<Branch[]>>('/branches', { params });
      return res.data;
    } catch {
      await mockDelay(220);

      const {
        keyword = '',
        city = '',
        district = '',
        status = 'all',
        pageNumber = 1,
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      let filtered = [...inMemoryBranches];

      // 1. Keyword search (Name, Phone, Address)
      if (keyword.trim()) {
        const q = keyword.toLowerCase().trim();
        filtered = filtered.filter(
          (b) =>
            b.branchName.toLowerCase().includes(q) ||
            b.phone.includes(q) ||
            b.address.toLowerCase().includes(q) ||
            b.district.toLowerCase().includes(q) ||
            b.city.toLowerCase().includes(q),
        );
      }

      // 2. City filter
      if (city && city !== 'all' && city !== 'All Cities') {
        filtered = filtered.filter((b) => b.city.toLowerCase() === city.toLowerCase());
      }

      // 3. District filter
      if (district && district !== 'all' && district !== 'All Districts') {
        filtered = filtered.filter((b) => b.district.toLowerCase() === district.toLowerCase());
      }

      // 4. Status filter
      if (status && status !== 'all') {
        filtered = filtered.filter((b) => b.status === status);
      }

      // 5. Sorting
      filtered.sort((a, b) => {
        let diff = 0;
        if (sortBy === 'branchName') {
          diff = a.branchName.localeCompare(b.branchName, 'vi');
        } else if (sortBy === 'totalCourts') {
          diff = a.totalCourts - b.totalCourts;
        } else {
          diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortOrder === 'desc' ? -diff : diff;
      });

      // 6. Pagination
      const totalCount = filtered.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const validPage = Math.min(Math.max(1, pageNumber), totalPages);
      const startIndex = (validPage - 1) * pageSize;
      const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

      return createSuccessResponse(paginatedData, {
        pageNumber: validPage,
        pageSize,
        totalCount,
        totalPages,
        hasPreviousPage: validPage > 1,
        hasNextPage: validPage < totalPages,
      });
    }
  },

  /**
   * Get single branch detail by ID
   */
  getBranchDetail: async (id: string): Promise<ApiResponse<Branch>> => {
    try {
      const res = await http.get<ApiResponse<Branch>>(`/branches/${id}`);
      return res.data;
    } catch {
      await mockDelay(180);
      const branch = inMemoryBranches.find((b) => b.id === id);
      if (!branch) {
        return createErrorResponse('BRANCH_NOT_FOUND', `Không tìm thấy chi nhánh với ID "${id}".`);
      }
      return createSuccessResponse(branch);
    }
  },

  /**
   * Get statistics summary for branches
   */
  getBranchStats: async (): Promise<ApiResponse<BranchStats>> => {
    try {
      const res = await http.get<ApiResponse<BranchStats>>('/branches/stats');
      return res.data;
    } catch {
      await mockDelay(150);
      const totalBranches = inMemoryBranches.length;
      const activeBranches = inMemoryBranches.filter((b) => b.status === 'active').length;
      const inactiveBranches = inMemoryBranches.filter((b) => b.status === 'inactive').length;
      const totalCourts = inMemoryBranches.reduce(
        (acc, curr) => acc + (curr.totalCourts || curr.courts.length || 0),
        0,
      );

      return createSuccessResponse({
        totalBranches,
        activeBranches,
        inactiveBranches,
        totalCourts,
      });
    }
  },

  /**
   * Create a new branch
   */
  createBranch: async (input: CreateBranchInput): Promise<ApiResponse<Branch>> => {
    try {
      const res = await http.post<ApiResponse<Branch>>('/branches', input);
      return res.data;
    } catch {
      await mockDelay(300);

      // Validate branch name
      if (!input.branchName.trim()) {
        return createErrorResponse('VALIDATION_ERROR', 'Tên chi nhánh không được để trống.', [
          { field: 'branchName', message: 'Tên chi nhánh bắt buộc nhập.' },
        ]);
      }

      // Validate phone
      if (!input.phone.trim()) {
        return createErrorResponse('VALIDATION_ERROR', 'Số điện thoại không được để trống.', [
          { field: 'phone', message: 'Số điện thoại bắt buộc nhập.' },
        ]);
      }

      const newId = `branch-${Date.now().toString().slice(-4)}`;
      const courtsFormatted: CourtItem[] = (input.courts || []).map((c, idx) => ({
        id: c.id || `court-${idx + 1}`,
        name: c.name || `Court ${idx + 1}`,
        surface: c.surface || 'bwf_mat',
        category: c.category || 'standard',
        status: c.status || 'available',
        pricePerHour: c.pricePerHour || 120000,
      }));

      const newBranch: Branch = {
        id: newId,
        branchName: input.branchName.trim(),
        slug: input.branchName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        phone: input.phone.trim(),
        description: input.description?.trim() || '',
        city: input.city.trim(),
        district: input.district.trim(),
        address: input.address.trim(),
        latitude: input.latitude,
        longitude: input.longitude,
        openTime: input.openTime || DEFAULT_OPEN_TIME,
        closeTime: input.closeTime || DEFAULT_CLOSE_TIME,
        amenityIds: input.amenityIds ?? [],
        images: input.images?.length ? input.images : SAMPLE_IMAGES.slice(0, 2),
        coverImage: input.images?.[0] || SAMPLE_IMAGES[0],
        pricing: input.pricing?.length ? input.pricing : DEFAULT_PRICING,
        courts: courtsFormatted,
        totalCourts: courtsFormatted.length,
        status: input.status || 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      inMemoryBranches.unshift(newBranch);
      return createSuccessResponse(newBranch, null, 'Tạo chi nhánh mới thành công.');
    }
  },

  /**
   * Update an existing branch
   */
  updateBranch: async (
    id: string,
    input: Partial<CreateBranchInput>,
  ): Promise<ApiResponse<Branch>> => {
    try {
      const res = await http.put<ApiResponse<Branch>>(`/branches/${id}`, input);
      return res.data;
    } catch {
      await mockDelay(250);
      const index = inMemoryBranches.findIndex((b) => b.id === id);
      if (index === -1) {
        return createErrorResponse('BRANCH_NOT_FOUND', `Không tìm thấy chi nhánh với ID "${id}".`);
      }

      const existing = inMemoryBranches[index]!;
      let updatedCourts = existing.courts;

      if (input.courts) {
        updatedCourts = input.courts.map((c, idx) => ({
          id: c.id || `court-${idx + 1}`,
          name: c.name || `Court ${idx + 1}`,
          surface: c.surface || 'bwf_mat',
          category: c.category || 'standard',
          status: c.status || 'available',
          pricePerHour: c.pricePerHour || 120000,
        }));
      }

      const updatedBranch: Branch = {
        ...existing,
        ...input,
        branchName: input.branchName?.trim() ?? existing.branchName,
        phone: input.phone?.trim() ?? existing.phone,
        description:
          input.description !== undefined ? input.description.trim() : existing.description,
        city: input.city?.trim() ?? existing.city,
        district: input.district?.trim() ?? existing.district,
        address: input.address?.trim() ?? existing.address,
        openTime: input.openTime ?? existing.openTime,
        closeTime: input.closeTime ?? existing.closeTime,
        amenityIds: input.amenityIds ?? existing.amenityIds,
        images: input.images ?? existing.images,
        coverImage: input.images?.[0] ?? existing.coverImage,
        pricing: input.pricing ?? existing.pricing,
        courts: updatedCourts,
        totalCourts: updatedCourts.length,
        status: input.status ?? existing.status,
        updatedAt: new Date().toISOString(),
      };

      inMemoryBranches[index] = updatedBranch;
      return createSuccessResponse(updatedBranch, null, 'Cập nhật chi nhánh thành công.');
    }
  },

  /**
   * Delete a branch
   */
  deleteBranch: async (id: string): Promise<ApiResponse<{ id: string }>> => {
    try {
      const res = await http.delete<ApiResponse<{ id: string }>>(`/branches/${id}`);
      return res.data;
    } catch {
      await mockDelay(200);
      const index = inMemoryBranches.findIndex((b) => b.id === id);
      if (index === -1) {
        return createErrorResponse('BRANCH_NOT_FOUND', `Không tìm thấy chi nhánh với ID "${id}".`);
      }

      inMemoryBranches.splice(index, 1);
      return createSuccessResponse({ id }, null, 'Xóa chi nhánh thành công.');
    }
  },
};
