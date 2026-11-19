import type { InventoryBalance } from './types';

export type AdjustmentType = 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'DAMAGE';

export interface AdjustmentDraft {
  productSearch: string;
  productId: string;
  movementType: AdjustmentType;
  quantity: string;
  notes: string;
}

export const emptyAdjustmentDraft = (): AdjustmentDraft => ({
  productSearch: '',
  productId: '',
  movementType: 'ADJUSTMENT_IN',
  quantity: '',
  notes: '',
});

export const isAdjustmentDraftDirty = (draft: AdjustmentDraft) =>
  Boolean(draft.productSearch || draft.productId || draft.movementType !== 'ADJUSTMENT_IN' ||
    draft.quantity || draft.notes);

export const adjustmentTypes: Array<{ value: AdjustmentType; label: string }> = [
  { value: 'ADJUSTMENT_IN', label: 'Tăng tồn kho thủ công' },
  { value: 'ADJUSTMENT_OUT', label: 'Giảm tồn kho thủ công' },
  { value: 'DAMAGE', label: 'Xuất hàng hư hỏng' },
];

export const validateAdjustment = (
  item: InventoryBalance | undefined,
  movementType: AdjustmentType,
  quantity: string,
  notes: string,
) => {
  const amount = Number(quantity);
  const quantityValid = /^\d+(?:\.\d{1,3})?$/.test(quantity) &&
    Number.isFinite(amount) && amount >= 0.001 && amount <= 999_999_999.999;
  const quantityUnits = quantityValid ? Math.round(amount * 1000) : 0;
  const onHandUnits = item ? Math.round(item.quantityOnHand * 1000) : 0;
  const availableUnits = item ? Math.round(item.availableQuantity * 1000) : 0;
  const isDecrease = movementType !== 'ADJUSTMENT_IN';
  let quantityError = '';
  if (!quantityValid) quantityError = 'Nhập số lượng từ 0,001 đến 999.999.999,999, tối đa 3 chữ số thập phân.';
  else if (item && isDecrease && quantityUnits > availableUnits) quantityError = 'Số lượng vượt quá tồn kho khả dụng.';
  else if (item && !isDecrease && onHandUnits + quantityUnits > 999_999_999_999) quantityError = 'Tồn kho sau điều chỉnh vượt quá giới hạn.';
  const trimmedNotes = notes.trim();
  const notesError = !trimmedNotes ? 'Vui lòng nhập lý do điều chỉnh.' : trimmedNotes.length > 2000 ? 'Lý do không được vượt quá 2000 ký tự.' : '';
  const valid = Boolean(item) && !quantityError && !notesError;
  const delta = isDecrease ? -quantityUnits : quantityUnits;
  return {
    valid,
    quantityError,
    notesError,
    resultOnHand: item && quantityValid ? (onHandUnits + delta) / 1000 : null,
    resultAvailable: item && quantityValid ? (availableUnits + delta) / 1000 : null,
  };
};
