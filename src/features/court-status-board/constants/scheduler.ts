export const SLOT_WIDTH = 100;
export const COURT_COLUMN_WIDTH = 80;

export const SCHEDULER_CONFIG = {
  START_TIME: '05:00',
  END_TIME: '23:00',
  SLOT_DURATION: 60,
  DEFAULT_INTERVAL_MINUTES: 60,
  SUPPORTED_INTERVALS: [60, 30, 15] as const,

  // Geometry (pixels)
  SLOT_WIDTH: 100, // Single source of truth
  BASE_SLOT_WIDTH: 100, // width of one slot at 1.0 zoom
  MIN_SLOT_WIDTH: 80,
  MAX_SLOT_WIDTH: 160,

  ROW_HEIGHT: 48,
  TIME_HEADER_HEIGHT: 44,
  DATE_COLUMN_WIDTH: 40, // far left vertical date label ("Thứ 7 15/08")
  COURT_NAME_WIDTH: 100, // "Sân 1", "Sân 2", ...
  COURT_COLUMN_WIDTH: 80,
  TOTAL_LEFT_COLUMN_WIDTH: 140, // DATE_COLUMN_WIDTH + COURT_NAME_WIDTH

  // Virtualization thresholds
  OVERSCAN_ROWS: 5,
} as const;

export type SupportedInterval = (typeof SCHEDULER_CONFIG.SUPPORTED_INTERVALS)[number];
