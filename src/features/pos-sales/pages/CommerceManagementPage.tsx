import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Boxes,
  FileText,
  Package,
  Plus,
  RefreshCw,
  Save,
  Tags,
  Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TablePagination } from '@/components/management';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardBody } from '@/components/ui/card';
import { queryClient } from '@/lib/query-client';
import { toast } from '@/lib/toast';
import { useAuthorization } from '@/features/auth/authorization';
import { PERMISSIONS as P } from '@/shared/constants/permissions';
import { paths } from '@/app/router/paths';
import { inventoryWorkspaceTitle, productCatalogTitle } from '@/components/layout/management-navigation';
import { posSalesApi } from '../api';
import { loadInventory } from '../inventory-overview';
import { PosWorkspaceHeader, PosWorkspaceTabs } from '../components/PosWorkspaceShell';
import type { Product, ProductCategory, StockMovement } from '../types';

type Section =
  | 'categories'
  | 'products'
  | 'inventory'
  | 'movements'
  | 'receipts'
  | 'receipt-edit'
  | 'receipt-detail'
  | 'orders'
  | 'order-detail'
  | 'invoice';

const sectionLinks: Array<{
  section: Section;
  path: string;
  label: string;
  icon: typeof Tags;
  permissions: string[];
}> = [
  { section: 'categories', path: paths.posCategories, label: 'Danh mục', icon: Tags, permissions: [P.PRODUCT_VIEW] },
  { section: 'products', path: paths.posProducts, label: 'Sản phẩm', icon: Package, permissions: [P.PRODUCT_VIEW] },
  { section: 'inventory', path: paths.posInventory, label: 'Tồn kho', icon: Boxes, permissions: [P.INVENTORY_VIEW] },
  { section: 'receipts', path: paths.posReceipts, label: 'Nhập', icon: Truck, permissions: [P.INVENTORY_VIEW] },
  { section: 'movements', path: paths.posMovements, label: 'Xuất', icon: RefreshCw, permissions: [P.INVENTORY_VIEW] },
];

const catalogSections = ['categories', 'products'];
const inventorySections = ['inventory', 'movements', 'receipts'];

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
  'h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const amount = (value: number) => currency.format(value);

const errorMessage = (error: unknown) => {
  if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
    return 'Bạn không có quyền truy cập dữ liệu hoặc chi nhánh này.';
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};

const notifyError = (error: unknown) => toast.error('Không thể hoàn tất', errorMessage(error));

const useCan = (permission: string) => useAuthorization().hasPermission(permission);

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

const TableHead = ({ children }: { children?: ReactNode }) => (
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
  const { hasAllPermissions } = useAuthorization();
  const activeSection = section === 'receipt-detail' || section === 'receipt-edit'
    ? 'receipts' : section === 'order-detail' || section === 'invoice' ? 'orders' : section;
  const workspace = catalogSections.includes(activeSection)
    ? {
        title: productCatalogTitle,
        description: 'Quản lý danh mục, sản phẩm và theo dõi tồn kho theo chi nhánh.',
        icon: Tags,
        sections: catalogSections,
      }
    : inventorySections.includes(activeSection)
      ? {
          title: inventoryWorkspaceTitle,
          description: 'Theo dõi tồn kho, nhập hàng và các lượt xuất hàng từ bán hàng.',
          icon: Boxes,
          sections: inventorySections,
        }
      : {
          title: 'Đơn bán hàng',
          description: 'Theo dõi đơn bán hàng và xem hóa đơn theo chi nhánh.',
          icon: FileText,
          sections: [],
        };
  const visibleLinks = sectionLinks.filter((link) =>
    workspace.sections.includes(link.section) && hasAllPermissions(link.permissions),
  );

  return (
    <div className="pos-workspace min-w-0 space-y-4 py-4 sm:py-5">
      <PosWorkspaceHeader
        title={workspace.title}
        description={workspace.description}
        icon={workspace.icon}
        branchId={branchId}
        onBranchChange={setBranchId}
      />
      {visibleLinks.length > 0 && <PosWorkspaceTabs
        ariaLabel={workspace.title}
        tabs={visibleLinks.map(({ section: linkSection, path, label, icon }) => ({
          id: linkSection,
          to: path,
          label,
          icon,
          active: activeSection === linkSection,
        }))}
      />}
      {!branchId && section !== 'categories' && section !== 'products' ? (
        <Card><CardBody><EmptyPanel>Vui lòng chọn chi nhánh được phân quyền để xem dữ liệu.</EmptyPanel></CardBody></Card>
      ) : children}
    </div>
  );
};

