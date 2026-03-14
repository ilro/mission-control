import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { FolderKanban, GitBranch, Package, ExternalLink, Github, Clock, RefreshCw } from 'lucide-react';
import { GridCardSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getProjects();
      setProjects(data.projects || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const filteredProjects = projects.filter((p: any) => p.type !== 'agent');

  const typeColors: Record<string, string> = {
    github: 'bg-green-500/20 text-green-400',
    project: 'bg-blue-500/20 text-blue-400',
    agent: 'bg-purple-500/20 text-purple-400',
  };

  const isGitHub = (p: any) => p.type === 'github';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Projects</h2>
        <GridCardSkeleton count={6} cols={2} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button onClick={loadProjects} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadProjects} />}

      {filteredProjects.length === 0 && !error ? (
        <div className="glass-card p-8 text-center">
          <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No projects found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProjects.map((project: any, i: number) => (
            <div key={i} className="glass-card p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {isGitHub(project) ? (
                    <Github className="w-5 h-5 text-green-400" />
                  ) : (
                    <FolderKanban className="w-5 h-5 text-cyan-400" />
                  )}
                  {project.name}
                </h3>
                <span className={`text-xs px-2 py-1 rounded ${typeColors[project.type] || 'bg-gray-500/20 text-gray-400'}`}>
                  {project.type}
                </span>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
              )}
              {isGitHub(project) ? (
                <a
                  href={project.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 mb-3 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {project.path}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground mb-3 truncate">{project.path}</p>
              )}
              <div className="flex items-center gap-4 text-xs">
                {project.updatedAt && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" /> {formatDate(project.updatedAt)}
                  </span>
                )}
                {project.hasGit && (
                  <span className="flex items-center gap-1 text-green-400">
                    <GitBranch className="w-3 h-3" /> Git
                  </span>
                )}
                {project.hasPkg && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Package className="w-3 h-3" /> npm
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
