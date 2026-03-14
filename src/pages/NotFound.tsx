import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="text-8xl font-bold text-muted-foreground/30">404</div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/tasks"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Go Home</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Go Back</span>
        </button>
      </div>
    </div>
  );
}
