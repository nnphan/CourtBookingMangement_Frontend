export interface CourtStatusCourt {
  courtId: string;
  courtNumber: number;
  courtName: string;
  status: string;
}

export interface CourtScheduleItem {
  bookingId: string;
  courtId: string;
  courtNumber: number;
  courtName: string;
  startTime: string;
  endTime: string;
  bookingDate: string;
  bookingType: string;
  bookingStatus: string;
  paymentStatus: string;
  customerName: string;
  phoneNumber: string;
  title: string;
  color: string;
}

export interface CourtStatusResponse {
  branchId: string;
  branchName: string;
  date: string;
  openTime: string;
  closeTime: string;
  courts: CourtStatusCourt[];
  scheduleItems: CourtScheduleItem[];
}
