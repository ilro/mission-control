import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, FolderKanban, Brain, FileText, Users, Building2,
  Github, Zap, Target, Cpu, Megaphone, Shield, DollarSign, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const mainNav = [
  { name: "Dashboard", href: "/tasks", icon: LayoutDashboard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Projects", href: "/projects", icon: FolderKanban },
];

const execNav = [
  { name: "CPO", href: "/executives/cpo", icon: Target, colour: "text-blue-400" },
  { name: "CMO", href: "/executives/cmo", icon: Megaphone, colour: "text-pink-400" },
  { name: "CTO", href: "/executives/cto", icon: Cpu, colour: "text-purple-400" },
  { name: "CFO", href: "/executives/cfo", icon: DollarSign, colour: "text-green-400" },
  { name: "COO", href: "/executives/coo", icon: Shield, colour: "text-orange-400" },
];

const bottomNav = [
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Docs", href: "/docs", icon: FileText },
  { name: "Office", href: "/office", icon: Building2 },
  { name: "GitHub", href: "/github", icon: Github },
  { name: "Venture Studio", href: "/venture-studio", icon: Target },
];

export function Sidebar() {
  const location = useLocation();
  const [execStatuses, setExecStatuses] = useState<Record<string, string>>({});
  const [execExpanded, setExecExpanded] = useState(true);

  // Determine if any exec route is active
  const isExecRoute = location.pathname.startsWith('/executives');

  useEffect(() => {
    // Fetch exec statuses periodically
    const loadStatuses = async () => {
      try {
        const data = await api.getExecutives();
        const statuses: Record<string, string> = {};
        for (const exec of data.executives || []) {
          statuses[exec.id] = exec.status;
        }
        setExecStatuses(statuses);
      } catch (e) {
        // Silently fail
      }
    };

    loadStatuses();
    const interval = setInterval(loadStatuses, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]';
      case 'idle': return 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.5)]';
      default: return 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]';
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/5 bg-card/50 backdrop-blur-xl z-10">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-foreground">Mission</span>
            <span className="text-lg font-bold tracking-tight text-cyan-400"> Control</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.name} item={item} location={location} />
          ))}
        </div>

        {/* Executive Council Section */}
        <div className="pt-4">
          <button
            onClick={() => setExecExpanded(!execExpanded)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors",
              isExecRoute ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              Executive Council
            </span>
            {execExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>

          <AnimatePresence>
            {execExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 pt-1">
                  {/* Council Overview */}
                  <NavLink
                    to="/executives"
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "text-foreground bg-white/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Users className={cn(
                          "mr-3 h-4 w-4 flex-shrink-0 transition-all",
                          isActive ? "text-cyan-400" : "text-muted-foreground"
                        )} />
                        <span className="text-xs">Overview</span>
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-indicator"
                            className="absolute inset-y-1 left-0 w-1 -my-1 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-r-full shadow-lg shadow-cyan-500/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>

                  {/* Individual Execs */}
                  {execNav.map((item) => {
                    const status = execStatuses[item.name.toLowerCase()] || 'offline';
                    const statusDot = getStatusDot(status);

                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive
                              ? "text-foreground bg-white/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className={cn(
                              "mr-3 h-4 w-4 flex-shrink-0 transition-all",
                              isActive ? item.colour : "text-muted-foreground group-hover:text-foreground"
                            )} />
                            <span className="flex-1">{item.name}</span>
                            <span className={cn("w-2 h-2 rounded-full", statusDot)} />
                            {isActive && (
                              <motion.div
                                layoutId="sidebar-active-indicator"
                                className="absolute inset-y-1 left-0 w-1 -my-1 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-r-full shadow-lg shadow-cyan-500/30"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <div className="pt-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Resources
          </div>
          {bottomNav.map((item) => (
            <NavItem key={item.name} item={item} location={location} />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 ring-2 ring-white/10" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Dr. Lee</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ item, location }: { item: { name: string; href: string; icon: any }; location: any }) {
  const isActive = location.pathname === item.href;

  return (
    <NavLink
      to={item.href}
      className={cn(
        "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
        isActive
          ? "text-foreground bg-white/5"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      )}
    >
      <item.icon
        className={cn(
          "mr-3 h-5 w-5 flex-shrink-0 transition-all duration-200",
          isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden="true"
      />
      <span className="relative z-10">{item.name}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute inset-y-1 left-0 w-1 -my-1 bg-gradient-to-b from-cyan-400 to-cyan-500 rounded-r-full shadow-lg shadow-cyan-500/30"
          initial={{ opacity: 0, scaleY: 0.5 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </NavLink>
  );
}
