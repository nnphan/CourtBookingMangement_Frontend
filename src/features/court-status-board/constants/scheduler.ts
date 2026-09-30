export const SLOT_WIDTH = 80;

export const SCHEDULER_CONFIG = {
  START_TIME: '05:00',
  END_TIME: '23:00',
  SLOT_DURATION: 60,
  DEFAULT_INTERVAL_MINUTES: 60,
  SUPPORTED_INTERVALS: [60, 30, 15] as const,

  // Geometry (pixels)
  SLOT_WIDTH: 80, // Single source of truth
  BASE_SLOT_WIDTH: 80, // width of one slot at 1.0 zoom
  MIN_SLOT_WIDTH: 50,
  MAX_SLOT_WIDTH: 140,

  ROW_HEIGHT: 44,
  TIME_HEADER_HEIGHT: 42,
  DATE_COLUMN_WIDTH: 36, // far left vertical date label ("Thứ 7 15/08")
  COURT_NAME_WIDTH: 76, // "Sân 1", "Sân 2", ...
  TOTAL_LEFT_COLUMN_WIDTH: 112, // DATE_COLUMN_WIDTH + COURT_NAME_WIDTH

  // Virtualization thresholds
  OVERSCAN_ROWS: 5,
} as const;

export type SupportedInterval = (typeof SCHEDULER_CONFIG.SUPPORTED_INTERVALS)[number];

