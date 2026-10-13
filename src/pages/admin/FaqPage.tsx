import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import FaqFormModal from '../../components/modals/FaqFormModal';
import type { FaqFormValues } from '../../components/modals/FaqFormModal';
import {
  createFaq,
  deleteFaq,
  getFaqs,
  MAX_SECTION_FAQS,
  moveFaq,
  toggleFaqFeatured,
  updateFaq,
  type FaqRecord,
} from '../../services/faq.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  HelpCircle,
  LayoutList,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const FAQS_QUERY_KEY = ['faqs'] as const;

export default function FaqPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingFaq, setEditingFaq] = useState<FaqRecord | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<FaqRecord | null>(null);

  const { data: faqs = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: FAQS_QUERY_KEY,
    queryFn: getFaqs,
    ...adminListQueryOptions,
  });

  const featuredCount = faqs.filter((f) => f.featuredInSection).length;

  const createMutation = useMutation({
    mutationFn: (values: FaqFormValues) => createFaq(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
      setFormMode(null);
      toast.success('FAQ created');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to create FAQ'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: FaqFormValues }) =>
      updateFaq(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
      setFormMode(null);
      setEditingFaq(null);
      toast.success('FAQ updated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update FAQ'),
  });

  const featuredMutation = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      toggleFaqFeatured(id, featured),
    onMutate: async ({ id, featured }) => {
      await queryClient.cancelQueries({ queryKey: FAQS_QUERY_KEY });
      const previous = queryClient.getQueryData<FaqRecord[]>(FAQS_QUERY_KEY);
      queryClient.setQueryData<FaqRecord[]>(FAQS_QUERY_KEY, (old = []) =>
        old.map((item) =>
          item.id === id
            ? { ...item, featuredInSection: featured, updatedAt: new Date().toISOString() }
            : item
        )
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAQS_QUERY_KEY, context.previous);
      toast.error(err?.message || 'Failed to update section mark');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      moveFaq(id, direction),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to reorder'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: FAQS_QUERY_KEY });
      const previous = queryClient.getQueryData<FaqRecord[]>(FAQS_QUERY_KEY);
      queryClient.setQueryData<FaqRecord[]>(FAQS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: any, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAQS_QUERY_KEY, context.previous);
      toast.error(err?.message || 'Failed to delete FAQ');
    },
    onSuccess: async () => {
      setFaqToDelete(null);
      toast.success('FAQ deleted');
      await queryClient.invalidateQueries({ queryKey: FAQS_QUERY_KEY });
    },
  });

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [faqs, searchQuery]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-3 xl:!grid-cols-3">
        <StatCard label="Total FAQs" value={faqs.length.toString()} icon={HelpCircle} />
        <StatCard
          label="In Sections"
          value={`${featuredCount}/${MAX_SECTION_FAQS}`}
          icon={Star}
        />
        <StatCard
          label="FAQ Page Only"
          value={(faqs.length - featuredCount).toString()}
          icon={LayoutList}
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
                placeholder="Search FAQs..."
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
                setEditingFaq(null);
                setFormMode('create');
              }}
              title="New FAQ"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New FAQ</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A86A]" />
          Star up to {MAX_SECTION_FAQS} FAQs to show them in page sections. Use arrows to arrange order.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
            <span>Loading FAQs...</span>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-center">
            <span className="font-semibold text-gray-700">No FAQs found</span>
            <span className="text-xs text-gray-400">Add a question to get started.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredFaqs.map((faq) => {
              const absoluteIndex = faqs.findIndex((f) => f.id === faq.id);
              const isFirst = absoluteIndex === 0;
              const isLast = absoluteIndex === faqs.length - 1;

              return (
                <div
                  key={faq.id}
                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#F8F7F5] border border-gray-100"
                >
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      disabled={isFirst || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: faq.id, direction: 'up' })}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#2C0E11] hover:bg-white disabled:opacity-25 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: faq.id, direction: 'down' })}
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
                        {faq.question}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pl-5">
                      {faq.answer}
                    </p>
                    {faq.featuredInSection && (
                      <span className="inline-flex mt-2 ml-5 items-center gap-1 px-2 py-0.5 rounded-full bg-[#2C0E11] text-white text-[10px] font-bold uppercase tracking-wide">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        Section
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title={
                        faq.featuredInSection
                          ? 'Remove from sections'
                          : featuredCount >= MAX_SECTION_FAQS
                            ? `Max ${MAX_SECTION_FAQS} section FAQs`
                            : 'Show in page sections'
                      }
                      disabled={
                        featuredMutation.isPending ||
                        (!faq.featuredInSection && featuredCount >= MAX_SECTION_FAQS)
                      }
                      onClick={() =>
                        featuredMutation.mutate({
                          id: faq.id,
                          featured: !faq.featuredInSection,
                        })
                      }
                      className={cn(
                        'p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-30',
                        faq.featuredInSection
                          ? 'text-[#C9A86A] bg-[#C9A86A]/15 hover:bg-[#C9A86A]/25'
                          : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                      )}
                    >
                      <Star
                        className={cn('w-4 h-4', faq.featuredInSection && 'fill-current')}
                      />
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditingFaq(faq);
                        setFormMode('edit');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setFaqToDelete(faq)}
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

      <FaqFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        featuredCount={featuredCount}
        initialValues={
          formMode === 'edit' && editingFaq
            ? {
                question: editingFaq.question,
                answer: editingFaq.answer,
                featuredInSection: editingFaq.featuredInSection,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingFaq(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingFaq) {
            await updateMutation.mutateAsync({ id: editingFaq.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!faqToDelete}
        onClose={() => setFaqToDelete(null)}
        onConfirm={() => {
          if (faqToDelete) deleteMutation.mutate(faqToDelete.id);
        }}
        title="Delete FAQ"
        description={
          <span>
            Delete{' '}
            <strong className="text-[#2C0E11]">
              &ldquo;{faqToDelete?.question}&rdquo;
            </strong>
            ?
          </span>
        }
        confirmText="Delete FAQ"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
