import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';
import { FileText, X, RefreshCw } from 'lucide-react';
import { GridCardSkeleton } from '../components/Skeleton';
import { ErrorCard } from '../components/ErrorCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalLock } from '../hooks/useModalLock';

export default function Docs() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => { setSelected(null); setContent(null); }, []);
  useModalLock(!!selected, closeModal);

  const loadDocs = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getDocs();
      setDocs(data.docs || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load docs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const viewDoc = async (doc: any) => {
    setSelected(doc);
    setContentLoading(true);
    try {
      const data = await api.getDocContent(doc.name);
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
        <h2 className="text-2xl font-bold">Docs</h2>
        <GridCardSkeleton count={6} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Docs</h2>
        <button onClick={loadDocs} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {error && <ErrorCard message={error} onRetry={loadDocs} />}

      {docs.length === 0 && !error ? (
        <div className="glass-card p-8 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {docs.map((doc: any, i: number) => (
            <button
              key={i}
              onClick={() => viewDoc(doc)}
              className={`glass-card p-4 text-left hover:border-cyan-500/30 transition-all ${
                selected?.name === doc.name ? 'border-cyan-500/40' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span className="font-medium truncate">{doc.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.modified).toLocaleDateString()}
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
            aria-label={`Document: ${selected.name}`}
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
                  aria-label="Close document viewer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto flex-1">
                {contentLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${40 + Math.random() * 60}%` }} />
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
