import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatGrid, StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import CategoryFormModal from '../../components/modals/CategoryFormModal';
import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  type CategoryRecord,
  type CategoryStatus,
} from '../../services/categories.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  Layers,
  Tag,
  Edit2,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  Plus,
  X,
  Calendar,
  Link2,
  Sparkles,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES_QUERY_KEY = ['categories'] as const;

function StatusTogglePill({
  status,
  onChange,
  disabled = false,
}: {
  status: CategoryStatus;
  onChange: (newStatus: CategoryStatus) => void;
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
        "group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none active:scale-95 border",
        isActive
          ? "bg-[#E8F8EF] text-[#2F7D4A] hover:bg-[#D8F3E4] border-[#BFE8CF] shadow-2xs"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200 border-stone-200/80 shadow-2xs"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full shrink-0 transition-all duration-300",
          isActive ? "bg-[#83BF6E]" : "bg-stone-400"
        )}
      />
      <span className="capitalize tracking-wide font-medium">
        {status}
      </span>
      <span
        className={cn(
          "text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-0.5",
          isActive ? "text-[#2F7D4A]" : "text-stone-500"
        )}
      >
        ⇄
      </span>
    </button>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CategoryStatus>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [viewCategory, setViewCategory] = useState<CategoryRecord | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryRecord | null>(null);

  const { data: categories = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: getCategories,
    ...adminListQueryOptions,
  });

  const activeViewCategory = useMemo(() => {
    if (!viewCategory) return null;
    return categories.find((c) => c.id === viewCategory.id) || viewCategory;
  }, [categories, viewCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewCategory) setViewCategory(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewCategory]);

  const createMutation = useMutation({
    mutationFn: (values: { name: string; status: CategoryStatus }) =>
      createCategory(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      setFormMode(null);
      toast.success('Category created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name, status }: { id: string; name: string; status: CategoryStatus }) =>
      updateCategory(id, { name, status }),
    onMutate: async ({ id, name, status }) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      const previous = queryClient.getQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY);
      queryClient.setQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY, (old = []) =>
        old.map((item) =>
          item.id === id
            ? { ...item, name, status, updatedAt: new Date().toISOString() }
            : item
        )
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to update category');
    },
    onSuccess: () => {
      setFormMode(null);
      setEditingCategory(null);
      toast.success('Category updated successfully');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: CategoryStatus }) =>
      updateCategoryStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      const previous = queryClient.getQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY);
      queryClient.setQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY, (old = []) =>
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
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      const previous = queryClient.getQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY);
      queryClient.setQueryData<CategoryRecord[]>(CATEGORIES_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
      toast.error(err?.message || 'Failed to delete category');
    },
    onSuccess: () => {
      setCategoryToDelete(null);
      if (viewCategory && categoryToDelete && viewCategory.id === categoryToDelete.id) {
        setViewCategory(null);
      }
      toast.success('Category deleted successfully');
    },
  });

  const activeCount = categories.filter((c) => c.status === 'active').length;
  const inactiveCount = categories.filter((c) => c.status === 'inactive').length;

  const filteredCategories = useMemo(() => {
    let result = categories;

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q)
      );
    }

    return result;
  }, [categories, searchQuery, statusFilter]);

  const columns: Column<CategoryRecord>[] = [
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
      id: 'name',
      header: 'Category Name',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <span className="font-bold text-[#2C0E11] text-sm uppercase tracking-wide">
            {row.name}
          </span>
        </div>
      ),
    },
    {
      id: 'slug',
      header: 'Slug',
      cell: (row) => (
        <span className="text-gray-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded">
          /{row.slug}
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
      <StatGrid className="!grid-cols-1 sm:!grid-cols-3 xl:!grid-cols-3">
        <StatCard
          label="Total Categories"
          value={categories.length.toString()}
          icon={Layers}
        />
        <StatCard
          label="Active"
          value={activeCount.toString()}
          icon={Sparkles}
        />
        <StatCard
          label="Inactive"
          value={inactiveCount.toString()}
          icon={EyeOff}
        />
      </StatGrid>

      <DataTable
        columns={columns}
        rows={filteredCategories}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading categories...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-4 text-center">
              <span className="font-semibold text-gray-700">No categories found</span>
              <span className="text-xs text-gray-400">
                {statusFilter !== 'all'
                  ? `There are currently no ${statusFilter} categories.`
                  : 'Add a category to show it in the marketplace filter bar.'}
              </span>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-[#2C0E11] shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  All ({categories.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
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
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
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
                className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
                title="Refresh this page only"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setFormMode('create');
                }}
                className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setFormMode('create');
                }}
                className="inline-flex sm:hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2C0E11] text-white transition-colors duration-200 hover:bg-[#2C0E11]/90 shadow-sm cursor-pointer"
                title="Add Category"
              >
                <Plus className="h-4 w-4" />
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
                setViewCategory(row);
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
                setEditingCategory(row);
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
                setCategoryToDelete(row);
              }}
              className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <CategoryFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialName={formMode === 'edit' ? editingCategory?.name || '' : ''}
        initialStatus={formMode === 'edit' ? editingCategory?.status || 'active' : 'active'}
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingCategory(null);
        }}
        onSubmit={async ({ name, status }) => {
          if (formMode === 'edit' && editingCategory) {
            await updateMutation.mutateAsync({ id: editingCategory.id, name, status });
          } else {
            await createMutation.mutateAsync({ name, status });
          }
        }}
      />

      {/* View Modal */}
      {activeViewCategory && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setViewCategory(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#FCFBF8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2C0E11]/8 text-[#2C0E11] flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2C0E11]">Category Details</h3>
                  <p className="text-xs text-gray-500">Marketplace filter label</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewCategory(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Name</span>
                  <p className="text-lg font-bold text-[#2C0E11] uppercase tracking-wide truncate">
                    {activeViewCategory.name}
                  </p>
                </div>
                <StatusTogglePill
                  status={activeViewCategory.status}
                  onChange={(newStatus) => {
                    statusMutation.mutate({ id: activeViewCategory.id, status: newStatus });
                  }}
                />
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <Link2 className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Slug</p>
                  <p className="font-mono text-sm text-gray-800 truncate">/{activeViewCategory.slug}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Created</p>
                  <p className="text-sm text-gray-800">
                    {new Date(activeViewCategory.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                {activeViewCategory.status === 'active'
                  ? 'This category is visible in the marketplace filter.'
                  : 'This category is hidden from the marketplace until set to Active.'}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(activeViewCategory);
                  setFormMode('edit');
                  setViewCategory(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-[#2C0E11] text-white text-sm font-semibold hover:bg-[#3E1418] transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setCategoryToDelete(activeViewCategory)}
                className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmationModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id);
          }
        }}
        title="Delete Category"
        description={
          <span>
            Are you sure you want to delete{' '}
            <strong className="text-[#2C0E11] uppercase">{categoryToDelete?.name}</strong>? It will be removed from the marketplace filter.
          </span>
        }
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
