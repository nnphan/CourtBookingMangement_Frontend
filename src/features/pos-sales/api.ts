import { http } from '@/lib/axios';
import type {
  BranchProduct,
  CheckoutRequest,
  CustomerLookup,
  GoodsReceipt,
  InventoryBalance,
  InvoiceSnapshot,
  PagedResult,
  Product,
  ProductCategory,
  ProductCategoryDetail,
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

  async getCategories(isActive?: boolean) {
    const response = await http.get<SuccessEnvelope<ProductCategory[]>>('/product-categories', {
      params: isActive === undefined ? undefined : { isActive },
    });
    return dataOf(response);
  },

  async searchProducts() {
    const response = await http.get<SuccessEnvelope<Product[]>>('/products', {
      params: { page: 1, pageSize: 100, isActive: true },
    });
    return dataOf(response);
  },

  async searchCatalogProducts(params: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  } = {}) {
    const response = await http.get<SuccessEnvelope<Product[]>>('/products', {
      params: { page: 1, pageSize: 50, ...params },
    });
    return pagedOf(response);
  },

  async searchCustomers(keyword: string) {
    const response = await http.get<SuccessEnvelope<CustomerLookup[]>>('/customers', {
      params: { keyword, isActive: true, pageNumber: 1, pageSize: 8, sortBy: 'latest' },
    });
    return pagedOf(response);
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

  async updateCategory(
    categoryId: string,
    input: { code: string; name: string; description?: string; displayOrder: number; isActive: boolean },
  ) {
    const response = await http.put<SuccessEnvelope<ProductCategoryDetail>>(
      `/product-categories/${categoryId}`,
      input,
    );
    return dataOf(response);
  },

  async deactivateCategory(categoryId: string) {
    const response = await http.delete<SuccessEnvelope<unknown>>(`/product-categories/${categoryId}`);
    return dataOf(response);
  },

  async createProduct(input: {
    categoryId: string;
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    unit: string;
    defaultCostPrice?: number;
    defaultSellingPrice: number;
    trackInventory: boolean;
    isActive: boolean;
  }) {
    const response = await http.post<SuccessEnvelope<Product>>('/products', input);
    return dataOf(response);
  },

  async updateProduct(
    productId: string,
    input: {
      categoryId: string;
      sku: string;
      barcode?: string;
      name: string;
      description?: string;
      unit: string;
      defaultCostPrice?: number;
      defaultSellingPrice: number;
      trackInventory: boolean;
      isActive: boolean;
    },
  ) {
    const response = await http.put<SuccessEnvelope<Product>>(`/products/${productId}`, input);
    return dataOf(response);
  },

  async deactivateProduct(productId: string) {
    const response = await http.delete<SuccessEnvelope<unknown>>(`/products/${productId}`);
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

  async getInventory(
    branchId: string,
    params: { lowStockOnly?: boolean; page?: number; pageSize?: number } = {},
  ) {
    const response = await http.get<SuccessEnvelope<InventoryBalance[]>>(
      `/branches/${branchId}/inventory`,
      { params: { page: 1, pageSize: 100, ...params } },
    );
    return pagedOf(response);
  },

  async getMovements(
    branchId: string,
    params: {
      productId?: string;
      movementType?: string;
      from?: string;
      to?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ) {
    const response = await http.get<SuccessEnvelope<StockMovement[]>>(
      `/branches/${branchId}/inventory/movements`,
      { params: { page: 1, pageSize: 50, ...params } },
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

  async getReceipts(
    branchId: string,
    params: { status?: string; search?: string; page?: number; pageSize?: number } = {},
  ) {
    const response = await http.get<SuccessEnvelope<GoodsReceipt[]>>(
      `/branches/${branchId}/inventory/goods-receipts`,
      { params: { page: 1, pageSize: 50, ...params } },
    );
    return pagedOf(response);
  },

  async getReceipt(branchId: string, receiptId: string) {
    const response = await http.get<SuccessEnvelope<GoodsReceipt>>(
      `/branches/${branchId}/inventory/goods-receipts/${receiptId}`,
    );
    return dataOf(response);
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

  async updateReceipt(
    branchId: string,
    receiptId: string,
    input: {
      supplierName?: string;
      supplierReference?: string;
      notes?: string;
      items: Array<{ productId: string; quantity: number; unitCost: number }>;
    },
  ) {
    const response = await http.put<SuccessEnvelope<GoodsReceipt>>(
      `/branches/${branchId}/inventory/goods-receipts/${receiptId}`,
      input,
    );
    return dataOf(response);
  },

  async cancelReceipt(branchId: string, receiptId: string) {
    const response = await http.post<SuccessEnvelope<unknown>>(
      `/branches/${branchId}/inventory/goods-receipts/${receiptId}/cancel`,
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

  async searchOrders(
    branchId: string,
    params: { search?: string; status?: string; from?: string; to?: string; page?: number; pageSize?: number } = {},
  ) {
    const response = await http.get<SuccessEnvelope<SalesOrderListItem[]>>(
      `/branches/${branchId}/sales/orders`,
      { params: { page: 1, pageSize: 20, ...params } },
    );
    return pagedOf(response);
  },

  async getOrder(branchId: string, orderId: string) {
    const response = await http.get<SuccessEnvelope<SalesOrder>>(
      `/branches/${branchId}/sales/orders/${orderId}`,
    );
    return dataOf(response);
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

  async getInvoice(branchId: string, invoiceId: string) {
    const response = await http.get<SuccessEnvelope<InvoiceSnapshot>>(
      `/branches/${branchId}/sales/invoices/${invoiceId}`,
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
