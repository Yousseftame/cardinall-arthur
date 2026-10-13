import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import TermsFormModal from '../../components/modals/TermsFormModal';
import type { TermsFormValues } from '../../components/modals/TermsFormModal';
import {
  createTerm,
  deleteTerm,
  getTerms,
  moveTerm,
  updateTerm,
  type TermRecord,
} from '../../services/terms.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TERMS_QUERY_KEY = ['terms'] as const;

export default function TermsAdminPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingTerm, setEditingTerm] = useState<TermRecord | null>(null);
  const [termToDelete, setTermToDelete] = useState<TermRecord | null>(null);

  const { data: terms = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: TERMS_QUERY_KEY,
    queryFn: getTerms,
    ...adminListQueryOptions,
  });

  const createMutation = useMutation({
    mutationFn: (values: TermsFormValues) => createTerm(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TERMS_QUERY_KEY });
      setFormMode(null);
      toast.success('Section created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create section'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TermsFormValues }) =>
      updateTerm(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TERMS_QUERY_KEY });
      setFormMode(null);
      setEditingTerm(null);
      toast.success('Section updated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update section'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      moveTerm(id, direction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TERMS_QUERY_KEY });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to reorder'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTerm(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: TERMS_QUERY_KEY });
      const previous = queryClient.getQueryData<TermRecord[]>(TERMS_QUERY_KEY);
      queryClient.setQueryData<TermRecord[]>(TERMS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(TERMS_QUERY_KEY, context.previous);
      toast.error(err?.message || 'Failed to delete section');
    },
    onSuccess: async () => {
      setTermToDelete(null);
      toast.success('Section deleted');
      await queryClient.invalidateQueries({ queryKey: TERMS_QUERY_KEY });
    },
  });

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;
    const q = searchQuery.toLowerCase();
    return terms.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [terms, searchQuery]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-2">
        <StatCard label="Total Sections" value={terms.length.toString()} icon={FileText} />
        <StatCard
          label="Shown on /terms"
          value={terms.length.toString()}
          icon={FileText}
        />
      </StatGrid>

      <section className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-row items-center justify-between gap-3 max-md:flex-col max-md:items-stretch mb-6">
          <div className="flex items-center gap-2 flex-1 min-w-0 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-gray-100 transition-colors border-none"
              />
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex md:hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="hidden md:flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingTerm(null);
                setFormMode('create');
              }}
              title="New Section"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Section</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Use arrows to arrange the order shown on the Terms & Conditions page.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
            <span>Loading sections...</span>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-center">
            <span className="font-semibold text-gray-700">No sections found</span>
            <span className="text-xs text-gray-400">Add a title and description to get started.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredTerms.map((term) => {
              const absoluteIndex = terms.findIndex((t) => t.id === term.id);
              const isFirst = absoluteIndex === 0;
              const isLast = absoluteIndex === terms.length - 1;

              return (
                <div
                  key={term.id}
                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#F8F7F5] border border-gray-100"
                >
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      disabled={isFirst || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: term.id, direction: 'up' })}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#2C0E11] hover:bg-white disabled:opacity-25 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: term.id, direction: 'down' })}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#2C0E11] hover:bg-white disabled:opacity-25 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1">
                      <span className="text-[10px] font-bold text-gray-400 tabular-nums pt-1 shrink-0">
                        {absoluteIndex + 1}.
                      </span>
                      <p className="font-semibold text-[#2C0E11] text-sm leading-snug">
                        {term.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pl-5">
                      {term.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditingTerm(term);
                        setFormMode('edit');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setTermToDelete(term)}
                      className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <TermsFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialValues={
          formMode === 'edit' && editingTerm
            ? {
                title: editingTerm.title,
                description: editingTerm.description,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingTerm(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingTerm) {
            await updateMutation.mutateAsync({ id: editingTerm.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!termToDelete}
        onClose={() => setTermToDelete(null)}
        onConfirm={() => {
          if (termToDelete) deleteMutation.mutate(termToDelete.id);
        }}
        title="Delete Section"
        description={
          <span>
            Delete{' '}
            <strong className="text-[#2C0E11]">
              &ldquo;{termToDelete?.title}&rdquo;
            </strong>
            ?
          </span>
        }
        confirmText="Delete Section"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
