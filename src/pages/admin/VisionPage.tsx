import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import {
  DEFAULT_VISION,
  getVision,
  updateVision,
  type VisionRecord,
} from '../../services/vision.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { Eye, FileText, RefreshCw, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const ADMIN_VISION_QUERY_KEY = ['admin-vision'] as const;
export const STOREFRONT_VISION_QUERY_KEY = ['vision'] as const;

export default function VisionPage() {
  const queryClient = useQueryClient();

  const { data: initial, isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_VISION_QUERY_KEY,
    queryFn: getVision,
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 5,
  });

  const [formData, setFormData] = useState<VisionRecord | null>(null);

  useEffect(() => {
    if (initial) setFormData({ ...initial });
  }, [initial]);

  const saveMutation = useMutation({
    mutationFn: (payload: VisionRecord) => updateVision({ text: payload.text }),
    onSuccess: (saved) => {
      queryClient.setQueryData(ADMIN_VISION_QUERY_KEY, saved);
      queryClient.invalidateQueries({ queryKey: STOREFRONT_VISION_QUERY_KEY });
      setFormData({ ...saved });
      toast.success('Vision saved');
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save Vision.');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    saveMutation.mutate(formData);
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#2C0E11] animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#2C0E11] tracking-tight flex items-center gap-2">
            <Eye className="w-6 h-6 text-[#2C0E11]" />
            Vision
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Edit the Vision statement shown on the About page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
            title="Refresh this page only"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...DEFAULT_VISION })}
            className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-[#F4F4F4] px-5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Reset defaults
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2C0E11] px-6 text-sm font-bold text-white transition-all hover:bg-[#2C0E11]/90 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {saveMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-2">
        <StatCard label="Text length" value={`${formData.text.length} chars`} icon={FileText} />
        <StatCard
          label="Last saved"
          value={
            formData.updatedAt && formData.updatedAt !== DEFAULT_VISION.updatedAt
              ? new Date(formData.updatedAt).toLocaleDateString()
              : 'Not saved yet'
          }
          icon={Sparkles}
        />
      </StatGrid>

      <section className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-bold text-[#2C0E11] uppercase tracking-wider mb-1">
          Vision statement
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Shown in white on the About page (typically uppercase on storefront).
        </p>
        <textarea
          value={formData.text}
          onChange={(e) => setFormData((prev) => (prev ? { ...prev, text: e.target.value } : prev))}
          rows={8}
          required
          className="w-full rounded-2xl bg-[#F4F4F4] px-4 py-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/15 transition-all border border-transparent focus:border-[#2C0E11]/15 resize-y min-h-[180px]"
          placeholder="Enter the vision statement..."
        />
      </section>
    </form>
  );
}
