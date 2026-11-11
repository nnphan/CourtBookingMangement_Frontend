import { http } from '@/lib/axios';
import type {
  BranchProduct,
  CheckoutRequest,
  GoodsReceipt,
  InventoryBalance,
  PagedResult,
  Product,
  ProductCategory,
  SalesOrder,
  SalesOrderListItem,
  SalesReport,
  StockMovement,
} from './types';

interface SuccessEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  metadata?: PagedResult<unknown>['metadata'];
}

const dataOf = <T>(response: { data: SuccessEnvelope<T> }): T => {
  if (!response.data?.success) {
    throw new Error(response.data?.message || 'Yêu cầu không thành công.');
  }
  return response.data.data;
};

const pagedOf = <T>(response: { data: SuccessEnvelope<T[]> }): PagedResult<T> => ({
  items: dataOf(response),
  metadata: response.data.metadata ?? null,
});

export const posSalesApi = {
  async getBranchProducts(branchId: string, availableOnly = false) {
    const response = await http.get<SuccessEnvelope<BranchProduct[]>>(
      `/branches/${branchId}/products`,
      { params: availableOnly ? { isAvailableForSale: true } : undefined },
    );
    return dataOf(response);
  },

  async getCategories() {
    const response = await http.get<SuccessEnvelope<ProductCategory[]>>('/product-categories', {
      params: { isActive: true },
    });
    return dataOf(response);
  },

  async searchProducts() {
    const response = await http.get<SuccessEnvelope<Product[]>>('/products', {
      params: { page: 1, pageSize: 100, isActive: true },
    });
    return dataOf(response);
  },

  async createCategory(input: {
    code: string;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
  }) {
    const response = await http.post<SuccessEnvelope<ProductCategory>>('/product-categories', input);
    return dataOf(response);
  },

  async createProduct(input: {
    categoryId: string;
    sku: string;
    barcode?: string;
    name: string;
    unit: string;
    defaultCostPrice?: number;
    defaultSellingPrice: number;
    trackInventory: boolean;
    isActive: boolean;
  }) {
    const response = await http.post<SuccessEnvelope<Product>>('/products', input);
    return dataOf(response);
  },

  async configureBranchProduct(
    branchId: string,
    productId: string,
    input: {
      sellingPrice: number;
      costPrice?: number;
      isAvailableForSale: boolean;
      displayOrder: number;
    },
  ) {
    const response = await http.put<SuccessEnvelope<BranchProduct>>(
      `/branches/${branchId}/products/${productId}`,
      input,
    );
    return dataOf(response);
  },

  async getInventory(branchId: string, lowStockOnly = false) {
    const response = await http.get<SuccessEnvelope<InventoryBalance[]>>(
      `/branches/${branchId}/inventory`,
      { params: { page: 1, pageSize: 100, lowStockOnly } },
    );
    return pagedOf(response);
  },

  async getMovements(branchId: string) {
    const response = await http.get<SuccessEnvelope<StockMovement[]>>(
      `/branches/${branchId}/inventory/movements`,
      { params: { page: 1, pageSize: 50 } },
    );
    return pagedOf(response);
  },

  async adjustInventory(
    branchId: string,
    input: { productId: string; movementType: string; quantity: number; notes: string },
  ) {
    const response = await http.post<SuccessEnvelope<unknown>>(
      `/branches/${branchId}/inventory/adjustments`,
      input,
    );
    return dataOf(response);
  },

  async setReorderLevel(branchId: string, productId: string, reorderLevel: number) {
    const response = await http.put<SuccessEnvelope<unknown>>(
      `/branches/${branchId}/inventory/${productId}/reorder-level`,
      { reorderLevel },
    );
    return dataOf(response);
  },

  async getReceipts(branchId: string) {
    const response = await http.get<SuccessEnvelope<GoodsReceipt[]>>(
      `/branches/${branchId}/inventory/goods-receipts`,
      { params: { page: 1, pageSize: 50 } },
    );
    return pagedOf(response);
  },

  async createReceipt(
    branchId: string,
    input: {
      supplierName?: string;
      supplierReference?: string;
      notes?: string;
      items: Array<{ productId: string; quantity: number; unitCost: number }>;
    },
  ) {
    const response = await http.post<SuccessEnvelope<GoodsReceipt>>(
      `/branches/${branchId}/inventory/goods-receipts`,
      input,
    );
    return dataOf(response);
  },

  async postReceipt(branchId: string, receiptId: string) {
    const response = await http.post<SuccessEnvelope<unknown>>(
      `/branches/${branchId}/inventory/goods-receipts/${receiptId}/post`,
    );
    return dataOf(response);
  },

  async getOrders(branchId: string) {
    const response = await http.get<SuccessEnvelope<SalesOrderListItem[]>>(
      `/branches/${branchId}/sales/orders`,
      { params: { page: 1, pageSize: 50 } },
    );
    return pagedOf(response);
  },

  async checkout(branchId: string, input: CheckoutRequest) {
    const response = await http.post<SuccessEnvelope<SalesOrder>>(
      `/branches/${branchId}/sales/orders`,
      input,
    );
    return dataOf(response);
  },

  async cancelOrder(branchId: string, orderId: string, reason: string) {
    const response = await http.post<SuccessEnvelope<unknown>>(
      `/branches/${branchId}/sales/orders/${orderId}/cancel`,
      { reason },
    );
    return dataOf(response);
  },

  async getReport(branchId: string, from: string, to: string) {
    const response = await http.get<SuccessEnvelope<SalesReport>>(
      `/branches/${branchId}/sales/report`,
      { params: { from, to } },
    );
    return dataOf(response);
  },

  async getInvoicePdf(branchId: string, invoiceId: string, download = false) {
    const response = await http.get<Blob>(
      `/branches/${branchId}/sales/invoices/${invoiceId}/${download ? 'download' : 'preview'}`,
      { responseType: 'blob' },
    );
    return response.data;
  },
};
