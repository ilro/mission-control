import { useState } from "react";
import { TrendingUp, FlaskConical, Rocket, Lightbulb, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Experiment {
  id: string;
  name: string;
  owner: string;
  objective: string;
  status: "running" | "completed" | "paused";
  nextMilestone: string;
}

interface MVP {
  id: string;
  name: string;
  agents: string[];
  status: "planning" | "building" | "testing" | "launching";
  expectedLaunch: string;
}

interface Product {
  id: string;
  name: string;
  users: string;
  revenue?: string;
  growth: string;
}

interface Opportunity {
  id: string;
  name: string;
  problem: string;
  solution: string;
  nextStep: "research" | "validation" | "prototype";
}

const initialExperiments: Experiment[] = [
  {
    id: "1",
    name: "Document QA API",
    owner: "Opportunity Radar",
    objective: "Validate demand for simple document Q&A API",
    status: "completed",
    nextMilestone: "Test with real users",
  },
];

const initialMVPs: MVP[] = [];

const initialProducts: Product[] = [];

const initialOpportunities: Opportunity[] = [
  {
    id: "1",
    name: "AI Agent Memory",
    problem: "LLM apps need reliable context management",
    solution: "KV store with semantic search for agent context",
    nextStep: "validation",
  },
  {
    id: "2",
    name: "Annotation Tool",
    problem: "No simple screenshot/annotate tool for Slack/Discord",
    solution: "Minimal macOS/Windows capture + annotate + share",
    nextStep: "prototype",
  },
  {
    id: "3",
    name: "Meeting Notes AI",
    problem: "Meeting notes tools still don't work well",
    solution: "Join call → transcript → actionable summary + tasks",
    nextStep: "research",
  },
  {
    id: "4",
    name: "Tab Manager AI",
    problem: "Browser tabs are unorganised",
    solution: "AI organises tabs by project/context automatically",
    nextStep: "research",
  },
];

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const statusColors = {
    running: "bg-green-500/20 text-green-400",
    completed: "bg-cyan-500/20 text-cyan-400",
    paused: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{experiment.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{experiment.objective}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[experiment.status]}`}>
          {experiment.status}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Owner: {experiment.owner}</span>
        <span>Next: {experiment.nextMilestone}</span>
      </div>
    </div>
  );
}

function MVPCard({ mvp }: { mvp: MVP }) {
  const statusColors = {
    planning: "bg-blue-500/20 text-blue-400",
    building: "bg-purple-500/20 text-purple-400",
    testing: "bg-yellow-500/20 text-yellow-400",
    launching: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{mvp.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{mvp.agents.join(", ")}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[mvp.status]}`}>
          {mvp.status}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>Launch: {mvp.expectedLaunch}</span>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-green-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{product.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{product.users} users</p>
        </div>
        {product.revenue && (
          <span className="text-green-400 font-medium">{product.revenue}</span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3 text-green-400" />
        <span>{product.growth}</span>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const stepColors = {
    research: "bg-blue-500/20 text-blue-400",
    validation: "bg-yellow-500/20 text-yellow-400",
    prototype: "bg-green-500/20 text-green-400",
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{opportunity.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{opportunity.problem}</p>
          <p className="text-xs text-cyan-400 mt-2">{opportunity.solution}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stepColors[opportunity.nextStep]}`}>
          {opportunity.nextStep}
        </span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl bg-card/50 border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">
            <Icon className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="font-medium">{title}</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">{count}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VentureStudio() {
  const [opportunities] = useState(initialOpportunities);
  const [experiments] = useState(initialExperiments);
  const [mvps] = useState(initialMVPs);
  const [products] = useState(initialProducts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Venture Studio</h1>
          <p className="text-muted-foreground">Portfolio of experiments, products & opportunities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors">
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">New Initiative</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
          <div className="text-2xl font-bold">{experiments.filter(e => e.status === "running").length}</div>
          <div className="text-sm text-muted-foreground">Active Experiments</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="text-2xl font-bold">{mvps.length}</div>
          <div className="text-sm text-muted-foreground">MVPs in Progress</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20">
          <div className="text-2xl font-bold">{products.length}</div>
          <div className="text-sm text-muted-foreground">Launched Products</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
          <div className="text-2xl font-bold">{opportunities.length}</div>
          <div className="text-sm text-muted-foreground">Opportunity Pipeline</div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionCard title="Active Experiments" icon={FlaskConical} count={experiments.length} defaultOpen>
          {experiments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active experiments</p>
          ) : (
            experiments.map((exp) => <ExperimentCard key={exp.id} experiment={exp} />)
          )}
        </SectionCard>

        <SectionCard title="MVP Development" icon={Rocket} count={mvps.length}>
          {mvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No MVPs in development</p>
          ) : (
            mvps.map((mvp) => <MVPCard key={mvp.id} mvp={mvp} />)
          )}
        </SectionCard>

        <SectionCard title="Launched Products" icon={TrendingUp} count={products.length}>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No launched products yet</p>
          ) : (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          )}
        </SectionCard>

        <SectionCard title="Opportunity Pipeline" icon={Lightbulb} count={opportunities.length}>
          {opportunities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No opportunities identified</p>
          ) : (
            opportunities.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)
          )}
        </SectionCard>
      </div>
    </div>
  );
}
