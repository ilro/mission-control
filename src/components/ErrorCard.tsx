import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({ message = "Failed to load data", onRetry }: ErrorCardProps) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-red-400/50 flex items-center gap-4">
      <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-red-400 font-medium">{message}</p>
        <p className="text-xs text-muted-foreground mt-1">Check the API server or try again.</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          title="Retry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function PageError({ message, onRetry }: ErrorCardProps) {
  return (
    <div className="space-y-4">
      <ErrorCard message={message} onRetry={onRetry} />
    </div>
  );
}
