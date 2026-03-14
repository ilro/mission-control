import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatRelativeTime } from '../lib/api';
import {
  ArrowLeft, RefreshCw, Target, Cpu, Megaphone, Shield, DollarSign,
  FileText, Clock, Activity, BookOpen, Zap, TrendingUp
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

const EXEC_ICONS: Record<string, any> = {
  cpo: Target, cto: Cpu, cmo: Megaphone, coo: Shield, cfo: DollarSign
};

const EXEC_COLOURS: Record<string, { text: string; bg: string; glow: string; gradient: string }> = {
  cpo: {
    text: 'text-blue-400', bg: 'bg-blue-500/10',
    glow: 'shadow-blue-500/20', gradient: 'from-blue-500/20 to-blue-600/5'
  },
  cto: {
    text: 'text-purple-400', bg: 'bg-purple-500/10',
    glow: 'shadow-purple-500/20', gradient: 'from-purple-500/20 to-purple-600/5'
  },
  cmo: {
    text: 'text-pink-400', bg: 'bg-pink-500/10',
    glow: 'shadow-pink-500/20', gradient: 'from-pink-500/20 to-pink-600/5'
  },
  coo: {
    text: 'text-orange-400', bg: 'bg-orange-500/10',
    glow: 'shadow-orange-500/20', gradient: 'from-orange-500/20 to-orange-600/5'
  },
  cfo: {
    text: 'text-green-400', bg: 'bg-green-500/10',
    glow: 'shadow-green-500/20', gradient: 'from-green-500/20 to-green-600/5'
  }
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string }> = {
  active: { dot: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]', label: 'Active', text: 'text-green-400' },
  idle: { dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]', label: 'Idle', text: 'text-yellow-400' },
  offline: { dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]', label: 'Offline', text: 'text-red-400' }
};

export default function ExecutiveDetail() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const result = await api.getExecutiveDetail(id);
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load executive');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ))}
        </div>
        <div className="glass-card p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link to="/executives" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Executive Council
        </Link>
        <ErrorCard message={error || 'Executive not found'} onRetry={load} />
      </div>
    );
  }

  const colours = EXEC_COLOURS[data.id] || EXEC_COLOURS.cpo;
  const Icon = EXEC_ICONS[data.id] || Target;
  const statusCfg = STATUS_CONFIG[data.status] || STATUS_CONFIG.offline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Back nav */}
      <Link to="/executives" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Executive Council
      </Link>

      {/* Header Card */}
      <div className={`glass-card p-6 bg-gradient-to-br ${colours.gradient} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <Icon className="w-full h-full" />
        </div>
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl ${colours.bg} flex items-center justify-center border border-white/10`}>
              <Icon className={`h-8 w-8 ${colours.text}`} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className={`text-3xl font-bold ${colours.text}`}>{data.name}</h1>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
                  <span className={`text-sm font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-1">{data.title}</p>
              {data.philosophy && (
                <p className="text-sm text-muted-foreground/80 mt-2 italic max-w-xl">
                  "{data.philosophy}"
                </p>
              )}
            </div>
          </div>
          <button onClick={load} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Work Files" value={data.fileCount} colour="text-cyan-400" />
        <StatCard icon={BookOpen} label="Memos / Reports" value={data.memoCount} colour="text-purple-400" />
        <StatCard icon={Activity} label="Sessions (24h)" value={data.sessionCount} colour="text-pink-400" />
        <StatCard icon={Clock} label="Last Activity" value={formatRelativeTime(data.lastActivity)} colour="text-green-400" small />
      </div>

      {/* Focus Areas */}
      {data.focus && data.focus.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className={`h-5 w-5 ${colours.text}`} />
            <h3 className="font-semibold">Focus Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.focus.map((f: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Soul / Identity */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap className={`h-5 w-5 ${colours.text}`} />
          <h3 className="font-semibold">Identity & Soul</h3>
        </div>
        <div className="bg-black/40 rounded-xl p-4 max-h-80 overflow-y-auto">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {data.soul || 'No soul defined yet'}
          </pre>
        </div>
      </div>

      {/* Memory */}
      {data.memory && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className={`h-5 w-5 ${colours.text}`} />
            <h3 className="font-semibold">Memory</h3>
          </div>
          <div className="bg-black/40 rounded-xl p-4 max-h-60 overflow-y-auto">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {data.memory}
            </pre>
          </div>
        </div>
      )}

      {/* Work Files */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className={`h-5 w-5 ${colours.text}`} />
          <h3 className="font-semibold">Recent Work</h3>
          <span className="text-xs text-muted-foreground ml-auto">{data.workFiles.length} files</span>
        </div>
        {data.workFiles.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work files found yet.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.workFiles.map((file: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className="bg-black/40 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatRelativeTime(file.modified)}</span>
                </div>
                {file.preview && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{file.preview}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, colour, small }: { icon: any; label: string; value: string | number; colour: string; small?: boolean }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${colour}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className={`${small ? 'text-base' : 'text-2xl'} font-bold text-foreground`}>
        {value}
      </div>
    </div>
  );
}
