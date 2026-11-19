import assert from 'node:assert/strict';
import test from 'node:test';
import { filterInventory, isValidReorderLevel, loadInventory, sortInventory, stockStatus, validateInventoryPage } from './inventory-overview.ts';

const item = (id, availableQuantity, reorderLevel, overrides = {}) => ({
  productId: id,
  sku: `SKU-${id}`,
  barcode: null,
  productName: `Product ${id}`,
  categoryName: 'Drinks',
  unit: 'item',
  quantityOnHand: availableQuantity,
  quantityReserved: 0,
  availableQuantity,
  reorderLevel,
  ...overrides,
});

const pageResult = (items, pageNumber, totalCount, pageSize = 1) => ({
  items,
  metadata: { pageNumber, pageSize, totalCount, totalPages: Math.ceil(totalCount / pageSize) },
});

test('loads every inventory page and handles an empty branch', async () => {
  const pages = [];
  const result = await loadInventory(async (page) => {
    pages.push(page);
    return pageResult([item(String(page), 1, 0)], page, 2);
  });
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(result.map((balance) => balance.productId), ['1', '2']);
  assert.deepEqual(await loadInventory(async () => pageResult([], 1, 0)), []);
});

test('rejects incomplete or changing paginated results', async () => {
  await assert.rejects(loadInventory(async () => ({ items: [], metadata: null })));
  await assert.rejects(loadInventory(async (page) =>
    pageResult([item(String(page), 1, 0)], page, page === 1 ? 2 : 3)));
  await assert.rejects(loadInventory(async (page) => pageResult([item('same', 1, 0)], page, 2)));
});

test('rejects mismatched pagination and partial pages without treating them as empty stock', () => {
  const row = item('1', 1, 0);
  assert.throws(() => validateInventoryPage(pageResult([row], 1, 1), 2));
  assert.throws(() => validateInventoryPage(pageResult([row], 1, 1), 1, 20));
  assert.throws(() => validateInventoryPage(pageResult([], 1, 1), 1));
  assert.throws(() => validateInventoryPage({ items: [row], metadata: { ...pageResult([row], 1, 1).metadata, totalPages: 0 } }, 1));
  assert.deepEqual(validateInventoryPage(pageResult([], 2, 1), 2).items, []);
});

test('filters by barcode, category and available-stock status', () => {
  const items = [
    item('a', 2, 2, { barcode: '12345' }),
    item('b', 0, 3),
    item('c', 5, 2, { categoryName: 'Equipment' }),
  ];
  assert.equal(stockStatus(items[0]), 'low-stock');
  assert.equal(stockStatus(items[1]), 'out-of-stock');
  assert.equal(stockStatus(items[2]), 'in-stock');
  assert.deepEqual(filterInventory(items, '234', 'Drinks', 'low-stock'), [items[0]]);
  assert.deepEqual(filterInventory(items, 'SKU-B', '', 'out-of-stock'), [items[1]]);
  assert.deepEqual(filterInventory(items, '', 'Equipment', 'low-stock'), []);
});

test('sorts the full filtered inventory numerically or by SKU without changing the source', () => {
  const items = [item('a', 2, 1, { sku: 'SKU-10' }), item('b', 10, 1, { sku: 'SKU-2' }), item('c', 2, 1)];
  assert.deepEqual(sortInventory(items, { field: 'availableQuantity', direction: 'desc' }).map((row) => row.productId), ['b', 'a', 'c']);
  assert.deepEqual(sortInventory(items.slice(0, 2), { field: 'sku', direction: 'asc' }).map((row) => row.productId), ['b', 'a']);
  assert.deepEqual(items.map((row) => row.productId), ['a', 'b', 'c']);
});

test('only accepts valid reorder values, including zero', () => {
  for (const value of ['0', '0.001', '999999999.999']) assert.equal(isValidReorderLevel(value), true);
  for (const value of ['', '-1', '0.0001', '1e3', '1000000000']) assert.equal(isValidReorderLevel(value), false);
});
