import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Target, TrendingUp, RefreshCw } from 'lucide-react';
import { StatsSkeleton, Skeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

const EXECUTIVE_COLORS: Record<string, string> = {
  cpo: 'text-blue-400',
  cto: 'text-purple-400',
  cmo: 'text-pink-400',
  coo: 'text-orange-400',
  cfo: 'text-green-400'
};

export default function Executives() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExecutives = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getExecutives();
      setExecutives(data.executives || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load executives');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExecutives();
  }, [loadExecutives]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Executive Council</h2>
        <StatsSkeleton cols={5} />
        <div className="glass-card p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Executive Council</h2>
        <button onClick={loadExecutives} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadExecutives} />}

      {/* Executive Cards */}
      <div className="grid grid-cols-5 gap-4">
        {executives.map((exec: any, i: number) => (
          <button
            key={i}
            onClick={() => setSelected(exec)}
            className={`glass-card p-4 text-left hover:border-cyan-500/30 transition-all ${
              selected?.name === exec.name ? 'border-cyan-500/40' : ''
            }`}
          >
            <div className={`font-bold text-lg ${EXECUTIVE_COLORS[exec.name.toLowerCase()] || 'text-foreground'}`}>
              {exec.name}
            </div>
            <div className="text-sm text-muted-foreground">{exec.title}</div>
            <div className="mt-2 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
              Active
            </div>
          </button>
        ))}
      </div>

      {/* Selected Executive Detail */}
      {selected && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-3xl font-bold ${EXECUTIVE_COLORS[selected.name.toLowerCase()] || 'text-foreground'}`}>
              {selected.name}
            </span>
            <div>
              <div className="text-xl font-semibold">{selected.title}</div>
              <div className="text-sm text-green-400">Active</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-muted-foreground mb-2">Philosophy & Role</h4>
              <div className="text-sm p-3 bg-black/40 rounded-lg">
                {selected.soul || 'No soul defined yet'}
              </div>
            </div>

            {selected.memory && (
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Current Focus</h4>
                <div className="text-sm p-3 bg-black/40 rounded-lg">
                  {selected.memory}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Council Mission */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">Organisation Mission</h3>
        </div>
        <p className="text-lg">Build profitable digital products through continuous experimentation.</p>
      </div>

      {/* Council Priorities */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-fuchsia-400" />
          <h3 className="font-semibold">Council Priorities</h3>
        </div>
        <ul className="space-y-2 text-sm">
          <li>1. Launch AccessiScan paid tier</li>
          <li>2. Build platform spine (shared infra)</li>
          <li>3. Narrow BizBot to one vertical</li>
          <li>4. Consolidate to 3 core products</li>
          <li>5. Build owned audience</li>
        </ul>
      </div>
    </div>
  );
}

