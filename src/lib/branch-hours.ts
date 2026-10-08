export const DEFAULT_OPEN_TIME = '05:00';
export const DEFAULT_CLOSE_TIME = '23:00';

/** True when both values are "HH:mm" and the closing time is strictly after the opening time. */
export const isCloseAfterOpen = (openTime: string, closeTime: string): boolean =>
  Boolean(openTime) && Boolean(closeTime) && closeTime > openTime;