const CommerceManagementPage = ({ section }: { section: Section }) => {
  const [params, setParams] = useSearchParams();
  const requestedOrderBranch = section === 'orders' || section === 'order-detail' || section === 'invoice'
    ? params.get('branchId') : null;
  const [branchId, setBranchId] = useState(() => localStorage.getItem('pos-sales.branchId') ?? '');
  const handleBranchChange = (nextBranchId: string) => {
    setBranchId(nextBranchId);
    localStorage.setItem('pos-sales.branchId', nextBranchId);
    if (requestedOrderBranch) setParams({ branchId: nextBranchId }, { replace: true });
  };
  const activeBranchId = requestedOrderBranch || branchId;

  return (
    <ManagementFrame section={section} branchId={activeBranchId} setBranchId={handleBranchChange}>
      {section === 'categories' && <CategoriesPage />}
      {section === 'products' && <ProductsPage branchId={branchId} />}
      {section === 'inventory' && <InventoryPage key={branchId} branchId={branchId} />}
      {section === 'movements' && <StockHistory key={branchId} branchId={branchId} direction="out" />}
      {section === 'receipts' && <StockHistory key={branchId} branchId={branchId} direction="in" />}
      {section === 'receipt-edit' && <ReceiptEditorPage branchId={branchId} />}
      {section === 'receipt-detail' && <ReceiptDetailPage branchId={branchId} />}
      {section === 'orders' && <OrdersPage branchId={activeBranchId} />}
      {section === 'order-detail' && <OrderDetailPage branchId={activeBranchId} />}
      {section === 'invoice' && <InvoicePage branchId={activeBranchId} />}
    </ManagementFrame>
  );
};

