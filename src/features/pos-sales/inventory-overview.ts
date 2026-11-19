import type { InventoryBalance, PagedResult } from './types';

export type StockStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
export type InventorySortField = 'productName' | 'sku' | 'categoryName' | 'quantityOnHand' | 'quantityReserved' | 'availableQuantity' | 'reorderLevel';
export type InventorySort = { field: InventorySortField; direction: 'asc' | 'desc' } | null;

export const stockStatus = (item: InventoryBalance): Exclude<StockStatus, 'all'> => {
  if (item.availableQuantity <= 0) return 'out-of-stock';
  return item.availableQuantity <= item.reorderLevel ? 'low-stock' : 'in-stock';
};

export const filterInventory = (
  items: InventoryBalance[],
  search: string,
  category: string,
  status: StockStatus,
) => {
  const term = search.trim().toLocaleLowerCase('vi');
  return items.filter((item) =>
    (!term || [item.productName, item.sku, item.barcode ?? ''].some((value) =>
      value.toLocaleLowerCase('vi').includes(term),
    )) &&
    (!category || item.categoryName === category) &&
    (status === 'all' || stockStatus(item) === status),
  );
};

export const sortInventory = (items: InventoryBalance[], sort: InventorySort) => {
  if (!sort) return items;
  const collator = new Intl.Collator('vi', { numeric: true, sensitivity: 'base' });
  return [...items].sort((a, b) => {
    const left = a[sort.field];
    const right = b[sort.field];
    const comparison = typeof left === 'number' && typeof right === 'number'
      ? left - right : collator.compare(String(left), String(right));
    return comparison * (sort.direction === 'asc' ? 1 : -1) || collator.compare(a.productId, b.productId);
  });
};

export const isValidReorderLevel = (value: string) =>
  /^\d+(?:\.\d{1,3})?$/.test(value) && Number.isFinite(Number(value)) &&
  Number(value) <= 999_999_999.999;

export const validateInventoryPage = (
  result: PagedResult<InventoryBalance>,
  page: number,
  expectedPageSize?: number,
) => {
  const metadata = result.metadata;
  if (!metadata || !Number.isSafeInteger(metadata.totalCount) || metadata.totalCount < 0 ||
      !Number.isSafeInteger(metadata.pageSize) || metadata.pageSize < 1 || metadata.pageSize > 100 ||
      metadata.pageNumber !== page || (expectedPageSize !== undefined && metadata.pageSize !== expectedPageSize) ||
      metadata.totalPages !== Math.ceil(metadata.totalCount / metadata.pageSize) ||
      result.items.length !== Math.min(metadata.pageSize, Math.max(0, metadata.totalCount - (page - 1) * metadata.pageSize))) {
    throw new Error('Dữ liệu phân trang tồn kho không hợp lệ hoặc đã thay đổi. Vui lòng thử lại.');
  }
  return { items: result.items, metadata };
};

export const loadInventory = async (
  fetchPage: (page: number) => Promise<PagedResult<InventoryBalance>>,
) => {
  const first = validateInventoryPage(await fetchPage(1), 1);
  const { totalPages, totalCount, pageSize } = first.metadata;
  const items = [...first.items];
  for (let page = 2; page <= totalPages; page += 1) {
    const result = validateInventoryPage(await fetchPage(page), page, pageSize);
    if (result.metadata.totalCount !== totalCount || result.metadata.totalPages !== totalPages) {
      throw new Error('Dữ liệu tồn kho đã thay đổi khi tải. Vui lòng thử lại.');
    }
    items.push(...result.items);
  }
  if (items.length !== totalCount || new Set(items.map((item) => item.productId)).size !== items.length) {
    throw new Error('Không thể tải đầy đủ tồn kho. Vui lòng thử lại.');
  }
  return items;
};
