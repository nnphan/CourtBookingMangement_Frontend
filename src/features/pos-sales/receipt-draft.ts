export interface ReceiptDraftLine {
  key: number;
  productId: string;
  quantity: string;
  unitCost: string;
}

export interface ReceiptDraft {
  supplierName: string;
  supplierReference: string;
  notes: string;
  items: ReceiptDraftLine[];
}

export interface ReceiptFieldErrors {
  header: Partial<Record<'supplierName' | 'supplierReference' | 'notes', string>>;
  lines: Record<number, Partial<Record<'productId' | 'quantity' | 'unitCost', string>>>;
}

export const mapReceiptFieldErrors = (
  fields: Record<string, string>,
  items: ReceiptDraftLine[],
): ReceiptFieldErrors => {
  const errors: ReceiptFieldErrors = { header: {}, lines: {} };
  for (const [field, message] of Object.entries(fields)) {
    const header = field.toLowerCase();
    if (header === 'suppliername') errors.header.supplierName = message;
    else if (header === 'supplierreference') errors.header.supplierReference = message;
    else if (header === 'notes') errors.header.notes = message;
    else {
      const match = /^items\[(\d+)\]\.(productid|quantity|unitcost)$/i.exec(field);
      if (!match) continue;
      const item = items[Number(match[1])];
      if (!item) continue;
      const property = match[2].toLowerCase();
      const line = errors.lines[item.key] ?? {};
      if (property === 'productid') line.productId = message;
      else if (property === 'quantity') line.quantity = message;
      else line.unitCost = message;
      errors.lines[item.key] = line;
    }
  }
  return errors;
};

export const emptyReceiptDraft = (): ReceiptDraft => ({
  supplierName: '',
  supplierReference: '',
  notes: '',
  items: [{ key: 0, productId: '', quantity: '', unitCost: '' }],
});

export const isReceiptDraftDirty = (draft: ReceiptDraft) =>
  Boolean(draft.supplierName || draft.supplierReference || draft.notes || draft.items.length !== 1 ||
    draft.items.some((item) => item.productId || item.quantity || item.unitCost));

const scaledNumber = (value: string, precision: number, max: bigint): bigint | null => {
  if (value.length > 20 || !new RegExp(`^\\d+(?:\\.\\d{1,${precision}})?$`).test(value)) return null;
  const [whole, fraction = ''] = value.split('.');
  const scaled = BigInt(whole) * (10n ** BigInt(precision)) + BigInt(fraction.padEnd(precision, '0'));
  return scaled <= max ? scaled : null;
};

export const validateReceiptDraft = (draft: ReceiptDraft, productIds: Set<string>) => {
  const counts = new Map<string, number>();
  for (const item of draft.items) {
    if (item.productId) counts.set(item.productId, (counts.get(item.productId) ?? 0) + 1);
  }
  let totalCents = 0n;
  const lines = draft.items.map((item) => {
    const quantity = scaledNumber(item.quantity, 3, 999_999_999_999n);
    const cost = scaledNumber(item.unitCost, 2, 999_999_999_999n);
    const productError = !item.productId || !productIds.has(item.productId)
      ? 'Vui lòng chọn sản phẩm của chi nhánh.'
      : (counts.get(item.productId) ?? 0) > 1 ? 'Sản phẩm đã có trong phiếu.' : '';
    const quantityError = quantity === null || quantity === 0n
      ? 'Nhập số lượng lớn hơn 0, tối đa 3 chữ số thập phân.' : '';
    const costError = cost === null
      ? 'Nhập giá vốn từ 0 đến 9.999.999.999,99, tối đa 2 chữ số thập phân.' : '';
    const lineCents = quantity !== null && quantity > 0n && cost !== null
      ? (quantity * cost + 500n) / 1000n : null;
    if (lineCents !== null) totalCents += lineCents;
    return { productError, quantityError, costError, lineCents };
  });
  const totalError = totalCents > 999_999_999_999n ? 'Tổng phiếu vượt quá giới hạn 9.999.999.999,99.' : '';
  return {
    lines,
    totalCents,
    totalError,
    valid: draft.items.length > 0 && draft.items.length <= 500 && !totalError &&
      draft.supplierName.trim().length <= 200 && draft.supplierReference.trim().length <= 100 &&
      draft.notes.trim().length <= 2000 &&
      lines.every((line) => !line.productError && !line.quantityError && !line.costError),
  };
};
