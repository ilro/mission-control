import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { Brain, X, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { ListSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalLock } from '../hooks/useModalLock';

export default function Memories() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => { setSelected(null); setContent(null); }, []);
  useModalLock(!!selected, closeModal);

  const loadMemories = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getMemories();
      setMemories(data.memories || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const viewMemory = async (mem: any) => {
    setSelected(mem);
    setContentLoading(true);
    try {
      const data = await api.getMemoryContent(mem.name);
      setContent(data.content);
    } catch {
      setContent('Failed to load content');
    } finally {
      setContentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Memories</h2>
        <ListSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Memories</h2>
        <button onClick={loadMemories} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadMemories} />}

      {memories.length === 0 && !error ? (
        <div className="glass-card p-8 text-center">
          <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No memories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {memories.map((mem: any, i: number) => (
            <button
              key={i}
              onClick={() => viewMemory(mem)}
              className={`glass-card p-4 text-left hover:border-cyan-500/30 transition-all ${
                selected?.name === mem.name ? 'border-cyan-500/40' : ''
              }`}
            >
              <h3 className="font-semibold text-cyan-400 flex items-center gap-2">
                <Brain className="w-4 h-4 flex-shrink-0" />
                {mem.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mem.preview}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {(mem.size / 1024).toFixed(1)} KB
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(mem.modified).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Content viewer modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label={`Memory: ${selected.name}`}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-3xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="font-semibold text-lg">{selected.name}</h3>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close memory viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1">
                {contentLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    ))}
                  </div>
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">{content}</pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
