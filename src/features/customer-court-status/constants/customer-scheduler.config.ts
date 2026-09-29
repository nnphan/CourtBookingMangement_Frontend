export const CUSTOMER_SCHEDULER_CONFIG = {
  START_TIME: '05:00',
  END_TIME: '24:00',
  DEFAULT_INTERVAL_MINUTES: 30,
  SUPPORTED_INTERVALS: [15, 30] as const,
  ROW_HEIGHT: 44,
  COURT_COL_WIDTH: 74,
  BASE_SLOT_WIDTH: 46,
  MIN_SLOT_WIDTH: 36,
  MAX_SLOT_WIDTH: 72,
  OVERSCAN_ROWS: 5,
} as const;

export const CUSTOMER_HOTLINE = {
  PHONE_1: '028.2204.4789',
  PHONE_2: '0988.780.723',
  LABEL: 'Lưu ý: Nếu bạn cần đặt lịch cố định vui lòng liên hệ: 028.2204.4789 hoặc 0988.780.723 để được hỗ trợ',
} as const;
