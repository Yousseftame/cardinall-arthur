import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import {
  createNote,
  deleteNote,
  ensureSuggestedNotes,
  getNotes,
  updateNote,
  updateNoteStatus,
  type NoteRecord,
  type NoteStatus,
} from '../../services/notes.service';
import { NOTES_QUERY_KEY } from '../../hooks/usePerfumeNotes';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { SUGGESTED_PERFUME_NOTES } from '../../data/perfumeNotes';
import {
  Edit2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Flower2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function StatusTogglePill({
  status,
  onChange,
}: {
  status: NoteStatus;
  onChange: (newStatus: NoteStatus) => void;
}) {
  const isActive = status === 'active';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(isActive ? 'inactive' : 'active');
      }}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border',
        isActive
          ? 'bg-[#E8F8EF] text-[#2F7D4A] border-[#BFE8CF]'
          : 'bg-stone-100 text-stone-600 border-stone-200/80'
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', isActive ? 'bg-[#83BF6E]' : 'bg-stone-400')} />
      <span className="capitalize">{status}</span>
    </button>
  );
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NoteStatus>('all');
  const [newLabel, setNewLabel] = useState('');
  const [editing, setEditing] = useState<NoteRecord | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [toDelete, setToDelete] = useState<NoteRecord | null>(null);

  const { data: notes = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: NOTES_QUERY_KEY,
    queryFn: getNotes,
    ...adminListQueryOptions,
  });

  const createMutation = useMutation({
    mutationFn: (label: string) => createNote({ label, status: 'active' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      setNewLabel('');
      toast.success('Note added');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to add note'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) =>
      updateNote(id, { label, status: editing?.status }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      setEditing(null);
      setEditLabel('');
      toast.success('Note updated');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to update note'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: NoteStatus }) =>
      updateNoteStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_QUERY_KEY });
      const previous = queryClient.getQueryData<NoteRecord[]>(NOTES_QUERY_KEY);
      queryClient.setQueryData<NoteRecord[]>(NOTES_QUERY_KEY, (old = []) =>
        old.map((n) => (n.id === id ? { ...n, status, updatedAt: new Date().toISOString() } : n))
      );
      return { previous };
    },
    onError: (err: any, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(NOTES_QUERY_KEY, ctx.previous);
      toast.error(err?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      setToDelete(null);
      toast.success('Note deleted');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to delete note'),
  });

  const seedMutation = useMutation({
    mutationFn: ensureSuggestedNotes,
    onSuccess: async (added) => {
      await queryClient.invalidateQueries({ queryKey: NOTES_QUERY_KEY });
      toast.success(added > 0 ? `Added ${added} suggested notes` : 'All suggested notes already exist');
    },
    onError: (err: any) => toast.error(err?.message || 'Failed to seed notes'),
  });

  const activeCount = notes.filter((n) => n.status === 'active').length;

  const filtered = useMemo(() => {
    let list = notes;
    if (statusFilter !== 'all') list = list.filter((n) => n.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) => n.label.toLowerCase().includes(q) || n.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }, [notes, searchQuery, statusFilter]);

  const columns: Column<NoteRecord>[] = [
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusTogglePill
          status={row.status}
          onChange={(status) => statusMutation.mutate({ id: row.id, status })}
        />
      ),
    },
    {
      id: 'label',
      header: 'Note',
      cell: (row) => (
        <div>
          <p className="font-bold text-[#2C0E11] text-sm">{row.label}</p>
          <p className="text-[11px] text-gray-400 font-mono">{row.slug}</p>
        </div>
      ),
    },
  ];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      toast.error('Enter a note name');
      return;
    }
    createMutation.mutate(newLabel.trim());
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-3">
        <StatCard label="Total Notes" value={notes.length.toString()} icon={Flower2} />
        <StatCard label="Active" value={activeCount.toString()} icon={Sparkles} />
        <StatCard
          label="Suggested Set"
          value={SUGGESTED_PERFUME_NOTES.length.toString()}
          icon={Plus}
        />
      </StatGrid>

      {/* Free-write + recommendations */}
      <div className="rounded-[24px] bg-white border border-[#2C0E11]/6 p-5 md:p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#2C0E11] tracking-tight">Add a scent note</h2>
          <p className="text-sm text-gray-500 mt-1">
            Type any note name freely. It will appear in product forms and in Find Your Perfume for shoppers.
          </p>
        </div>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Black Pepper, Fig, Leather…"
            disabled={createMutation.isPending}
            className="flex-1 h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/20 border border-transparent focus:border-[#2C0E11]/15"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white hover:bg-[#2C0E11]/90 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add note
          </button>
        </form>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recommended notes
            </p>
            <button
              type="button"
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="text-xs font-semibold text-[#2C0E11] hover:underline cursor-pointer disabled:opacity-50"
            >
              Add missing suggestions
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PERFUME_NOTES.map((n) => {
              const exists = notes.some((x) => x.slug === n.id);
              return (
                <button
                  key={n.id}
                  type="button"
                  disabled={exists || createMutation.isPending}
                  onClick={() => createMutation.mutate(n.label)}
                  title={exists ? 'Already in your list' : `Add ${n.label}`}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer disabled:cursor-default',
                    exists
                      ? 'bg-[#E8F8EF] text-[#2F7D4A] border-[#BFE8CF] opacity-80'
                      : 'bg-[#F4F4F4] text-gray-700 border-transparent hover:border-[#2C0E11]/20 hover:bg-white'
                  )}
                >
                  {n.label}
                  {exists ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(row) => row.id}
        empty={
          isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
              <span>Loading notes...</span>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="font-semibold text-gray-700">No notes yet</p>
              <p className="text-xs text-gray-400 mt-1">Add a note above or import suggestions.</p>
            </div>
          )
        }
        toolbar={
          <div className="flex flex-row items-center justify-between gap-3 max-md:flex-col max-md:items-stretch">
            <div className="relative flex-1 min-w-0 w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="h-10 sm:h-11 w-full rounded-full bg-[#F4F4F4] pr-4 pl-11 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#F4F4F4] p-1 rounded-full text-xs font-semibold">
                {(['all', 'active', 'inactive'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={cn(
                      'px-3 py-1.5 rounded-full capitalize cursor-pointer',
                      statusFilter === key ? 'bg-white text-[#2C0E11] shadow-xs' : 'text-gray-500'
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-10 w-10 rounded-full bg-[#F4F4F4] flex items-center justify-center cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        }
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setEditing(row);
                setEditLabel(row.label);
              }}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#2C0E11] cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setToDelete(row)}
              className="p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Edit modal (inline simple) */}
      {editing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#2C0E11]">Edit note</h3>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              className="w-full h-12 px-4 rounded-2xl bg-[#F4F4F4] text-sm font-medium outline-none focus:ring-2 focus:ring-[#2C0E11]/20"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="h-11 px-5 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateMutation.isPending}
                onClick={() => updateMutation.mutate({ id: editing.id, label: editLabel.trim() })}
                className="h-11 px-5 rounded-full bg-[#2C0E11] text-white text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => toDelete && deleteMutation.mutate(toDelete.id)}
        title="Delete Note"
        description={
          <span>
            Delete <strong className="text-[#2C0E11]">{toDelete?.label}</strong>? Products that
            already use this note will keep the id until you edit them.
          </span>
        }
        confirmText="Delete Note"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
