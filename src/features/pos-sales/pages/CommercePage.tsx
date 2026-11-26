import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import {
  BarChart3,
  Check,
  ClipboardList,
  Download,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { useAuthorization } from '@/features/auth/authorization';
import { PERMISSIONS as P } from '@/shared/constants/permissions';
import { paths } from '@/app/router/paths';
import { posSalesApi } from '../api';
import { PosWorkspaceHeader, PosWorkspaceTabs } from '../components/PosWorkspaceShell';
import type { BranchProduct, CheckoutRequest, CustomerLookup, SalesOrder } from '../types';
type CommerceTab = 'pos' | 'orders';
const tabs: Array<{ id: CommerceTab; label: string; icon: typeof ShoppingCart }> = [
  { id: 'pos', label: 'Bán hàng', icon: ShoppingCart },
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
  const canViewOrders = hasAnyPermission([P.SALES_VIEW, P.SALES_REPORT_VIEW]);
  const availableTabs = tabs.filter((tab) => tab.id === 'pos' || canViewOrders);
  const [searchParams] = useSearchParams();
  const [branchId, setBranchId] = useState(() => localStorage.getItem('pos-sales.branchId') ?? '');
  const activeTab = searchParams.get('tab') === 'orders' && canViewOrders ? 'orders' : 'pos';

  const handleBranchChange = (nextBranchId: string) => {
    setBranchId(nextBranchId);
    localStorage.setItem('pos-sales.branchId', nextBranchId);
  };

  return (
    <div className="pos-workspace min-w-0 space-y-3 py-3 sm:py-4">
      <PosWorkspaceHeader
        compact
        title="POS / Bán hàng"
        branchId={branchId}
        onBranchChange={handleBranchChange}
      />

      <PosWorkspaceTabs
        ariaLabel="Chức năng POS"
        stretch
        compact
        tabs={availableTabs
          .map(({ id, label, icon }) => ({
            id,
            label,
            icon,
            to: id === 'pos' ? paths.posSales : `${paths.posSales}?tab=${id}`,
            active: activeTab === id,
          }))}
      />

      {activeTab === 'pos' && !hasPermission(P.SALES_VIEW) ? (
        <Card><CardBody>
          <p role="alert" className="text-sm font-semibold text-slate-800">
            Tài khoản chưa có quyền Bán hàng (sales.view). Hãy liên hệ quản trị viên để được cấp quyền.
          </p>
        </CardBody></Card>
      ) : !branchId ? (
        <Card>
          <CardBody>
            <EmptyPanel>Vui lòng chọn chi nhánh để bắt đầu.</EmptyPanel>
          </CardBody>
        </Card>
      ) : (
        <>
          {activeTab === 'pos' && <PosPanel key={branchId} branchId={branchId} />}
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
  const [cashInput, setCashInput] = useState('');
  const [completedChange, setCompletedChange] = useState<number | null>(null);
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
    (sum, product) => sum + Math.round(product.sellingPrice * 100) * (cart[product.productId] ?? 0), 0,
  ) / 100;
  const cashTendered = Number(cashInput);
  const hasEnoughCash = cashInput.trim() !== '' && Number.isFinite(cashTendered)
    && cashTendered >= estimatedTotal && cashTendered <= 9_999_999_999.99
    && /^\d+(\.\d{1,2})?$/.test(cashInput);
  const cartQuantity = cartProducts.reduce((sum, product) => sum + (cart[product.productId] ?? 0), 0);

  const checkoutMutation = useMutation({
    mutationFn: ({ orderBranchId, input }: { orderBranchId: string; input: CheckoutRequest }) =>
      posSalesApi.checkout(orderBranchId, input),
    onSuccess: (order, { orderBranchId, input }) => {
      setCompletedChange(input.cashTendered == null ? null : input.cashTendered - order.totalAmount);
      if (orderBranchId === branchId) {
        setCart({});
        setCartProductSnapshots({});
        setCustomerSearch('');
        setSelectedCustomer(null);
        setBookingId('');
        setNotes('');
        setCashInput('');
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
      void queryClient.invalidateQueries({ queryKey: ['business-statistics', 'report'] });
    },
    onError: (error, { orderBranchId }) => {
      const code =
        error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
          ? error.code
          : '';
      if (code === 'Sales.InsufficientCash') {
        toast.error('Tiền khách đưa chưa đủ', 'Giá bán có thể đã thay đổi. Hãy kiểm tra lại tổng tiền.');
        void queryClient.invalidateQueries({ queryKey: queryKeys.products(orderBranchId) });
        return;
      }
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
    if (cartProducts.length === 0 || !hasEnoughCash || checkoutMutation.isPending) return;
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
        paymentMethodCode: 'CASH',
        cashTendered,
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
    <div className="grid min-w-0 items-start gap-3 min-[56.25rem]:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
      <Card className="border-line min-w-0 rounded-lg border shadow-none">
        <CardBody className="space-y-3 px-4 py-4 sm:px-4 sm:py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Chọn sản phẩm</h2>
              <p className="text-sm text-slate-500">Giá bán và tồn kho được xác thực phía máy chủ.</p>
            </div>
            <label className="relative block w-full sm:max-w-[14rem] [&_input]:h-9">
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
          <label className="block sm:max-w-[14rem]">
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
            <div className="grid gap-2 sm:grid-cols-2 min-[56.25rem]:grid-cols-3">
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
                    className="rounded-lg border border-slate-200 p-3 text-left text-sm transition hover:border-emerald-500 hover:bg-emerald-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="block font-bold text-slate-900">{product.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {product.sku} · {product.categoryName}
                    </span>
                    <span className="mt-2 block font-extrabold text-emerald-800">
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

      <Card className="border-line min-w-0 rounded-lg border shadow-none">
        <CardBody className="space-y-2 px-4 py-3 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Đơn hàng hiện tại</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">
              {cartProducts.length} mặt hàng · {cartQuantity} sản phẩm
            </span>
          </div>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {cartProducts.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-slate-500">Chọn sản phẩm để tạo đơn hàng.</p>
            ) : (
              cartProducts.map((product) => {
                const quantity = cart[product.productId] ?? 0;
                return (
                  <div key={product.productId} className="space-y-1.5 border-b border-line pb-2">
                    <p className="break-words font-semibold text-slate-800">{product.name}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-slate-500">{amount(product.sellingPrice)}</span>
                      <div className="flex items-center gap-1.5">
                        <button type="button" className="grid size-8 place-items-center rounded border"
                          disabled={checkoutMutation.isPending} onClick={() => setQuantity(product, quantity - 1)}
                          aria-label={`Giảm số lượng ${product.name}`}>−</button>
                        <span className="min-w-5 text-center tabular-nums">{quantity}</span>
                        <button type="button" className="grid size-8 place-items-center rounded border"
                          disabled={checkoutMutation.isPending || (product.trackInventory &&
                            quantity >= (stockByProduct.get(product.productId)?.availableQuantity ?? 0))}
                          onClick={() => setQuantity(product, quantity + 1)}
                          aria-label={`Tăng số lượng ${product.name}`}>+</button>
                      </div>
                      <span className="font-semibold tabular-nums">{amount(product.sellingPrice * quantity)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <dl className="space-y-1 border-t border-line pt-3 text-sm tabular-nums">
            <div className="flex justify-between gap-2 font-bold">
              <dt>Tổng tiền</dt><dd>{amount(estimatedTotal)}</dd>
            </div>
          </dl>
          <div className="space-y-2 border-t border-line pt-3">
            <p className="text-sm text-slate-700"><strong>Phương thức Thanh toán:</strong> Tiền mặt</p>
            <Field label="Tiền khách đưa" type="number" min={0} step={0.01} value={cashInput} onChange={setCashInput} />
            <div className="flex justify-between gap-2 text-sm font-semibold tabular-nums">
              <span>Tiền thừa</span>
              <output>{cartProducts.length > 0 && hasEnoughCash ? amount(cashTendered - estimatedTotal) : '—'}</output>
            </div>
            {cartProducts.length > 0 && cashInput !== '' && !hasEnoughCash && (
              <p role="status" className="text-xs text-red-700">Nhập số tiền hợp lệ và đủ để thanh toán.</p>
            )}
          </div>
          {(hasInsufficientTrackedStock || hasUnavailableCartProduct) && (
            <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {hasUnavailableCartProduct
                ? 'Một sản phẩm trong giỏ không còn được bán tại chi nhánh này. Hãy xóa sản phẩm đó trước khi thanh toán.'
                : 'Số lượng trong giỏ đang cao hơn tồn kho khả dụng mới nhất. Hãy giảm số lượng trước khi thanh toán.'}
            </p>
          )}
          {hasPermission(P.SALES_CREATE) && (
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm"
                disabled={cartProducts.length === 0 || checkoutMutation.isPending}
                onClick={() => {
                  if (!window.confirm('Hủy đơn hiện tại?')) return;
                  setCart({});
                  setCartProductSnapshots({});
                  clearCustomer();
                  setBookingId('');
                  setNotes('');
                  setCashInput('');
                }}>Hủy đơn</Button>
              <Button type="button" size="sm" onClick={checkout} loading={checkoutMutation.isPending}
                disabled={cartProducts.length === 0 || !hasEnoughCash || checkoutMutation.isPending ||
                  hasInsufficientTrackedStock || hasUnavailableCartProduct || productsQuery.isLoading || inventoryQuery.isLoading}>
                <Check aria-hidden className="size-4" /> Thanh toán
              </Button>
            </div>
          )}
          <details className="border-t border-line pt-2">
            <summary className="cursor-pointer text-sm font-medium text-slate-600">
              Thông tin đơn hàng (không bắt buộc)
            </summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 [&_input]:h-9 [&_select]:h-9 [&_label>span:first-child]:text-xs">
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

            </label>
            <Field label="Ghi chú" value={notes} onChange={setNotes} />
              <p className="text-xs text-slate-500 sm:col-span-2">
                Máy chủ xác nhận booking thuộc chi nhánh và khách hàng đã chọn.
              </p>
          </div>
          </details>
          {completedOrder && (
            <div className="flex flex-wrap gap-2 rounded-xl bg-emerald-50 p-3">
              <div className="w-full text-sm text-emerald-950" role="status" aria-live="polite">
                <p className="font-bold">
                  Thanh toán hoàn tất · {completedOrder.orderCode}
                  {completedOrderBranchId !== branchId && ` · Chi nhánh ${completedOrderBranchId}`}
                </p>
                <p className="mt-1">Tổng tiền do máy chủ xác nhận: <strong>{amount(completedOrder.totalAmount)}</strong></p>
                <p>Đã thanh toán: {amount(completedOrder.paidAmount)} · {completedOrder.paymentMethodCode}</p>
                {completedChange !== null && <p>Tiền thừa: {amount(completedChange)}</p>}
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
      void queryClient.invalidateQueries({ queryKey: ['business-statistics', 'report'] });
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
