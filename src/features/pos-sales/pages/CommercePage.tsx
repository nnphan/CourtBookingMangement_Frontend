import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router';
import {
  BarChart3,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Boxes,
  Check,
  CheckCircle2,
  CircleX,
  ClipboardList,
  Download,
  PackagePlus,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
  Tags,
  TriangleAlert,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { useAuthorization } from '@/features/auth/authorization';
import { PERMISSIONS as P } from '@/shared/constants/permissions';
import { paths } from '@/app/router/paths';
import { posSalesApi } from '../api';
import { PosWorkspaceHeader, PosWorkspaceTabs } from '../components/PosWorkspaceShell';
import type { BranchProduct, CheckoutRequest, CustomerLookup, InventoryBalance, SalesOrder } from '../types';
import {
  filterInventory, isValidReorderLevel, loadInventory, sortInventory, stockStatus, validateInventoryPage,
  type InventorySort, type InventorySortField, type StockStatus,
} from '../inventory-overview';
import {
  adjustmentTypes, emptyAdjustmentDraft, isAdjustmentDraftDirty, validateAdjustment,
  type AdjustmentDraft, type AdjustmentType,
} from '../inventory-adjustment';
import {
  emptyReceiptDraft, isReceiptDraftDirty, mapReceiptFieldErrors, validateReceiptDraft,
  type ReceiptDraft, type ReceiptDraftLine, type ReceiptFieldErrors,
} from '../receipt-draft';

type CommerceTab = 'pos' | 'catalog' | 'inventory' | 'orders';
const tabs: Array<{ id: CommerceTab; label: string; icon: typeof ShoppingCart }> = [
  { id: 'pos', label: 'Bán hàng', icon: ShoppingCart },
  { id: 'catalog', label: 'Sản phẩm', icon: Tags },
  { id: 'inventory', label: 'Kho', icon: Boxes },
  { id: 'orders', label: 'Đơn hàng & báo cáo', icon: BarChart3 },
];

const queryKeys = {
  products: (branchId: string) => ['pos-sales', 'products', branchId] as const,
  catalog: ['pos-sales', 'catalog'] as const,
  inventory: (branchId: string) => ['pos-sales', 'inventory', branchId] as const,
  movements: (branchId: string) => ['pos-sales', 'movements', branchId] as const,
  receipts: (branchId: string) => ['pos-sales', 'receipts', branchId] as const,
  orders: (branchId: string) => ['pos-sales', 'orders', branchId] as const,
  report: (branchId: string, from: string, to: string) =>
    ['pos-sales', 'report', branchId, from, to] as const,
};

const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
const currency = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});
const amount = (value: number) => currency.format(value);

const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
    return 'Bạn không có quyền truy cập dữ liệu hoặc chi nhánh này.';
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const message = error.message;
    if (typeof message === 'string') return message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

const notifyError = (error: unknown) => toast.error('Không thể hoàn tất', errorMessage(error));

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  step?: number;
}) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <input
      className={inputClass}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      min={min}
      step={step}
    />
  </label>
);

const SelectField = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
      {children}
    </select>
  </label>
);

const ErrorPanel = ({ error, retry }: { error: unknown; retry: () => void }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <span>{errorMessage(error)}</span>
    <Button size="sm" variant="outline" onClick={retry}>
      <RefreshCw className="size-4" />
      Thử lại
    </Button>
  </div>
);

const EmptyPanel = ({ children }: { children: string }) => (
  <p className="py-10 text-center text-sm text-slate-500">{children}</p>
);

const CommercePage = () => {
  const { hasPermission, hasAnyPermission } = useAuthorization();
  const availableTabs = tabs.filter((tab) =>
    tab.id === 'pos' ? hasPermission(P.SALES_VIEW) :
    tab.id === 'catalog' ? hasPermission(P.PRODUCT_VIEW) :
    tab.id === 'inventory' ? hasPermission(P.INVENTORY_VIEW) :
    hasAnyPermission([P.SALES_VIEW, P.SALES_REPORT_VIEW]));
  const [searchParams, setSearchParams] = useSearchParams();
  const [branchId, setBranchId] = useState(() => localStorage.getItem('pos-sales.branchId') ?? '');
  const [receiptDraft, setReceiptDraft] = useState<ReceiptDraft>(emptyReceiptDraft);
  const [receiptSaving, setReceiptSaving] = useState(false);
  const [adjustmentDraft, setAdjustmentDraft] = useState<AdjustmentDraft>(emptyAdjustmentDraft);
  const [adjustmentBusy, setAdjustmentBusy] = useState(false);
  const selectedTab = searchParams.get('tab');
  const activeTab: CommerceTab = availableTabs.some((tab) => tab.id === selectedTab)
    ? (selectedTab as CommerceTab)
    : availableTabs[0]?.id ?? 'pos';

  const handleBranchChange = (nextBranchId: string) => {
    if (nextBranchId === branchId || receiptSaving || adjustmentBusy) return;
    const unsavedReceipt = isReceiptDraftDirty(receiptDraft);
    const unsavedAdjustment = isAdjustmentDraftDirty(adjustmentDraft);
    if ((unsavedReceipt || unsavedAdjustment) && !window.confirm(
      `Bỏ ${unsavedReceipt && unsavedAdjustment ? 'phiếu nhập và điều chỉnh tồn kho' : unsavedReceipt ? 'phiếu nhập' : 'điều chỉnh tồn kho'} chưa lưu để đổi chi nhánh?`,
    )) return;
    setReceiptDraft(emptyReceiptDraft());
    setAdjustmentDraft(emptyAdjustmentDraft());
    setBranchId(nextBranchId);
    localStorage.setItem('pos-sales.branchId', nextBranchId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('inventorySearch');
      next.delete('inventoryCategory');
      next.delete('inventoryStatus');
      return next;
    }, { replace: true });
  };

  if (!availableTabs.length) {
    return (
      <Card><CardBody><p role="alert" className="py-8 text-center text-sm font-semibold text-red-700">Bạn không có quyền truy cập chức năng POS.</p></CardBody></Card>
    );
  }

  return (
    <div className="pos-workspace min-w-0 space-y-4 py-4 sm:py-5">
      <PosWorkspaceHeader
        title="POS & Kho hàng"
        description="Bán hàng, quản lý sản phẩm và theo dõi tồn kho theo chi nhánh."
        branchId={branchId}
        onBranchChange={handleBranchChange}
        branchDisabled={receiptSaving || adjustmentBusy}
      />

      <PosWorkspaceTabs
        ariaLabel="Chức năng POS"
        stretch
        tabs={availableTabs
          .map(({ id, label, icon }) => ({
            id,
            label,
            icon,
            to: id === 'pos' ? paths.posSales : `${paths.posSales}?tab=${id}`,
            active: activeTab === id,
            disabled: (adjustmentBusy || receiptSaving) && id !== activeTab,
          }))}
      />

      {!branchId ? (
        <Card>
          <CardBody>
            <EmptyPanel>Vui lòng chọn chi nhánh để bắt đầu.</EmptyPanel>
          </CardBody>
        </Card>
      ) : (
        <>
          {activeTab === 'pos' && <PosPanel key={branchId} branchId={branchId} />}
          {activeTab === 'catalog' && <CatalogPanel key={branchId} branchId={branchId} />}
          {activeTab === 'inventory' && <InventoryPanel key={branchId} branchId={branchId}
            canAdjust={hasPermission(P.INVENTORY_ADJUST)} canReceive={hasPermission(P.INVENTORY_RECEIVE)} canPost={hasPermission(P.INVENTORY_POST_RECEIPT)}
            receiptDraft={receiptDraft} setReceiptDraft={setReceiptDraft} receiptSaving={receiptSaving} setReceiptSaving={setReceiptSaving}
            adjustmentDraft={adjustmentDraft} setAdjustmentDraft={setAdjustmentDraft} adjustmentBusy={adjustmentBusy} setAdjustmentBusy={setAdjustmentBusy} />}
          {activeTab === 'orders' && <OrdersPanel key={branchId} branchId={branchId}
            canViewOrders={hasPermission(P.SALES_VIEW)} canCancel={hasPermission(P.SALES_CANCEL)} canViewReport={hasPermission(P.SALES_REPORT_VIEW)} />}
        </>
      )}
    </div>
  );
};

