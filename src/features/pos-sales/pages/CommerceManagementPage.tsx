import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  FileText,
  Package,
  Plus,
  RefreshCw,
  Save,
  Tags,
  Truck,
} from 'lucide-react';
import { BranchSelector } from '@/components/branches/BranchSelector';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { paths } from '@/app/router/paths';
import { posSalesApi } from '../api';
import type { BranchProduct, InventoryBalance, Product, ProductCategory, SalesReport, StockMovement } from '../types';

type Section =
  | 'categories'
  | 'products'
  | 'branch-products'
  | 'inventory'
  | 'movements'
  | 'receipts'
  | 'receipt-edit'
  | 'receipt-detail'
  | 'orders'
  | 'order-detail'
  | 'dashboard'
  | 'invoice';

type Permission =
  | 'product.view'
  | 'product.create'
  | 'product.update'
  | 'product.deactivate'
  | 'inventory.view'
  | 'inventory.receive'
  | 'inventory.post_receipt'
  | 'inventory.adjust'
  | 'sales.view'
  | 'sales.cancel'
  | 'sales.refund'
  | 'sales.invoice.view'
  | 'sales.invoice.print'
  | 'sales.report.view';

const branchAdminPermissions: Permission[] = [
  'product.view',
  'product.create',
  'product.update',
  'product.deactivate',
  'inventory.view',
  'inventory.receive',
  'inventory.post_receipt',
  'inventory.adjust',
  'sales.view',
  'sales.cancel',
  'sales.refund',
  'sales.invoice.view',
  'sales.invoice.print',
  'sales.report.view',
];

const staffPermissions: Permission[] = [
  'product.view',
  'inventory.view',
  'sales.view',
  'sales.invoice.view',
  'sales.invoice.print',
];

const permissionBySection: Record<Section, Permission[]> = {
  categories: ['product.view'],
  products: ['product.view'],
  'branch-products': ['product.view', 'product.update'],
  inventory: ['inventory.view'],
  movements: ['inventory.view'],
  receipts: ['inventory.view'],
  'receipt-edit': ['inventory.receive'],
  'receipt-detail': ['inventory.view'],
  orders: ['sales.view'],
  'order-detail': ['sales.view'],
  dashboard: ['sales.report.view'],
  invoice: ['sales.invoice.view'],
};

const sectionLinks: Array<{
  section: Section;
  path: string;
  label: string;
  icon: typeof Tags;
  permissions: Permission[];
}> = [
  { section: 'dashboard', path: paths.posDashboard, label: 'Báo cáo bán hàng', icon: BarChart3, permissions: ['sales.report.view'] },
  { section: 'categories', path: paths.posCategories, label: 'Danh mục', icon: Tags, permissions: ['product.view'] },
  { section: 'products', path: paths.posProducts, label: 'Sản phẩm', icon: Package, permissions: ['product.view'] },
  { section: 'branch-products', path: paths.posBranchProducts, label: 'Cấu hình chi nhánh', icon: ClipboardList, permissions: ['product.view', 'product.update'] },
  { section: 'inventory', path: paths.posInventory, label: 'Tồn kho', icon: Boxes, permissions: ['inventory.view'] },
  { section: 'movements', path: paths.posMovements, label: 'Biến động kho', icon: RefreshCw, permissions: ['inventory.view'] },
  { section: 'receipts', path: paths.posReceipts, label: 'Phiếu nhập', icon: Truck, permissions: ['inventory.view'] },
  { section: 'orders', path: paths.posOrders, label: 'Đơn bán hàng', icon: FileText, permissions: ['sales.view'] },
];

const queryKeys = {
  categories: ['pos-sales', 'management', 'categories'] as const,
  products: ['pos-sales', 'management', 'catalog-products'] as const,
  branchProducts: (branchId: string) => ['pos-sales', 'management', 'branch-products', branchId] as const,
  inventory: (branchId: string) => ['pos-sales', 'management', 'inventory', branchId] as const,
  movements: (branchId: string, filter: string) => ['pos-sales', 'management', 'movements', branchId, filter] as const,
  receipts: (branchId: string) => ['pos-sales', 'management', 'receipts', branchId] as const,
  receipt: (branchId: string, receiptId: string) => ['pos-sales', 'management', 'receipt', branchId, receiptId] as const,
  orders: (branchId: string) => ['pos-sales', 'management', 'orders', branchId] as const,
  order: (branchId: string, orderId: string) => ['pos-sales', 'management', 'order', branchId, orderId] as const,
  report: (branchId: string, from: string, to: string) => ['pos-sales', 'management', 'report', branchId, from, to] as const,
  invoice: (branchId: string, invoiceId: string) => ['pos-sales', 'management', 'invoice', branchId, invoiceId] as const,
};

const invalidateCatalogViews = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'categories'] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'catalog-products'] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'branch-products'] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'catalog'] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'products'] }),
  ]);

const invalidateInventoryViews = (branchId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'inventory', branchId] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'receipts', branchId] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'management', 'movements', branchId] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'inventory', branchId] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'receipts', branchId] }),
    queryClient.invalidateQueries({ queryKey: ['pos-sales', 'movements', branchId] }),
  ]);

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const amount = (value: number) => currency.format(value);

const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

const notifyError = (error: unknown) => toast.error('Không thể hoàn tất', errorMessage(error));

const canUse = (roles: string[], permission: Permission) =>
  roles.some((role) => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'BRANCH_ADMIN') {
      return branchAdminPermissions.includes(permission);
    }
    return role === 'STAFF' && staffPermissions.includes(permission);
  });

const useCan = (permission: Permission) => {
  const user = useAuthStore((state) => state.user);
  const roles = [...(user?.roles ?? []), user?.role ?? ''].map((role) => role.toUpperCase());
  return canUse(roles, permission);
};

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  min,
  step,
  disabled = false,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: number;
  step?: number;
  disabled?: boolean;
}) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <input
      className={inputClass}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      min={min}
      step={step}
      disabled={disabled}
    />
  </label>
);

const ErrorPanel = ({ error, retry }: { error: unknown; retry: () => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <span>{errorMessage(error)}</span>
    <Button size="sm" variant="outline" onClick={retry}>
      <RefreshCw className="size-4" /> Thử lại
    </Button>
  </div>
);

const EmptyPanel = ({ children }: { children: string }) => (
  <p className="py-10 text-center text-sm text-slate-500">{children}</p>
);

const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
  </div>
);

const TableHead = ({ children }: { children: ReactNode }) => (
  <th className="whitespace-nowrap bg-slate-50 px-4 py-3 font-bold text-slate-600">{children}</th>
);

const TableCell = ({ children }: { children: ReactNode }) => (
  <td className="border-t border-slate-100 px-4 py-3 align-middle text-slate-700">{children}</td>
);

