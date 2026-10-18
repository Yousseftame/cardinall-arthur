import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import TimelineFormModal from '../../components/modals/TimelineFormModal';
import type { TimelineFormValues } from '../../components/modals/TimelineFormModal';
import {
  createTimelineEntry,
  deleteTimelineEntry,
  getTimeline,
  moveTimelineEntry,
  updateTimelineEntry,
  type TimelineRecord,
} from '../../services/timeline.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TIMELINE_QUERY_KEY = ['timeline'] as const;
export const ADMIN_TIMELINE_QUERY_KEY = ['admin-timeline'] as const;

export default function TimelinePage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingEntry, setEditingEntry] = useState<TimelineRecord | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimelineRecord | null>(null);

  const { data: entries = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_TIMELINE_QUERY_KEY,
    queryFn: getTimeline,
    ...adminListQueryOptions,
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_TIMELINE_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: TIMELINE_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (values: TimelineFormValues) => createTimelineEntry(values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      toast.success('Milestone created');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to create milestone'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TimelineFormValues }) =>
      updateTimelineEntry(id, values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      setEditingEntry(null);
      toast.success('Milestone updated');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update milestone'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      moveTimelineEntry(id, direction),
    onSuccess: async () => {
      await invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to reorder'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTimelineEntry(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_TIMELINE_QUERY_KEY });
      const previous = queryClient.getQueryData<TimelineRecord[]>(ADMIN_TIMELINE_QUERY_KEY);
      queryClient.setQueryData<TimelineRecord[]>(ADMIN_TIMELINE_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADMIN_TIMELINE_QUERY_KEY, context.previous);
      }
      toast.error(err instanceof Error ? err.message : 'Failed to delete milestone');
    },
    onSuccess: async () => {
      setEntryToDelete(null);
      toast.success('Milestone deleted');
      await invalidateAll();
    },
  });

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.year.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-2">
        <StatCard label="Total Milestones" value={entries.length.toString()} icon={Clock} />
        <StatCard
          label="Shown on /about"
          value={entries.length.toString()}
          icon={Clock}
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
                placeholder="Search milestones..."
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
                setEditingEntry(null);
                setFormMode('create');
              }}
              title="New Milestone"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Milestone</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Use arrows to arrange order on “Our Journey in Craft”. Side (left/right) alternates
          automatically.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
            <span>Loading milestones...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-center">
            <span className="font-semibold text-gray-700">No milestones found</span>
            <span className="text-xs text-gray-400">
              Add a year, title, and description to get started.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredEntries.map((entry) => {
              const absoluteIndex = entries.findIndex((t) => t.id === entry.id);
              const isFirst = absoluteIndex === 0;
              const isLast = absoluteIndex === entries.length - 1;
              const side = absoluteIndex % 2 === 0 ? 'Right' : 'Left';

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-[#F8F7F5] border border-gray-100"
                >
                  <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      disabled={isFirst || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: entry.id, direction: 'up' })}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#2C0E11] hover:bg-white disabled:opacity-25 cursor-pointer"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast || moveMutation.isPending || !!searchQuery.trim()}
                      onClick={() => moveMutation.mutate({ id: entry.id, direction: 'down' })}
                      className="p-1 rounded-lg text-gray-400 hover:text-[#2C0E11] hover:bg-white disabled:opacity-25 cursor-pointer"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 tabular-nums pt-1 shrink-0">
                        {absoluteIndex + 1}.
                      </span>
                      <p className="font-semibold text-[#2C0E11] text-sm leading-snug">
                        {entry.title}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-600 tracking-wide">
                        {entry.year}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2C0E11]/5 text-[10px] font-bold text-[#2C0E11]/70 tracking-wide">
                        {side}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 pl-5">
                      {entry.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => {
                        setEditingEntry(entry);
                        setFormMode('edit');
                      }}
                      className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => setEntryToDelete(entry)}
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

      <TimelineFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialValues={
          formMode === 'edit' && editingEntry
            ? {
                year: editingEntry.year,
                title: editingEntry.title,
                description: editingEntry.description,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingEntry(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingEntry) {
            await updateMutation.mutateAsync({ id: editingEntry.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!entryToDelete}
        onClose={() => setEntryToDelete(null)}
        onConfirm={() => {
          if (entryToDelete) deleteMutation.mutate(entryToDelete.id);
        }}
        title="Delete Milestone"
        description={
          <span>
            Delete{' '}
            <strong className="text-[#2C0E11]">
              &ldquo;{entryToDelete?.title}&rdquo;
            </strong>{' '}
            ({entryToDelete?.year})?
          </span>
        }
        confirmText="Delete Milestone"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
