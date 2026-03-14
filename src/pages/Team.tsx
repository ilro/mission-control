import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Key, Shield, Play, RefreshCw } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

export default function Team() {
  const [keys, setKeys] = useState<any[]>([]);
  const [crons, setCrons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [keysData, cronData] = await Promise.all([
        api.getKeys(),
        api.getCron()
      ]);
      setKeys(keysData.keys || []);
      setCrons(cronData.crons || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runCron = async (script: string) => {
    if (!script) return;
    const scriptName = script.split('/').pop()?.replace('.sh', '') || '';
    if (confirm(`Run ${scriptName}?`)) {
      try {
        await api.runCron(scriptName);
        alert('Cron started!');
      } catch (e: any) {
        alert('Failed: ' + e.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Team & Config</h2>
        <div className="space-y-4">
          <div className="glass-card p-4"><ListSkeleton count={3} /></div>
          <div className="glass-card p-4"><ListSkeleton count={4} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team & Config</h2>
        <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadData} />}

      {/* API Keys */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">API Keys</h3>
        </div>
        {keys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No API keys configured</p>
        ) : (
          <div className="space-y-2">
            {keys.map((key: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
                <span className="font-medium">{key.name}</span>
                <span className={`text-sm ${key.hasKey ? 'text-green-400' : 'text-red-400'}`}>
                  {key.hasKey ? '✓ Configured' : '✗ Missing'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crons */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-fuchsia-400" />
          <h3 className="font-semibold">Cron Jobs</h3>
        </div>
        {crons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No cron jobs configured</p>
        ) : (
          <div className="space-y-2">
            {crons.map((cron: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
                <div className="min-w-0">
                  <span className="font-mono text-sm">{cron.schedule}</span>
                  <span className="text-xs text-muted-foreground ml-2 truncate">{cron.command}</span>
                </div>
                <button
                  onClick={() => runCron(cron.command)}
                  className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded hover:bg-cyan-500/20 transition-colors flex items-center gap-1 flex-shrink-0 ml-2"
                >
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
