import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import ProductFormModal from '../../components/modals/ProductFormModal';
import type { ProductFormValues } from '../../components/modals/ProductFormModal';
import {
  createProduct,
  deleteProduct,
  formatProductPrice,
  getProductGallerySrcs,
  getProductImageSrc,
  getProducts,
  getProductSharePath,
  PRODUCT_BOTTLE_SIZE,
  updateProduct,
  updateProductStatus,
  type ProductRecord,
  type ProductStatus,
} from '../../services/products.service';
import { getCategories } from '../../services/categories.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  Boxes,
  Calendar,
  Edit2,
  Eye,
  EyeOff,
  Link2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCTS_QUERY_KEY = ['products'] as const;
const CATEGORIES_QUERY_KEY = ['categories'] as const;

function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: ProductStatus;
  onChange: (newStatus: ProductStatus) => void;
  disabled?: boolean;
}) {
  const isActive = status === 'active';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(isActive ? 'inactive' : 'active');
      }}
      title={isActive ? 'Click to set Inactive' : 'Click to set Active'}
      className={cn(
        'group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border',
        isActive
          ? 'bg-[#E8F8EF] text-[#2F7D4A] hover:bg-[#D8F3E4] border-[#BFE8CF] shadow-2xs'
          : 'bg-stone-100 text-stone-600 hover:bg-stone-200 border-stone-200/80 shadow-2xs'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full shrink-0 transition-all duration-300',
          isActive ? 'bg-[#83BF6E]' : 'bg-stone-400'
        )}
      />
      <span className="capitalize tracking-wide font-medium">{status}</span>
    </button>
  );
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [viewProduct, setViewProduct] = useState<ProductRecord | null>(null);
  const [viewGalleryIndex, setViewGalleryIndex] = useState(0);
  const [productToDelete, setProductToDelete] = useState<ProductRecord | null>(null);

  const { data: products = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
    ...adminListQueryOptions,
  });

  // Categories only when opening create/edit form (table uses denormalized categoryName)
  const { data: categories = [] } = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
    ...adminListQueryOptions,
    enabled: formMode !== null,
  });

  const activeViewProduct = useMemo(() => {
    if (!viewProduct) return null;
    return products.find((p) => p.id === viewProduct.id) || viewProduct;
  }, [products, viewProduct]);

  const viewGallerySrcs = useMemo(
    () => (activeViewProduct ? getProductGallerySrcs(activeViewProduct) : []),
    [activeViewProduct]
  );

  useEffect(() => {
    setViewGalleryIndex(0);
  }, [viewProduct?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewProduct) setViewProduct(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewProduct]);

  const createMutation = useMutation({
    mutationFn: (values: ProductFormValues) => createProduct(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      setFormMode(null);
      toast.success('Product created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create product');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ProductFormValues }) =>
      updateProduct(id, values),
    onMutate: async ({ id, values }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY);
      queryClient.setQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY, (old = []) =>
        old.map((item) =>
          item.id === id
            ? {
                ...item,
                ...values,
                bottleSize: PRODUCT_BOTTLE_SIZE,
                updatedAt: new Date().toISOString(),
              }
            : item
        )
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to update product');
    },
    onSuccess: () => {
      setFormMode(null);
      setEditingProduct(null);
      toast.success('Product updated successfully');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductStatus }) =>
      updateProductStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY);
      queryClient.setQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY, (old = []) =>
        old.map((item) =>
          item.id === id
            ? { ...item, status, updatedAt: new Date().toISOString() }
            : item
        )
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });
      const previous = queryClient.getQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY);
      queryClient.setQueryData<ProductRecord[]>(PRODUCTS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to delete product');
    },
    onSuccess: () => {
      setProductToDelete(null);
      if (viewProduct && productToDelete && viewProduct.id === productToDelete.id) {
        setViewProduct(null);
      }
      toast.success('Product deleted successfully');
    },
  });

  const activeCount = products.filter((p) => p.status === 'active').length;
  const inactiveCount = products.filter((p) => p.status === 'inactive').length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const totalQty = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, searchQuery, statusFilter]);

  const columns: Column<ProductRecord>[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusTogglePill
          status={row.status}
          onChange={(newStatus) => {
            statusMutation.mutate({ id: row.id, status: newStatus });
          }}
        />
      ),
    },
    {
      id: 'product',
      header: 'Product',
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={getProductImageSrc(row)}
              alt={row.name}
              className="w-11 h-11 rounded-xl object-cover bg-gray-100"
            />
            {row.imageKeys.length > 1 && (
              <span className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2C0E11] text-white text-[9px] font-bold flex items-center justify-center">
                {row.imageKeys.length}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#2C0E11] text-sm truncate">{row.name}</p>
            <p className="text-[11px] text-gray-400 font-mono truncate">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-xs font-semibold text-gray-700 border border-gray-100">
          <Tag className="w-3 h-3 text-gray-400" />
          {row.categoryName || '—'}
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      cell: (row) => (
        <span className="text-sm font-semibold text-[#2C0E11]">
          {formatProductPrice(row.price)}
        </span>
      ),
    },
    {
      id: 'size',
      header: 'Size',
      cell: () => (
        <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
          {PRODUCT_BOTTLE_SIZE}
        </span>
      ),
    },
    {
      id: 'stock',
      header: 'Stock',
      cell: (row) => (
        <span
          className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            row.stock === 0
              ? 'bg-red-50 text-red-600'
              : row.stock <= 5
                ? 'bg-amber-50 text-amber-700'
                : 'bg-[#E8F8EF] text-[#2F7D4A]'
          )}
        >
          {row.stock}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Date Added',
      cell: (row) => {
        const dateObj = new Date(row.createdAt);
        const formattedDate = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : row.createdAt;
        const formattedTime = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '';

        return (
          <div className="flex flex-col text-xs text-gray-500">
            <span className="font-medium text-gray-700">{formattedDate}</span>
            <span className="text-[11px] text-gray-400">{formattedTime}</span>
          </div>
        );
      },
    },
  ];

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-5">
        <StatCard label="Total Products" value={products.length.toString()} icon={Package} />
        <StatCard label="Total Qty" value={totalQty.toString()} icon={Boxes} />
        <StatCard label="Active" value={activeCount.toString()} icon={Sparkles} />
        <StatCard label="Inactive" value={inactiveCount.toString()} icon={EyeOff} />
        <StatCard label="Low Stock" value={lowStockCount.toString()} icon={Tag} />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={filteredProducts}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading products...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No products found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all'
                  ? `There are currently no ${statusFilter} products.`
                  : 'Add a product to show it on the home section and marketplace.'}
              </span>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-row items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
            <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
                />
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex md:hidden h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh this page only"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold overflow-x-auto scrollbar-hide min-w-0 flex-1 md:flex-none">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    statusFilter === 'active'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${activeCount > 0 ? 'bg-[#83BF6E]' : 'bg-gray-300'}`} />
                  Active ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === 'inactive'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Inactive ({inactiveCount})
                </button>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="hidden md:flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh this page only"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormMode('create');
                }}
                title="New Product"
                className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Product</span>
              </button>
            </div>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="View"
              onClick={(e) => {
                e.stopPropagation();
                setViewProduct(row);
              }}
              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Edit"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProduct(row);
                setFormMode('edit');
              }}
              className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                setProductToDelete(row);
              }}
              className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <ProductFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        categories={categories}
        initialValues={
          formMode === 'edit' && editingProduct
            ? {
                name: editingProduct.name,
                description: editingProduct.description,
                price: editingProduct.price,
                stock: editingProduct.stock,
                categoryId: editingProduct.categoryId,
                categoryName: editingProduct.categoryName,
                imageKeys: editingProduct.imageKeys,
                status: editingProduct.status,
                slug: editingProduct.slug,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingProduct(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingProduct) {
            await updateMutation.mutateAsync({ id: editingProduct.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      {activeViewProduct && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewProduct(null)}
        >
          <div
            className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#2C0E11]">Product Details</h3>
                  <p className="text-xs text-gray-500 truncate">{activeViewProduct.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4 scrollbar-hide">
              {/* Compact gallery */}
              <div className="flex items-start gap-3">
                <img
                  src={viewGallerySrcs[viewGalleryIndex] || getProductImageSrc(activeViewProduct)}
                  alt={activeViewProduct.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-gray-100 shrink-0 border border-gray-100"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#2C0E11] text-base leading-snug">
                        {activeViewProduct.name}
                      </p>
                      <p className="text-sm font-semibold text-[#C9A86A] mt-0.5">
                        {formatProductPrice(activeViewProduct.price)}
                      </p>
                    </div>
                    <StatusTogglePill
                      status={activeViewProduct.status}
                      onChange={(newStatus) => {
                        statusMutation.mutate({ id: activeViewProduct.id, status: newStatus });
                      }}
                    />
                  </div>
                  {viewGallerySrcs.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {viewGallerySrcs.map((src, i) => (
                        <button
                          key={`${activeViewProduct.id}-t-${i}`}
                          type="button"
                          onClick={() => setViewGalleryIndex(i)}
                          className={cn(
                            'w-9 h-9 rounded-lg overflow-hidden border transition-all cursor-pointer',
                            i === viewGalleryIndex
                              ? 'border-[#2C0E11]'
                              : 'border-gray-200 opacity-80 hover:opacity-100'
                          )}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {activeViewProduct.description}
              </p>

              {/* Simple info rows */}
              <div className="rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gray-50/60">
                  <span className="text-xs text-gray-500 font-medium">Category</span>
                  <span className="text-sm font-semibold text-[#2C0E11] truncate">
                    {activeViewProduct.categoryName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-xs text-gray-500 font-medium">Bottle size</span>
                  <span className="text-sm font-semibold text-[#2C0E11]">{PRODUCT_BOTTLE_SIZE}</span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-gray-50/60">
                  <span className="text-xs text-gray-500 font-medium">Stock</span>
                  <span className="text-sm font-semibold text-[#2C0E11]">{activeViewProduct.stock}</span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-xs text-gray-500 font-medium">Images</span>
                  <span className="text-sm font-semibold text-[#2C0E11]">
                    {activeViewProduct.imageKeys.length}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 px-3.5 py-2.5 bg-gray-50/60">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5 shrink-0">
                    <Link2 className="w-3.5 h-3.5" />
                    Share link
                  </span>
                  <span className="text-xs font-mono text-gray-700 text-right break-all">
                    {getProductSharePath(activeViewProduct)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created
                  </span>
                  <span className="text-sm text-gray-700">
                    {new Date(activeViewProduct.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 px-5 py-4 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(activeViewProduct);
                  setFormMode('edit');
                  setViewProduct(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#2C0E11] text-white text-sm font-semibold hover:bg-[#3E1418] transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setProductToDelete(activeViewProduct)}
                className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete.id);
          }
        }}
        title="Delete Product"
        description={
          <span>
            Are you sure you want to delete{' '}
            <strong className="text-[#2C0E11]">{productToDelete?.name}</strong>? It will be removed from the catalog.
          </span>
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
