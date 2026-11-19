import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyAdjustmentDraft, isAdjustmentDraftDirty, validateAdjustment } from './inventory-adjustment.ts';

const item = {
  productId: 'p1',
  sku: 'SKU-1',
  barcode: null,
  productName: 'Product',
  categoryName: 'Drinks',
  unit: 'item',
  quantityOnHand: 5.125,
  quantityReserved: 2,
  availableQuantity: 3.125,
  reorderLevel: 1,
};

test('requires a product, valid quantity and nonblank reason', () => {
  assert.equal(validateAdjustment(undefined, 'ADJUSTMENT_IN', '1', 'reason').valid, false);
  for (const quantity of ['', '0', '-1', '0.0001', '1e2', '1000000000']) {
    assert.equal(validateAdjustment(item, 'ADJUSTMENT_IN', quantity, 'reason').valid, false);
  }
  assert.equal(validateAdjustment(item, 'ADJUSTMENT_IN', '1', '   ').valid, false);
  assert.equal(validateAdjustment(item, 'ADJUSTMENT_IN', '1', 'a'.repeat(2001)).valid, false);
});

test('prevents both decrease types from consuming reserved stock', () => {
  for (const type of ['ADJUSTMENT_OUT', 'DAMAGE']) {
    assert.equal(validateAdjustment(item, type, '3.126', 'reason').valid, false);
    const result = validateAdjustment(item, type, '3.125', 'reason');
    assert.equal(result.valid, true);
    assert.equal(result.resultOnHand, 2);
    assert.equal(result.resultAvailable, 0);
  }
});

test('calculates decimal previews and enforces the resulting stock limit', () => {
  const result = validateAdjustment(item, 'ADJUSTMENT_IN', '0.001', 'reason');
  assert.equal(result.valid, true);
  assert.equal(result.resultOnHand, 5.126);
  assert.equal(result.resultAvailable, 3.126);
  assert.equal(validateAdjustment({ ...item, quantityOnHand: 999_999_999.999 }, 'ADJUSTMENT_IN', '0.001', 'reason').valid, false);
});

test('detects adjustment input that must be confirmed before a branch switch', () => {
  const empty = emptyAdjustmentDraft();
  assert.equal(isAdjustmentDraftDirty(empty), false);
  for (const change of [
    { productSearch: 'SKU' },
    { productId: 'p1' },
    { movementType: 'DAMAGE' },
    { quantity: '0' },
    { notes: ' ' },
  ]) {
    assert.equal(isAdjustmentDraftDirty({ ...empty, ...change }), true);
  }
});
