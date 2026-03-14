import { useState, useEffect, useCallback } from 'react';
import { api, formatBytes, formatUptime } from '../lib/api';
import { Cpu, HardDrive, Network, Server, Activity, RefreshCw } from 'lucide-react';
import { StatsSkeleton, TableSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

export default function Office() {
  const [system, setSystem] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [sysData, svcData, netData] = await Promise.all([
        api.getSystem(),
        api.getServices(),
        api.getNetwork()
      ]);
      setSystem(sysData);
      setServices(svcData.services || []);
      setNetwork(netData.interfaces || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load system data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">System Status</h2>
        <StatsSkeleton cols={4} />
        <div className="glass-card p-4"><TableSkeleton rows={3} /></div>
        <div className="glass-card p-4"><TableSkeleton rows={2} /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Status</h2>
        <button onClick={loadData} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadData} />}

      {/* System Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* CPU */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="text-sm text-muted-foreground">CPU</span>
          </div>
          <div className="text-2xl font-bold">{system?.cpu?.load?.toFixed(1) || 0}%</div>
          <div className="text-xs text-muted-foreground">{system?.cpu?.cores?.length || 0} cores</div>
        </div>

        {/* Memory */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-fuchsia-400" />
            <span className="text-sm text-muted-foreground">Memory</span>
          </div>
          <div className="text-2xl font-bold">
            {system?.memory ? formatBytes(system.memory.used) : '0 B'}
          </div>
          <div className="text-xs text-muted-foreground">
            of {system?.memory ? formatBytes(system.memory.total) : '0 B'}
          </div>
        </div>

        {/* Disk */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-muted-foreground">Disk</span>
          </div>
          <div className="text-2xl font-bold">
            {system?.disk?.[1] ? system.disk[1].use.toFixed(1) + '%' : '0%'}
          </div>
          <div className="text-xs text-muted-foreground">
            {system?.disk?.[1] ? formatBytes(system.disk[1].used) + ' used' : ''}
          </div>
        </div>

        {/* Uptime */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="text-sm text-muted-foreground">Uptime</span>
          </div>
          <div className="text-2xl font-bold">
            {system?.os?.uptime ? formatUptime(system.os.uptime) : '0m'}
          </div>
          <div className="text-xs text-muted-foreground">{system?.os?.distro || 'Linux'}</div>
        </div>
      </div>

      {/* Services */}
      <div className="glass-card p-4">
        <h3 className="font-semibold mb-4">Services</h3>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">No services detected</p>
        ) : (
          <div className="space-y-2">
            {services.map((svc: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
                <span className="font-medium">{svc.name}</span>
                <span className={`text-sm ${svc.status === 'running' ? 'text-green-400' : 'text-red-400'}`}>
                  {svc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">Network</h3>
        </div>
        {network.length === 0 ? (
          <p className="text-sm text-muted-foreground">No network interfaces detected</p>
        ) : (
          <div className="space-y-2">
            {network.map((iface: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-black/40 rounded-lg">
                <span className="font-medium">{iface.name}</span>
                <span className="text-sm text-muted-foreground">{iface.ip4 || 'No IP'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
