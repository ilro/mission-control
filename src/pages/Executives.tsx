import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatRelativeTime } from '../lib/api';
import {
  Target, Cpu, Megaphone, Shield, DollarSign,
  RefreshCw, Activity, FileText, Clock, ArrowRight, Zap
} from 'lucide-react';
import { StatsSkeleton, Skeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

const EXEC_ICONS: Record<string, any> = {
  cpo: Target, cto: Cpu, cmo: Megaphone, coo: Shield, cfo: DollarSign
};

const EXEC_COLOURS: Record<string, { text: string; border: string; bg: string; glow: string }> = {
  cpo: { text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10', glow: 'shadow-blue-500/10' },
  cto: { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/10' },
  cmo: { text: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-500/10', glow: 'shadow-pink-500/10' },
  coo: { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10', glow: 'shadow-orange-500/10' },
  cfo: { text: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/10', glow: 'shadow-green-500/10' }
};

const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string }> = {
  active: { dot: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]', label: 'Active', text: 'text-green-400' },
  idle: { dot: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]', label: 'Idle', text: 'text-yellow-400' },
  offline: { dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]', label: 'Offline', text: 'text-red-400' }
};

export default function Executives() {
  const [executives, setExecutives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    load();
  }, [load]);

  const activeCount = executives.filter(e => e.status === 'active').length;
  const idleCount = executives.filter(e => e.status === 'idle').length;
  const offlineCount = executives.filter(e => e.status === 'offline').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <StatsSkeleton cols={5} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <UsersIcon className="h-7 w-7 text-cyan-400" />
            Executive Council
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Command & control for your AI executive team</p>
        </div>
        <button onClick={load} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={load} />}

      {/* System Health Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <HealthPill colour="bg-green-400" label="Active" count={activeCount} />
            <HealthPill colour="bg-yellow-400" label="Idle" count={idleCount} />
            <HealthPill colour="bg-red-400" label="Offline" count={offlineCount} />
          </div>
          <div className="text-sm text-muted-foreground">
            {executives.length} executives · {executives.reduce((sum, e) => sum + (e.fileCount || 0), 0)} work files
          </div>
        </div>
      </div>

      {/* Executive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {executives.map((exec, i) => (
          <ExecCard key={exec.id} exec={exec} index={i} />
        ))}
      </div>

      {/* Organisation Mission */}
      <div className="glass-card p-5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">Organisation Mission</h3>
        </div>
        <p className="text-muted-foreground">
          Build profitable digital products through continuous experimentation.
          Focused on high-value compliance SaaS in regulated verticals with deep data moats.
        </p>
      </div>
    </div>
  );
}

function ExecCard({ exec, index }: { exec: any; index: number }) {
  const colours = EXEC_COLOURS[exec.id] || EXEC_COLOURS.cpo;
  const Icon = EXEC_ICONS[exec.id] || Target;
  const statusCfg = STATUS_CONFIG[exec.status] || STATUS_CONFIG.offline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
    >
      <Link
        to={`/executives/${exec.id}`}
        className={`glass-card p-5 block group hover:${colours.border} hover:${colours.glow} transition-all duration-300 relative overflow-hidden`}
      >
        {/* Background icon */}
        <div className="absolute top-2 right-2 w-20 h-20 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">
          <Icon className="w-full h-full" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={`h-10 w-10 rounded-xl ${colours.bg} flex items-center justify-center border border-white/10`}>
              <Icon className={`h-5 w-5 ${colours.text}`} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
              <span className={`text-xs font-medium ${statusCfg.text}`}>{statusCfg.label}</span>
            </div>
          </div>

          {/* Name & Title */}
          <h3 className={`text-lg font-bold ${colours.text}`}>{exec.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{exec.title}</p>

          {/* Philosophy */}
          {exec.philosophy && (
            <p className="text-xs text-muted-foreground/70 italic line-clamp-2 mb-3">
              "{exec.philosophy}"
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> {exec.fileCount} files
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatRelativeTime(exec.lastActivity)}
            </span>
          </div>

          {/* View Details */}
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View Details <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function HealthPill({ colour, label, count }: { colour: string; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${colour}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{count}</span>
    </div>
  );
}

function UsersIcon(props: any) {
  return <Activity {...props} />;
}