const CategoriesPage = () => {
  const canCreate = useCan(P.PRODUCT_CREATE);
  const canUpdate = useCan(P.PRODUCT_UPDATE);
  const canDeactivate = useCan(P.PRODUCT_DEACTIVATE);
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories, queryFn: () => posSalesApi.getCategories() });
  const [formOpen, setFormOpen] = useState(false);
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
      setFormOpen(false);
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
    <div className="space-y-5">
      <Card><CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">Danh mục sản phẩm</h2>
          {canCreate && <Button type="button" onClick={() => { reset(); setFormOpen(true); }}>
            <Plus aria-hidden className="size-4" />Thêm danh mục mới
          </Button>}
        </div>
        {categoriesQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải danh mục...</p>
          : categoriesQuery.isError ? <ErrorPanel error={categoriesQuery.error} retry={() => void categoriesQuery.refetch()} />
            : categoriesQuery.data?.length ? (
              <Table><thead><tr><TableHead>Mã danh mục</TableHead><TableHead>Tên danh mục</TableHead><TableHead>Thứ tự</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></tr></thead>
                <tbody>{categoriesQuery.data.map((category) => <tr key={category.id}>
                  <TableCell>{category.code}</TableCell><TableCell>{category.name}</TableCell><TableCell>{category.displayOrder}</TableCell>
                  <TableCell>{category.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</TableCell>
                  <TableCell><div className="flex gap-2">
                    {canUpdate && <Button size="sm" variant="outline" onClick={() => { setFormOpen(true); setEditing(category); setCode(category.code); setName(category.name); setDescription(category.description ?? ''); setDisplayOrder(String(category.displayOrder)); setIsActive(category.isActive); }}>Sửa</Button>}
                    {canDeactivate && category.isActive && <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Ngừng hoạt động danh mục "${category.name}"?`)) deactivate.mutate(category.id); }}>Ngừng</Button>}
                  </div></TableCell>
                </tr>)}</tbody>
              </Table>
            ) : <EmptyPanel>Chưa có danh mục sản phẩm.</EmptyPanel>}
      </CardBody></Card>
      {formOpen && (
        <Dialog open onOpenChange={(open) => { if (!open && !save.isPending) setFormOpen(false); }}>
          <DialogContent closeDisabled={save.isPending} className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
            <DialogHeader><DialogTitle>{editing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <Field label="Mã danh mục" value={code} onChange={setCode} required />
          <Field label="Tên danh mục" value={name} onChange={setName} required />
          <Field label="Mô tả" value={description} onChange={setDescription} />
          <Field label="Thứ tự hiển thị" type="number" value={displayOrder} onChange={setDisplayOrder} min={0} step={1} required />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Đang hoạt động</label>
          <div className="flex gap-2"><Button type="submit" disabled={save.isPending}><Save className="size-4" />{save.isPending ? 'Đang lưu...' : 'Lưu'}</Button><Button type="button" variant="outline" disabled={save.isPending} onClick={() => setFormOpen(false)}>Hủy</Button></div>
        </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const ProductsPage = ({ branchId }: { branchId: string }) => {
  const canViewInventory = useCan(P.INVENTORY_VIEW);
  const balances = useQuery({
    queryKey: [...queryKeys.inventory(branchId), 'product-list'],
    queryFn: () => loadInventory((page) => posSalesApi.getInventory(branchId, { page })),
    enabled: !!branchId && canViewInventory,
  });
  const stockByProduct = new Map(balances.data?.map((item) => [item.productId, item.quantityOnHand]));
  const canCreate = useCan(P.PRODUCT_CREATE);
  const canUpdate = useCan(P.PRODUCT_UPDATE);
  const canDeactivate = useCan(P.PRODUCT_DEACTIVATE);
  const categoriesQuery = useQuery({ queryKey: queryKeys.categories, queryFn: () => posSalesApi.getCategories() });
  const productsQuery = useQuery({ queryKey: queryKeys.products, queryFn: () => posSalesApi.searchCatalogProducts({ pageSize: 100 }) });
  const [formOpen, setFormOpen] = useState(false);
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
      setFormOpen(false);
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
    setFormOpen(true); setEditing(product); setCategoryId(product.categoryId); setSku(product.sku); setBarcode(product.barcode ?? '');
    setName(product.name); setDescription(product.description ?? ''); setUnit(product.unit);
    setCost(product.defaultCostPrice === null ? '' : String(product.defaultCostPrice));
    setPrice(String(product.defaultSellingPrice)); setTrackInventory(product.trackInventory); setActive(product.isActive);
  };
  return (
    <div className="space-y-5">
      <Card><CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">Danh sách sản phẩm</h2>
          {canCreate && <Button type="button" onClick={() => { reset(); setFormOpen(true); }}>
            <Plus aria-hidden className="size-4" />Thêm sản phẩm mới
          </Button>}
        </div>
        {balances.isError && <ErrorPanel error={balances.error} retry={() => void balances.refetch()} />}
        {productsQuery.isLoading || categoriesQuery.isLoading ? <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải sản phẩm...</p>
          : productsQuery.isError ? <ErrorPanel error={productsQuery.error} retry={() => void productsQuery.refetch()} />
            : categoriesQuery.isError ? <ErrorPanel error={categoriesQuery.error} retry={() => void categoriesQuery.refetch()} />
              : productsQuery.data?.items.length ? (
                <Table><thead><tr><TableHead>SKU / Barcode</TableHead><TableHead>Danh mục</TableHead><TableHead>Tên sản phẩm</TableHead><TableHead>Đơn vị</TableHead><TableHead>Giá bán</TableHead><TableHead>Tồn kho</TableHead><TableHead>Trạng thái</TableHead><TableHead>Thao tác</TableHead></tr></thead>
                  <tbody>{productsQuery.data.items.map((product) => <tr key={product.id}>
                    <TableCell><span className="font-semibold">{product.sku}</span><br />{product.barcode ?? '—'}</TableCell>
                    <TableCell>{product.categoryName}</TableCell>
                    <TableCell>{product.name}</TableCell><TableCell>{product.unit}</TableCell>
                    <TableCell>{amount(product.defaultSellingPrice)}</TableCell>
                    <TableCell>{stockByProduct.get(product.id) ?? '—'}</TableCell><TableCell>{product.isActive ? 'Hoạt động' : 'Đã ẩn'}</TableCell>
                    <TableCell><div className="flex gap-2">{canUpdate && <Button size="sm" variant="outline" onClick={() => startEdit(product)}>Sửa</Button>}{canDeactivate && product.isActive && <Button size="sm" variant="outline" onClick={() => { if (window.confirm(`Ngừng hoạt động sản phẩm "${product.name}"?`)) deactivate.mutate(product.id); }}>Ngừng</Button>}</div></TableCell>
                  </tr>)}</tbody>
                </Table>
              ) : <EmptyPanel>Chưa có sản phẩm trong danh mục.</EmptyPanel>}
      </CardBody></Card>
      {formOpen && (
        <Dialog open onOpenChange={(open) => { if (!open && !save.isPending) setFormOpen(false); }}>
          <DialogContent closeDisabled={save.isPending} className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader><DialogTitle>{editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle></DialogHeader>
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
            <Button type="button" variant="outline" disabled={save.isPending} onClick={() => setFormOpen(false)}>Hủy</Button>
          </div>
        </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const stockStatusLabels = {
  IN_STOCK: 'Còn hàng',
  LOW_STOCK: 'Sắp hết',
  OUT_OF_STOCK: 'Hết hàng',
};
const inventoryDate = (value: string) => new Date(value).toLocaleString('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
});

const WarehousePagination = ({
  metadata, page, pageSize, onPageChange, onPageSizeChange,
}: {
  metadata: { totalCount: number; totalPages: number };
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) => (
  <TablePagination pageNumber={page} pageSize={pageSize} totalCount={metadata.totalCount}
    totalPages={metadata.totalPages} itemsLabel="dòng" onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} />
);

const InventoryPage = ({ branchId }: { branchId: string }) => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const categories = useQuery({
    queryKey: [...queryKeys.inventory(branchId), 'categories'],
    queryFn: () => posSalesApi.getInventoryCategories(branchId),
  });
  const criteria = { search: search.trim() || undefined, categoryId: categoryId || undefined,
    stockStatus: stockStatus || undefined, page, pageSize };
  const inventory = useQuery({
    queryKey: [...queryKeys.inventory(branchId), criteria],
    queryFn: () => posSalesApi.getInventory(branchId, criteria),
  });

  return (
    <Card><CardBody className="space-y-4">
      <h2 className="text-lg font-black text-slate-900">Tồn kho chi nhánh</h2>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Tìm theo tên sản phẩm" value={search}
          onChange={(value) => { setSearch(value); setPage(1); }} />
        <label className="block">
          <span className={labelClass}>Danh mục</span>
          <select aria-label="Danh mục" className={inputClass} value={categoryId} disabled={categories.isLoading || categories.isError}
            onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}>
            <option value="">Tất cả danh mục</option>
            {categories.data?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className={labelClass}>Trạng thái tồn kho</span>
          <select aria-label="Trạng thái tồn kho" className={inputClass} value={stockStatus}
            onChange={(event) => { setStockStatus(event.target.value); setPage(1); }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(stockStatusLabels).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
          </select>
        </label>
      </div>
      {categories.isError && <ErrorPanel error={categories.error} retry={() => void categories.refetch()} />}
      {inventory.isLoading ? <EmptyPanel>Đang tải tồn kho...</EmptyPanel>
        : inventory.isError ? <ErrorPanel error={inventory.error} retry={() => void inventory.refetch()} />
        : !inventory.data?.items.length ? <EmptyPanel>Không có sản phẩm phù hợp.</EmptyPanel>
        : <Table>
            <thead><tr><TableHead>Danh mục</TableHead><TableHead>Tên sản phẩm</TableHead><TableHead>Đơn vị</TableHead><TableHead>Tồn hiện tại</TableHead><TableHead>Trạng thái</TableHead></tr></thead>
            <tbody>{inventory.data.items.map((item) => {
              const state = item.quantityOnHand <= 0 ? 'OUT_OF_STOCK'
                : item.quantityOnHand <= item.reorderLevel ? 'LOW_STOCK' : 'IN_STOCK';
              return <tr key={item.productId}>
                <TableCell>{item.categoryName}</TableCell><TableCell>{item.productName}</TableCell>
                <TableCell>{item.unit}</TableCell><TableCell>{item.quantityOnHand}</TableCell>
                <TableCell>{stockStatusLabels[state]}</TableCell>
              </tr>;
            })}</tbody>
          </Table>}
      {inventory.data?.metadata && <WarehousePagination metadata={inventory.data.metadata} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />}
    </CardBody></Card>
  );
};

const StockHistory = ({ branchId, direction }: { branchId: string; direction: 'in' | 'out' }) => {
  const canReceive = useCan(P.INVENTORY_RECEIVE);
  const incoming = direction === 'in';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const movements = useQuery({
    queryKey: queryKeys.movements(branchId, `${direction}:${page}:${pageSize}`),
    queryFn: () => posSalesApi.getMovements(branchId, {
      movementType: incoming ? 'GOODS_RECEIPT' : 'SALE', includeDraftReceipts: incoming, page, pageSize,
    }),
  });

  return (
    <Card><CardBody className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-slate-900">{incoming ? 'Lịch sử nhập kho' : 'Xuất kho từ POS'}</h2>
        {incoming && <div className="flex flex-wrap items-center gap-2">
          {canReceive && <Button asChild><Link to={paths.posReceiptCreate}><Plus aria-hidden className="size-4" />Nhập kho</Link></Button>}
        </div>}
      </div>
      {movements.isLoading ? <EmptyPanel>Đang tải lịch sử kho...</EmptyPanel>
        : movements.isError ? <ErrorPanel error={movements.error} retry={() => void movements.refetch()} />
        : !movements.data?.items.length ? <EmptyPanel>Chưa có dữ liệu.</EmptyPanel>
        : <Table>
            <thead><tr><TableHead>{incoming ? 'Ngày nhập' : 'Ngày xuất'}</TableHead>
              <TableHead>Danh mục</TableHead><TableHead>Sản phẩm</TableHead><TableHead>Đơn vị</TableHead>
              <TableHead>Số lượng</TableHead>{incoming && <><TableHead>Giá nhập</TableHead><TableHead>Nhà cung cấp</TableHead><TableHead>Thao tác</TableHead></>}</tr></thead>
            <tbody>{movements.data.items.map((item: StockMovement) => <tr key={item.id}>
              <TableCell>{inventoryDate(item.createdAt)}</TableCell><TableCell>{item.categoryName}</TableCell>
              <TableCell>{item.productName}{item.isDraft && <span className="ml-2 text-xs text-amber-700">Nháp</span>}</TableCell>
              <TableCell>{item.unit}</TableCell><TableCell>{Math.abs(item.quantity)}</TableCell>
              {incoming && <>
                <TableCell>{item.unitCost == null ? '—' : amount(item.unitCost)}</TableCell>
                <TableCell>{item.supplierName ?? '—'}</TableCell>
                <TableCell>{canReceive && item.referenceId && (
                  <Link className="font-semibold text-emerald-700 underline"
                    to={paths.posReceiptEdit(item.referenceId)}>
                    Sửa
                  </Link>
                )}</TableCell>
              </>}
            </tr>)}</tbody>
          </Table>}
      {movements.data?.metadata && <WarehousePagination metadata={movements.data.metadata} page={page} pageSize={pageSize}
        onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />}
    </CardBody></Card>
  );
};

type ReceiptLine = { productId: string; quantity: string; unitCost: string };

const ReceiptEditorPage = ({ branchId }: { branchId: string }) => {
  const { receiptId } = useParams();
  const navigate = useNavigate();
  const canPost = useCan(P.INVENTORY_POST_RECEIPT);
  const isEdit = Boolean(receiptId && receiptId !== 'new');
  const productsQuery = useQuery({ queryKey: queryKeys.branchProducts(branchId), queryFn: () => posSalesApi.getBranchProducts(branchId) });
  const receiptQuery = useQuery({
    queryKey: queryKeys.receipt(branchId, receiptId ?? ''),
    queryFn: () => posSalesApi.getReceipt(branchId, receiptId!),
    enabled: isEdit,
  });
  const [supplierName, setSupplierName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ReceiptLine[]>([{ productId: '', quantity: '1', unitCost: '0' }]);
  const loadedReceiptId = receiptQuery.data?.id;
  useEffect(() => {
    if (!receiptQuery.data || receiptQuery.data.id !== loadedReceiptId) return;
    setSupplierName(receiptQuery.data.supplierName ?? '');
    setNotes(receiptQuery.data.notes ?? '');
    setItems(receiptQuery.data.items?.map((item) => ({ productId: item.productId, quantity: String(item.quantity), unitCost: String(item.unitCost) })) ?? []);
  }, [loadedReceiptId, receiptQuery.data]);
  const save = useMutation({
    mutationFn: async () => {
      const existing = receiptQuery.data;
      if (existing?.status === 'POSTED') {
        await posSalesApi.updatePostedReceiptSupplier(branchId, existing.id, supplierName.trim() || null);
        return { receipt: existing, posted: false, supplierUpdated: true };
      }

      const input = {
        supplierName: supplierName || undefined,
        supplierReference: isEdit ? receiptQuery.data?.supplierReference ?? undefined : undefined,
        notes: notes || undefined,
        items: items.map((item) => ({ productId: item.productId, quantity: Number(item.quantity), unitCost: Number(item.unitCost) })),
      };
      const receipt = isEdit
        ? await posSalesApi.updateReceipt(branchId, receiptId!, input)
        : await posSalesApi.createReceipt(branchId, input);
      if (!canPost) return { receipt, posted: false };
      try {
        await posSalesApi.postReceipt(branchId, receipt.id);
        return { receipt, posted: true };
      } catch (error) {
        // The saved draft can be posted again without creating a second receipt.
        return { receipt, posted: false, error: errorMessage(error) };
      }
    },
    onSuccess: async ({ receipt, posted, error, supplierUpdated }) => {
      await Promise.all([
        invalidateInventoryViews(branchId),
        queryClient.invalidateQueries({ queryKey: queryKeys.receipt(branchId, receipt.id) }),
      ]);
      if (supplierUpdated) {
        toast.success('Đã cập nhật nhà cung cấp.');
        navigate(paths.posReceipts);
        return;
      }
      if (posted) {
        toast.success('Đã nhập kho và cập nhật tồn kho.');
        navigate(paths.posReceipts);
        return;
      }
      if (error) toast.error('Đã lưu phiếu nháp, chưa ghi sổ', error);
      else toast.success('Đã lưu phiếu nháp.');
      navigate(paths.posReceiptDetail(receipt.id));
    },
    onError: notifyError,
  });
  const addLine = () => setItems((current) => [...current, { productId: '', quantity: '1', unitCost: '0' }]);
  const updateLine = (index: number, patch: Partial<ReceiptLine>) => setItems((current) => current.map((item, row) => row === index ? { ...item, ...patch } : item));
  const onSubmit = (event: FormEvent) => { event.preventDefault(); if (!save.isPending) save.mutate(); };
  if (isEdit && receiptQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải phiếu...</p></CardBody></Card>;
  if (isEdit && receiptQuery.isError) return <ErrorPanel error={receiptQuery.error} retry={() => void receiptQuery.refetch()} />;
  if (receiptQuery.data?.status === 'POSTED') {
    return (
      <Card><CardBody className="space-y-4">
        <h2 className="text-lg font-black text-slate-900">Sửa nhà cung cấp</h2>
        <p className="text-sm text-slate-600">Phiếu đã ghi sổ chỉ cho phép cập nhật nhà cung cấp.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Nhà cung cấp" value={supplierName} onChange={setSupplierName} />
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending || supplierName.trim().length > 200}>Lưu</Button>
            <Button asChild variant="outline"><Link to={paths.posReceipts}>Quay lại danh sách</Link></Button>
          </div>
        </form>
      </CardBody></Card>
    );
  }
  if (productsQuery.isLoading) return <Card><CardBody><p role="status" className="py-8 text-center">Đang tải sản phẩm...</p></CardBody></Card>;
  if (productsQuery.isError) return <ErrorPanel error={productsQuery.error} retry={() => void productsQuery.refetch()} />;
  if (isEdit && receiptQuery.data?.status !== 'DRAFT') return <Card><CardBody><p className="text-sm text-slate-700">Chỉ phiếu nhập ở trạng thái nháp mới được chỉnh sửa.</p><Link className="mt-3 inline-block font-bold text-emerald-700" to={paths.posReceiptDetail(receiptId!)}>Xem phiếu</Link></CardBody></Card>;
  return <Card><CardBody>
    <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">{isEdit ? 'Sửa phiếu nhập nháp' : 'Nhập kho'}</h2><Link to={paths.posReceipts} className="text-sm font-bold text-emerald-700">Quay lại danh sách</Link></div>
    <form className="space-y-5" onSubmit={onSubmit}>
      <label className="block">
        <span className={labelClass}>Ngày nhập</span>
        <input className={inputClass} readOnly value={inventoryDate(receiptQuery.data?.createdAt ?? new Date().toISOString())} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2"><Field label="Nhà cung cấp" value={supplierName} onChange={setSupplierName} /><div className="sm:col-span-2"><Field label="Ghi chú" value={notes} onChange={setNotes} /></div></div>
      <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="font-bold text-slate-800">Sản phẩm nhận</h3><Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="size-4" />Thêm dòng</Button></div>
        {items.map((item, index) => {
          const product = productsQuery.data?.find((candidate) => candidate.productId === item.productId);
          return <div key={`${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
          <label className="block sm:col-span-2"><span className={labelClass}>Sản phẩm</span><select className={inputClass} value={item.productId} required onChange={(event) => updateLine(index, { productId: event.target.value })}><option value="">Chọn sản phẩm</option>{productsQuery.data?.filter((product) => product.trackInventory).map((product) => <option key={product.productId} value={product.productId}>{product.sku} — {product.name}</option>)}</select></label>
          <label className="block"><span className={labelClass}>Danh mục</span><input className={inputClass} readOnly value={product?.categoryName ?? ''} /></label>
          <label className="block"><span className={labelClass}>Đơn vị</span><input className={inputClass} readOnly value={product?.unit ?? ''} /></label>
          <Field label="Số lượng" type="number" value={item.quantity} onChange={(value) => updateLine(index, { quantity: value })} min={0.001} step={0.001} required />
          <div className="flex gap-2"><Field label="Giá nhập" type="number" value={item.unitCost} onChange={(value) => updateLine(index, { unitCost: value })} min={0} step={0.01} required /><Button type="button" variant="outline" className="mt-6" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((_, row) => row !== index))}>Xóa</Button></div>
        </div>;
        })}
      </div>
      <Button type="submit" disabled={save.isPending || !productsQuery.data?.some((product) => product.trackInventory) || new Set(items.map((item) => item.productId).filter(Boolean)).size !== items.filter((item) => item.productId).length}><Save className="size-4" />{save.isPending ? 'Đang lưu...' : canPost ? 'Xác nhận nhập kho' : 'Lưu phiếu nháp'}</Button>
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
  const canReceive = useCan(P.INVENTORY_RECEIVE);
  const canPost = useCan(P.INVENTORY_POST_RECEIPT);
  return <div className="flex flex-wrap gap-2">
    {canReceive && <><Link to={paths.posReceiptEdit(receipt.id)}><Button variant="outline">Sửa nháp</Button></Link><Button variant="outline" disabled={cancelPending} onClick={() => { if (window.confirm('Hủy phiếu nhập nháp này?')) onCancel(); }}>Hủy phiếu</Button></>}
    {canPost && <Button disabled={postPending} onClick={() => { if (window.confirm('Ghi sổ phiếu này và cộng tồn kho? Thao tác không thể hoàn tác.')) onPost(); }}>{postPending ? 'Đang ghi sổ...' : 'Ghi sổ'}</Button>}
  </div>;
};

const orderBranchPath = (path: string, branchId: string) => path + "?" + new URLSearchParams({ branchId });

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
          <tbody>{ordersQuery.data.items.map((order) => <tr key={order.id}><TableCell>{order.orderCode}</TableCell><TableCell>{order.customerName ?? 'Khách lẻ'}</TableCell><TableCell>{order.status}</TableCell><TableCell>{order.paymentStatus} · {order.paymentMethodCode}</TableCell><TableCell>{amount(order.totalAmount)}</TableCell><TableCell>{new Date(order.createdAt).toLocaleString('vi-VN')}</TableCell><TableCell><Link className="font-bold text-emerald-700 hover:underline" to={orderBranchPath(paths.posOrderDetail(order.id), branchId)}>Chi tiết</Link></TableCell></tr>)}</tbody></Table>
          : <EmptyPanel>Không tìm thấy đơn bán hàng.</EmptyPanel>}
  </CardBody></Card>;
};

