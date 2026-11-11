import type { PaginationMetadata } from '@/types/api';

export interface PagedResult<T> {
  items: T[];
  metadata: PaginationMetadata | null;
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  barcode: string | null;
  name: string;
  unit: string;
  defaultCostPrice: number | null;
  defaultSellingPrice: number;
  trackInventory: boolean;
  isActive: boolean;
}

export interface BranchProduct {
  productId: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  barcode: string | null;
  name: string;
  unit: string;
  trackInventory: boolean;
  sellingPrice: number;
  costPrice: number | null;
  isAvailableForSale: boolean;
  displayOrder: number;
}

export interface InventoryBalance {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string;
  unit: string;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
  reorderLevel: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  movementType: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  receiptCode: string;
  supplierName: string | null;
  supplierReference: string | null;
  status: string;
  totalCost: number;
  createdAt: string;
  items?: Array<{
    productId: string;
    sku: string;
    productName: string;
    unit: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
  }>;
}

export interface SalesOrderListItem {
  id: string;
  branchId: string;
  orderCode: string;
  customerName: string | null;
  status: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethodCode: string;
  paymentStatus: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  createdAt: string;
}

export interface SalesOrder extends SalesOrderListItem {
  customerId: string | null;
  bookingId: string | null;
  subtotalAmount: number;
  discountAmount: number;
  notes: string | null;
  completedAt: string | null;
  items: Array<{
    productId: string;
    sku: string;
    productName: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
}

export interface SalesReport {
  from: string;
  to: string;
  completedOrderCount: number;
  grossSales: number;
  refunds: number;
  netSales: number;
  dailySales: Array<{
    date: string;
    orderCount: number;
    grossSales: number;
    refunds: number;
  }>;
  topProducts: Array<{
    productId: string;
    sku: string;
    productName: string;
    quantitySold: number;
    grossSales: number;
  }>;
}

export interface CheckoutRequest {
  customerId?: string;
  bookingId?: string;
  paymentMethodCode: 'CASH' | 'MOMO' | 'BANK_TRANSFER';
  notes?: string;
  items: Array<{ productId: string; quantity: number }>;
}
