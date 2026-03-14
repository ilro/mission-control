import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Bot, Bell, Settings } from "lucide-react";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-card/30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                <Bot className="h-4 w-4 text-cyan-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">OpenClaw Ops</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <Bell className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 ml-2 border border-white/10" />
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 relative">
          {/* Background grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}