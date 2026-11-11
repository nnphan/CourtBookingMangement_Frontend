import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import {
  BarChart3,
  Boxes,
  Check,
  ClipboardList,
  Download,
  PackagePlus,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShoppingCart,
  Tags,
  X,
} from 'lucide-react';
import { BranchSelector } from '@/components/branches/BranchSelector';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { posSalesApi } from '../api';
import type { BranchProduct, CheckoutRequest } from '../types';

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [branchId, setBranchId] = useState(() => localStorage.getItem('pos-sales.branchId') ?? '');
  const selectedTab = searchParams.get('tab');
  const activeTab: CommerceTab = tabs.some((tab) => tab.id === selectedTab)
    ? (selectedTab as CommerceTab)
    : 'pos';

  const handleBranchChange = (nextBranchId: string) => {
    setBranchId(nextBranchId);
    localStorage.setItem('pos-sales.branchId', nextBranchId);
  };

  return (
    <div className="space-y-5 py-5 sm:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
            ALOBO · Quản lý bán hàng
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">POS & Kho hàng</h1>
          <p className="mt-1 text-sm text-slate-600">
            Bán hàng, quản lý sản phẩm và theo dõi tồn kho theo chi nhánh.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <label className={labelClass}>Chi nhánh đang thao tác</label>
          <BranchSelector value={branchId} onChange={handleBranchChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setSearchParams(id === 'pos' ? {} : { tab: id })}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
              activeTab === id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

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
          {activeTab === 'inventory' && <InventoryPanel key={branchId} branchId={branchId} />}
          {activeTab === 'orders' && <OrdersPanel key={branchId} branchId={branchId} />}
        </>
      )}
    </div>
  );
};