const PosPanel = ({ branchId }: { branchId: string }) => {
  const { hasPermission } = useAuthorization();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartProductSnapshots, setCartProductSnapshots] = useState<Record<string, BranchProduct>>({});
  const [paymentMethodCode, setPaymentMethodCode] = useState<CheckoutRequest['paymentMethodCode']>('CASH');
  const [customerSearch, setCustomerSearch] = useState('');
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookup | null>(null);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(-1);
  const [bookingId, setBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<SalesOrder | null>(null);
  const [completedOrderBranchId, setCompletedOrderBranchId] = useState<string | null>(null);
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setCart({});
    setCartProductSnapshots({});
    setCustomerSearch('');
    setDebouncedCustomerSearch('');
    setSelectedCustomer(null);
    setActiveCustomerIndex(-1);
    setBookingId('');
    setNotes('');
    setCompletedOrder(null);
    setCompletedOrderBranchId(null);
    setInvoicePreviewUrl(null);
  }, [branchId]);
  const productsQuery = useQuery({
    queryKey: queryKeys.products(branchId),
    queryFn: () => posSalesApi.getBranchProducts(branchId, true),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: () => posSalesApi.getCategories(true),
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory(branchId),
    queryFn: () => posSalesApi.getInventory(branchId),
  });
  const customerQuery = useQuery({
    queryKey: ['pos-sales', 'customer-search', debouncedCustomerSearch],
    queryFn: () => posSalesApi.searchCustomers(debouncedCustomerSearch),
    enabled: hasPermission(P.CUSTOMER_VIEW) && debouncedCustomerSearch.trim().length >= 2 && !selectedCustomer,
  });
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCustomerSearch(customerSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [customerSearch]);
  useEffect(() => () => {
    if (invoicePreviewUrl) URL.revokeObjectURL(invoicePreviewUrl);
  }, [invoicePreviewUrl]);
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const categories = categoriesQuery.data ?? [];
  const stockByProduct = useMemo(
    () => new Map((inventoryQuery.data?.items ?? []).map((item) => [item.productId, item])),
    [inventoryQuery.data],
  );
  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.sku} ${product.barcode ?? ''}`
        .toLowerCase()
        .includes(normalizedSearch);
      return matchesSearch && (!categoryId || product.categoryId === categoryId);
    });
  }, [products, search, categoryId]);
  const cartProducts: BranchProduct[] = Object.entries(cart).flatMap(([productId, quantity]) => {
    if (quantity <= 0) return [];
    const product = products.find((candidate) => candidate.productId === productId) ?? cartProductSnapshots[productId];
    return product ? [product] : [];
  });
  const customerOptions = customerQuery.data?.items ?? [];
  const estimatedTotal = cartProducts.reduce(
    (sum, product) => sum + product.sellingPrice * (cart[product.productId] ?? 0), 0,
  );
  const cartQuantity = cartProducts.reduce((sum, product) => sum + (cart[product.productId] ?? 0), 0);

  const checkoutMutation = useMutation({
    mutationFn: ({ orderBranchId, input }: { orderBranchId: string; input: CheckoutRequest }) =>
      posSalesApi.checkout(orderBranchId, input),
    onSuccess: (order, { orderBranchId }) => {
      if (orderBranchId === branchId) {
        setCart({});
        setCartProductSnapshots({});
        setCustomerSearch('');
        setSelectedCustomer(null);
        setBookingId('');
        setNotes('');
      }
      setCompletedOrder(order);
      setCompletedOrderBranchId(orderBranchId);
      setInvoicePreviewUrl(null);
      toast.success('Thanh toán thành công', `Mã đơn ${order.orderCode}`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products(orderBranchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(orderBranchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders(orderBranchId) });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'branch-products', orderBranchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'inventory', orderBranchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'movements', orderBranchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'orders', orderBranchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'report', orderBranchId] });
    },
    onError: (error, { orderBranchId }) => {
      const code =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : '';
      if (code === 'Sales.InsufficientStock' || code === 'Sales.ProductNotAvailable') {
        toast.error(
          'Số lượng tồn kho đã thay đổi',
          'Giỏ hàng vẫn được giữ nguyên. Tồn kho và danh sách sản phẩm đang được làm mới để bạn kiểm tra lại.',
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(orderBranchId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.products(orderBranchId) });
        return;
      }
      notifyError(error);
    },
  });

  const setQuantity = (product: BranchProduct, quantity: number) => {
    const stock = stockByProduct.get(product.productId);
    const max = product.trackInventory ? (stock?.availableQuantity ?? 0) : 999_999_999;
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[product.productId];
      else next[product.productId] = Math.min(quantity, max);
      return next;
    });
    setCartProductSnapshots((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[product.productId];
      else next[product.productId] = product;
      return next;
    });
  };

  const checkout = () => {
    if (cartProducts.length === 0) return;
    const booking = bookingId.trim();
    if (booking && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(booking)) {
      toast.error('Mã Booking không hợp lệ', 'Nhập UUID của booking thuộc chi nhánh này.');
      return;
    }
    checkoutMutation.mutate({
      orderBranchId: branchId,
      input: {
        customerId: selectedCustomer?.id,
        bookingId: booking || undefined,
        paymentMethodCode,
        notes: notes.trim() || undefined,
        items: cartProducts.map((product) => ({
          productId: product.productId,
          quantity: cart[product.productId] ?? 0,
        })),
      },
    });
  };
  const hasInsufficientTrackedStock = cartProducts.some((product) => {
    if (!product.trackInventory) return false;
    return (cart[product.productId] ?? 0) > (stockByProduct.get(product.productId)?.availableQuantity ?? 0);
  });
  const hasUnavailableCartProduct = cartProducts.some(
    (product) => !products.some((currentProduct) => currentProduct.productId === product.productId),
  );
  const selectCustomer = (customer: CustomerLookup) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.fullName);
    setDebouncedCustomerSearch('');
  };
  const clearCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setDebouncedCustomerSearch('');
  };

  const openInvoice = async (
    invoiceId: string,
    action: 'preview' | 'download' | 'print' = 'preview',
  ) => {
    const download = action === 'download';
    const popup = action === 'preview' || action === 'print' ? window.open('about:blank', '_blank') : null;
    if (popup) popup.opener = null;
    try {
      const blob = await posSalesApi.getInvoicePdf(completedOrderBranchId ?? branchId, invoiceId, download);
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `invoice-${invoiceId}.pdf`;
        anchor.click();
      } else if (popup) {
        if (action === 'print') {
          popup.onload = () => popup.print();
        }
        popup.location.href = url;
        if (action === 'preview') {
          setInvoicePreviewUrl(url);
        }
      } else {
        throw new Error('Trình duyệt đã chặn cửa sổ hóa đơn. Hãy cho phép cửa sổ bật lên rồi thử lại.');
      }
      if (action !== 'preview') window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      popup?.close();
      notifyError(error);
    }
  };

  if (productsQuery.isError || categoriesQuery.isError || inventoryQuery.isError) {
    const error = productsQuery.error ?? categoriesQuery.error ?? inventoryQuery.error;
    return (
      <ErrorPanel
        error={error}
        retry={() => {
          void productsQuery.refetch();
          void categoriesQuery.refetch();
          void inventoryQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.8fr)]">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Chọn sản phẩm</h2>
              <p className="text-sm text-slate-500">Giá bán và tồn kho được xác thực phía máy chủ.</p>
            </div>
            <label className="relative block w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                className={`${inputClass} pl-9`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm tên, SKU hoặc mã vạch"
                aria-label="Tìm sản phẩm"
                autoComplete="off"
              />
            </label>
          </div>
          <label className="block sm:max-w-xs">
            <span className={labelClass}>Danh mục</span>
            <select
              className={inputClass}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              aria-label="Lọc sản phẩm theo danh mục"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          {productsQuery.isLoading ? (
            <EmptyPanel>Đang tải sản phẩm...</EmptyPanel>
          ) : filteredProducts.length === 0 ? (
            <EmptyPanel>Không có sản phẩm đang bán tại chi nhánh này.</EmptyPanel>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const stock = stockByProduct.get(product.productId);
                const unavailable =
                  product.trackInventory &&
                  (inventoryQuery.isLoading || (stock?.availableQuantity ?? 0) <= 0);
                const lowStock =
                  product.trackInventory &&
                  stock !== undefined &&
                  stock.availableQuantity > 0 &&
                  stock.availableQuantity <= stock.reorderLevel;
                return (
                  <button
                    key={product.productId}
                    type="button"
                    disabled={unavailable || checkoutMutation.isPending}
                    onClick={() => setQuantity(product, (cart[product.productId] ?? 0) + 1)}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="block font-bold text-slate-900">{product.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {product.sku} · {product.categoryName}
                    </span>
                    <span className="mt-3 block font-extrabold text-emerald-800">
                      {amount(product.sellingPrice)}
                    </span>
                    <span className={`mt-1 block text-xs ${unavailable ? 'font-semibold text-red-700' : lowStock ? 'font-semibold text-amber-700' : 'text-slate-500'}`}>
                      {product.trackInventory
                        ? inventoryQuery.isLoading
                          ? 'Đang kiểm tra tồn kho...'
                          : unavailable
                          ? 'Hết hàng'
                          : `Còn ${stock?.availableQuantity ?? 0} ${product.unit}${lowStock ? ' · Sắp hết' : ''}`
                        : 'Không theo dõi tồn kho'}
                    </span>
                    {(cart[product.productId] ?? 0) > 0 && (
                      <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-900">
                        Trong giỏ: {cart[product.productId]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Giỏ hàng</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
              {cartProducts.length} mặt hàng · {cartQuantity} sản phẩm
            </span>
          </div>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {cartProducts.length === 0 ? (
              <EmptyPanel>Chọn sản phẩm để tạo đơn hàng.</EmptyPanel>
            ) : (
              cartProducts.map((product) => (
                <div key={product.productId} className="flex items-center gap-3 border-b pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-800">{product.name}</p>
                    <p className="text-xs text-slate-500">{amount(product.sellingPrice)} · {product.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-lg border"
                      disabled={checkoutMutation.isPending}
                      onClick={() => setQuantity(product, (cart[product.productId] ?? 0) - 1)}
                      aria-label={`Giảm số lượng ${product.name}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold">{cart[product.productId]}</span>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-lg border"
                      disabled={
                        checkoutMutation.isPending ||
                        (product.trackInventory &&
                          (cart[product.productId] ?? 0) >=
                            (stockByProduct.get(product.productId)?.availableQuantity ?? 0))
                      }
                      onClick={() => setQuantity(product, (cart[product.productId] ?? 0) + 1)}
                      aria-label={`Tăng số lượng ${product.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                      disabled={checkoutMutation.isPending}
                      onClick={() => setQuantity(product, 0)}
                      aria-label={`Xóa ${product.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Phương thức thanh toán"
              value={paymentMethodCode}
              onChange={(value) => setPaymentMethodCode(value as CheckoutRequest['paymentMethodCode'])}
            >
              <option value="CASH">Tiền mặt</option>
              <option value="MOMO">MoMo</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
            </SelectField>
            <div className="relative block sm:col-span-2">
              <label className="block">
                <span className={labelClass}>Khách hàng (không bắt buộc)</span>
                <input
                  className={inputClass}
                  role="combobox"
                  aria-label="Tìm khách hàng"
                  aria-autocomplete="list"
                  aria-expanded={
                    !selectedCustomer &&
                    customerSearch.trim() === debouncedCustomerSearch &&
                    debouncedCustomerSearch.length >= 2
                  }
                  aria-controls="pos-customer-results"
                  aria-activedescendant={
                    activeCustomerIndex >= 0 ? `pos-customer-option-${activeCustomerIndex}` : undefined
                  }
                  value={customerSearch}
                  onChange={(event) => {
                    setSelectedCustomer(null);
                    setActiveCustomerIndex(-1);
                    setCustomerSearch(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' && customerOptions.length > 0) {
                      event.preventDefault();
                      setActiveCustomerIndex((index) => Math.min(index + 1, customerOptions.length - 1));
                    } else if (event.key === 'ArrowUp' && customerOptions.length > 0) {
                      event.preventDefault();
                      setActiveCustomerIndex((index) => Math.max(index - 1, 0));
                    } else if (event.key === 'Enter' && activeCustomerIndex >= 0) {
                      event.preventDefault();
                      const customer = customerOptions[activeCustomerIndex];
                      if (customer) selectCustomer(customer);
                    } else if (event.key === 'Escape') {
                      setActiveCustomerIndex(-1);
                      setDebouncedCustomerSearch('');
                    }
                  }}
                  placeholder="Tìm theo tên hoặc số điện thoại"
                  autoComplete="off"
                  disabled={checkoutMutation.isPending}
                />
              </label>
              {selectedCustomer && (
                <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <span>Đã chọn: {selectedCustomer.fullName} · {selectedCustomer.phoneNumber}</span>
                  <button type="button" className="font-bold underline" onClick={clearCustomer} disabled={checkoutMutation.isPending}>Bỏ chọn</button>
                </div>
              )}
              {!selectedCustomer &&
                customerSearch.trim() === debouncedCustomerSearch &&
                debouncedCustomerSearch.length >= 2 && (
                <ul id="pos-customer-results" role="listbox" className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {customerQuery.isLoading ? <li role="status" className="p-3 text-sm text-slate-500">Đang tìm khách hàng...</li>
                    : customerQuery.isError ? <li className="p-3"><ErrorPanel error={customerQuery.error} retry={() => void customerQuery.refetch()} /></li>
                      : customerOptions.length ? customerOptions.map((customer, index) => (
                        <li
                          key={customer.id}
                          id={`pos-customer-option-${index}`}
                          role="option"
                          aria-selected={activeCustomerIndex === index}
                          className={`cursor-pointer px-3 py-2 text-sm hover:bg-emerald-50 ${activeCustomerIndex === index ? 'bg-emerald-50' : ''}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveCustomerIndex(index)}
                          onClick={() => selectCustomer(customer)}
                        >
                          <span className="block font-semibold text-slate-800">{customer.fullName}</span>
                          <span className="block text-xs text-slate-500">{customer.phoneNumber}{customer.membershipLevelName ? ` · ${customer.membershipLevelName}` : ''}{customer.isGuest ? ' · Khách vãng lai' : ''}</span>
                        </li>
                      )) : <li className="p-3 text-sm text-slate-500">Không tìm thấy khách hàng.</li>}
                </ul>
              )}
            </div>
            <label className="block">
              <span className={labelClass}>Mã Booking (không bắt buộc)</span>
              <input
                className={inputClass}
                value={bookingId}
                onChange={(event) => setBookingId(event.target.value.trim())}
                placeholder="UUID booking cùng chi nhánh"
                pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}"
                title="Nhập mã UUID của booking thuộc chi nhánh này."
                disabled={checkoutMutation.isPending}
              />
              <span className="mt-1 block text-xs text-slate-500">
                Máy chủ xác nhận booking thuộc chi nhánh và khách hàng đã chọn.
              </span>
            </label>
            <Field label="Ghi chú" value={notes} onChange={setNotes} />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold text-slate-600">Tạm tính (máy chủ xác nhận giá cuối)</span>
            <span className="text-xl font-black text-slate-950">{amount(estimatedTotal)}</span>
          </div>
          {(hasInsufficientTrackedStock || hasUnavailableCartProduct) && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {hasUnavailableCartProduct
                ? 'Một sản phẩm trong giỏ không còn được bán tại chi nhánh này. Hãy xóa sản phẩm đó trước khi thanh toán.'
                : 'Số lượng trong giỏ đang cao hơn tồn kho khả dụng mới nhất. Hãy giảm số lượng trước khi thanh toán.'}
            </p>
          )}
          {hasPermission(P.SALES_CREATE) && <Button
            block
            onClick={checkout}
            loading={checkoutMutation.isPending}
            disabled={
              cartProducts.length === 0 ||
              checkoutMutation.isPending ||
              hasInsufficientTrackedStock ||
              hasUnavailableCartProduct ||
              productsQuery.isLoading ||
              inventoryQuery.isLoading
            }
          >
            <Check className="size-5" />
            Thanh toán
          </Button>}
          {completedOrder && (
            <div className="flex flex-wrap gap-2 rounded-xl bg-emerald-50 p-3">
              <div className="w-full text-sm text-emerald-950" role="status" aria-live="polite">
                <p className="font-bold">
                  Thanh toán hoàn tất · {completedOrder.orderCode}
                  {completedOrderBranchId !== branchId && ` · Chi nhánh ${completedOrderBranchId}`}
                </p>
                <p className="mt-1">Tổng tiền do máy chủ xác nhận: <strong>{amount(completedOrder.totalAmount)}</strong></p>
                <p>Đã thanh toán: {amount(completedOrder.paidAmount)} · {completedOrder.paymentMethodCode}</p>
              </div>
              {completedOrder.invoiceId ? (
                <>
                  {hasPermission(P.SALES_INVOICE_VIEW) && <Button size="sm" variant="outline" onClick={() => void openInvoice(completedOrder.invoiceId!, 'preview')}>
                    <Printer className="size-4" /> Xem hóa đơn
                  </Button>}
                  {hasPermission(P.SALES_INVOICE_PRINT) && <Button size="sm" variant="outline" onClick={() => void openInvoice(completedOrder.invoiceId!, 'download')}>
                    <Download className="size-4" /> Tải PDF
                  </Button>}
                  {hasPermission(P.SALES_INVOICE_PRINT) && <Button size="sm" onClick={() => void openInvoice(completedOrder.invoiceId!, 'print')}>
                    <Printer className="size-4" /> In hóa đơn
                  </Button>}
                </>
              ) : <p className="text-sm text-amber-800">Đơn hàng đã hoàn tất nhưng chưa có mã hóa đơn để in.</p>}
            </div>
          )}
          {invoicePreviewUrl && (
            <section aria-label="Xem trước PDF hóa đơn" className="space-y-2">
              <h3 className="font-bold text-slate-800">Xem trước hóa đơn</h3>
              <iframe title="Xem trước PDF hóa đơn" src={invoicePreviewUrl} className="h-[55vh] min-h-80 w-full rounded-lg border border-slate-200" />
            </section>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const CatalogPanel = ({ branchId }: { branchId: string }) => {
  const { hasPermission } = useAuthorization();
  const categoriesQuery = useQuery({
    queryKey: queryKeys.catalog,
    queryFn: () => posSalesApi.getCategories(),
  });
  const productsQuery = useQuery({
    queryKey: [...queryKeys.catalog, 'products'],
    queryFn: () => posSalesApi.searchProducts(),
  });
  const branchProductsQuery = useQuery({
    queryKey: queryKeys.products(branchId),
    queryFn: () => posSalesApi.getBranchProducts(branchId),
  });
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('cái');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [isAvailableForSale, setAvailable] = useState(true);

  const invalidateCatalog = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalog });
    void queryClient.invalidateQueries({ queryKey: queryKeys.products(branchId) });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'categories'] });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'catalog-products'] });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'branch-products', branchId] });
  };
  const createCategory = useMutation({
    mutationFn: () =>
      posSalesApi.createCategory({
        code: categoryCode,
        name: categoryName,
        displayOrder: 0,
        isActive: true,
      }),
    onSuccess: () => {
      setCategoryCode('');
      setCategoryName('');
      toast.success('Đã tạo danh mục.');
      invalidateCatalog();
    },
    onError: notifyError,
  });
  const createProduct = useMutation({
    mutationFn: () =>
      posSalesApi.createProduct({
        categoryId,
        sku,
        name,
        unit,
        defaultSellingPrice: Number(defaultPrice),
        trackInventory: true,
        isActive: true,
      }),
    onSuccess: (product) => {
      setSku('');
      setName('');
      setDefaultPrice('');
      setSelectedProductId(product.id);
      setSellingPrice(String(product.defaultSellingPrice));
      toast.success('Đã tạo sản phẩm trong danh mục dùng chung.');
      invalidateCatalog();
    },
    onError: notifyError,
  });
  const configureProduct = useMutation({
    mutationFn: () =>
      posSalesApi.configureBranchProduct(branchId, selectedProductId, {
        sellingPrice: Number(sellingPrice),
        costPrice: costPrice ? Number(costPrice) : undefined,
        isAvailableForSale,
        displayOrder: 0,
      }),
    onSuccess: () => {
      toast.success('Đã cập nhật giá và trạng thái bán tại chi nhánh.');
      invalidateCatalog();
    },
    onError: notifyError,
  });
  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const configuredIds = new Set((branchProductsQuery.data ?? []).map((product) => product.productId));
  const selectedBranchProduct = (branchProductsQuery.data ?? []).find(
    (product) => product.productId === selectedProductId,
  );

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    createCategory.mutate();
  };
  const submitProduct = (event: FormEvent) => {
    event.preventDefault();
    createProduct.mutate();
  };
  const submitConfiguration = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProductId) return;
    configureProduct.mutate();
  };

  if (categoriesQuery.isError || productsQuery.isError || branchProductsQuery.isError) {
    const failure =
      categoriesQuery.error ?? productsQuery.error ?? branchProductsQuery.error ?? new Error();
    return (
      <ErrorPanel
        error={failure}
        retry={() => {
          void categoriesQuery.refetch();
          void productsQuery.refetch();
          void branchProductsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardBody>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Tags className="size-5 text-emerald-700" /> Danh mục sản phẩm
          </h2>
          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700"
              >
                {category.name}
              </span>
            ))}
            {categories.length === 0 && <span className="text-sm text-slate-500">Chưa có danh mục.</span>}
          </div>
          {hasPermission(P.PRODUCT_CREATE) && <form onSubmit={submitCategory} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <Field label="Mã danh mục" value={categoryCode} onChange={setCategoryCode} required />
            <Field label="Tên danh mục" value={categoryName} onChange={setCategoryName} required />
            <Button className="self-end" size="md" loading={createCategory.isPending}>
              <Plus className="size-4" /> Thêm
            </Button>
          </form>}
        </CardBody>
      </Card>

      {hasPermission(P.PRODUCT_CREATE) && <Card>
        <CardBody>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <PackagePlus className="size-5 text-emerald-700" /> Tạo sản phẩm
          </h2>
          <form onSubmit={submitProduct} className="grid gap-3 sm:grid-cols-2">
            <SelectField label="Danh mục" value={categoryId} onChange={setCategoryId}>
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <Field label="SKU" value={sku} onChange={setSku} required />
            <Field label="Tên sản phẩm" value={name} onChange={setName} required />
            <Field label="Đơn vị" value={unit} onChange={setUnit} required />
            <Field
              label="Giá bán mặc định (VND)"
              value={defaultPrice}
              onChange={setDefaultPrice}
              type="number"
              min={0}
              step={1000}
              required
            />
            <Button className="self-end" loading={createProduct.isPending} disabled={!categoryId}>
              <Plus className="size-4" /> Tạo sản phẩm
            </Button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            Sản phẩm được tạo trong catalog chung; cần cấu hình giá và bật bán riêng cho chi nhánh.
          </p>
        </CardBody>
      </Card>}

      {hasPermission(P.PRODUCT_UPDATE) && <Card className="lg:col-span-2">
        <CardBody>
          <h2 className="mb-1 text-lg font-extrabold">Cấu hình sản phẩm tại chi nhánh</h2>
          <p className="mb-4 text-sm text-slate-500">
            {selectedBranchProduct ? 'Đang chỉnh sửa cấu hình hiện tại.' : 'Đang thêm sản phẩm vào chi nhánh.'}
          </p>
          <form onSubmit={submitConfiguration} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SelectField
              label="Sản phẩm catalog"
              value={selectedProductId}
              onChange={(value) => {
                setSelectedProductId(value);
                const product = products.find((item) => item.id === value);
                const branchProduct = (branchProductsQuery.data ?? []).find(
                  (item) => item.productId === value,
                );
                setSellingPrice(
                  String(branchProduct?.sellingPrice ?? product?.defaultSellingPrice ?? ''),
                );
                setCostPrice(
                  branchProduct?.costPrice == null
                    ? product?.defaultCostPrice == null
                      ? ''
                      : String(product.defaultCostPrice)
                    : String(branchProduct.costPrice),
                );
                setAvailable(branchProduct?.isAvailableForSale ?? true);
              }}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} · {product.name}
                  {configuredIds.has(product.id) ? ' (đã cấu hình)' : ''}
                </option>
              ))}
            </SelectField>
            <Field
              label="Giá bán tại chi nhánh (VND)"
              value={sellingPrice}
              onChange={setSellingPrice}
              type="number"
              min={0}
              step={1000}
              required
            />
            <Field
              label="Giá vốn (không bắt buộc)"
              value={costPrice}
              onChange={setCostPrice}
              type="number"
              min={0}
              step={1000}
            />
            <div className="flex items-end gap-3">
              <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border px-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isAvailableForSale}
                  onChange={(event) => setAvailable(event.target.checked)}
                  className="size-4 accent-emerald-700"
                />
                Cho phép bán
              </label>
              <Button size="md" loading={configureProduct.isPending} disabled={!selectedProductId}>
                Lưu
              </Button>
            </div>
          </form>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Sản phẩm</th>
                  <th>Danh mục</th>
                  <th className="text-right">Giá bán</th>
                  <th className="text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(branchProductsQuery.data ?? []).map((product) => (
                  <tr key={product.productId}>
                    <td className="py-3 font-semibold">{product.sku} · {product.name}</td>
                    <td>{product.categoryName}</td>
                    <td className="text-right">{amount(product.sellingPrice)}</td>
                    <td className="text-center">
                      {product.isAvailableForSale ? 'Đang bán' : 'Ngừng bán'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {branchProductsQuery.data?.length === 0 && (
              <EmptyPanel>Chi nhánh chưa cấu hình sản phẩm.</EmptyPanel>
            )}
          </div>
        </CardBody>
      </Card>}
    </div>
  );
};

const InventoryAdjustmentForm = ({
  branchId,
  balances,
  draft,
  setDraft,
  busy,
  setBusy,
  invalidateInventory,
  refreshInventory,
}: {
  branchId: string;
  balances: InventoryBalance[];
  draft: AdjustmentDraft;
  setDraft: React.Dispatch<React.SetStateAction<AdjustmentDraft>>;
  busy: boolean;
  setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  invalidateInventory: () => void;
  refreshInventory: () => Promise<InventoryBalance[]>;
}) => {
  const { productSearch, productId, movementType, quantity, notes } = draft;
  const [submitError, setSubmitError] = useState('');
  const [conflictNotice, setConflictNotice] = useState('');
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDecrease, setConfirmDecrease] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'productId' | 'movementType' | 'quantity' | 'notes', string>>>({});
  const submitting = useRef(false);
  const selected = balances.find((item) => item.productId === productId);
  const matchingProducts = filterInventory(balances, productSearch, '', 'all');
  const options = selected && !matchingProducts.some((item) => item.productId === selected.productId)
    ? [selected, ...matchingProducts] : matchingProducts;
  const validation = validateAdjustment(selected, movementType, quantity, notes);
  const formatQuantity = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 3 });
  const updateDraft = <K extends keyof AdjustmentDraft>(key: K, value: AdjustmentDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      if (key === 'productId') delete next.productId;
      if (key === 'movementType') delete next.movementType;
      if (key === 'quantity') delete next.quantity;
      if (key === 'notes') delete next.notes;
      return next;
    });
  };

  const refreshAfterConflict = async (conflictedProductId: string) => {
    setRefreshing(true);
    try {
      const freshBalances = await refreshInventory();
      const freshItem = freshBalances.find((item) => item.productId === conflictedProductId);
      setConflictNotice(freshItem
        ? `Tồn kho khả dụng mới nhất: ${formatQuantity(freshItem.availableQuantity)} ${freshItem.unit}. Vui lòng kiểm tra lại số lượng.`
        : 'Sản phẩm không còn trong tồn kho chi nhánh. Vui lòng chọn sản phẩm khác.');
      setNeedsRefresh(false);
    } catch (error) {
      setConflictNotice(`Không thể tải tồn kho mới nhất: ${errorMessage(error)} Hãy thử làm mới trước khi gửi lại.`);
      setNeedsRefresh(true);
    } finally {
      setRefreshing(false);
    }
  };

  const adjustmentMutation = useMutation({
    mutationFn: (input: { productId: string; movementType: AdjustmentType; quantity: number; notes: string }) =>
      posSalesApi.adjustInventory(branchId, input),
    onSuccess: () => {
      setDraft(emptyAdjustmentDraft());
      setSubmitError('');
      setFieldErrors({});
      setConflictNotice('');
      setNeedsRefresh(false);
      toast.success('Đã ghi nhận điều chỉnh tồn kho.');
      invalidateInventory();
    },
    onError: async (error, input) => {
      setSubmitError(errorMessage(error));
      if (error && typeof error === 'object' && 'fields' in error && error.fields &&
          typeof error.fields === 'object') {
        const mapped: typeof fieldErrors = {};
        for (const [key, value] of Object.entries(error.fields)) {
          if (typeof value !== 'string') continue;
          const field = key.toLowerCase();
          if (field === 'productid') mapped.productId = value;
          else if (field === 'movementtype') mapped.movementType = value;
          else if (field === 'quantity') mapped.quantity = value;
          else if (field === 'notes') mapped.notes = value;
        }
        setFieldErrors(mapped);
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'Inventory.InsufficientStock') {
        setNeedsRefresh(true);
        await refreshAfterConflict(input.productId);
      }
    },
    onSettled: () => { submitting.current = false; setBusy(false); },
  });

  const submitAdjustment = () => {
    if (!selected || !validation.valid || Object.keys(fieldErrors).length || needsRefresh ||
        refreshing || busy || adjustmentMutation.isPending || submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setConfirmDecrease(false);
    setSubmitError('');
    setConflictNotice('');
    adjustmentMutation.mutate({ productId, movementType, quantity: Number(quantity), notes: notes.trim() });
  };

  return (
    <>
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!selected || !validation.valid || Object.keys(fieldErrors).length || needsRefresh ||
            refreshing || busy || adjustmentMutation.isPending || submitting.current) return;
        if (movementType !== 'ADJUSTMENT_IN') setConfirmDecrease(true);
        else submitAdjustment();
      }}
    >
      <fieldset disabled={busy || refreshing} className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Tìm sản phẩm</span>
          <input className={inputClass} value={productSearch} onChange={(event) => updateDraft('productSearch', event.target.value)} placeholder="Tên, SKU hoặc mã vạch" />
        </label>
        <label className="block">
          <span className={labelClass}>Sản phẩm</span>
          <select className={inputClass} value={productId} onChange={(event) => updateDraft('productId', event.target.value)} required
            aria-invalid={Boolean(fieldErrors.productId)} aria-describedby={fieldErrors.productId ? 'adjustment-product-error' : undefined}>
            <option value="">Chọn sản phẩm</option>
            {options.map((item) => <option key={item.productId} value={item.productId}>{item.sku} · {item.productName}</option>)}
          </select>
          {fieldErrors.productId && <span id="adjustment-product-error" className="mt-1 block text-sm text-red-700">{fieldErrors.productId}</span>}
        </label>
        <label className="block">
          <span className={labelClass}>Loại điều chỉnh</span>
          <select className={inputClass} value={movementType} onChange={(event) => {
            const option = adjustmentTypes.find((type) => type.value === event.target.value);
            if (option) updateDraft('movementType', option.value);
          }} aria-invalid={Boolean(fieldErrors.movementType)}
            aria-describedby={fieldErrors.movementType ? 'adjustment-type-error' : undefined}>
            {adjustmentTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          {fieldErrors.movementType && <span id="adjustment-type-error" className="mt-1 block text-sm text-red-700">{fieldErrors.movementType}</span>}
        </label>
        <label className="block">
          <span className={labelClass}>Số lượng{selected ? ` (${selected.unit})` : ''}</span>
          <input className={inputClass} type="number" min={0.001} max={999999999.999} step={0.001} required value={quantity}
            onChange={(event) => updateDraft('quantity', event.target.value)}
            aria-invalid={Boolean(fieldErrors.quantity || (quantity && validation.quantityError))}
            aria-describedby={fieldErrors.quantity || (quantity && validation.quantityError) ? 'adjustment-quantity-error' : undefined} />
          {(fieldErrors.quantity || (quantity && validation.quantityError)) && <span id="adjustment-quantity-error" className="mt-1 block text-sm text-red-700">{fieldErrors.quantity || validation.quantityError}</span>}
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Lý do / ghi chú</span>
          <input className={inputClass} value={notes} onChange={(event) => updateDraft('notes', event.target.value)} maxLength={2000} required
            aria-invalid={Boolean(fieldErrors.notes || (notes && validation.notesError))}
            aria-describedby={fieldErrors.notes || (notes && validation.notesError) ? 'adjustment-notes-error' : undefined} />
          {(fieldErrors.notes || (notes && validation.notesError)) && <span id="adjustment-notes-error" className="mt-1 block text-sm text-red-700">{fieldErrors.notes || validation.notesError}</span>}
        </label>
        {selected && <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700 sm:col-span-2">
          <p>Hiện có: <strong>{formatQuantity(selected.quantityOnHand)} {selected.unit}</strong> · Khả dụng: <strong>{formatQuantity(selected.availableQuantity)} {selected.unit}</strong></p>
          {!validation.quantityError && validation.resultOnHand !== null && validation.resultAvailable !== null && (
            <p className="mt-1">Dự kiến sau điều chỉnh: <strong>{formatQuantity(validation.resultOnHand)} {selected.unit}</strong> · Khả dụng: <strong>{formatQuantity(validation.resultAvailable)} {selected.unit}</strong></p>
          )}
          <p className="mt-1 text-slate-500">Tồn kho sẽ được máy chủ kiểm tra khi ghi nhận.</p>
        </div>}
        {submitError && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{submitError}</p>}
        {conflictNotice && <p role="status" className="text-sm text-amber-800 sm:col-span-2">{conflictNotice}</p>}
        {needsRefresh && <Button type="button" variant="outline" size="sm" className="sm:col-span-2" onClick={() => void refreshAfterConflict(productId)}>
          <RefreshCw aria-hidden="true" className="size-4" /> Làm mới tồn kho
        </Button>}
        <Button type="submit" className="sm:col-span-2" loading={busy || refreshing} disabled={!validation.valid || needsRefresh || Object.keys(fieldErrors).length > 0}>
          {busy ? 'Đang ghi nhận...' : refreshing ? 'Đang tải tồn kho...' : 'Ghi nhận điều chỉnh'}
        </Button>
      </fieldset>
    </form>
    <Dialog open={confirmDecrease} onOpenChange={setConfirmDecrease}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto [&>button:last-child]:right-1 [&>button:last-child]:top-1 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center">
        <DialogHeader className="pr-10">
          <DialogTitle>Xác nhận giảm tồn kho</DialogTitle>
          <DialogDescription>
            {selected && `Giảm ${formatQuantity(Number(quantity))} ${selected.unit} của ${selected.productName}. Vui lòng kiểm tra trước khi ghi nhận.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmDecrease(false)}>Hủy</Button>
          <Button type="button" onClick={submitAdjustment}>Xác nhận điều chỉnh</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

const ReceiptDraftForm = ({
  draft,
  setDraft,
  balances,
  busy,
  saving,
  error,
  fieldErrors,
  setFieldErrors,
  onSave,
}: {
  draft: ReceiptDraft;
  setDraft: React.Dispatch<React.SetStateAction<ReceiptDraft>>;
  balances: InventoryBalance[];
  busy: boolean;
  saving: boolean;
  error: string;
  fieldErrors: ReceiptFieldErrors;
  setFieldErrors: React.Dispatch<React.SetStateAction<ReceiptFieldErrors>>;
  onSave: () => void;
}) => {
  const validation = validateReceiptDraft(draft, new Set(balances.map((item) => item.productId)));
  const productInputs = useRef(new Map<number, HTMLSelectElement>());
  const focusLine = useRef<number | null>(null);
  const nextLineKey = useRef(Math.max(-1, ...draft.items.map((item) => item.key)) + 1);
  useEffect(() => {
    if (focusLine.current !== null) {
      productInputs.current.get(focusLine.current)?.focus();
      focusLine.current = null;
    }
  }, [draft.items]);
  const updateHeader = (key: 'supplierName' | 'supplierReference' | 'notes', value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const header = { ...current.header };
      delete header[key];
      return { ...current, header };
    });
  };
  const updateLine = (key: number, patch: Partial<ReceiptDraftLine>) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item) => item.key === key ? { ...item, ...patch } : item),
    }));
    setFieldErrors((current) => {
      const line = { ...current.lines[key] };
      if ('productId' in patch) delete line.productId;
      if ('quantity' in patch) delete line.quantity;
      if ('unitCost' in patch) delete line.unitCost;
      return { ...current, lines: { ...current.lines, [key]: line } };
    });
  };
  const displayCents = (cents: bigint) => new Intl.NumberFormat('vi-VN', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 2,
  }).format(Number(cents) / 100);
  const allAmountsValid = validation.lines.every((line) => line.lineCents !== null);

  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      if (validation.valid && !busy) onSave();
    }}>
      <fieldset disabled={busy} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Nhà cung cấp</span>
            <input className={inputClass} value={draft.supplierName} maxLength={200}
              aria-invalid={Boolean(fieldErrors.header.supplierName)}
              aria-describedby={fieldErrors.header.supplierName ? 'receipt-supplier-error' : undefined}
              onChange={(event) => updateHeader('supplierName', event.target.value)} />
            {fieldErrors.header.supplierName && <span id="receipt-supplier-error" className="mt-1 block text-sm text-red-700">{fieldErrors.header.supplierName}</span>}
          </label>
          <label className="block">
            <span className={labelClass}>Số hóa đơn / tham chiếu</span>
            <input className={inputClass} value={draft.supplierReference} maxLength={100}
              aria-invalid={Boolean(fieldErrors.header.supplierReference)}
              aria-describedby={fieldErrors.header.supplierReference ? 'receipt-reference-error' : undefined}
              onChange={(event) => updateHeader('supplierReference', event.target.value)} />
            {fieldErrors.header.supplierReference && <span id="receipt-reference-error" className="mt-1 block text-sm text-red-700">{fieldErrors.header.supplierReference}</span>}
          </label>
          <label className="block sm:col-span-2">
            <span className={labelClass}>Ghi chú</span>
            <input className={inputClass} value={draft.notes} maxLength={2000}
              aria-invalid={Boolean(fieldErrors.header.notes)}
              aria-describedby={fieldErrors.header.notes ? 'receipt-notes-error' : undefined}
              onChange={(event) => updateHeader('notes', event.target.value)} />
            {fieldErrors.header.notes && <span id="receipt-notes-error" className="mt-1 block text-sm text-red-700">{fieldErrors.header.notes}</span>}
          </label>
          <p className="text-sm text-slate-500 sm:col-span-2">Ngày tạo được ghi tự động khi lưu phiếu.</p>
        </div>
        <div className="@container max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {draft.items.map((item, index) => {
            const line = validation.lines[index];
            const active = Boolean(item.productId || item.quantity || item.unitCost);
            const productError = fieldErrors.lines[item.key]?.productId || (active ? line.productError : '');
            const quantityError = fieldErrors.lines[item.key]?.quantity || (active ? line.quantityError : '');
            const costError = fieldErrors.lines[item.key]?.unitCost || (active ? line.costError : '');
            return (
              <div key={item.key} className="grid min-w-0 gap-3 rounded-xl border border-slate-200 p-3 @sm:grid-cols-2 @[700px]:grid-cols-[minmax(220px,2fr)_minmax(110px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_44px] @[700px]:items-start">
                <label className="block min-w-0">
                  <span className={labelClass}>Sản phẩm {index + 1}</span>
                  <select className={inputClass} value={item.productId} required ref={(element) => {
                    if (element) productInputs.current.set(item.key, element);
                    else productInputs.current.delete(item.key);
                  }}
                    onChange={(event) => updateLine(item.key, { productId: event.target.value })}
                    aria-invalid={Boolean(productError)}
                    aria-describedby={productError ? `receipt-product-error-${item.key}` : undefined}>
                    <option value="">Chọn sản phẩm</option>
                    {balances.map((balance) => <option key={balance.productId} value={balance.productId}>{balance.sku} · {balance.productName}</option>)}
                  </select>
                  {productError && <span id={`receipt-product-error-${item.key}`} className="mt-1 block text-sm text-red-700">{productError}</span>}
                </label>
                <label className="block min-w-0">
                  <span className={labelClass}>Số lượng</span>
                  <input className={inputClass} type="number" min={0.001} max={999999999.999} step={0.001} required value={item.quantity}
                    onChange={(event) => updateLine(item.key, { quantity: event.target.value })}
                    aria-invalid={Boolean(quantityError)}
                    aria-describedby={quantityError ? `receipt-quantity-error-${item.key}` : undefined} />
                  {quantityError && <span id={`receipt-quantity-error-${item.key}`} className="mt-1 block text-sm text-red-700">{quantityError}</span>}
                </label>
                <label className="block min-w-0">
                  <span className={`${labelClass} whitespace-nowrap`}>Giá vốn / đơn vị</span>
                  <input className={inputClass} type="number" min={0} max={9999999999.99} step={0.01} required value={item.unitCost}
                    onChange={(event) => updateLine(item.key, { unitCost: event.target.value })}
                    aria-invalid={Boolean(costError)}
                    aria-describedby={costError ? `receipt-cost-error-${item.key}` : undefined} />
                  {costError && <span id={`receipt-cost-error-${item.key}`} className="mt-1 block text-sm text-red-700">{costError}</span>}
                </label>
                <div className="min-w-0">
                  <span className={labelClass}>Thành tiền dự kiến</span>
                  <p className="flex min-h-11 items-center text-sm font-bold text-slate-900">
                    {line.lineCents === null ? '—' : line.lineCents > 999_999_999_999n ? 'Vượt giới hạn' : displayCents(line.lineCents)}
                  </p>
                </div>
                <button type="button" className="grid size-11 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40 @[760px]:mt-7"
                  aria-label={`Xóa sản phẩm ${index + 1} khỏi phiếu nhập`} disabled={draft.items.length === 1}
                  onClick={() => {
                    focusLine.current = (draft.items[index + 1] ?? draft.items[index - 1]).key;
                    setDraft((current) => ({ ...current, items: current.items.filter((lineItem) => lineItem.key !== item.key) }));
                    setFieldErrors((current) => {
                      const lines = { ...current.lines };
                      delete lines[item.key];
                      return { ...current, lines };
                    });
                  }}>
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
        <Button type="button" size="sm" variant="outline" disabled={draft.items.length >= 500}
          onClick={() => {
            const key = nextLineKey.current++;
            focusLine.current = key;
            setDraft((current) => ({
              ...current,
              items: [...current.items, { key, productId: '', quantity: '', unitCost: '' }],
            }));
          }}>
          <Plus aria-hidden="true" className="size-4" /> Thêm sản phẩm
        </Button>
        <div className="rounded-lg bg-slate-50 p-3 text-sm" aria-live="polite">
          <p className="font-bold">Tổng phiếu dự kiến: {allAmountsValid && !validation.totalError ? displayCents(validation.totalCents) : '—'}</p>
          <p className="mt-1 text-slate-600">Máy chủ tính lại tổng khi lưu. Lưu nháp không thay đổi tồn kho.</p>
          {validation.totalError && <p className="mt-1 text-red-700">{validation.totalError}</p>}
        </div>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <Button type="submit" className="w-full" loading={saving} disabled={!validation.valid || busy}>
          {saving ? 'Đang lưu...' : 'Lưu phiếu nháp'}
        </Button>
      </fieldset>
    </form>
  );
};