const OrderDetailPage = ({ branchId }: { branchId: string }) => {
  const { hasPermission } = useAuthorization();
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
        queryClient.invalidateQueries({ queryKey: ['business-statistics', 'report'] }),
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
  const canCancel = hasPermission(P.SALES_CANCEL) && order.status === 'COMPLETED';
  return <Card><CardBody className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={orderBranchPath(paths.posOrders, branchId)} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" />Danh sách đơn</Link><h2 className="mt-3 text-xl font-black text-slate-900">{order.orderCode}</h2></div>
      <div className="flex flex-wrap gap-2">{order.invoiceId && hasPermission(P.SALES_INVOICE_VIEW) && <Link to={orderBranchPath(paths.posInvoice(order.invoiceId), branchId)}><Button variant="outline"><FileText className="size-4" />Hóa đơn</Button></Link>}{canCancel && <Button variant="outline" disabled={cancel.isPending} onClick={() => { if (window.confirm('Hủy đơn và hoàn kho toàn bộ sản phẩm?')) cancel.mutate(); }}>Hủy đơn / hoàn tiền</Button>}</div>
    </div>
    <div className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3"><p><b>Khách hàng:</b> {order.customerName ?? 'Khách lẻ'}</p><p><b>Booking tham chiếu:</b> {order.bookingId ?? '—'}</p><p><b>Trạng thái:</b> {order.status}</p><p><b>Thanh toán:</b> {order.paymentStatus} · {order.paymentMethodCode}</p><p><b>Ngày tạo:</b> {new Date(order.createdAt).toLocaleString('vi-VN')}</p><p><b>Hoàn tất:</b> {order.completedAt ? new Date(order.completedAt).toLocaleString('vi-VN') : '—'}</p>{order.notes && <p className="sm:col-span-3"><b>Ghi chú:</b> {order.notes}</p>}</div>
    <Table><thead><tr><TableHead>Sản phẩm</TableHead><TableHead>Số lượng</TableHead><TableHead>Đơn giá</TableHead><TableHead>Thành tiền</TableHead></tr></thead><tbody>{order.items.map((item, index) => <tr key={`${item.productId}-${index}`}><TableCell>{item.sku}<br />{item.productName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{amount(item.unitPrice)}</TableCell><TableCell>{amount(item.lineTotal)}</TableCell></tr>)}</tbody></Table>
    <div className="ml-auto max-w-sm space-y-1 text-right text-sm"><p>Tạm tính: {amount(order.subtotalAmount)}</p><p>Giảm giá: {amount(order.discountAmount)}</p><p className="text-lg font-black">Tổng cộng: {amount(order.totalAmount)}</p><p>Đã thanh toán: {amount(order.paidAmount)}</p></div>
  </CardBody></Card>;
};

const InvoicePage = ({ branchId }: { branchId: string }) => {
  const canPrint = useCan(P.SALES_INVOICE_PRINT);
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
    <div className="flex flex-wrap items-start justify-between gap-3"><div><Link to={orderBranchPath(paths.posOrders, branchId)} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700"><ArrowLeft className="size-4" />Đơn bán hàng</Link><h2 className="mt-3 text-xl font-black text-slate-900">Hóa đơn {invoice.invoiceNumber}</h2><p className="text-sm text-slate-500">Bản chụp hóa đơn bất biến · {new Date(invoice.issuedAt).toLocaleString('vi-VN')}</p></div>
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
