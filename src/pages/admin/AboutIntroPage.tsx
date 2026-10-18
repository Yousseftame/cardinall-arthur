import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import {
  DEFAULT_ABOUT_INTRO,
  getAboutIntro,
  updateAboutIntro,
  type AboutIntroRecord,
  type AboutIntroStat,
} from '../../services/aboutIntro.service';
import { adminListQueryOptions } from '../../lib/adminQuery';
import { FileText, Hash, RefreshCw, Save, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export const ADMIN_ABOUT_INTRO_QUERY_KEY = ['admin-about-intro'] as const;
export const STOREFRONT_ABOUT_INTRO_QUERY_KEY = ['about-intro'] as const;

function cloneIntro(source: AboutIntroRecord): AboutIntroRecord {
  return {
    description: source.description,
    stats: [
      { ...source.stats[0] },
      { ...source.stats[1] },
      { ...source.stats[2] },
    ],
    updatedAt: source.updatedAt,
  };
}

export default function AboutIntroPage() {
  const queryClient = useQueryClient();

  const { data: initial, isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_ABOUT_INTRO_QUERY_KEY,
    queryFn: getAboutIntro,
    ...adminListQueryOptions,
    staleTime: 1000 * 60 * 5,
  });

  const [formData, setFormData] = useState<AboutIntroRecord | null>(null);

  useEffect(() => {
    if (initial) setFormData(cloneIntro(initial));
  }, [initial]);

  const saveMutation = useMutation({
    mutationFn: (payload: AboutIntroRecord) =>
      updateAboutIntro({
        description: payload.description,
        stats: payload.stats,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(ADMIN_ABOUT_INTRO_QUERY_KEY, saved);
      queryClient.invalidateQueries({ queryKey: STOREFRONT_ABOUT_INTRO_QUERY_KEY });
      setFormData(cloneIntro(saved));
      toast.success('About Us Intro saved');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to save About Us Intro.';
      toast.error(message);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    saveMutation.mutate(formData);
  };

  const updateStat = (index: 0 | 1 | 2, patch: Partial<AboutIntroStat>) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const nextStats: [AboutIntroStat, AboutIntroStat, AboutIntroStat] = [
        { ...prev.stats[0] },
        { ...prev.stats[1] },
        { ...prev.stats[2] },
      ];
      nextStats[index] = { ...nextStats[index], ...patch };
      return { ...prev, stats: nextStats };
    });
  };

  const handleResetDefaults = () => {
    setFormData(cloneIntro(DEFAULT_ABOUT_INTRO));
    toast.success('Form reset to defaults (not saved yet)');
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-[#2C0E11] animate-spin" />
      </div>
    );
  }

  const filledStats = formData.stats.filter((s) => s.value.trim() && s.label.trim()).length;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h2 className="text-2xl font-bold text-[#2C0E11] tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#2C0E11]" />
            About Us Intro
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Edit the About page intro description and the three highlight stats.
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
            onClick={handleResetDefaults}
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

      <StatGrid className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Description length" value={`${formData.description.length} chars`} icon={FileText} />
        <StatCard label="Stats configured" value={`${filledStats} of 3`} icon={Hash} />
        <StatCard
          label="Last saved"
          value={
            formData.updatedAt && formData.updatedAt !== DEFAULT_ABOUT_INTRO.updatedAt
              ? new Date(formData.updatedAt).toLocaleDateString()
              : 'Not saved yet'
          }
          icon={Sparkles}
        />
      </StatGrid>

      <section className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-sm font-bold text-[#2C0E11] uppercase tracking-wider mb-1">
            Description
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Shown as the large intro paragraph on the About page (typically uppercase on storefront).
          </p>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
            rows={6}
            required
            className="w-full rounded-2xl bg-[#F4F4F4] px-4 py-3 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#2C0E11]/15 transition-all border border-transparent focus:border-[#2C0E11]/15 resize-y min-h-[140px]"
            placeholder="Enter the About intro description..."
          />
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-sm font-bold text-[#2C0E11] uppercase tracking-wider mb-1">
            Highlight stats
          </h3>
          <p className="text-xs text-gray-500">
            Three numbers shown under the description (value + label).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {formData.stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl bg-[#F4F4F4]/80 border border-gray-100 p-4 sm:p-5 space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
                Stat {index + 1}
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateStat(index as 0 | 1 | 2, { value: e.target.value })}
                  required
                  maxLength={24}
                  placeholder="e.g. 10+"
                  className="w-full h-11 rounded-xl bg-white px-3 text-sm font-semibold text-gray-900 outline-none border border-gray-200 focus:border-[#2C0E11] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index as 0 | 1 | 2, { label: e.target.value })}
                  required
                  maxLength={64}
                  placeholder="e.g. YEARS OF EXPERIENCE"
                  className="w-full h-11 rounded-xl bg-white px-3 text-sm font-medium text-gray-900 outline-none border border-gray-200 focus:border-[#2C0E11] transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