const INVENTORY_PAGE_SIZE = 20;
const inventoryNumber = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 });
const inventoryDate = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const InventoryTable = ({
  branchId,
  canManage,
  overview,
  search,
  setSearch,
  appliedSearch,
  category,
  status,
  updateFilter,
}: {
  branchId: string;
  canManage: boolean;
  overview: UseQueryResult<InventoryBalance[], Error>;
  search: string;
  setSearch: (value: string) => void;
  appliedSearch: string;
  category: string;
  status: StockStatus;
  updateFilter: (key: string, value: string) => void;
}) => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<InventorySort>(null);
  const [reorderLevels, setReorderLevels] = useState<Record<string, string>>({});
  const reorderLock = useRef(false);
  const serverMode = !category && status === 'all' && sort === null;
  const tableQuery = useQuery({
    queryKey: [...queryKeys.inventory(branchId), 'table', { page, search: appliedSearch }],
    queryFn: async () => {
      const result = await posSalesApi.getInventory(branchId, {
        page, pageSize: INVENTORY_PAGE_SIZE, search: appliedSearch.trim() || undefined,
      });
      return validateInventoryPage(result, page, INVENTORY_PAGE_SIZE);
    },
    enabled: serverMode,
  });
  const reorderMutation = useMutation({
    mutationFn: ({ id, level }: { id: string; level: number }) => posSalesApi.setReorderLevel(branchId, id, level),
    onSuccess: async (_, { id }) => {
      setReorderLevels((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'inventory', branchId] }),
      ]);
      toast.success('Đã cập nhật mức tồn kho cảnh báo.');
    },
    onError: notifyError,
    onSettled: () => { reorderLock.current = false; },
  });
  const balances = overview.data ?? [];
  const categories = [...new Set(balances.map((item) => item.categoryName))].sort((a, b) => a.localeCompare(b, 'vi'));
  const filtered = useMemo(
    () => serverMode ? [] : sortInventory(filterInventory(overview.data ?? [], appliedSearch, category, status), sort),
    [serverMode, overview.data, appliedSearch, category, status, sort],
  );
  const totalCount = serverMode ? tableQuery.data?.metadata.totalCount : overview.data ? filtered.length : undefined;
  const totalPages = totalCount === undefined ? undefined : Math.max(1, Math.ceil(totalCount / INVENTORY_PAGE_SIZE));
  const rows = serverMode
    ? tableQuery.data?.items
    : overview.data ? filtered.slice((page - 1) * INVENTORY_PAGE_SIZE, page * INVENTORY_PAGE_SIZE) : undefined;
  const loading = serverMode ? tableQuery.isLoading : overview.isLoading;
  const error = serverMode ? tableQuery.error : overview.error;

  useEffect(() => { setPage(1); }, [appliedSearch, category, status, sort]);
  useEffect(() => {
    if (totalPages !== undefined && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setSortField = (field: InventorySortField) => {
    setPage(1);
    setSort((current) => ({
      field,
      direction: current?.field === field && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  const header = (label: string, field: InventorySortField, numeric = false, pinned = false) => (
    <th scope="col" aria-sort={sort?.field === field ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
      className={`sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3 ${pinned ? 'min-w-40 xl:left-0 xl:z-20' : ''} ${numeric ? 'text-right' : 'text-left'}`}>
      <button type="button" className={`inline-flex min-h-11 items-center gap-1 font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${numeric ? 'justify-end' : ''}`}
        onClick={() => setSortField(field)}>
        {label}
        {sort?.field === field
          ? sort.direction === 'asc' ? <ArrowUp aria-hidden="true" className="size-4" /> : <ArrowDown aria-hidden="true" className="size-4" />
          : <ArrowUpDown aria-hidden="true" className="size-4 text-slate-400" />}
      </button>
    </th>
  );
  const showError = Boolean(error) && (serverMode || !overview.data);
  const isRefreshing = overview.isFetching || (serverMode && tableQuery.isFetching);

  return (
    <Card>
      <CardBody>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
          <Boxes aria-hidden="true" className="size-5 text-emerald-700" /> Tồn kho chi nhánh
        </h2>
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <Field label="Tìm sản phẩm" value={search} onChange={(value) => { setPage(1); setSearch(value); }} placeholder="Tên, SKU hoặc mã vạch" />
          <SelectField label="Danh mục" value={category} onChange={(value) => { setPage(1); updateFilter('inventoryCategory', value); }}>
            <option value="">Tất cả danh mục</option>
            {category && !categories.includes(category) && <option value={category}>{category}</option>}
            {categories.map((name) => <option key={name} value={name}>{name}</option>)}
          </SelectField>
          <SelectField label="Trạng thái tồn kho" value={status} onChange={(value) => { setPage(1); updateFilter('inventoryStatus', value === 'all' ? '' : value); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="in-stock">Còn hàng</option>
            <option value="low-stock">Sắp hết hàng</option>
            <option value="out-of-stock">Hết hàng</option>
          </SelectField>
          <Button type="button" variant="outline" size="sm" loading={isRefreshing} onClick={() => {
            void overview.refetch();
            if (serverMode) void tableQuery.refetch();
          }}>
            <RefreshCw aria-hidden="true" className="size-4" /> Làm mới
          </Button>
        </div>
        {!serverMode && <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <p>Bộ lọc và sắp xếp được áp dụng trên toàn bộ dữ liệu đã tải của chi nhánh.</p>
          {sort && <Button type="button" variant="outline" size="sm" onClick={() => { setPage(1); setSort(null); }}>Thứ tự mặc định</Button>}
        </div>}
        <p className="mb-3 text-sm text-slate-600 xl:hidden">
          Cuộn ngang để xem các cột và thao tác; chọn bảng rồi dùng phím mũi tên để cuộn bằng bàn phím.
        </p>
        {isRefreshing && !loading && <p role="status" className="mb-3 text-sm text-slate-600">Đang cập nhật tồn kho...</p>}
        {showError && <div className="mb-3"><ErrorPanel error={error} retry={() => {
          if (serverMode) void tableQuery.refetch();
          else void overview.refetch();
        }} /></div>}
        {loading && <p role="status" className="sr-only">Đang tải bảng tồn kho...</p>}
        <div role="region" aria-label="Bảng tồn kho chi nhánh, cuộn để xem thêm" tabIndex={0}
          onFocusCapture={(event) => {
            const container = event.currentTarget;
            if (event.target === container) return;
            const bounds = container.getBoundingClientRect();
            const focused = event.target.getBoundingClientRect();
            if (focused.right > bounds.right) container.scrollLeft += focused.right - bounds.right + 8;
            else if (focused.left < bounds.left) container.scrollLeft -= bounds.left - focused.left + 8;
          }}
          className="max-h-[min(60dvh,48rem)] overflow-auto rounded-xl border border-slate-200 scroll-px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
          <table className="w-full min-w-[1100px] border-collapse text-sm" aria-busy={loading || isRefreshing}>
            <caption className="sr-only">Tồn kho chi nhánh theo sản phẩm</caption>
            <thead>
              <tr className="text-xs uppercase">
                {header('Sản phẩm', 'productName', false, true)}
                {header('SKU', 'sku')}
                {header('Danh mục', 'categoryName')}
                {header('Hiện có', 'quantityOnHand', true)}
                {header('Đã giữ', 'quantityReserved', true)}
                {header('Khả dụng', 'availableQuantity', true)}
                {header('Mức đặt lại', 'reorderLevel', true)}
                <th scope="col" className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3 text-left">Trạng thái</th>
                <th scope="col" className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3 text-left">Cập nhật</th>
                {canManage && <th scope="col" className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-3 py-3 text-left">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && Array.from({ length: 5 }, (_, index) => (
                <tr key={index} aria-hidden="true">
                  {Array.from({ length: canManage ? 10 : 9 }, (_, cell) => (
                    <td key={cell} className="px-3 py-4"><Skeleton className="h-4" /></td>
                  ))}
                </tr>
              ))}
              {!loading && rows?.map((item) => {
                const itemStatus = stockStatus(item);
                const badge = itemStatus === 'out-of-stock'
                  ? { label: 'Hết hàng', className: 'bg-red-50 text-red-800', Icon: CircleX }
                  : itemStatus === 'low-stock'
                    ? { label: 'Sắp hết', className: 'bg-amber-50 text-amber-800', Icon: TriangleAlert }
                    : { label: 'Còn hàng', className: 'bg-emerald-50 text-emerald-800', Icon: CheckCircle2 };
                const level = reorderLevels[item.productId] ?? String(item.reorderLevel);
                const levelValid = isValidReorderLevel(level);
                const pending = reorderMutation.isPending && reorderMutation.variables?.id === item.productId;
                const updated = Date.parse(item.updatedAt);
                return (
                  <tr key={item.productId}>
                    <td className="min-w-40 bg-surface px-3 py-3 font-semibold text-slate-900 xl:sticky xl:left-0 xl:z-[1]">
                      <span className="block max-w-56 break-words [overflow-wrap:anywhere]">{item.productName}</span>
                      <span className="block text-xs font-normal text-slate-500">Đơn vị: {item.unit}</span>
                    </td>
                    <td className="px-3 py-3">{item.sku}</td>
                    <td className="px-3 py-3">{item.categoryName}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{inventoryNumber.format(item.quantityOnHand)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{inventoryNumber.format(item.quantityReserved)}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums">{inventoryNumber.format(item.availableQuantity)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {canManage ? <>
                        <input aria-label={`Mức đặt lại ${item.productName} (${item.sku})`} aria-invalid={!levelValid}
                          aria-describedby={!levelValid ? `reorder-error-${item.productId}` : undefined}
                          className="h-11 w-24 rounded border border-slate-200 px-2 text-right" type="number" min={0} max={999999999.999} step={0.001}
                          value={level} disabled={pending}
                          onChange={(event) => setReorderLevels((current) => ({ ...current, [item.productId]: event.target.value }))} />
                        {!levelValid && <span id={`reorder-error-${item.productId}`} className="block max-w-40 text-xs text-red-700">Nhập mức không âm, tối đa 3 chữ số thập phân.</span>}
                      </> : inventoryNumber.format(item.reorderLevel)}
                    </td>
                    <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${badge.className}`}><badge.Icon aria-hidden="true" className="size-4" />{badge.label}</span></td>
                    <td className="whitespace-nowrap px-3 py-3">{Number.isNaN(updated) ? 'Không rõ' : inventoryDate.format(updated)}</td>
                    {canManage && <td className="px-3 py-3"><Button type="button" size="sm" variant="outline" loading={pending}
                      disabled={reorderMutation.isPending || !levelValid || Number(level) === item.reorderLevel}
                      aria-label={`Lưu mức đặt lại ${item.productName} (${item.sku})`}
                      onClick={() => {
                        if (reorderLock.current || !levelValid || Number(level) === item.reorderLevel) return;
                        reorderLock.current = true;
                        reorderMutation.mutate({ id: item.productId, level: Number(level) });
                      }}>Lưu</Button></td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && rows && rows.length === 0 && <EmptyPanel>
            {appliedSearch || category || status !== 'all'
              ? 'Không tìm thấy sản phẩm. Hãy thử thay đổi tìm kiếm hoặc bộ lọc.'
              : 'Chưa có sản phẩm theo dõi tồn kho tại chi nhánh.'}
          </EmptyPanel>}
        </div>
        {totalCount !== undefined && totalPages !== undefined && totalCount > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm text-slate-600">Trang {Math.min(page, totalPages)} / {totalPages} · {inventoryNumber.format(totalCount)} sản phẩm</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Trang trước</Button>
            <Button type="button" variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((current) => current + 1)}>Trang sau</Button>
          </div>
        </div>}
      </CardBody>
    </Card>
  );
};

const InventoryPanel = ({
  branchId,
  canAdjust,
  canReceive,
  canPost,
  receiptDraft,
  setReceiptDraft,
  receiptSaving,
  setReceiptSaving,
  adjustmentDraft,
  setAdjustmentDraft,
  adjustmentBusy,
  setAdjustmentBusy,
}: {
  branchId: string;
  canAdjust: boolean;
  canReceive: boolean;
  canPost: boolean;
  receiptDraft: ReceiptDraft;
  setReceiptDraft: React.Dispatch<React.SetStateAction<ReceiptDraft>>;
  receiptSaving: boolean;
  setReceiptSaving: React.Dispatch<React.SetStateAction<boolean>>;
  adjustmentDraft: AdjustmentDraft;
  setAdjustmentDraft: React.Dispatch<React.SetStateAction<AdjustmentDraft>>;
  adjustmentBusy: boolean;
  setAdjustmentBusy: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('inventorySearch') ?? '';
  const category = searchParams.get('inventoryCategory') ?? '';
  const statusParam = searchParams.get('inventoryStatus');
  const status: StockStatus = statusParam === 'in-stock' || statusParam === 'low-stock' || statusParam === 'out-of-stock'
    ? statusParam : 'all';
  const [search, setSearch] = useState(urlSearch);
  useEffect(() => setSearch(urlSearch), [urlSearch]);
  useEffect(() => {
    if (search === urlSearch) return;
    const timer = window.setTimeout(() => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (search.trim()) next.set('inventorySearch', search.trim());
        else next.delete('inventorySearch');
        return next;
      }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, urlSearch, setSearchParams]);

  const updateFilter = (key: string, value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  };
  const inventoryQuery = useQuery({
    queryKey: [...queryKeys.inventory(branchId), 'overview'],
    queryFn: () => loadInventory((page) => posSalesApi.getInventory(branchId, { page })),
  });
  const receiptsQuery = useQuery({
    queryKey: queryKeys.receipts(branchId),
    queryFn: () => posSalesApi.getReceipts(branchId),
  });
  const movementsQuery = useQuery({
    queryKey: queryKeys.movements(branchId),
    queryFn: () => posSalesApi.getMovements(branchId),
  });
  const [receiptError, setReceiptError] = useState('');
  const [receiptFieldErrors, setReceiptFieldErrors] = useState<ReceiptFieldErrors>({ header: {}, lines: {} });
  const [postError, setPostError] = useState('');
  const [pendingPost, setPendingPost] = useState<{ id: string; receiptCode: string } | null>(null);
  const [lastSavedReceipt, setLastSavedReceipt] = useState<{ id: string; receiptCode: string } | null>(null);
  const receiptOperationLock = useRef(false);
  const postButtonRef = useRef<HTMLButtonElement | null>(null);
  const receiptsHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const invalidateAdjustment = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.movements(branchId) });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'inventory', branchId] });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'movements', branchId] });
  };
  const invalidateInventory = () => {
    invalidateAdjustment();
    void queryClient.invalidateQueries({ queryKey: queryKeys.receipts(branchId) });
    void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipts', branchId] });
  };
  const receiptMutation = useMutation({
    mutationFn: (draft: ReceiptDraft) =>
      posSalesApi.createReceipt(branchId, {
        supplierName: draft.supplierName.trim() || undefined,
        supplierReference: draft.supplierReference.trim() || undefined,
        notes: draft.notes.trim() || undefined,
        items: draft.items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      }),
    onSuccess: (receipt) => {
      setReceiptDraft(emptyReceiptDraft());
      setReceiptError('');
      setReceiptFieldErrors({ header: {}, lines: {} });
      setLastSavedReceipt({ id: receipt.id, receiptCode: receipt.receiptCode });
      toast.success(`Đã lưu phiếu nháp ${receipt.receiptCode}. Hãy kiểm tra và ghi sổ để tăng tồn kho.`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.receipts(branchId) });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipts', branchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipt', branchId, receipt.id] });
    },
    onError: (error, draft) => {
      setReceiptError(errorMessage(error));
      if (error && typeof error === 'object' && 'fields' in error && error.fields &&
          typeof error.fields === 'object') {
        const fields = Object.fromEntries(
          Object.entries(error.fields).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        );
        setReceiptFieldErrors(mapReceiptFieldErrors(fields, draft.items));
      }
      if (error && typeof error === 'object' && 'code' in error && error.code === 'Inventory.ProductNotConfigured') {
        void inventoryQuery.refetch();
      }
    },
    onSettled: () => { receiptOperationLock.current = false; setReceiptSaving(false); },
  });
  const postReceiptMutation = useMutation({
    mutationFn: (receiptId: string) => posSalesApi.postReceipt(branchId, receiptId),
    onSuccess: (_, receiptId) => {
      setPostError('');
      toast.success('Đã xác nhận phiếu nhập và cập nhật tồn kho.');
      invalidateInventory();
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipt', branchId, receiptId] });
    },
    onError: (error, receiptId) => {
      setPostError(errorMessage(error));
      if (error && typeof error === 'object' && 'status' in error &&
          (error.status === 404 || error.status === 409)) {
        void receiptsQuery.refetch();
        void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipt', branchId, receiptId] });
      }
    },
    onSettled: () => { receiptOperationLock.current = false; setReceiptSaving(false); },
  });
  const balances = inventoryQuery.data ?? [];
  const metrics = [
    { label: 'Sản phẩm theo dõi', value: balances.length },
    { label: 'Sắp hết hàng', value: balances.filter((item) => stockStatus(item) === 'low-stock').length },
    { label: 'Hết hàng', value: balances.filter((item) => stockStatus(item) === 'out-of-stock').length },
  ];

  return (
    <div className="space-y-4">
      {inventoryQuery.isError && <ErrorPanel error={inventoryQuery.error} retry={() => void inventoryQuery.refetch()} />}
      <section aria-label="Tổng quan tồn kho" className="grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardBody>
              <p className="text-sm font-semibold text-slate-600">{metric.label}</p>
              {inventoryQuery.data
                ? <p className="mt-1 text-2xl font-black text-slate-950">{metric.value.toLocaleString('vi-VN')}</p>
                : inventoryQuery.isLoading
                  ? <div role="status" aria-label="Đang tải tổng quan tồn kho" className="mt-2 h-7 w-16 animate-pulse rounded bg-slate-200" />
                  : <p className="mt-1 text-sm text-slate-600">Không có dữ liệu</p>}
            </CardBody>
          </Card>
        ))}
      </section>
      {(canAdjust || canReceive) && inventoryQuery.data && <div className="grid gap-4 min-[1200px]:grid-cols-2">
        {canAdjust && <Card>
          <CardBody>
            <h2 className="mb-4 text-lg font-extrabold">Điều chỉnh tồn kho</h2>
            <InventoryAdjustmentForm
              branchId={branchId}
              balances={balances}
              draft={adjustmentDraft}
              setDraft={setAdjustmentDraft}
              busy={adjustmentBusy}
              setBusy={setAdjustmentBusy}
              invalidateInventory={invalidateAdjustment}
              refreshInventory={async () => {
                const result = await inventoryQuery.refetch();
                if (result.isError || !result.data) throw result.error ?? new Error('Không thể tải tồn kho mới nhất.');
                return result.data;
              }}
            />
          </CardBody>
        </Card>}

        {canReceive && <Card>
          <CardBody>
            <h2 className="mb-4 text-lg font-extrabold">Tạo phiếu nhập hàng</h2>
            <ReceiptDraftForm draft={receiptDraft} setDraft={setReceiptDraft} balances={balances}
              busy={receiptSaving} saving={receiptMutation.isPending} error={receiptError}
              fieldErrors={receiptFieldErrors} setFieldErrors={setReceiptFieldErrors} onSave={() => {
                if (receiptOperationLock.current || receiptSaving) return;
                receiptOperationLock.current = true;
                setReceiptSaving(true);
                setReceiptError('');
                receiptMutation.mutate(receiptDraft);
              }} />
          </CardBody>
        </Card>}
      </div>}

      <InventoryTable branchId={branchId} canManage={canAdjust} overview={inventoryQuery}
        search={search} setSearch={setSearch} appliedSearch={urlSearch}
        category={category} status={status} updateFilter={updateFilter} />

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardBody>
            <h2 ref={receiptsHeadingRef} tabIndex={-1} className="mb-3 text-lg font-extrabold">Phiếu nhập gần đây</h2>
            {lastSavedReceipt && <p className="mb-3 text-sm text-slate-700">
              Phiếu vừa lưu: <Link className="font-bold text-emerald-700 underline" to={paths.posReceiptDetail(lastSavedReceipt.id)}>{lastSavedReceipt.receiptCode}</Link>
            </p>}
            {postError && <p role="alert" className="mb-3 text-sm text-red-700">{postError}</p>}
            {receiptsQuery.isError && <ErrorPanel error={receiptsQuery.error} retry={() => void receiptsQuery.refetch()} />}
            {receiptsQuery.isLoading && <EmptyPanel>Đang tải phiếu nhập...</EmptyPanel>}
            <div className="space-y-2">
              {(receiptsQuery.data?.items ?? []).map((receipt) => (
                <div key={receipt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <p className="font-bold">{receipt.receiptCode}</p>
                    <p className="text-xs text-slate-500">
                      {receipt.supplierName || 'Không rõ nhà cung cấp'} · {receipt.status} · {amount(receipt.totalCost)}
                    </p>
                  </div>
                  {canPost && receipt.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      type="button"
                      aria-label={`Ghi sổ phiếu ${receipt.receiptCode}`}
                      disabled={receiptSaving}
                      onClick={(event) => {
                        if (receiptOperationLock.current || receiptSaving) return;
                        postButtonRef.current = event.currentTarget;
                        setPendingPost({ id: receipt.id, receiptCode: receipt.receiptCode });
                      }}
                      loading={postReceiptMutation.isPending && postReceiptMutation.variables === receipt.id}
                    >
                      Ghi sổ nhập kho
                    </Button>
                  )}
                </div>
              ))}
              {receiptsQuery.data?.items.length === 0 && <EmptyPanel>Chưa có phiếu nhập.</EmptyPanel>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold">Biến động kho gần đây</h2>
              <Link to={paths.posMovements} className="text-sm font-bold text-emerald-700 underline">
                Mở lịch sử biến động
              </Link>
            </div>
            {movementsQuery.isError && <ErrorPanel error={movementsQuery.error} retry={() => void movementsQuery.refetch()} />}
            {movementsQuery.isLoading && <EmptyPanel>Đang tải biến động kho...</EmptyPanel>}
            <div className="max-h-80 space-y-2 overflow-auto">
              {(movementsQuery.data?.items ?? []).map((movement) => (
                <div key={movement.id} className="flex justify-between gap-3 rounded-xl border p-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{movement.productName}</p>
                    <p className="text-xs text-slate-500">{movement.movementType} · {movement.notes ?? ''}</p>
                  </div>
                  <span className={`shrink-0 font-bold ${movement.quantity > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                </div>
              ))}
              {movementsQuery.data?.items.length === 0 && <EmptyPanel>Chưa có biến động kho.</EmptyPanel>}
            </div>
          </CardBody>
        </Card>
      </div>
      <Dialog open={pendingPost !== null} onOpenChange={(open) => { if (!open) setPendingPost(null); }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto [&>button:last-child]:right-1 [&>button:last-child]:top-1 [&>button:last-child]:grid [&>button:last-child]:size-11 [&>button:last-child]:place-items-center" onCloseAutoFocus={(event) => {
          event.preventDefault();
          const button = postButtonRef.current;
          if (button && button.isConnected && !button.disabled) button.focus();
          else receiptsHeadingRef.current?.focus();
        }}>
          <DialogHeader className="pr-10">
            <DialogTitle>Xác nhận ghi sổ nhập kho</DialogTitle>
            <DialogDescription>
              Ghi sổ phiếu {pendingPost?.receiptCode} sẽ cộng tồn kho và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setPendingPost(null)}>Hủy</Button>
            <Button type="button" onClick={() => {
              if (!pendingPost || receiptOperationLock.current || receiptSaving) return;
              receiptOperationLock.current = true;
              setReceiptSaving(true);
              setPostError('');
              setPendingPost(null);
              postReceiptMutation.mutate(pendingPost.id);
            }}>Xác nhận ghi sổ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrdersPanel = ({
  branchId,
  canViewOrders,
  canCancel,
  canViewReport,
}: {
  branchId: string;
  canViewOrders: boolean;
  canCancel: boolean;
  canViewReport: boolean;
}) => {
  const { hasPermission } = useAuthorization();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders(branchId),
    queryFn: () => posSalesApi.getOrders(branchId),
    enabled: canViewOrders,
  });
  const reportQuery = useQuery({
    queryKey: queryKeys.report(branchId, from, to),
    queryFn: () => posSalesApi.getReport(branchId, from, to),
    enabled: canViewReport,
  });
  const [reason, setReason] = useState('');
  const cancelMutation = useMutation({
    mutationFn: (orderId: string) =>
      posSalesApi.cancelOrder(branchId, orderId, reason.trim() || 'Hủy theo yêu cầu tại quầy'),
    onSuccess: () => {
      setReason('');
      toast.success('Đã hủy đơn và ghi nhận hoàn tiền.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders(branchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.report(branchId, from, to) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'orders', branchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'order', branchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'report', branchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'inventory', branchId] });
      void queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'movements', branchId] });
    },
    onError: notifyError,
  });

  const openInvoice = async (invoiceId: string, download: boolean) => {
    const popup = download ? null : window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    try {
      const blob = await posSalesApi.getInvoicePdf(branchId, invoiceId, download);
      const url = URL.createObjectURL(blob);
      if (download) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `invoice-${invoiceId}.pdf`;
        anchor.click();
      } else if (popup) {
        popup.location.href = url;
      } else {
        throw new Error('Cho phép mở cửa sổ mới để xem hóa đơn.');
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      popup?.close();
      notifyError(error);
    }
  };

  if (ordersQuery.isError || (canViewReport && reportQuery.isError)) {
    const error = ordersQuery.error ?? reportQuery.error ?? new Error();
    return (
      <ErrorPanel
        error={error}
        retry={() => {
          if (canViewOrders) void ordersQuery.refetch();
          if (canViewReport) void reportQuery.refetch();
        }}
      />
    );
  }
  const report = reportQuery.data;

  return (
    <div className="space-y-4">
      {canViewReport && <Card>
        <CardBody>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">Báo cáo bán hàng</h2>
              <p className="text-sm text-slate-500">Tổng hợp theo ngày UTC; khoảng ngày bao gồm cả hai đầu.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Field label="Từ ngày" value={from} onChange={setFrom} type="date" />
              <Field label="Đến ngày" value={to} onChange={setTo} type="date" />
            </div>
          </div>
          {report && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Đơn hoàn tất', String(report.completedOrderCount)],
                  ['Doanh số', amount(report.grossSales)],
                  ['Đã hoàn', amount(report.refunds)],
                  ['Doanh số thuần', amount(report.netSales)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-bold">Theo ngày</h3>
                  {report.dailySales.map((day) => (
                    <div key={day.date} className="flex justify-between border-b py-2 text-sm">
                      <span>{day.date} · {day.orderCount} đơn</span>
                      <span className="font-semibold">{amount(day.grossSales - day.refunds)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="mb-2 font-bold">Sản phẩm bán chạy</h3>
                  {report.topProducts.map((product) => (
                    <div key={product.productId} className="flex justify-between gap-3 border-b py-2 text-sm">
                      <span className="truncate">{product.productName} · {product.quantitySold}</span>
                      <span className="shrink-0 font-semibold">{amount(product.grossSales)}</span>
                    </div>
                  ))}
                  {report.topProducts.length === 0 && <EmptyPanel>Không có dữ liệu trong kỳ.</EmptyPanel>}
                </div>
              </div>
            </>
          )}
          {reportQuery.isLoading && <EmptyPanel>Đang tải báo cáo...</EmptyPanel>}
        </CardBody>
      </Card>}

      {canViewOrders && <Card>
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <ClipboardList className="size-5 text-emerald-700" /> Đơn hàng gần đây
            </h2>
            {canCancel && <label className="w-full sm:w-80">
              <span className={labelClass}>Lý do hủy đơn (nếu cần)</span>
              <input className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Mã đơn</th><th>Thời gian</th><th>Khách hàng</th>
                  <th>Trạng thái</th><th className="text-right">Tổng tiền</th><th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(ordersQuery.data?.items ?? []).map((order) => (
                  <tr key={order.id}>
                    <td className="py-3 font-bold">{order.orderCode}</td>
                    <td>{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                    <td>{order.customerName || 'Khách lẻ'}</td>
                    <td>{order.status}</td>
                    <td className="text-right font-semibold">{amount(order.totalAmount)}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        {order.invoiceId && (
                          <>
                            {hasPermission(P.SALES_INVOICE_VIEW) && <Button
                              size="sm"
                              variant="outline"
                              aria-label="Xem hóa đơn"
                              onClick={() => void openInvoice(order.invoiceId!, false)}
                            >
                              <Printer className="size-4" />
                            </Button>}
                            {hasPermission(P.SALES_INVOICE_PRINT) && <Button
                              size="sm"
                              variant="outline"
                              aria-label="Tải hóa đơn"
                              onClick={() => void openInvoice(order.invoiceId!, true)}
                            >
                              <Download className="size-4" />
                            </Button>}
                          </>
                        )}
                        {canCancel && order.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (window.confirm(`Xác nhận hủy đơn ${order.orderCode} và hoàn tiền toàn bộ?`)) {
                                cancelMutation.mutate(order.id);
                              }
                            }}
                            loading={cancelMutation.isPending}
                          >
                            Hủy đơn
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ordersQuery.isLoading && <EmptyPanel>Đang tải đơn hàng...</EmptyPanel>}
            {!ordersQuery.isLoading && ordersQuery.data?.items.length === 0 && (
              <EmptyPanel>Chưa có đơn hàng.</EmptyPanel>
            )}
          </div>
        </CardBody>
      </Card>}
    </div>
  );
};

export default CommercePage;