const ManagementFrame = ({
  section,
  branchId,
  setBranchId,
  children,
}: {
  section: Section;
  branchId: string;
  setBranchId: (id: string) => void;
  children: ReactNode;
}) => {
  const user = useAuthStore((state) => state.user);
  const roles = [...(user?.roles ?? []), user?.role ?? ''].map((role) => role.toUpperCase());
  const visibleLinks = sectionLinks.filter((link) =>
    link.permissions.every((permission) => canUse(roles, permission)),
  );

  return (
    <div className="space-y-5 py-5 sm:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link to={paths.posSales} className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
            <ArrowLeft className="size-4" /> POS / bán hàng
          </Link>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">ALOBO · Quản lý bán hàng</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Quản trị POS & kho</h1>
          <p className="mt-1 text-sm text-slate-600">Danh mục, sản phẩm, tồn kho và giao dịch của chi nhánh đang chọn.</p>
        </div>
        <div className="w-full sm:w-80">
          <label className={labelClass}>Chi nhánh đang thao tác</label>
          <BranchSelector value={branchId} onChange={setBranchId} />
        </div>
      </div>
      <nav aria-label="Quản lý POS" className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-4 lg:grid-cols-8">
        {visibleLinks.map(({ section: linkSection, path, label, icon: Icon }) => (
          <Link
            key={linkSection}
            to={path}
            aria-current={section === linkSection ? 'page' : undefined}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 py-2 text-center text-xs font-bold transition sm:text-sm ${
              section === linkSection ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
      {!branchId ? (
        <Card><CardBody><EmptyPanel>Vui lòng chọn chi nhánh được phân quyền để xem dữ liệu.</EmptyPanel></CardBody></Card>
      ) : children}
    </div>
  );
};

const CommerceManagementPage = ({ section }: { section: Section }) => {
  const user = useAuthStore((state) => state.user);
  const roles = [...(user?.roles ?? []), user?.role ?? ''].map((role) => role.toUpperCase());
  const allowed = permissionBySection[section].every((permission) => canUse(roles, permission));
  const [branchId, setBranchId] = useState(() => localStorage.getItem('pos-sales.branchId') ?? '');
  const handleBranchChange = (nextBranchId: string) => {
    setBranchId(nextBranchId);
    localStorage.setItem('pos-sales.branchId', nextBranchId);
  };

  if (!allowed) {
    return (
      <div className="py-12">
        <Card><CardBody><p role="alert" className="text-center text-sm font-semibold text-red-700">Bạn không có quyền truy cập chức năng này.</p></CardBody></Card>
      </div>
    );
  }

  return (
    <ManagementFrame section={section} branchId={branchId} setBranchId={handleBranchChange}>
      {section === 'categories' && <CategoriesPage />}
      {section === 'products' && <ProductsPage />}
      {section === 'branch-products' && <BranchProductsPage branchId={branchId} />}
      {section === 'inventory' && <InventoryPage branchId={branchId} />}
      {section === 'movements' && <MovementsPage branchId={branchId} />}
      {section === 'receipts' && <ReceiptsPage branchId={branchId} />}
      {section === 'receipt-edit' && <ReceiptEditorPage branchId={branchId} />}
      {section === 'receipt-detail' && <ReceiptDetailPage branchId={branchId} />}
      {section === 'orders' && <OrdersPage branchId={branchId} />}
      {section === 'order-detail' && <OrderDetailPage branchId={branchId} roles={roles} />}
      {section === 'dashboard' && <SalesDashboardPage branchId={branchId} />}
      {section === 'invoice' && <InvoicePage branchId={branchId} />}
    </ManagementFrame>
  );
};

const CategoriesPage = () => {
  const canCreate = useCan('product.create');
  const canUpdate = useCan('product.update');
  const canDeactivate = useCan('product.deactivate');
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories, queryFn: () => posSalesApi.getCategories() });
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const reset = () => {
    setEditing(null); setCode(''); setName(''); setDescription(''); setDisplayOrder('0'); setIsActive(true);
  };
  const save = useMutation({
    mutationFn: () => editing
      ? posSalesApi.updateCategory(editing.id, { code, name, description: description || undefined, displayOrder: Number(displayOrder), isActive })
      : posSalesApi.createCategory({ code, name, description: description || undefined, displayOrder: Number(displayOrder), isActive }),
    onSuccess: async () => {
      await invalidateCatalogViews();
      toast.success(editing ? 'Danh mục đã được cập nhật.' : 'Danh mục đã được tạo.');
      reset();
    },
    onError: notifyError,
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => posSalesApi.deactivateCategory(id),
    onSuccess: async () => { await invalidateCatalogViews(); toast.success('Đã ngừng hoạt động danh mục.'); },
    onError: notifyError,
  });
  const onSubmit = (event: FormEvent) => { event.preventDefault(); save.mutate(); };
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)]">
      <Card><CardBody className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Danh mục sản phẩm</h2>
        {categoriesQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải danh mục...</p>
          : categoriesQuery.isError ? <ErrorPanel error={categoriesQuery.error} retry={() => void categoriesQuery.refetch()} />
            : categoriesQuery.data?.length ? (
              <Table><thead><tr><TableHead>Mã</TableHead><TableHead>Tên</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></tr></thead>
                <tbody>{categoriesQuery.data.map((category) => <tr key={category.id}>
                  <TableCell>{category.code}</TableCell><TableCell>{category.name}</TableCell><TableCell>{category.displayOrder}</TableCell>
                  <TableCell>{category.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</TableCell>
                  <TableCell><div className="flex gap-2">
                    {canUpdate && <Button size="sm" variant="outline" onClick={() => { setEditing(category); setCode(category.code); setName(category.name); setDescription(category.description ?? ''); setDisplayOrder(String(category.displayOrder)); setIsActive(category.isActive); }}>Sửa</Button>}
                    {canDeactivate && category.isActive && <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Ngừng hoạt động danh mục "${category.name}"?`)) deactivate.mutate(category.id); }}>Ngừng</Button>}
                  </div></TableCell>
                </tr>)}</tbody>
              </Table>
            ) : <EmptyPanel>Chưa có danh mục sản phẩm.</EmptyPanel>}
      </CardBody></Card>
      {(canCreate || (canUpdate && editing !== null)) && <Card><CardBody>
        <h2 className="mb-4 text-lg font-black text-slate-900">{editing ? 'Cập nhật danh mục' : 'Tạo danh mục'}</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Field label="Mã danh mục" value={code} onChange={setCode} required />
          <Field label="Tên danh mục" value={name} onChange={setName} required />
          <Field label="Mô tả" value={description} onChange={setDescription} />
          <Field label="Thứ tự hiển thị" type="number" value={displayOrder} onChange={setDisplayOrder} min={0} step={1} required />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Đang hoạt động</label>
          <div className="flex gap-2"><Button type="submit" disabled={save.isPending}><Save className="size-4" />{save.isPending ? 'Đang lưu...' : 'Lưu'}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Hủy sửa</Button>}</div>
        </form>
      </CardBody></Card>}
    </div>
  );
};

const ProductsPage = () => {
  const canCreate = useCan('product.create');
  const canUpdate = useCan('product.update');
  const canDeactivate = useCan('product.deactivate');
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories, queryFn: () => posSalesApi.getCategories() });
  const productsQuery = useQuery({ queryKey: queryKeys.products, queryFn: () => posSalesApi.searchCatalogProducts({ pageSize: 100 }) });
  const [editing, setEditing] = useState<Product | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('cái');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [trackInventory, setTrackInventory] = useState(true);
  const [active, setActive] = useState(true);
  const reset = () => { setEditing(null); setCategoryId(''); setSku(''); setBarcode(''); setName(''); setDescription(''); setUnit('cái'); setCost(''); setPrice(''); setTrackInventory(true); setActive(true); };
  const save = useMutation({
    mutationFn: () => {
      const input = {
        categoryId, sku, barcode: barcode || undefined, name, description: description || undefined, unit,
        defaultCostPrice: cost ? Number(cost) : undefined, defaultSellingPrice: Number(price), trackInventory, isActive: active,
      };
      return editing ? posSalesApi.updateProduct(editing.id, input) : posSalesApi.createProduct(input);
    },
    onSuccess: async () => {
      await invalidateCatalogViews();
      toast.success(editing ? 'Sản phẩm đã được cập nhật.' : 'Sản phẩm đã được tạo.');
      reset();
    },
    onError: notifyError,
  });
  const deactivate = useMutation({
    mutationFn: (id: string) => posSalesApi.deactivateProduct(id),
    onSuccess: async () => { await invalidateCatalogViews(); toast.success('Đã ngừng hoạt động sản phẩm.'); },
    onError: notifyError,
  });
  const onSubmit = (event: FormEvent) => { event.preventDefault(); save.mutate(); };
  const startEdit = (product: Product) => {
    setEditing(product); setCategoryId(product.categoryId); setSku(product.sku); setBarcode(product.barcode ?? '');
    setName(product.name); setDescription(product.description ?? ''); setUnit(product.unit);
    setCost(product.defaultCostPrice === null ? '' : String(product.defaultCostPrice));
    setPrice(String(product.defaultSellingPrice)); setTrackInventory(product.trackInventory); setActive(product.isActive);
  };
  return (
    <div className="space-y-5">
      <Card><CardBody className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Danh mục sản phẩm dùng chung</h2>
        {productsQuery.isLoading || categoriesQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải sản phẩm...</p>
          : productsQuery.isError ? <ErrorPanel error={productsQuery.error} retry={() => void productsQuery.refetch()} />
            : categoriesQuery.isError ? <ErrorPanel error={categoriesQuery.error} retry={() => void categoriesQuery.refetch()} />
              : productsQuery.data?.items.length ? (
                <Table><thead><tr><TableHead>SKU / Barcode</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Danh mục</TableHead><TableHead>Giá mặc định</TableHead><TableHead>Tồn kho</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></tr></thead>
                  <tbody>{productsQuery.data.items.map((product) => <tr key={product.id}>
                    <TableCell><span className="font-semibold">{product.sku}</span><br />{product.barcode ?? '—'}</TableCell>
                    <TableCell>{product.name}<br /><span className="text-xs text-slate-500">{product.unit}</span></TableCell>
                    <TableCell>{product.categoryName}</TableCell><TableCell>{amount(product.defaultSellingPrice)}</TableCell>
                    <TableCell>{product.trackInventory ? 'Theo dõi' : 'Không'}</TableCell><TableCell>{product.isActive ? 'Hoạt động' : 'Đã ẩn'}</TableCell>
                    <TableCell><div className="flex gap-2">{canUpdate && <Button size="sm" variant="outline" onClick={() => startEdit(product)}>Sửa</Button>}{canDeactivate && product.isActive && <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Ngừng hoạt động sản phẩm "${product.name}"?`)) deactivate.mutate(product.id); }}>Ngừng</Button>}</div></TableCell>
                  </tr>)}</tbody>
                </Table>
              ) : <EmptyPanel>Chưa có sản phẩm trong danh mục.</EmptyPanel>}
      </CardBody></Card>
      {(canCreate || (canUpdate && editing !== null)) && <Card><CardBody>
        <h2 className="mb-4 text-lg font-black text-slate-900">{editing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}</h2>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
          <label className="block"><span className={labelClass}>Danh mục</span><select className={inputClass} value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required><option value="">Chọn danh mục</option>{categoriesQuery.data?.filter((category) => category.isActive).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <Field label="SKU" value={sku} onChange={setSku} required />
          <Field label="Barcode" value={barcode} onChange={setBarcode} />
          <Field label="Tên sản phẩm" value={name} onChange={setName} required />
          <Field label="Đơn vị" value={unit} onChange={setUnit} required />
          <Field label="Giá vốn mặc định" type="number" value={cost} onChange={setCost} min={0} step={0.01} />
          <Field label="Giá bán mặc định" type="number" value={price} onChange={setPrice} min={0} step={0.01} required />
          <Field label="Mô tả" value={description} onChange={setDescription} />
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={trackInventory} onChange={(event) => setTrackInventory(event.target.checked)} /> Theo dõi tồn kho</label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Đang hoạt động</label>
            <Button type="submit" disabled={save.isPending || !categoriesQuery.data?.length}><Save className="size-4" />{save.isPending ? 'Đang lưu...' : 'Lưu sản phẩm'}</Button>
            {editing && <Button type="button" variant="outline" onClick={reset}>Hủy sửa</Button>}
          </div>
        </form>
      </CardBody></Card>}
    </div>
  );
};

