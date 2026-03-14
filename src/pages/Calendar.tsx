import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Calendar as CalendarIcon, Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadActivity = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getActivity();
      setActivity(data.activity || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const activityDates = new Set(
    activity
      .map((a: any) => a.time?.substring(0, 10))
      .filter((d: string) => d && d.length === 10)
  );

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Calendar & Activity</h2>
        <div className="glass-card p-4"><ListSkeleton count={5} /></div>
        <div className="glass-card p-4">
          <div className="h-64 animate-pulse bg-white/5 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar & Activity</h2>
        <button onClick={loadActivity} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadActivity} />}

      {/* Activity Feed */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold">Activity Feed</h3>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activity.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2 bg-black/40 rounded-lg">
                <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                  item.source === 'cron' ? 'bg-cyan-500/20 text-cyan-400' :
                  item.source === 'security' ? 'bg-red-500/20 text-red-400' :
                  'bg-white/10 text-muted-foreground'
                }`}>
                  {item.source}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{item.message}</div>
                  {item.time && <div className="text-xs text-muted-foreground">{item.time}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-fuchsia-400" />
            <h3 className="font-semibold">{MONTHS[month]} {year}</h3>
          </div>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasActivity = activityDates.has(dateStr);
            const isToday = isCurrentMonth && today.getDate() === day;
            return (
              <div
                key={day}
                className={`p-1.5 rounded-lg text-center text-sm transition-colors ${
                  isToday
                    ? 'bg-cyan-500/20 border border-cyan-500/40 font-bold text-cyan-400'
                    : hasActivity
                    ? 'border border-cyan-500/20 bg-cyan-500/5'
                    : 'border border-transparent hover:border-white/10'
                }`}
              >
                {day}
                {hasActivity && !isToday && (
                  <div className="w-1 h-1 rounded-full bg-cyan-400 mx-auto mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
