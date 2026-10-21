import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/ui/StatCard';
import ConfirmationModal from '../../components/modals/ConfirmationModal';
import LatestProjectFormModal from '../../components/modals/LatestProjectFormModal';
import type { LatestProjectFormValues } from '../../components/modals/LatestProjectFormModal';
import {
  createLatestProject,
  deleteLatestProject,
  getLatestProjects,
  moveLatestProject,
  updateLatestProject,
  type LatestProjectRecord,
} from '../../services/latestProjects.service';
import {
  ADMIN_LATEST_PROJECTS_QUERY_KEY,
  LATEST_PROJECTS_QUERY_KEY,
} from '../../hooks/useLatestProjects';
import { resolveLatestProjectImage } from '../../data/latestProjectImages';
import { adminListQueryOptions } from '../../lib/adminQuery';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LatestProjectsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingProject, setEditingProject] = useState<LatestProjectRecord | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<LatestProjectRecord | null>(null);

  const { data: projects = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ADMIN_LATEST_PROJECTS_QUERY_KEY,
    queryFn: getLatestProjects,
    ...adminListQueryOptions,
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ADMIN_LATEST_PROJECTS_QUERY_KEY });
    await queryClient.invalidateQueries({ queryKey: LATEST_PROJECTS_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (values: LatestProjectFormValues) => createLatestProject(values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      toast.success('Project created');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to create project'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: LatestProjectFormValues }) =>
      updateLatestProject(id, values),
    onSuccess: async () => {
      await invalidateAll();
      setFormMode(null);
      setEditingProject(null);
      toast.success('Project updated');
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to update project'),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'up' | 'down' }) =>
      moveLatestProject(id, direction),
    onSuccess: async () => {
      await invalidateAll();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : 'Failed to reorder'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLatestProject(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_LATEST_PROJECTS_QUERY_KEY });
      const previous = queryClient.getQueryData<LatestProjectRecord[]>(
        ADMIN_LATEST_PROJECTS_QUERY_KEY
      );
      queryClient.setQueryData<LatestProjectRecord[]>(
        ADMIN_LATEST_PROJECTS_QUERY_KEY,
        (old = []) => old.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADMIN_LATEST_PROJECTS_QUERY_KEY, context.previous);
      }
      toast.error(err instanceof Error ? err.message : 'Failed to delete project');
    },
    onSuccess: async () => {
      setProjectToDelete(null);
      toast.success('Project deleted');
      await invalidateAll();
    },
  });

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.buttonText.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <StatGrid className="!grid-cols-1 sm:!grid-cols-2 xl:!grid-cols-2">
        <StatCard label="Total Projects" value={projects.length.toString()} icon={LayoutGrid} />
        <StatCard label="Shown on Home" value={projects.length.toString()} icon={LayoutGrid} />
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
                placeholder="Search projects..."
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
                setEditingProject(null);
                setFormMode('create');
              }}
              title="New Project"
              className="inline-flex h-10 w-10 sm:h-11 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#2C0E11] sm:px-6 text-sm font-bold text-white transition-colors hover:bg-[#2C0E11]/90 shadow-sm shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Use arrows to arrange the order on the home page. The first project opens the
          sequence; each following project overlaps it exactly as before.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin text-[#2C0E11]" />
            <span>Loading projects...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 py-16 text-center">
            <span className="font-semibold text-gray-700">No projects found</span>
            <span className="text-xs text-gray-400">
              Add a title, description, and image to get started.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => {
              const absoluteIndex = projects.findIndex((p) => p.id === project.id);
              const isFirst = absoluteIndex === 0;
              const isLast = absoluteIndex === projects.length - 1;

              return (
                <div
                  key={project.id}
                  className="flex flex-col rounded-2xl bg-[#F8F7F5] border border-gray-100 overflow-hidden"
                >
                  <div className="relative w-full h-44 bg-[#0E1011]">
                    <img
                      src={resolveLatestProjectImage(project.imageKey)}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold tracking-wide">
                      #{absoluteIndex + 1}
                    </span>
                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={isFirst || moveMutation.isPending || !!searchQuery.trim()}
                        onClick={() => moveMutation.mutate({ id: project.id, direction: 'up' })}
                        className="p-1.5 rounded-lg bg-white/90 text-gray-500 hover:text-[#2C0E11] disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast || moveMutation.isPending || !!searchQuery.trim()}
                        onClick={() => moveMutation.mutate({ id: project.id, direction: 'down' })}
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
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-1">
                        {project.description}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-400 mt-2">
                        Button: {project.buttonText}
                        {project.buttonLink ? ` → ${project.buttonLink}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Edit"
                        onClick={() => {
                          setEditingProject(project);
                          setFormMode('edit');
                        }}
                        className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => setProjectToDelete(project)}
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

      <LatestProjectFormModal
        isOpen={formMode !== null}
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialValues={
          formMode === 'edit' && editingProject
            ? {
                title: editingProject.title,
                description: editingProject.description,
                buttonText: editingProject.buttonText,
                buttonLink: editingProject.buttonLink,
                imageKey: editingProject.imageKey,
              }
            : undefined
        }
        isLoading={isFormSubmitting}
        onClose={() => {
          if (isFormSubmitting) return;
          setFormMode(null);
          setEditingProject(null);
        }}
        onSubmit={async (values) => {
          if (formMode === 'edit' && editingProject) {
            await updateMutation.mutateAsync({ id: editingProject.id, values });
          } else {
            await createMutation.mutateAsync(values);
          }
        }}
      />

      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) deleteMutation.mutate(projectToDelete.id);
        }}
        title="Delete Project"
        description={
          <span>
            Delete{' '}
            <strong className="text-[#2C0E11]">&ldquo;{projectToDelete?.title}&rdquo;</strong>?
            It will be removed from the home page.
          </span>
        }
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