const BranchProductsPage = ({ branchId }: { branchId: string }) => {
  const productsQuery = useQuery({ queryKey: queryKeys.branchProducts(branchId), queryFn: () => posSalesApi.getBranchProducts(branchId) });
  const catalogQuery = useQuery({ queryKey: queryKeys.products, queryFn: () => posSalesApi.searchCatalogProducts({ pageSize: 100 }) });
  const [drafts, setDrafts] = useState<Record<string, { sellingPrice: string; costPrice: string; isAvailableForSale: boolean; displayOrder: string }>>({});
  const configure = useMutation({
    mutationFn: ({ productId, value }: { productId: string; value: BranchProduct }) => {
      const draft = drafts[productId];
      return posSalesApi.configureBranchProduct(branchId, productId, {
        sellingPrice: Number(draft?.sellingPrice ?? value.sellingPrice),
        costPrice: draft?.costPrice === '' ? undefined : Number(draft?.costPrice ?? value.costPrice ?? 0),
        isAvailableForSale: draft?.isAvailableForSale ?? value.isAvailableForSale,
        displayOrder: Number(draft?.displayOrder ?? value.displayOrder),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.branchProducts(branchId) }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'products', branchId] }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'catalog'] }),
      ]);
      toast.success('Cấu hình chi nhánh đã lưu.');
    },
    onError: notifyError,
  });
  const configuredById = new Map((productsQuery.data ?? []).map((product) => [product.productId, product]));
  const products = (catalogQuery.data?.items ?? []).filter((product) => product.isActive);
  const draftFor = (product: Product, configured?: BranchProduct) => drafts[product.id] ?? {
    sellingPrice: String(configured?.sellingPrice ?? product.defaultSellingPrice),
    costPrice: configured?.costPrice == null
      ? product.defaultCostPrice === null ? '' : String(product.defaultCostPrice)
      : String(configured.costPrice),
    isAvailableForSale: configured?.isAvailableForSale ?? false,
    displayOrder: String(configured?.displayOrder ?? 0),
  };
  return <Card><CardBody className="space-y-4">
    <div><h2 className="text-lg font-black text-slate-900">Giá và trạng thái theo chi nhánh</h2><p className="text-sm text-slate-500">Giá và trạng thái được cấu hình riêng cho chi nhánh đang chọn.</p></div>
    {productsQuery.isLoading || catalogQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải cấu hình...</p>
      : productsQuery.isError ? <ErrorPanel error={productsQuery.error} retry={() => void productsQuery.refetch()} />
        : catalogQuery.isError ? <ErrorPanel error={catalogQuery.error} retry={() => void catalogQuery.refetch()} />
          : products.length ? <Table><thead><tr><TableHead>SKU / sản phẩm</TableHead><TableHead>Giá bán</TableHead><TableHead>Giá vốn</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái bán</TableHead><TableHead></TableHead></tr></thead>
          <tbody>{products.map((product) => {
            const configured = configuredById.get(product.id);
            const draft = draftFor(product, configured);
            const rowProduct: BranchProduct = {
              productId: product.id,
              categoryId: product.categoryId,
              categoryName: product.categoryName,
              sku: product.sku,
              barcode: product.barcode,
              name: product.name,
              unit: product.unit,
              trackInventory: product.trackInventory,
              sellingPrice: Number(draft.sellingPrice),
              costPrice: draft.costPrice === '' ? null : Number(draft.costPrice),
              isAvailableForSale: draft.isAvailableForSale,
              displayOrder: Number(draft.displayOrder),
            };
            return <tr key={product.id}><TableCell>{product.sku}<br />{product.name}{configured ? '' : <span className="ml-2 text-xs text-amber-700">Chưa cấu hình</span>}</TableCell>
              <TableCell><input aria-label={`Giá bán ${product.name}`} className={`${inputClass} min-w-32`} type="number" min={0} step="0.01" value={draft.sellingPrice} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: { ...draft, sellingPrice: event.target.value } }))} /></TableCell>
              <TableCell><input aria-label={`Giá vốn ${product.name}`} className={`${inputClass} min-w-32`} type="number" min={0} step="0.01" value={draft.costPrice} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: { ...draft, costPrice: event.target.value } }))} /></TableCell>
              <TableCell><input aria-label={`Thứ tự ${product.name}`} className={`${inputClass} min-w-20`} type="number" min={0} step={1} value={draft.displayOrder} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: { ...draft, displayOrder: event.target.value } }))} /></TableCell>
              <TableCell><label className="flex items-center gap-2"><input type="checkbox" checked={draft.isAvailableForSale} onChange={(event) => setDrafts((current) => ({ ...current, [product.id]: { ...draft, isAvailableForSale: event.target.checked } }))} /> Cho bán</label></TableCell>
              <TableCell><Button size="sm" onClick={() => configure.mutate({ productId: product.id, value: rowProduct })} disabled={configure.isPending}>Lưu</Button></TableCell>
            </tr>;
          })}</tbody></Table> : <EmptyPanel>Chưa có sản phẩm cấu hình cho chi nhánh.</EmptyPanel>}
  </CardBody></Card>;
};

