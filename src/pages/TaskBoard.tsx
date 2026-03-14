import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Activity, Play, Bot, Clock, CheckCircle, Loader2, Terminal, AlertCircle } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';

export default function TaskBoard() {
  const [subagents, setSubagents] = useState<any[]>([]);
  const [crons, setCrons] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'cron'>('tasks');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [subagentData, cronData] = await Promise.all([
        api.getSubagents().catch(() => ({ subagents: [] })),
        api.getCron().catch(() => ({ crons: [], runs: [] })),
      ]);
      setSubagents(subagentData.subagents || []);
      setCrons(cronData.crons || []);
      setRuns(cronData.runs || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'running') {
      return <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'running') return 'border-l-cyan-400';
    return 'border-l-green-400';
  };

  const getFriendlyName = (command: string) => {
    const script = command.split('/').pop()?.replace('.sh', '') || '';
    const map: Record<string, string> = {
      'github-backup': 'GitHub Backup',
      'weekly-audit': 'Weekly Audit',
      'security-audit': 'Security Audit',
      'security-fix': 'Security Fix',
      'api-check': 'API Check',
      'meta-cron': 'Meta Cron',
      'cron-summary': 'Daily Summary',
      'alerts-job': 'Alerts',
      'business-radar': 'Business Radar',
      'daily-research': 'Daily Research',
      'morning-briefing': 'Morning Briefing',
      'post-radar': 'Post Radar',
      'sessions-to-markdown': 'Session Memory',
      'run-nightly': 'Nightly Security',
    };
    return map[script] || script;
  };

  const runCron = async (command: string) => {
    if (!command) return;
    const scriptName = command.split('/').pop()?.replace('.sh', '') || '';
    if (confirm('Run ' + scriptName + '?')) {
      try {
        await api.runCron(scriptName);
        alert('Cron started!');
        loadData();
      } catch (e: any) {
        alert('Failed to start cron: ' + e.message);
      }
    }
  };

  // Separate running vs completed tasks
  const runningTasks = subagents.filter((t) => t.status === 'running');
  const completedTasks = subagents.filter((t) => t.status !== 'running');

  // Categorize crons by frequency/type instead of broken modulo
  const shortInterval = crons.filter((c) => {
    const sched = c.schedule.split(' ');
    return sched[1] === '*' && sched[2] === '*'; // runs every hour or more frequently
  });
  const dailyJobs = crons.filter((c) => {
    const sched = c.schedule.split(' ');
    return sched[1] !== '*' && sched[2] === '*'; // specific hour, every day
  });
  const weeklyJobs = crons.filter((c) => {
    const sched = c.schedule.split(' ');
    return sched[2] !== '*' && sched[4] !== '*'; // specific day of week
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <ListSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Board</h2>
        
        {/* Tab Toggle */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tasks' 
                ? 'bg-cyan-500 text-black' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            Active Tasks
          </button>
          <button
            onClick={() => setActiveTab('cron')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'cron' 
                ? 'bg-cyan-500 text-black' 
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4 inline mr-2" />
            Cron Jobs
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 border-l-4 border-l-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* TASKS VIEW */}
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
                {runningTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-black/40 p-4 rounded-lg border-l-4 ${getStatusColor(task.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="font-medium">{task.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.runtime}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Model: {task.model}
                    </div>
                    {task.tokens > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Tokens: {task.tokens.toLocaleString()}
                      </div>
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
                {completedTasks.slice(0, 12).map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-black/40 p-3 rounded-lg border-l-4 ${getStatusColor(task.status)} opacity-70`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
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

      {/* CRON VIEW */}
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
                  <div key={i} className="text-sm text-muted-foreground font-mono">
                    {run.line || run.timestamp}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 text-cyan-400">Frequent (≤ Hourly)</h3>
              <div className="space-y-3">
                {shortInterval.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  shortInterval.map((cron, i) => (
                    <CronCard key={i} cron={cron} onRun={runCron} friendlyName={getFriendlyName} />
                  ))
                )}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 text-purple-400">Daily</h3>
              <div className="space-y-3">
                {dailyJobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  dailyJobs.map((cron, i) => (
                    <CronCard key={i} cron={cron} onRun={runCron} friendlyName={getFriendlyName} />
                  ))
                )}
              </div>
            </div>

            <div className="glass-card p-4">
              <h3 className="font-semibold mb-4 text-green-400">Weekly</h3>
              <div className="space-y-3">
                {weeklyJobs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">None</p>
                ) : (
                  weeklyJobs.map((cron, i) => (
                    <CronCard key={i} cron={cron} onRun={runCron} friendlyName={getFriendlyName} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CronCard({ cron, onRun, friendlyName }: { cron: any; onRun: (cmd: string) => void; friendlyName: (cmd: string) => string }) {
  return (
    <div className="bg-black/40 p-3 rounded-lg border border-white/5">
      <div className="text-xs font-mono text-muted-foreground">{cron.schedule}</div>
      <div className="text-sm font-medium truncate">{friendlyName(cron.command)}</div>
      <button 
        onClick={() => onRun(cron.command)} 
        className="mt-2 text-xs flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Play className="w-3 h-3" /> Run Now
      </button>
    </div>
  );
}
