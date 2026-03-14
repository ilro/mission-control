import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, formatBytes, formatRelativeTime } from '../lib/api';
import {
  Activity, Play, Bot, Clock, CheckCircle, Loader2, Terminal,
  Cpu, HardDrive, MemoryStick, Zap, Target, Megaphone,
  DollarSign, Shield, RefreshCw, FileText, GitCommit, Brain,
  ChevronRight
} from 'lucide-react';
import { ListSkeleton, StatsSkeleton, Skeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

const EXEC_ICONS: Record<string, any> = {
  cpo: Target, cto: Cpu, cmo: Megaphone, coo: Shield, cfo: DollarSign
};

const EXEC_COLOURS: Record<string, { text: string; bg: string }> = {
  cpo: { text: 'text-blue-400', bg: 'bg-blue-500/10' },
  cto: { text: 'text-purple-400', bg: 'bg-purple-500/10' },
  cmo: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
  coo: { text: 'text-orange-400', bg: 'bg-orange-500/10' },
  cfo: { text: 'text-green-400', bg: 'bg-green-500/10' }
};

const STATUS_CONFIG: Record<string, { dot: string; text: string }> = {
  active: { dot: 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]', text: 'text-green-400' },
  idle: { dot: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]', text: 'text-yellow-400' },
  offline: { dot: 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]', text: 'text-red-400' }
};

export default function TaskBoard() {
  const [system, setSystem] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [executives, setExecutives] = useState<any[]>([]);
  const [subagents, setSubagents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [crons, setCrons] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'cron' | 'activity'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [sysData, sumData, execData, subData, timeData, cronData] = await Promise.all([
        api.getSystem().catch(() => null),
        api.getWorkspaceSummary().catch(() => null),
        api.getExecutives().catch(() => ({ executives: [] })),
        api.getSubagents().catch(() => ({ subagents: [] })),
        api.getActivityTimeline().catch(() => ({ events: [] })),
        api.getCron().catch(() => ({ crons: [], runs: [] })),
      ]);
      setSystem(sysData);
      setSummary(sumData);
      setExecutives(execData.executives || []);
      setSubagents(subData.subagents || []);
      setTimeline(timeData.events || []);
      setCrons(cronData.crons || []);
      setRuns(cronData.runs || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const runningTasks = subagents.filter(t => t.status === 'running');
  const completedTasks = subagents.filter(t => t.status !== 'running');

  const shortInterval = crons.filter(c => {
    const sched = c.schedule.split(' ');
    return sched[1] === '*' && sched[2] === '*';
  });
  const dailyJobs = crons.filter(c => {
    const sched = c.schedule.split(' ');
    return sched[1] !== '*' && sched[2] === '*';
  });
  const weeklyJobs = crons.filter(c => {
    const sched = c.schedule.split(' ');
    return sched[2] !== '*' && sched[4] !== '*';
  });

  const runCron = async (command: string) => {
    if (!command) return;
    const scriptName = command.split('/').pop()?.replace('.sh', '') || '';
    if (confirm('Run ' + scriptName + '?')) {
      try {
        await api.runCron(scriptName);
        loadData();
      } catch (e: any) {
        alert('Failed: ' + e.message);
      }
    }
  };

  const getFriendlyName = (command: string) => {
    const script = command.split('/').pop()?.replace('.sh', '') || '';
    const map: Record<string, string> = {
      'github-backup': 'GitHub Backup', 'weekly-audit': 'Weekly Audit',
      'security-audit': 'Security Audit', 'security-fix': 'Security Fix',
      'api-check': 'API Check', 'meta-cron': 'Meta Cron', 'cron-summary': 'Daily Summary',
      'alerts-job': 'Alerts', 'business-radar': 'Business Radar',
      'daily-research': 'Daily Research', 'morning-briefing': 'Morning Briefing',
      'post-radar': 'Post Radar', 'sessions-to-markdown': 'Session Memory',
      'run-nightly': 'Nightly Security',
    };
    return map[script] || script;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <StatsSkeleton cols={4} />
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-3 space-y-2"><Skeleton className="h-12 w-full rounded-lg" /></div>
          ))}
        </div>
        <ListSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mission Control</h2>
          <p className="text-sm text-muted-foreground">System overview & operations</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          {/* Tab Toggle */}
          <div className="flex gap-1 bg-black/40 p-1 rounded-lg ml-2">
            {(['overview', 'tasks', 'cron', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  activeTab === tab ? 'bg-cyan-500 text-black' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <ErrorCard message={error} onRetry={loadData} />}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SystemStatCard
              icon={Cpu} label="CPU Load"
              value={system ? `${system.cpu.load.toFixed(1)}%` : '—'}
              colour="text-cyan-400" bg="bg-cyan-500/10"
            />
            <SystemStatCard
              icon={MemoryStick} label="Memory"
              value={system ? `${formatBytes(system.memory.used)} / ${formatBytes(system.memory.total)}` : '—'}
              colour="text-purple-400" bg="bg-purple-500/10"
            />
            <SystemStatCard
              icon={HardDrive} label="Disk"
              value={system?.disk?.[0] ? `${system.disk[0].use.toFixed(1)}%` : '—'}
              colour="text-pink-400" bg="bg-pink-500/10"
            />
            <SystemStatCard
              icon={Activity} label="Uptime"
              value={system ? formatUptimeShort(system.time.uptime) : '—'}
              colour="text-green-400" bg="bg-green-500/10"
            />
          </div>

          {/* Executive Status Row */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <h3 className="font-semibold text-sm">Executive Council</h3>
              </div>
              <Link to="/executives" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {executives.map(exec => {
                const colours = EXEC_COLOURS[exec.id] || EXEC_COLOURS.cpo;
                const Icon = EXEC_ICONS[exec.id] || Target;
                const statusCfg = STATUS_CONFIG[exec.status] || STATUS_CONFIG.offline;
                return (
                  <Link
                    key={exec.id}
                    to={`/executives/${exec.id}`}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <div className={`h-10 w-10 rounded-xl ${colours.bg} flex items-center justify-center border border-white/10`}>
                      <Icon className={`h-5 w-5 ${colours.text}`} />
                    </div>
                    <span className={`text-xs font-bold ${colours.text}`}>{exec.name}</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      <span className={`text-[10px] ${statusCfg.text}`}>{exec.status}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <MiniStat label="Agents" value={summary?.agentCount || 0} icon={Bot} colour="text-cyan-400" />
            <MiniStat label="Active Sessions" value={summary?.activeSessions || 0} icon={Activity} colour="text-green-400" />
            <MiniStat label="Files Today" value={summary?.filesModifiedToday || 0} icon={FileText} colour="text-purple-400" />
            <MiniStat label="Commits Today" value={summary?.commitsToday || 0} icon={GitCommit} colour="text-pink-400" />
            <MiniStat label="Memory Files" value={summary?.memoryFileCount || 0} icon={Brain} colour="text-orange-400" />
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" /> Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <QuickAction label="View Logs" icon={Terminal} onClick={() => setActiveTab('activity')} />
              <QuickAction label="Run Cron" icon={Play} onClick={() => setActiveTab('cron')} />
              <QuickAction label="Active Tasks" icon={Bot} onClick={() => setActiveTab('tasks')} />
              <QuickAction label="Refresh All" icon={RefreshCw} onClick={loadData} />
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" /> Recent Activity (24h)
              </h3>
              <button onClick={() => setActiveTab('activity')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity in the last 24 hours.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {timeline.slice(0, 8).map((event, i) => (
                  <TimelineItem key={i} event={event} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Running Tasks Preview */}
          {runningTasks.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" /> Running Tasks
                </h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {runningTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="bg-black/40 p-3 rounded-lg border-l-2 border-l-cyan-400 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{task.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{task.runtime}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Running Tasks */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold">Running Tasks ({runningTasks.length})</h3>
            </div>
            {runningTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active tasks. Spawn a subagent to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {runningTasks.map(task => (
                  <div key={task.id} className="bg-black/40 p-4 rounded-lg border-l-4 border-l-cyan-400">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        <span className="font-medium">{task.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.runtime}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Model: {task.model}</div>
                    {task.tokens > 0 && (
                      <div className="text-xs text-muted-foreground">Tokens: {task.tokens.toLocaleString()}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold">Recent Tasks ({completedTasks.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completedTasks.slice(0, 12).map(task => (
                  <div key={task.id} className="bg-black/40 p-3 rounded-lg border-l-4 border-l-green-400 opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-sm">{task.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.runtime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRON TAB */}
      {activeTab === 'cron' && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="font-semibold">Recent Runs</h3>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent runs</p>
              ) : (
                runs.slice(0, 10).map((run, i) => (
                  <div key={i} className="text-sm text-muted-foreground font-mono">{run.line || run.timestamp}</div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CronSection title="Frequent (≤ Hourly)" colour="text-cyan-400" crons={shortInterval} onRun={runCron} friendlyName={getFriendlyName} />
            <CronSection title="Daily" colour="text-purple-400" crons={dailyJobs} onRun={runCron} friendlyName={getFriendlyName} />
            <CronSection title="Weekly" colour="text-green-400" crons={weeklyJobs} onRun={runCron} friendlyName={getFriendlyName} />
          </div>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold">Activity Timeline (24h)</h3>
          </div>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity in the last 24 hours.</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {timeline.map((event, i) => (
                <TimelineItem key={i} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SystemStatCard({ icon: Icon, label, value, colour, bg }: any) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-8 w-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${colour}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon, colour }: any) {
  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <Icon className={`h-4 w-4 ${colour} flex-shrink-0`} />
      <div>
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 p-3 rounded-xl bg-black/30 hover:bg-black/50 border border-white/5 hover:border-white/10 transition-all text-sm text-muted-foreground hover:text-foreground"
    >
      <Icon className="h-4 w-4 text-cyan-400" />
      {label}
    </button>
  );
}

function TimelineItem({ event, index }: { event: any; index: number }) {
  const getIcon = () => {
    switch (event.type) {
      case 'commit': return <GitCommit className="h-4 w-4 text-green-400" />;
      case 'memory': return <Brain className="h-4 w-4 text-purple-400" />;
      case 'agent_work': return <Bot className="h-4 w-4 text-cyan-400" />;
      case 'cron': return <Clock className="h-4 w-4 text-orange-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getBg = () => {
    switch (event.type) {
      case 'commit': return 'border-l-green-400';
      case 'memory': return 'border-l-purple-400';
      case 'agent_work': return 'border-l-cyan-400';
      case 'cron': return 'border-l-orange-400';
      default: return 'border-l-muted';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`bg-black/30 p-3 rounded-lg border-l-2 ${getBg()} flex items-start gap-3`}
    >
      <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">{event.message}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">{event.source}</span>
          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(event.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}

function CronSection({ title, colour, crons, onRun, friendlyName }: any) {
  return (
    <div className="glass-card p-4">
      <h3 className={`font-semibold mb-4 ${colour}`}>{title}</h3>
      <div className="space-y-3">
        {crons.length === 0 ? (
          <p className="text-xs text-muted-foreground">None</p>
        ) : (
          crons.map((cron: any, i: number) => (
            <div key={i} className="bg-black/40 p-3 rounded-lg border border-white/5">
              <div className="text-xs font-mono text-muted-foreground">{cron.schedule}</div>
              <div className="text-sm font-medium truncate">{friendlyName(cron.command)}</div>
              <button onClick={() => onRun(cron.command)} className="mt-2 text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Play className="w-3 h-3" /> Run Now
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatUptimeShort(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h`;
}