const InventoryPage = ({ branchId }: { branchId: string }) => {
  const canAdjust = useCan('inventory.adjust');
  const inventoryQuery = useQuery({ queryKey: queryKeys.inventory(branchId), queryFn: () => posSalesApi.getInventory(branchId) });
  const [reorder, setReorder] = useState<Record<string, string>>({});
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState('ADJUSTMENT_IN');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const saveReorder = useMutation({
    mutationFn: ({ item, value }: { item: InventoryBalance; value: string }) => posSalesApi.setReorderLevel(branchId, item.productId, Number(value)),
    onSuccess: async () => { await invalidateInventoryViews(branchId); toast.success('Ngưỡng đặt hàng đã cập nhật.'); },
    onError: notifyError,
  });
  const adjust = useMutation({
    mutationFn: () => posSalesApi.adjustInventory(branchId, { productId, movementType, quantity: Number(quantity), notes }),
    onSuccess: async () => {
      await invalidateInventoryViews(branchId);
      toast.success('Điều chỉnh tồn kho đã ghi nhận.'); setQuantity(''); setNotes('');
    },
    onError: notifyError,
  });
  const onAdjust = (event: FormEvent) => { event.preventDefault(); adjust.mutate(); };
  return <div className="space-y-5">
    <Card><CardBody className="space-y-4">
      <h2 className="text-lg font-black text-slate-900">Tồn kho chi nhánh</h2>
      {inventoryQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải tồn kho...</p>
        : inventoryQuery.isError ? <ErrorPanel error={inventoryQuery.error} retry={() => void inventoryQuery.refetch()} />
          : inventoryQuery.data?.items.length ? <Table><thead><tr><TableHead>SKU / sản phẩm</TableHead><TableHead>Hiện có</TableHead><TableHead>Đã giữ</TableHead><TableHead>Có thể bán</TableHead>{canAdjust && <><TableHead>Ngưỡng đặt hàng</TableHead><TableHead></TableHead></>}</tr></thead>
            <tbody>{inventoryQuery.data.items.map((item) => <tr key={item.productId}>
              <TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantityOnHand} {item.unit}</TableCell><TableCell>{item.quantityReserved}</TableCell><TableCell>{item.availableQuantity}</TableCell>
              {canAdjust && <><TableCell><input aria-label={`Ngưỡng ${item.productName}`} className={`${inputClass} min-w-24`} type="number" min={0} step="0.001" value={reorder[item.productId] ?? String(item.reorderLevel)} onChange={(event) => setReorder((current) => ({ ...current, [item.productId]: event.target.value }))} /></TableCell>
              <TableCell><Button size="sm" variant="outline" disabled={saveReorder.isPending} onClick={() => saveReorder.mutate({ item, value: reorder[item.productId] ?? String(item.reorderLevel) })}>Lưu</Button></TableCell></>}
            </tr>)}</tbody></Table> : <EmptyPanel>Chưa có dữ liệu tồn kho cho chi nhánh.</EmptyPanel>}
    </CardBody></Card>
    {canAdjust && <Card><CardBody>
      <h2 className="mb-4 text-lg font-black text-slate-900">Điều chỉnh tồn kho</h2>
      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={onAdjust}>
        <label className="block"><span className={labelClass}>Sản phẩm</span><select className={inputClass} value={productId} onChange={(event) => setProductId(event.target.value)} required><option value="">Chọn sản phẩm</option>{inventoryQuery.data?.items.map((item) => <option key={item.productId} value={item.productId}>{item.sku} — {item.productName}</option>)}</select></label>
        <label className="block"><span className={labelClass}>Loại điều chỉnh</span><select className={inputClass} value={movementType} onChange={(event) => setMovementType(event.target.value)}><option value="ADJUSTMENT_IN">Tăng tồn</option><option value="ADJUSTMENT_OUT">Giảm tồn</option><option value="DAMAGE">Hư hỏng</option></select></label>
        <Field label="Số lượng (dương)" type="number" value={quantity} onChange={setQuantity} min={0.001} step="0.001" required />
        <Field label="Ghi chú" value={notes} onChange={setNotes} required />
        <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={adjust.isPending || !inventoryQuery.data?.items.length}><Plus className="size-4" />{adjust.isPending ? 'Đang ghi nhận...' : 'Ghi nhận điều chỉnh'}</Button></div>
      </form>
    </CardBody></Card>}
  </div>;
};

