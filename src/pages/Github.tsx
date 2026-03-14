import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { GitBranch, GitCommit, RefreshCw } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

export default function Github() {
  const [github, setGithub] = useState<any>({ gitStatus: {}, commits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGithub = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getGithub();
      setGithub(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load GitHub data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGithub();
  }, [loadGithub]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">GitHub</h2>
        <div className="space-y-4">
          <div className="glass-card p-4"><ListSkeleton count={4} /></div>
          <div className="glass-card p-4"><ListSkeleton count={3} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">GitHub</h2>
        <button onClick={loadGithub} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadGithub} />}

      {/* Recent Commits */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <GitCommit className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">Recent Commits</h3>
        </div>
        {github.commits?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No commits found</p>
        ) : (
          <div className="space-y-2">
            {github.commits?.map((commit: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-black/40 rounded-lg">
                <span className="font-mono text-xs text-cyan-400 flex-shrink-0">{commit.hash}</span>
                <span className="text-sm truncate">{commit.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modified Files */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-fuchsia-400" />
          <h3 className="font-semibold">Modified Files</h3>
        </div>
        <div className="space-y-1">
          {github.gitStatus?.modified?.length > 0 ? (
            github.gitStatus.modified.map((file: string, i: number) => (
              <div key={i} className="text-sm font-mono text-muted-foreground truncate">{file}</div>
            ))
          ) : (
            <div className="text-sm text-green-400">All changes committed!</div>
          )}
        </div>
      </div>
    </div>
  );
}
