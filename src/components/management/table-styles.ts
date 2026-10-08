/** Shared table look so every management list renders identically. */
export const tableStyles = {
  container: 'w-full bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden',
  head: 'bg-slate-50/90 border-b border-slate-200',
  th: 'py-3.5 px-4 text-sm font-semibold text-slate-600 whitespace-nowrap',
  body: 'divide-y divide-slate-100 text-slate-700',
  row: 'hover:bg-slate-50/80 transition-colors duration-150',
  td: 'py-3.5 px-4 text-sm',
  mobileList: 'sm:hidden divide-y divide-slate-100',
} as const;

/** Shared control look for filter dropdown triggers. */
export const FILTER_CONTROL_CLASS =
  'h-10 w-full rounded-xl border-slate-200 bg-slate-50/70 text-sm focus:bg-white';
