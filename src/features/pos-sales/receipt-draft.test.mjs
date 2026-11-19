import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyReceiptDraft, isReceiptDraftDirty, mapReceiptFieldErrors, validateReceiptDraft } from './receipt-draft.ts';

const products = new Set(['p1', 'p2']);
const line = (productId, quantity, unitCost, key = 0) => ({ key, productId, quantity, unitCost });
const draft = (...items) => ({ ...emptyReceiptDraft(), items });

test('requires a valid line and accepts zero unit cost', () => {
  assert.equal(validateReceiptDraft(emptyReceiptDraft(), products).valid, false);
  assert.equal(validateReceiptDraft(draft(), products).valid, false);
  assert.equal(validateReceiptDraft(draft(line('p1', '1', '0')), products).valid, true);
  for (const item of [
    line('missing', '1', '0'),
    line('p1', '0', '0'),
    line('p1', '0.0001', '1'),
    line('p1', '1', '-1'),
    line('p1', '1', '0.001'),
    line('p1', '1000000000', '1'),
  ]) assert.equal(validateReceiptDraft(draft(item), products).valid, false);
});

test('rejects duplicate products and enforces the receipt total limit', () => {
  const duplicate = validateReceiptDraft(draft(line('p1', '1', '5'), line('p1', '1', '5', 1)), products);
  assert.equal(duplicate.valid, false);
  assert.ok(duplicate.lines.every((item) => item.productError));
  assert.equal(validateReceiptDraft(draft(line('p1', '2', '9999999999.99')), products).valid, false);
  assert.equal(validateReceiptDraft(draft(line('p1', '1', '9999999999.99')), products).valid, true);
});

test('rounds each line to cents as the server does', () => {
  const result = validateReceiptDraft(draft(line('p1', '0.005', '1'), line('p2', '0.005', '1', 1)), products);
  assert.equal(result.valid, true);
  assert.equal(result.lines[0].lineCents, 1n);
  assert.equal(result.lines[1].lineCents, 1n);
  assert.equal(result.totalCents, 2n);
});

test('detects changes to header, items and row count', () => {
  assert.equal(isReceiptDraftDirty(emptyReceiptDraft()), false);
  assert.equal(isReceiptDraftDirty({ ...emptyReceiptDraft(), supplierReference: 'invoice' }), true);
  assert.equal(isReceiptDraftDirty(draft(line('', '', ''), line('', '', '', 1))), true);
  assert.equal(isReceiptDraftDirty(draft(line('p1', '', ''))), true);
});

test('maps server validation errors to stable receipt row keys', () => {
  const items = [line('p1', '1', '1', 4), line('p2', '1', '1', 9)];
  const errors = mapReceiptFieldErrors({
    SupplierReference: 'Invalid reference',
    'Items[1].UnitCost': 'Invalid cost',
    'items[0].productId': 'Missing product',
    'Items[2].Quantity': 'Unknown row',
  }, items);
  assert.deepEqual(errors.header, { supplierReference: 'Invalid reference' });
  assert.deepEqual(errors.lines, { 4: { productId: 'Missing product' }, 9: { unitCost: 'Invalid cost' } });
});
