export interface CourtStatusV2Summary {
  totalCourts: number;
  activeCourts: number;
  unavailableCourts: number;
  totalScheduleItems: number;
  totalBookings: number;
  occupiedCourtCount: number;
}

export interface CourtStatusV2Court {
  courtId: string;
  courtNumber: number;
  courtName: string;
  status: string;
}

export interface CourtStatusV2ScheduleItem {
  bookingDetailId: string;
  bookingId: string;
  bookingCode: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  bookingType: string;
  bookingStatus: string;
  bookingDetailStatus: string;
  paymentStatus: string;
  customerName: string;
  phoneNumber: string;
  bookingCourtCount: number;
  title?: string | null;
  displayLabel?: string | null;
  displayStatus?: string | null;
}

export interface CourtStatusV2Data {
  branchId: string;
  branchName: string;
  date: string;
  timezone: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  summary: CourtStatusV2Summary;
  courts: CourtStatusV2Court[];
  scheduleItems: CourtStatusV2ScheduleItem[];
}