const PosPanel = ({ branchId }: { branchId: string }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethodCode, setPaymentMethodCode] = useState<CheckoutRequest['paymentMethodCode']>('CASH');
  const [customerId, setCustomerId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: queryKeys.products(branchId),
    queryFn: () => posSalesApi.getBranchProducts(branchId, true),
  });
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory(branchId),
    queryFn: () => posSalesApi.getInventory(branchId),
  });
  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const stockByProduct = useMemo(
    () => new Map((inventoryQuery.data?.items ?? []).map((item) => [item.productId, item])),
    [inventoryQuery.data],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.sku} ${product.barcode ?? ''}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    [products, search],
  );
  const cartProducts = products.filter((product) => (cart[product.productId] ?? 0) > 0);
  const total = cartProducts.reduce(
    (sum, product) => sum + product.sellingPrice * (cart[product.productId] ?? 0),
    0,
  );

  const checkoutMutation = useMutation({
    mutationFn: (input: CheckoutRequest) => posSalesApi.checkout(branchId, input),
    onSuccess: (order) => {
      setCart({});
      setCustomerId('');
      setBookingId('');
      setNotes('');
      setLastInvoiceId(order.invoiceId);
      toast.success('Thanh toán thành công', `Mã đơn ${order.orderCode}`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products(branchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders(branchId) });
    },
    onError: notifyError,
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
  };

  const checkout = () => {
    if (cartProducts.length === 0) return;
    checkoutMutation.mutate({
      customerId: customerId.trim() || undefined,
      bookingId: bookingId.trim() || undefined,
      paymentMethodCode,
      notes: notes.trim() || undefined,
      items: cartProducts.map((product) => ({
        productId: product.productId,
        quantity: cart[product.productId] ?? 0,
      })),
    });
  };

  const openInvoice = async (invoiceId: string, download = false) => {
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

  if (productsQuery.isError || inventoryQuery.isError) {
    const error = productsQuery.error ?? inventoryQuery.error;
    return (
      <ErrorPanel
        error={error}
        retry={() => {
          void productsQuery.refetch();
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
              />
            </label>
          </div>
          {productsQuery.isLoading ? (
            <EmptyPanel>Đang tải sản phẩm...</EmptyPanel>
          ) : filteredProducts.length === 0 ? (
            <EmptyPanel>Không có sản phẩm đang bán tại chi nhánh này.</EmptyPanel>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const stock = stockByProduct.get(product.productId);
                const unavailable =
                  product.trackInventory && (stock?.availableQuantity ?? 0) <= 0;
                return (
                  <button
                    key={product.productId}
                    type="button"
                    disabled={unavailable}
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
                    {product.trackInventory && (
                      <span className="mt-1 block text-xs text-slate-500">
                        Còn {stock?.availableQuantity ?? 0} {product.unit}
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
              {cartProducts.length} mặt hàng
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
                    <p className="text-xs text-slate-500">{amount(product.sellingPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg border"
                      onClick={() => setQuantity(product, (cart[product.productId] ?? 0) - 1)}
                      aria-label={`Giảm số lượng ${product.name}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-bold">{cart[product.productId]}</span>
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg border"
                      onClick={() => setQuantity(product, (cart[product.productId] ?? 0) + 1)}
                      aria-label={`Tăng số lượng ${product.name}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
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
            <Field label="Mã khách hàng (không bắt buộc)" value={customerId} onChange={setCustomerId} />
            <Field label="Mã đặt sân (không bắt buộc)" value={bookingId} onChange={setBookingId} />
            <Field label="Ghi chú" value={notes} onChange={setNotes} />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold text-slate-600">Tổng thanh toán</span>
            <span className="text-xl font-black text-slate-950">{amount(total)}</span>
          </div>
          <Button
            block
            onClick={checkout}
            loading={checkoutMutation.isPending}
            disabled={cartProducts.length === 0}
          >
            <Check className="size-5" />
            Thanh toán
          </Button>
          {lastInvoiceId && (
            <div className="flex flex-wrap gap-2 rounded-xl bg-emerald-50 p-3">
              <span className="w-full text-sm font-semibold text-emerald-900">Hóa đơn đã tạo</span>
              <Button size="sm" variant="outline" onClick={() => void openInvoice(lastInvoiceId)}>
                <Printer className="size-4" /> Xem / In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => void openInvoice(lastInvoiceId, true)}
              >
                <Download className="size-4" /> Tải PDF
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const CatalogPanel = ({ branchId }: { branchId: string }) => {
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
          <form onSubmit={submitCategory} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <Field label="Mã danh mục" value={categoryCode} onChange={setCategoryCode} required />
            <Field label="Tên danh mục" value={categoryName} onChange={setCategoryName} required />
            <Button className="self-end" size="md" loading={createCategory.isPending}>
              <Plus className="size-4" /> Thêm
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
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
      </Card>

      <Card className="lg:col-span-2">
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
      </Card>
    </div>
  );
};

const InventoryPanel = ({ branchId }: { branchId: string }) => {
  const inventoryQuery = useQuery({
    queryKey: queryKeys.inventory(branchId),
    queryFn: () => posSalesApi.getInventory(branchId),
  });
  const receiptsQuery = useQuery({
    queryKey: queryKeys.receipts(branchId),
    queryFn: () => posSalesApi.getReceipts(branchId),
  });
  const movementsQuery = useQuery({
    queryKey: queryKeys.movements(branchId),
    queryFn: () => posSalesApi.getMovements(branchId),
  });
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [movementType, setMovementType] = useState('ADJUSTMENT_IN');
  const [notes, setNotes] = useState('');
  const [supplier, setSupplier] = useState('');
  const [receiptItems, setReceiptItems] = useState([
    { productId: '', quantity: '', unitCost: '' },
  ]);
  const [reorderLevels, setReorderLevels] = useState<Record<string, string>>({});

  const invalidateInventory = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.receipts(branchId) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.movements(branchId) });
  };
  const adjustmentMutation = useMutation({
    mutationFn: () =>
      posSalesApi.adjustInventory(branchId, {
        productId,
        movementType,
        quantity: Number(quantity),
        notes: notes.trim(),
      }),
    onSuccess: () => {
      setQuantity('');
      setNotes('');
      toast.success('Đã ghi nhận điều chỉnh tồn kho.');
      invalidateInventory();
    },
    onError: notifyError,
  });
  const receiptMutation = useMutation({
    mutationFn: () =>
      posSalesApi.createReceipt(branchId, {
        supplierName: supplier.trim() || undefined,
        items: receiptItems.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      }),
    onSuccess: () => {
      setReceiptItems([{ productId: '', quantity: '', unitCost: '' }]);
      toast.success('Đã tạo phiếu nhập nháp. Hãy kiểm tra và xác nhận phiếu để tăng tồn kho.');
      invalidateInventory();
    },
    onError: notifyError,
  });
  const postReceiptMutation = useMutation({
    mutationFn: (receiptId: string) => posSalesApi.postReceipt(branchId, receiptId),
    onSuccess: () => {
      toast.success('Đã xác nhận phiếu nhập và cập nhật tồn kho.');
      invalidateInventory();
    },
    onError: notifyError,
  });
  const reorderMutation = useMutation({
    mutationFn: ({ id, level }: { id: string; level: number }) =>
      posSalesApi.setReorderLevel(branchId, id, level),
    onSuccess: () => {
      toast.success('Đã cập nhật mức tồn kho cảnh báo.');
      void queryClient.invalidateQueries({ queryKey: queryKeys.inventory(branchId) });
    },
    onError: notifyError,
  });
  const balances = inventoryQuery.data?.items ?? [];
  const refresh = () => {
    void inventoryQuery.refetch();
    void receiptsQuery.refetch();
    void movementsQuery.refetch();
  };
  const queryError = inventoryQuery.error ?? receiptsQuery.error ?? movementsQuery.error;
  if (queryError) return <ErrorPanel error={queryError} retry={refresh} />;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-4 text-lg font-extrabold">Điều chỉnh tồn kho</h2>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                adjustmentMutation.mutate();
              }}
            >
              <SelectField label="Sản phẩm" value={productId} onChange={setProductId}>
                <option value="">Chọn sản phẩm</option>
                {balances.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.sku} · {item.productName}
                  </option>
                ))}
              </SelectField>
              <SelectField label="Loại điều chỉnh" value={movementType} onChange={setMovementType}>
                <option value="ADJUSTMENT_IN">Nhập bổ sung</option>
                <option value="ADJUSTMENT_OUT">Xuất kho</option>
                <option value="DAMAGE">Hàng hư hỏng</option>
              </SelectField>
              <Field
                label="Số lượng"
                value={quantity}
                onChange={setQuantity}
                type="number"
                min={0.001}
                step={0.001}
                required
              />
              <Field label="Lý do / ghi chú" value={notes} onChange={setNotes} required />
              <Button className="sm:col-span-2" loading={adjustmentMutation.isPending}>
                Ghi nhận điều chỉnh
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-4 text-lg font-extrabold">Tạo phiếu nhập hàng</h2>
            <form
              className="grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                receiptMutation.mutate();
              }}
            >
              <Field label="Nhà cung cấp" value={supplier} onChange={setSupplier} />
              <div className="space-y-3 sm:col-span-2">
                {receiptItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[2fr_1fr_1fr_auto]"
                  >
                    <label className="block">
                      <span className={labelClass}>Sản phẩm</span>
                      <select
                        className={inputClass}
                        value={item.productId}
                        required
                        onChange={(event) =>
                          setReceiptItems((current) =>
                            current.map((line, lineIndex) =>
                              lineIndex === index
                                ? { ...line, productId: event.target.value }
                                : line,
                            ),
                          )
                        }
                      >
                        <option value="">Chọn sản phẩm</option>
                        {balances.map((balance) => (
                          <option key={balance.productId} value={balance.productId}>
                            {balance.sku} · {balance.productName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field
                      label="Số lượng"
                      value={item.quantity}
                      onChange={(value) =>
                        setReceiptItems((current) =>
                          current.map((line, lineIndex) =>
                            lineIndex === index ? { ...line, quantity: value } : line,
                          ),
                        )
                      }
                      type="number"
                      min={0.001}
                      step={0.001}
                      required
                    />
                    <Field
                      label="Giá vốn / đơn vị"
                      value={item.unitCost}
                      onChange={(value) =>
                        setReceiptItems((current) =>
                          current.map((line, lineIndex) =>
                            lineIndex === index ? { ...line, unitCost: value } : line,
                          ),
                        )
                      }
                      type="number"
                      min={0}
                      step={1000}
                      required
                    />
                    <button
                      type="button"
                      className="mt-6 grid size-10 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
                      aria-label="Xóa sản phẩm khỏi phiếu nhập"
                      disabled={receiptItems.length === 1}
                      onClick={() =>
                        setReceiptItems((current) => current.filter((_, lineIndex) => lineIndex !== index))
                      }
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setReceiptItems((current) => [
                      ...current,
                      { productId: '', quantity: '', unitCost: '' },
                    ])
                  }
                >
                  <Plus className="size-4" /> Thêm sản phẩm
                </Button>
              </div>
              <Button
                className="sm:col-span-2"
                loading={receiptMutation.isPending}
                disabled={
                  receiptItems.some(
                    (item) => !item.productId || Number(item.quantity) <= 0 || !item.unitCost,
                  ) ||
                  new Set(receiptItems.map((item) => item.productId)).size !== receiptItems.length
                }
              >
                Tạo phiếu nhập nháp
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold">
            <Boxes className="size-5 text-emerald-700" /> Tồn kho chi nhánh
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="border-b text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Sản phẩm</th><th>Danh mục</th><th className="text-right">Tồn</th>
                  <th className="text-right">Đã giữ</th><th className="text-right">Có thể bán</th>
                  <th className="text-right">Mức đặt lại</th><th />
                </tr>
              </thead>
              <tbody className="divide-y">
                {balances.map((item) => (
                  <tr key={item.productId}>
                    <td className="py-3 font-semibold">{item.sku} · {item.productName}</td>
                    <td>{item.categoryName}</td>
                    <td className="text-right">{item.quantityOnHand} {item.unit}</td>
                    <td className="text-right">{item.quantityReserved}</td>
                    <td className={`text-right font-bold ${item.availableQuantity <= item.reorderLevel ? 'text-amber-700' : ''}`}>
                      {item.availableQuantity}
                    </td>
                    <td className="text-right">
                      <input
                        aria-label={`Mức đặt lại ${item.productName}`}
                        className="h-9 w-20 rounded border px-2 text-right"
                        type="number"
                        min={0}
                        step={0.001}
                        value={reorderLevels[item.productId] ?? String(item.reorderLevel)}
                        onChange={(event) =>
                          setReorderLevels((current) => ({
                            ...current,
                            [item.productId]: event.target.value,
                          }))
                        }
                      />
                    </td>
                    <td className="pl-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          Number(reorderLevels[item.productId] ?? item.reorderLevel) ===
                          item.reorderLevel
                        }
                        loading={reorderMutation.isPending}
                        onClick={() =>
                          reorderMutation.mutate({
                            id: item.productId,
                            level: Number(reorderLevels[item.productId]),
                          })
                        }
                      >
                        Lưu
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {inventoryQuery.isLoading && <EmptyPanel>Đang tải tồn kho...</EmptyPanel>}
            {!inventoryQuery.isLoading && balances.length === 0 && (
              <EmptyPanel>Chưa có sản phẩm theo dõi tồn kho tại chi nhánh.</EmptyPanel>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-3 text-lg font-extrabold">Phiếu nhập gần đây</h2>
            <div className="space-y-2">
              {(receiptsQuery.data?.items ?? []).map((receipt) => (
                <div key={receipt.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div>
                    <p className="font-bold">{receipt.receiptCode}</p>
                    <p className="text-xs text-slate-500">
                      {receipt.supplierName || 'Không rõ nhà cung cấp'} · {receipt.status} · {amount(receipt.totalCost)}
                    </p>
                  </div>
                  {receipt.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      onClick={() => postReceiptMutation.mutate(receipt.id)}
                      loading={postReceiptMutation.isPending}
                    >
                      Xác nhận nhập
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
            <h2 className="mb-3 text-lg font-extrabold">Biến động kho gần đây</h2>
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
    </div>
  );
};

const OrdersPanel = ({ branchId }: { branchId: string }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders(branchId),
    queryFn: () => posSalesApi.getOrders(branchId),
  });
  const reportQuery = useQuery({
    queryKey: queryKeys.report(branchId, from, to),
    queryFn: () => posSalesApi.getReport(branchId, from, to),
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

  if (ordersQuery.isError || reportQuery.isError) {
    const error = ordersQuery.error ?? reportQuery.error ?? new Error();
    return (
      <ErrorPanel
        error={error}
        retry={() => {
          void ordersQuery.refetch();
          void reportQuery.refetch();
        }}
      />
    );
  }
  const report = reportQuery.data;

  return (
    <div className="space-y-4">
      <Card>
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
      </Card>

      <Card>
        <CardBody>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <ClipboardList className="size-5 text-emerald-700" /> Đơn hàng gần đây
            </h2>
            <label className="w-full sm:w-80">
              <span className={labelClass}>Lý do hủy đơn (nếu cần)</span>
              <input className={inputClass} value={reason} onChange={(event) => setReason(event.target.value)} />
            </label>
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
                            <Button
                              size="sm"
                              variant="outline"
                              aria-label="Xem hóa đơn"
                              onClick={() => void openInvoice(order.invoiceId!, false)}
                            >
                              <Printer className="size-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              aria-label="Tải hóa đơn"
                              onClick={() => void openInvoice(order.invoiceId!, true)}
                            >
                              <Download className="size-4" />
                            </Button>
                          </>
                        )}
                        {order.status === 'COMPLETED' && (
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
      </Card>
    </div>
  );
};

export default CommercePage;
