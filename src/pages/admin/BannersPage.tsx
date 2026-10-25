import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import BannerFormModal from '../../components/modals/BannerFormModal';
import type { BannerFormValues } from '../../components/modals/BannerFormModal';
import {
  createBanner,
  deleteBanner,
  getBanners,
  moveBanner,
  updateBanner,
  type BannerRecord,
} from '../../services/banners.service';
import {
  ADMIN_BANNERS_QUERY_KEY,
  MARKETPLACE_BANNERS_QUERY_KEY,
} from '../../hooks/useMarketplaceBanners';
import {
  resolveMarketplaceBannerImage,
  splitBannerHeading,
} from '../../data/marketplaceBannerImages';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  ImageIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingBanner, setEditingBanner] = useState<BannerRecord | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<BannerRecord | null>(null);

  const { data: banners = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_BANNERS_QUERY_KEY,
    queryFn: getBanners,
    ...adminListQueryOptions,
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: MARKETPLACE_BANNERS_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (values: BannerFormValues) => createBanner(values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      toast.success('Banner created');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to create banner'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: BannerFormValues }) =>
      updateBanner(id, values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      setEditingBanner(null);
      toast.success('Banner updated');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update banner'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      moveBanner(id, direction),
    onSuccess: async () => {
      await invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to reorder'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBanner(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_BANNERS_QUERY_KEY });
      const previous = queryClient.getQueryData<BannerRecord[]>(ADMIN_BANNERS_QUERY_KEY);
      queryClient.setQueryData<BannerRecord[]>(ADMIN_BANNERS_QUERY_KEY, (old = []) =>
        old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADMIN_BANNERS_QUERY_KEY, context.previous);
      }
      toast.error(err instanceof Error ? err.message : 'Failed to delete banner');
    },
    onSuccess: async () => {
      setBannerToDelete(null);
      toast.success('Banner deleted');
      await invalidateAll();
    },
  });

  const filteredBanners = useMemo(() => {
    if (!searchQuery.trim()) return banners;
    const q = searchQuery.toLowerCase();
    return banners.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.heading.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
    );
  }, [banners, searchQuery]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-2">
        <StatCard label="Total Banners" value={banners.length.toString()} icon={ImageIcon} />
        <StatCard
          label="Shown on Marketplace"
          value={banners.length.toString()}
          icon={ImageIcon}
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
                placeholder="Search banners..."
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
                setEditingBanner(null);
                setFormMode('create');
              }}
              title="New Banner"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Banner</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Use arrows to arrange carousel order on the Marketplace page. Name is the top-left
          badge; heading stacks line by line.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
            <span>Loading banners...</span>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-center">
            <span className="font-semibold text-gray-700">No banners found</span>
            <span className="text-xs text-gray-400">
              Add a name, heading, description, and image to get started.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBanners.map((banner) => {
              const absoluteIndex = banners.findIndex((p) => p.id === banner.id);
              const isFirst = absoluteIndex === 0;
              const isLast = absoluteIndex === banners.length - 1;
              const headingLines = splitBannerHeading(banner.heading);

              return (
                <div
                  key={banner.id}
                  className="flex flex-col rounded-2xl bg-[#F8F7F5] border border-gray-100 overflow-hidden"
                >
                  <div className="relative w-full h-44 bg-[#0E1011]">
                    <img
                      src={resolveMarketplaceBannerImage(banner.imageKey)}
                      alt={banner.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold tracking-wide uppercase">
                      {banner.name}
                    </span>
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold tracking-wide">
                      #{absoluteIndex + 1}
                    </span>
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={isFirst || moveMutation.isPending || !!searchQuery.trim()}
                        onClick={() => moveMutation.mutate({ id: banner.id, direction: 'up' })}
                        className="p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-[#2C0E11] disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast || moveMutation.isPending || !!searchQuery.trim()}
                        onClick={() => moveMutation.mutate({ id: banner.id, direction: 'down' })}
                        className="p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-[#2C0E11] disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#2C0E11] text-sm leading-snug uppercase">
                        {headingLines.join(' · ') || banner.heading}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
                        {banner.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => {
                          setEditingBanner(banner);
                          setFormMode('edit');
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setBannerToDelete(banner)}
                        className="p-1.5 hover:bg-red-100 rounded-md text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <BannerFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialValues={
          formMode === 'edit' && editingBanner
            ? {
                name: editingBanner.name,
                heading: editingBanner.heading,
                description: editingBanner.description,
                imageKey: editingBanner.imageKey,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingBanner(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingBanner) {
            await updateMutation.mutateAsync({ id: editingBanner.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!bannerToDelete}
        onClose={() => setBannerToDelete(null)}
        onConfirm={() => {
          if (bannerToDelete) deleteMutation.mutate(bannerToDelete.id);
        }}
        title="Delete Banner"
        description={
          <span>
            Delete{' '}
            <strong className="text-[#2C0E11]">&ldquo;{bannerToDelete?.name}&rdquo;</strong>? It
            will be removed from the Marketplace carousel.
          </span>
        }
        confirmText="Delete Banner"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
