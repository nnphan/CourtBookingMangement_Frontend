export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export type MemberType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'standard';

export type Gender = 'male' | 'female' | 'other';

export interface Customer {
  id: string;
  customerCode: string; // e.g. "CUST-001"
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender?: Gender;
  birthday?: string; // YYYY-MM-DD
  address?: string;
  notes?: string;
  memberType: MemberType;
  status: CustomerStatus;
  isGuest: boolean;
  totalBookings: number;
  totalRevenue: number;
  lastBookingDate?: string;
  favoriteCourt?: string;
  bookingFrequency?: string; // e.g. "3 lần/tuần"
  joinDate: string; // YYYY-MM-DD
  expireDate?: string; // YYYY-MM-DD
  createdDate: string; // ISO string
  updatedDate: string; // ISO string
}

export interface CustomerFilters {
  status?: CustomerStatus | 'all';
  memberType?: MemberType | 'all';
  isGuest?: boolean | 'all';
}

export interface PaginationState {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CustomerSearchRequest {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  status?: CustomerStatus | 'all';
  memberType?: MemberType | 'all';
  isGuest?: boolean | 'all';
  sortBy?: 'fullName' | 'createdDate' | 'totalBookings' | 'totalRevenue';
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerCreateInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender?: Gender;
  birthday?: string;
  address?: string;
  notes?: string;
  memberType?: MemberType;
  status?: CustomerStatus;
  isGuest?: boolean;
}

export interface CustomerUpdateInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  gender?: Gender;
  birthday?: string;
  address?: string;
  notes?: string;
  memberType?: MemberType;
  status?: CustomerStatus;
}

export interface MonthlyNewCustomerTrend {
  month: string; // e.g. "T4/2026"
  count: number;
}

export interface TopRevenueCustomer {
  id: string;
  fullName: string;
  customerCode: string;
  totalRevenue: number;
  memberType: MemberType;
}

export interface MemberDistributionItem {
  type: MemberType;
  count: number;
  percentage: number;
}

export interface CustomerStatsOverview {
  totalCustomers: number;
  activeCustomers: number;
  vipCustomers: number;
  newCustomersThisMonth: number;
  monthlyTrend: MonthlyNewCustomerTrend[];
  topRevenueCustomers: TopRevenueCustomer[];
  memberDistribution: MemberDistributionItem[];
}
