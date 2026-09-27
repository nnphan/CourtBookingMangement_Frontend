/**
 * Canonical color definitions for Court Status Board
 * Derived from business requirements and pixel-matched with ALOBO design
 */
export const STATUS_COLORS = {
  AVAILABLE: '#FFFFFF',
  RECURRING_BOOKING: '#29B6F6',
  DAILY_BOOKING: '#2ECC71',
  FLEXIBLE_BOOKING: '#F4B942',
  EVENT: '#8E3875',
  DEPOSIT_PENDING: '#FF7F7F',
  MAINTENANCE: '#A0A0A0',
  SERVICE_UNPAID: '#F7D547',
  TICKET_UNPAID: '#E53935',
} as const;

export const THEME_COLORS = {
  BRAND_DARK: '#0d6838',
  BRAND_MEDIUM: '#108044',
  HEADER_BG: '#0d6838',
  FILTER_BG: 'rgba(255, 255, 255, 0.18)',
  FILTER_BORDER: 'rgba(255, 255, 255, 0.3)',
  GRID_BORDER: '#e2e8f0',
  GRID_BG_HEADER: '#e6f4ea',
  TIME_HEADER_BG: '#ebf6f0',
  COURT_HEADER_BG: '#f4faf6',
  BADGE_UNPAID: '#e53935',
} as const;