const MovementsPage = ({ branchId }: { branchId: string }) => {
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const productsQuery = useQuery({ queryKey: queryKeys.branchProducts(branchId), queryFn: () => posSalesApi.getBranchProducts(branchId) });
  const filterKey = [productId, movementType, from, to].join('|');
  const movementsQuery = useQuery({
    queryKey: queryKeys.movements(branchId, filterKey),
    queryFn: () => posSalesApi.getMovements(branchId, {
      productId: productId || undefined,
      movementType: movementType || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
  });
  return <Card><CardBody className="space-y-4">
    <div><h2 className="text-lg font-black text-slate-900">Lịch sử biến động kho</h2><p className="text-sm text-slate-500">Mọi thay đổi tồn được ghi thành stock movement theo chi nhánh.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="block"><span className={labelClass}>Sản phẩm</span><select className={inputClass} value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Tất cả</option>{productsQuery.data?.map((item) => <option key={item.productId} value={item.productId}>{item.sku} — {item.name}</option>)}</select></label>
      <label className="block"><span className={labelClass}>Loại biến động</span><select className={inputClass} value={movementType} onChange={(event) => setMovementType(event.target.value)}><option value="">Tất cả</option>{['OPENING_BALANCE', 'GOODS_RECEIPT', 'SALE', 'SALE_RETURN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGE', 'TRANSFER_IN', 'TRANSFER_OUT'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <Field label="Từ ngày" type="date" value={from} onChange={setFrom} />
      <Field label="Đến ngày" type="date" value={to} onChange={setTo} />
    </div>
    {movementsQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải biến động...</p>
      : movementsQuery.isError ? <ErrorPanel error={movementsQuery.error} retry={() => void movementsQuery.refetch()} />
        : movementsQuery.data?.items.length ? <MovementTable movements={movementsQuery.data.items} /> : <EmptyPanel>Không có biến động kho phù hợp.</EmptyPanel>}
  </CardBody></Card>;
};

const MovementTable = ({ movements }: { movements: StockMovement[] }) => (
  <Table><thead><tr><TableHead>Thời gian</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Loại</TableHead><TableHead>Thay đổi</TableHead><TableHead>Tồn trước → sau</TableHead><TableHead>Tham chiếu / ghi chú</TableHead></tr></thead>
    <tbody>{movements.map((movement) => <tr key={movement.id}><TableCell>{new Date(movement.createdAt).toLocaleString('vi-VN')}</TableCell><TableCell>{movement.sku}<br />{movement.productName}</TableCell><TableCell>{movement.movementType}</TableCell><TableCell>{movement.quantity} {movement.quantity < 0 ? '−' : '+'}</TableCell><TableCell>{movement.quantityBefore} → {movement.quantityAfter}</TableCell><TableCell>{movement.referenceType ?? '—'}{movement.notes ? <><br />{movement.notes}</> : null}</TableCell></tr>)}</tbody>
  </Table>
);

const ReceiptsPage = ({ branchId }: { branchId: string }) => {
  const canReceive = useCan('inventory.receive');
  const receiptsQuery = useQuery({ queryKey: queryKeys.receipts(branchId), queryFn: () => posSalesApi.getReceipts(branchId) });
  return <Card><CardBody className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">Phiếu nhập hàng</h2><p className="text-sm text-slate-500">Phiếu nháp chỉ làm thay đổi tồn sau khi được ghi sổ.</p></div>{canReceive && <Link to={paths.posReceiptCreate}><Button><Plus className="size-4" />Tạo phiếu nhập</Button></Link>}</div>
    {receiptsQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải phiếu nhập...</p>
      : receiptsQuery.isError ? <ErrorPanel error={receiptsQuery.error} retry={() => void receiptsQuery.refetch()} />
        : receiptsQuery.data?.items.length ? <Table><thead><tr><TableHead>Mã phiếu</TableHead><TableHead>Nhà cung cấp</TableHead><TableHead>Trạng thái</TableHead><TableHead>Tổng giá vốn</TableHead><TableHead>Ngày tạo</TableHead><TableHead></TableHead></tr></thead>
          <tbody>{receiptsQuery.data.items.map((receipt) => <tr key={receipt.id}><TableCell>{receipt.receiptCode}</TableCell><TableCell>{receipt.supplierName ?? '—'}</TableCell><TableCell>{receipt.status}</TableCell><TableCell>{amount(receipt.totalCost)}</TableCell><TableCell>{new Date(receipt.createdAt).toLocaleString('vi-VN')}</TableCell><TableCell><Link className="font-bold text-emerald-700 hover:underline" to={paths.posReceiptDetail(receipt.id)}>Chi tiết</Link></TableCell></tr>)}</tbody>
        </Table> : <EmptyPanel>Chưa có phiếu nhập hàng.</EmptyPanel>}
  </CardBody></Card>;
};

type ReceiptLine = { productId: string; quantity: string; unitCost: string };

const ReceiptEditorPage = ({ branchId }: { branchId: string }) => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(receiptId && receiptId !== 'new');
  const productsQuery = useQuery({ queryKey: queryKeys.branchProducts(branchId), queryFn: () => posSalesApi.getBranchProducts(branchId) });
  const receiptQuery = useQuery({
    queryKey: queryKeys.receipt(branchId, receiptId ?? ''),
    queryFn: () => posSalesApi.getReceipt(branchId, receiptId!),
    enabled: isEdit,
  });
  const [supplierName, setSupplierName] = useState('');
  const [supplierReference, setSupplierReference] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiptLine[]>([{ productId: '', quantity: '1', unitCost: '0' }]);
  const loadedReceiptId = receiptQuery.data?.id;
  useEffect(() => {
    if (!receiptQuery.data || receiptQuery.data.id !== loadedReceiptId) return;
    setSupplierName(receiptQuery.data.supplierName ?? '');
    setSupplierReference(receiptQuery.data.supplierReference ?? '');
    setNotes(receiptQuery.data.notes ?? '');
    setItems(receiptQuery.data.items?.map((item) => ({ productId: item.productId, quantity: String(item.quantity), unitCost: String(item.unitCost) })) ?? []);
  }, [loadedReceiptId, receiptQuery.data]);
  const save = useMutation({
    mutationFn: () => {
      const input = {
        supplierName: supplierName || undefined,
        supplierReference: supplierReference || undefined,
        notes: notes || undefined,
        items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity), unitCost: Number(item.unitCost) })),
      };
      return isEdit ? posSalesApi.updateReceipt(branchId, receiptId!, input) : posSalesApi.createReceipt(branchId, input);
    },
    onSuccess: async (receipt) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receipts(branchId) }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'receipts', branchId] }),
      ]);
      toast.success(isEdit ? 'Phiếu nháp đã được cập nhật.' : 'Phiếu nháp đã được tạo.');
      navigate(paths.posReceiptDetail(receipt.id));
    },
    onError: notifyError,
  });
  const addLine = () => setItems((current) => [...current, { productId: '', quantity: '1', unitCost: '0' }]);
  const updateLine = (index: number, patch: Partial<ReceiptLine>) => setItems((current) => current.map((item, row) => row === index ? { ...item, ...patch } : item));
  const onSubmit = (event: FormEvent) => { event.preventDefault(); save.mutate(); };
  if (isEdit && receiptQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải phiếu...</p></CardBody></Card>;
  if (isEdit && receiptQuery.isError) return <ErrorPanel error={receiptQuery.error} retry={() => void receiptQuery.refetch()} />;
  if (productsQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải sản phẩm...</p></CardBody></Card>;
  if (productsQuery.isError) return <ErrorPanel error={productsQuery.error} retry={() => void productsQuery.refetch()} />;
  if (isEdit && receiptQuery.data?.status !== 'DRAFT') return <Card><CardBody><p className="text-sm text-slate-700">Chỉ phiếu nhập ở trạng thái nháp mới được chỉnh sửa.</p><Link className="mt-3 inline-block font-bold text-emerald-700" to={paths.posReceiptDetail(receiptId!)}>Xem phiếu</Link></CardBody></Card>;
  return <Card><CardBody>
    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">{isEdit ? 'Sửa phiếu nhập nháp' : 'Tạo phiếu nhập nháp'}</h2><Link to={paths.posReceipts} className="text-sm font-bold text-emerald-700">Quay lại danh sách</Link></div>
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Nhà cung cấp" value={supplierName} onChange={setSupplierName} /><Field label="Mã tham chiếu nhà cung cấp" value={supplierReference} onChange={setSupplierReference} /><div className="sm:col-span-2"><Field label="Ghi chú" value={notes} onChange={setNotes} /></div></div>
      <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-800">Sản phẩm nhận</h3><Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="size-4" />Thêm dòng</Button></div>
        {items.map((item, index) => <div key={`${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
          <label className="block sm:col-span-2"><span className={labelClass}>Sản phẩm</span><select className={inputClass} value={item.productId} required onChange={(event) => updateLine(index, { productId: event.target.value })}><option value="">Chọn sản phẩm</option>{productsQuery.data?.filter((product) => product.trackInventory).map((product) => <option key={product.productId} value={product.productId}>{product.sku} — {product.name}</option>)}</select></label>
          <Field label="Số lượng" type="number" value={item.quantity} onChange={(value) => updateLine(index, { quantity: value })} min={0.001} step="0.001" required />
          <div className="flex gap-2"><Field label="Đơn giá vốn" type="number" value={item.unitCost} onChange={(value) => updateLine(index, { unitCost: value })} min={0} step="0.01" required /><Button type="button" variant="outline" className="mt-6" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, row) => row !== index))}>Xóa</Button></div>
        </div>)}
      </div>
      <Button type="submit" disabled={save.isPending || !productsQuery.data?.some((product) => product.trackInventory) || new Set(items.map((item) => item.productId).filter(Boolean)).size !== items.filter((item) => item.productId).length}><Save className="size-4" />{save.isPending ? 'Đang lưu...' : 'Lưu phiếu nháp'}</Button>
    </form>
  </CardBody></Card>;
};

const ReceiptDetailPage = ({ branchId }: { branchId: string }) => {
  const { receiptId = '' } = useParams();
  const receiptQuery = useQuery({ queryKey: queryKeys.receipt(branchId, receiptId), queryFn: () => posSalesApi.getReceipt(branchId, receiptId), enabled: Boolean(receiptId) });
  const post = useMutation({
    mutationFn: () => posSalesApi.postReceipt(branchId, receiptId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receipt(branchId, receiptId) }),
        invalidateInventoryViews(branchId),
      ]);
      toast.success('Phiếu đã ghi sổ và tồn kho đã được cập nhật.');
    }, onError: notifyError,
  });
  const cancel = useMutation({
    mutationFn: () => posSalesApi.cancelReceipt(branchId, receiptId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.receipt(branchId, receiptId) }),
        invalidateInventoryViews(branchId),
      ]);
      toast.success('Phiếu nháp đã hủy.');
    }, onError: notifyError,
  });
  if (receiptQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải phiếu nhập...</p></CardBody></Card>;
  if (receiptQuery.isError) return <ErrorPanel error={receiptQuery.error} retry={() => void receiptQuery.refetch()} />;
  const receipt = receiptQuery.data;
  if (!receipt) return <EmptyPanel>Không tìm thấy phiếu nhập.</EmptyPanel>;
  return <Card><CardBody className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={paths.posReceipts} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" />Danh sách phiếu</Link><h2 className="mt-3 text-xl font-black text-slate-900">{receipt.receiptCode}</h2><p className="text-sm text-slate-600">{receipt.supplierName ?? 'Không có nhà cung cấp'} · {receipt.status}</p></div>
    {receipt.status === 'DRAFT' && <ReceiptActions receipt={receipt} postPending={post.isPending} cancelPending={cancel.isPending} onPost={() => post.mutate()} onCancel={() => cancel.mutate()} />}
    </div>
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><b>Mã tham chiếu:</b> {receipt.supplierReference ?? '—'}</p><p><b>Ngày tạo:</b> {new Date(receipt.createdAt).toLocaleString('vi-VN')}</p><p><b>Tổng giá vốn:</b> {amount(receipt.totalCost)}</p>{receipt.notes && <p className="sm:col-span-3"><b>Ghi chú:</b> {receipt.notes}</p>}</div>
    {receipt.items?.length ? <Table><thead><tr><TableHead>SKU / sản phẩm</TableHead><TableHead>Số lượng</TableHead><TableHead>Đơn giá vốn</TableHead><TableHead>Thành tiền</TableHead></tr></thead><tbody>{receipt.items.map((item) => <tr key={item.productId}><TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{amount(item.unitCost)}</TableCell><TableCell>{amount(item.lineTotal)}</TableCell></tr>)}</tbody></Table> : <EmptyPanel>Phiếu chưa có dòng sản phẩm.</EmptyPanel>}
    {receipt.status !== 'DRAFT' && <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">Phiếu {receipt.status === 'POSTED' ? 'đã ghi sổ' : 'đã hủy'} ở chế độ chỉ đọc; lịch sử tồn kho được lưu trong biến động kho.</p>}
  </CardBody></Card>;
};

const ReceiptActions = ({
  receipt,
  postPending,
  cancelPending,
  onPost,
  onCancel,
}: {
  receipt: { id: string; status: string };
  postPending: boolean;
  cancelPending: boolean;
  onPost: () => void;
  onCancel: () => void;
}) => {
  const canReceive = useCan('inventory.receive');
  const canPost = useCan('inventory.post_receipt');
  return <div className="flex flex-wrap gap-2">
    {canReceive && <><Link to={paths.posReceiptEdit(receipt.id)}><Button variant="outline">Sửa nháp</Button></Link><Button variant="outline" disabled={cancelPending} onClick={() => { if (window.confirm('Hủy phiếu nhập nháp này?')) onCancel(); }}>Hủy phiếu</Button></>}
    {canPost && <Button disabled={postPending} onClick={() => { if (window.confirm('Ghi sổ phiếu này và cộng tồn kho? Thao tác không thể hoàn tác.')) onPost(); }}>{postPending ? 'Đang ghi sổ...' : 'Ghi sổ'}</Button>}
  </div>;
};

const OrdersPage = ({ branchId }: { branchId: string }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const ordersQuery = useQuery({ queryKey: [...queryKeys.orders(branchId), search, status], queryFn: () => posSalesApi.searchOrders(branchId, { search: search || undefined, status: status || undefined }) });
  return <Card><CardBody className="space-y-4">
    <div><h2 className="text-lg font-black text-slate-900">Đơn bán hàng</h2><p className="text-sm text-slate-500">Tra cứu đơn bán theo phạm vi chi nhánh.</p></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Tìm mã đơn / khách hàng" value={search} onChange={setSearch} /><label className="block"><span className={labelClass}>Trạng thái</span><select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Tất cả</option><option value="COMPLETED">Hoàn thành</option><option value="CANCELLED">Đã hủy</option></select></label></div>
    {ordersQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải đơn hàng...</p>
      : ordersQuery.isError ? <ErrorPanel error={ordersQuery.error} retry={() => void ordersQuery.refetch()} />
        : ordersQuery.data?.items.length ? <Table><thead><tr><TableHead>Mã đơn</TableHead><TableHead>Khách hàng</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thanh toán</TableHead><TableHead>Tổng tiền</TableHead><TableHead>Ngày tạo</TableHead><TableHead></TableHead></tr></thead>
          <tbody>{ordersQuery.data.items.map((order) => <tr key={order.id}><TableCell>{order.orderCode}</TableCell><TableCell>{order.customerName ?? 'Khách lẻ'}</TableCell><TableCell>{order.status}</TableCell><TableCell>{order.paymentStatus} · {order.paymentMethodCode}</TableCell><TableCell>{amount(order.totalAmount)}</TableCell><TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell><TableCell><Link className="font-bold text-emerald-700 hover:underline" to={paths.posOrderDetail(order.id)}>Chi tiết</Link></TableCell></tr>)}</tbody></Table>
          : <EmptyPanel>Không tìm thấy đơn bán hàng.</EmptyPanel>}
  </CardBody></Card>;
};

const OrderDetailPage = ({ branchId, roles }: { branchId: string; roles: string[] }) => {
  const { orderId = '' } = useParams();
  const orderQuery = useQuery({ queryKey: queryKeys.order(branchId, orderId), queryFn: () => posSalesApi.getOrder(branchId, orderId), enabled: Boolean(orderId) });
  const cancel = useMutation({
    mutationFn: () => posSalesApi.cancelOrder(branchId, orderId, 'Cancelled by branch administrator'),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.order(branchId, orderId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.orders(branchId) }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'orders', branchId] }),
        queryClient.invalidateQueries({ queryKey: ['pos-sales', 'report', branchId] }),
        invalidateInventoryViews(branchId),
      ]);
      toast.success('Đơn hàng đã hủy và hoàn kho.');
    },
    onError: notifyError,
  });
  if (orderQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải đơn hàng...</p></CardBody></Card>;
  if (orderQuery.isError) return <ErrorPanel error={orderQuery.error} retry={() => void orderQuery.refetch()} />;
  const order = orderQuery.data;
  if (!order) return <EmptyPanel>Không tìm thấy đơn hàng.</EmptyPanel>;
  const canCancel = canUse(roles, 'sales.cancel') && canUse(roles, 'sales.refund') && order.status === 'COMPLETED';
  return <Card><CardBody className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={paths.posOrders} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" />Danh sách đơn</Link><h2 className="mt-3 text-xl font-black text-slate-900">{order.orderCode}</h2></div>
      <div className="flex flex-wrap gap-2">{order.invoiceId && <Link to={paths.posInvoice(order.invoiceId)}><Button variant="outline"><FileText className="size-4" />Hóa đơn</Button></Link>}{canCancel && <Button variant="outline" disabled={cancel.isPending} onClick={() => { if (window.confirm('Hủy đơn và hoàn kho toàn bộ sản phẩm?')) cancel.mutate(); }}>Hủy đơn / hoàn tiền</Button>}</div>
    </div>
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><b>Khách hàng:</b> {order.customerName ?? 'Khách lẻ'}</p><p><b>Booking tham chiếu:</b> {order.bookingId ?? '—'}</p><p><b>Trạng thái:</b> {order.status}</p><p><b>Thanh toán:</b> {order.paymentStatus} · {order.paymentMethodCode}</p><p><b>Ngày tạo:</b> {new Date(order.createdAt).toLocaleString('vi-VN')}</p><p><b>Hoàn tất:</b> {order.completedAt ? new Date(order.completedAt).toLocaleString('vi-VN') : '—'}</p>{order.notes && <p className="sm:col-span-3"><b>Ghi chú:</b> {order.notes}</p>}</div>
    <Table><thead><tr><TableHead>Sản phẩm</TableHead><TableHead>Số lượng</TableHead><TableHead>Đơn giá</TableHead><TableHead>Thành tiền</TableHead></tr></thead><tbody>{order.items.map((item, index) => <tr key={`${item.productId}-${index}`}><TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{amount(item.unitPrice)}</TableCell><TableCell>{amount(item.lineTotal)}</TableCell></tr>)}</tbody></Table>
    <div className="ml-auto max-w-sm space-y-1 text-right text-sm"><p>Tạm tính: {amount(order.subtotalAmount)}</p><p>Giảm giá: {amount(order.discountAmount)}</p><p className="text-lg font-black">Tổng cộng: {amount(order.totalAmount)}</p><p>Đã thanh toán: {amount(order.paidAmount)}</p></div>
  </CardBody></Card>;
};

const SalesDashboardPage = ({ branchId }: { branchId: string }) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 29);
  const [from, setFrom] = useState(thirtyDaysAgo.toISOString().slice(0, 10));
  const [to, setTo] = useState(today.toISOString().slice(0, 10));
  const reportQuery = useQuery({ queryKey: queryKeys.report(branchId, from, to), queryFn: () => posSalesApi.getReport(branchId, from, to) });
  return <Card><CardBody className="space-y-5">
    <div><h2 className="text-lg font-black text-slate-900">Báo cáo bán hàng</h2><p className="text-sm text-slate-500">Doanh thu, hoàn tiền, doanh thu thuần và sản phẩm bán chạy theo chi nhánh.</p></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Từ ngày" type="date" value={from} onChange={setFrom} /><Field label="Đến ngày" type="date" value={to} onChange={setTo} /></div>
    {reportQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải báo cáo...</p>
      : reportQuery.isError ? <ErrorPanel error={reportQuery.error} retry={() => void reportQuery.refetch()} />
        : reportQuery.data && <SalesReportView report={reportQuery.data} />}
  </CardBody></Card>;
};

const SalesReportView = ({ report }: { report: SalesReport }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[['Số đơn hoàn tất', String(report.completedOrderCount)], ['Doanh thu gộp', amount(report.grossSales)], ['Hoàn tiền', amount(report.refunds)], ['Doanh thu thuần', amount(report.netSales)]].map(([label, value]) => <div key={label} className="rounded-xl bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-900">{label}</p><p className="mt-1 text-xl font-black text-emerald-950">{value}</p></div>)}
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <div><h3 className="mb-3 font-bold text-slate-800">Theo ngày</h3>{report.dailySales.length ? <Table><thead><tr><TableHead>Ngày (UTC)</TableHead><TableHead>Số đơn</TableHead><TableHead>Doanh thu gộp</TableHead><TableHead>Hoàn tiền</TableHead></tr></thead><tbody>{report.dailySales.map((row) => <tr key={row.date}><TableCell>{row.date}</TableCell><TableCell>{row.orderCount}</TableCell><TableCell>{amount(row.grossSales)}</TableCell><TableCell>{amount(row.refunds)}</TableCell></tr>)}</tbody></Table> : <EmptyPanel>Không có số liệu trong khoảng ngày này.</EmptyPanel>}</div>
      <div><h3 className="mb-3 font-bold text-slate-800">10 sản phẩm bán chạy</h3>{report.topProducts.length ? <Table><thead><tr><TableHead>Sản phẩm</TableHead><TableHead>Số lượng</TableHead><TableHead>Doanh thu</TableHead></tr></thead><tbody>{report.topProducts.map((item) => <tr key={item.productId}><TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantitySold}</TableCell><TableCell>{amount(item.grossSales)}</TableCell></tr>)}</tbody></Table> : <EmptyPanel>Chưa có sản phẩm bán ra trong kỳ.</EmptyPanel>}</div>
    </div>
  </div>
);

const InvoicePage = ({ branchId }: { branchId: string }) => {
  const canPrint = useCan('sales.invoice.print');
  const { invoiceId = '' } = useParams();
  const invoiceQuery = useQuery({ queryKey: queryKeys.invoice(branchId, invoiceId), queryFn: () => posSalesApi.getInvoice(branchId, invoiceId), enabled: Boolean(invoiceId) });
  const [pdfPreview, setPdfPreview] = useState<{ key: string; url: string } | null>(null);
  const [pdfError, setPdfError] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const invoiceKey = `${branchId}:${invoiceId}`;
  const pdfUrl = pdfPreview?.key === invoiceKey ? pdfPreview.url : '';
  const loadPreview = async () => {
    setIsPdfLoading(true);
    setPdfError('');
    try {
      const blob = await posSalesApi.getInvoicePdf(branchId, invoiceId);
      setPdfPreview({ key: invoiceKey, url: URL.createObjectURL(blob) });
    } catch (error) {
      setPdfError(errorMessage(error));
    } finally {
      setIsPdfLoading(false);
    }
  };
  useEffect(() => () => { if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url); }, [pdfPreview]);
  const download = async () => {
    try {
      const blob = await posSalesApi.getInvoicePdf(branchId, invoiceId, true);
        const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) { notifyError(error); }
  };
  const print = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    if (!printWindow) toast.error('Không thể mở hóa đơn', 'Vui lòng cho phép cửa sổ bật lên để in.');
  };
  if (invoiceQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải hóa đơn...</p></CardBody></Card>;
  if (invoiceQuery.isError) return <ErrorPanel error={invoiceQuery.error} retry={() => void invoiceQuery.refetch()} />;
  const invoice = invoiceQuery.data;
  if (!invoice) return <EmptyPanel>Không tìm thấy hóa đơn.</EmptyPanel>;
  return <Card><CardBody className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={paths.posOrders} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" />Đơn bán hàng</Link><h2 className="mt-3 text-xl font-black text-slate-900">Hóa đơn {invoice.invoiceNumber}</h2><p className="text-sm text-slate-500">Bản chụp hóa đơn bất biến · {new Date(invoice.issuedAt).toLocaleString('vi-VN')}</p></div>
      <div className="flex flex-wrap gap-2">{canPrint && <><Button variant="outline" onClick={() => void loadPreview()} disabled={isPdfLoading}>{isPdfLoading ? 'Đang tải...' : 'Xem trước'}</Button><Button variant="outline" onClick={() => void download()}>Tải PDF</Button><Button onClick={print} disabled={!pdfUrl}>In / in lại</Button></>}</div>
    </div>
    {pdfError && <ErrorPanel error={new Error(pdfError)} retry={() => void loadPreview()} />}
    {pdfUrl && <iframe title={`Xem trước hóa đơn ${invoice.invoiceNumber}`} src={pdfUrl} className="h-[70vh] w-full rounded-xl border border-slate-200" />}
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><p><b>Chi nhánh:</b> {invoice.branchName}</p><p><b>Thu ngân:</b> {invoice.cashierName}</p><p><b>Khách hàng:</b> {invoice.customerName ?? 'Khách lẻ'}</p><p><b>Thanh toán:</b> {invoice.paymentStatus} · {invoice.paymentMethodCode}</p>{invoice.branchAddress && <p><b>Địa chỉ:</b> {invoice.branchAddress}</p>}{invoice.branchPhone && <p><b>Điện thoại:</b> {invoice.branchPhone}</p>}</div>
    <Table><thead><tr><TableHead>Sản phẩm</TableHead><TableHead>Số lượng</TableHead><TableHead>Đơn giá</TableHead><TableHead>Thành tiền</TableHead></tr></thead><tbody>{invoice.items.map((item, index) => <tr key={`${item.sku}-${index}`}><TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{amount(item.unitPrice)}</TableCell><TableCell>{amount(item.lineTotal)}</TableCell></tr>)}</tbody></Table>
    <div className="ml-auto max-w-sm space-y-1 text-right text-sm"><p>Tạm tính: {amount(invoice.subtotalAmount)}</p><p>Giảm giá: {amount(invoice.discountAmount)}</p><p className="text-lg font-black">Tổng cộng: {amount(invoice.totalAmount)}</p></div>
  </CardBody></Card>;
};

export default CommerceManagementPage;
