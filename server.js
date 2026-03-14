import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as si from 'systeminformation';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const execAsync = promisify(exec);

// Helper to run shell commands
const run = (cmd) => execAsync(cmd).then(r => r.stdout).catch(e => e.message);

// ==================== SYSTEM STATS ====================

app.get('/api/system', async (req, res) => {
  try {
    const [cpu, mem, disk, network, osInfo, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.osInfo(),
      si.time()
    ]);
    
    res.json({
      cpu: { load: cpu.currentLoad, cores: cpu.cpus },
      memory: { total: mem.total, used: mem.used, free: mem.free },
      disk: disk.map(d => ({ fs: d.fs, size: d.size, used: d.used, use: d.use })),
      network: network.map(n => ({ iface: n.iface, rx: n.rx_sec, tx: n.tx_sec })),
      os: { platform: osInfo.platform, distro: osInfo.distro, release: osInfo.release, uptime: osInfo.uptime },
      time: { current: time.current, uptime: time.uptime }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== API KEYS ====================

app.get('/api/keys', async (req, res) => {
  try {
    const keys = [];
    const credDir = path.join(process.env.HOME || '/home/ilro', '.openclaw/credentials');
    
    if (fs.existsSync(credDir)) {
      const dirs = fs.readdirSync(credDir);
      for (const dir of dirs) {
        const configPath = path.join(credDir, dir, 'config.json');
        if (fs.existsSync(configPath)) {
          const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          keys.push({ name: dir, hasKey: !!data.api_key });
        }
      }
    }
    
    res.json({ keys });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== CRON STATUS ====================

app.get('/api/cron', async (req, res) => {
  try {
    const cronLog = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace/cron/cron.log');
    let runs = [];
    
    if (fs.existsSync(cronLog)) {
      const content = fs.readFileSync(cronLog, 'utf-8');
      const lines = content.trim().split('\n').slice(-50);
      runs = lines.map(l => ({ line: l, timestamp: l.substring(0, 19) }));
    }
    
    // Get cron list
    const { stdout } = await execAsync('crontab -l 2>/dev/null || echo ""');
    const crons = stdout.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
      const parts = l.split(' ');
      return { schedule: parts.slice(0,5).join(' '), command: parts.slice(5).join(' ') };
    });
    
    res.json({ runs: runs.reverse(), crons });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== RUN CRON ====================

app.post('/api/cron/run', async (req, res) => {
  const { script } = req.body;
  if (!script) return res.status(400).json({ error: 'Script name required' });
  
  try {
    const scriptPath = path.join(process.env.HOME || '/home/ilro', `.openclaw/workspace/cron/${script}.sh`);
    if (!fs.existsSync(scriptPath)) {
      return res.status(404).json({ error: 'Script not found' });
    }
    
    await execAsync(`bash ${scriptPath}`);
    res.json({ success: true, message: `Started ${script}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== SUBAGENTS ====================

app.get('/api/subagents', async (req, res) => {
  try {
    const nodePath = process.env.NVM_DIR 
      ? path.join(process.env.NVM_DIR, 'versions/node/v22.22.0/bin/node')
      : 'node';
    const openclawPath = path.join(process.env.HOME || '/home/ilro', '.nvm/versions/node/v22.22.0/lib/node_modules/openclaw/dist/index.js');
    
    // Get active sessions from OpenClaw (last 30 minutes)
    const { stdout } = await execAsync(`${nodePath} ${openclawPath} sessions --active 30 --json`);
    const data = JSON.parse(stdout);
    
    // Get current timestamp for more accurate running detection
    const now = Date.now();
    
    // Filter to get only subagents (those with 'subagent:' in the key)
    const subagents = data.sessions
      .filter(s => s.key.includes('subagent:'))
      .map(s => {
        // Extract label from session key (last part after subagent:)
        const parts = s.key.split(':');
        const label = parts[parts.length - 1] || 'unknown';
        
        // Determine status based on age and activity
        // A subagent is "running" if it was updated in the last 5 minutes
        const isRecent = s.ageMs < 300000; // 5 minutes
        const isActive = s.updatedAt > (now - 300000);
        const status = (isRecent && isActive) ? 'running' : 'completed';
        
        return {
          id: s.sessionId,
          sessionKey: s.key,
          label: label,
          status: status,
          ageMs: s.ageMs,
          runtime: formatDuration(s.ageMs),
          model: s.model,
          tokens: s.totalTokens || 0,
          updatedAt: s.updatedAt
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt); // Most recent first
    
    res.json({ subagents });
  } catch (e) {
    res.status(500).json({ error: e.message, subagents: [] });
  }
});

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ==================== GITHUB ====================

app.get('/api/github', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    
    // Get git status
    let gitStatus = {};
    try {
      const { stdout } = await execAsync('cd ' + workspace + ' && git status --short 2>/dev/null');
      gitStatus = { modified: stdout.split('\n').filter(l => l.trim()).slice(0, 10) };
    } catch (e) {
      gitStatus = { error: e.message };
    }
    
    // Get recent commits
    let commits = [];
    try {
      const { stdout } = await execAsync('cd ' + workspace + ' && git log --oneline -10 2>/dev/null');
      commits = stdout.split('\n').filter(l => l.trim()).map(l => ({ hash: l.substring(0,7), message: l.substring(8) }));
    } catch (e) {
      commits = [];
    }
    
    res.json({ gitStatus, commits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== NETWORK ====================

app.get('/api/network', async (req, res) => {
  try {
    const interfaces = await si.networkInterfaces();
    
    // si.networkInterfaces() returns an array
    const active = interfaces
      .filter((i) => !i.internal)
      .map((i) => ({
        name: i.ifaceName,
        ip4: i.ip4,
        ip6: i.ip6,
        mac: i.mac,
        type: i.type,
        speed: i.speed,
      }));
    
    res.json({ interfaces: active });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== SERVICES ====================

app.get('/api/services', async (req, res) => {
  try {
    const services = [];
    
    // Check OpenClaw gateway
    try {
      const { stdout } = await execAsync('openclaw gateway status 2>&1');
      services.push({ name: 'OpenClaw Gateway', status: stdout.includes('running') || stdout.includes('active') ? 'running' : 'stopped', detail: stdout.substring(0, 100) });
    } catch (e) {
      services.push({ name: 'OpenClaw Gateway', status: 'unknown', detail: e.message });
    }
    
    // Check if mission-control is running
    try {
      const { stdout } = await execAsync('pgrep -f "vite" | head -1');
      services.push({ name: 'Mission Control', status: stdout.trim() ? 'running' : 'stopped', detail: 'Vite dev server' });
    } catch (e) {
      services.push({ name: 'Mission Control', status: 'stopped', detail: 'Not running' });
    }
    
    // Check cron
    try {
      const { stdout } = await execAsync('pgrep -f cron | head -1');
      services.push({ name: 'Cron', status: stdout.trim() ? 'running' : 'stopped', detail: 'System cron' });
    } catch (e) {
      services.push({ name: 'Cron', status: 'stopped', detail: 'Not running' });
    }
    
    res.json({ services });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== ACTIVITY ====================

app.get('/api/activity', async (req, res) => {
  try {
    const logs = [];
    const logDir = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace/cron');
    
    // Read cron log
    const cronLog = path.join(logDir, 'cron.log');
    if (fs.existsSync(cronLog)) {
      const content = fs.readFileSync(cronLog, 'utf-8');
      const lines = content.trim().split('\n').slice(-30);
      logs.push(...lines.map(l => ({ source: 'cron', message: l, time: l.substring(0, 19) })));
    }
    
    // Read security audit log
    const secLog = path.join(logDir, 'security-audit.log');
    if (fs.existsSync(secLog)) {
      const content = fs.readFileSync(secLog, 'utf-8');
      const lines = content.trim().split('\n').slice(-10);
      logs.push(...lines.map(l => ({ source: 'security', message: l, time: '' })));
    }
    
    res.json({ activity: logs.reverse().slice(0, 20) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== PROJECTS ====================

app.get('/api/projects', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    const agentsDir = path.join(workspace, 'agents');
    const tradeconnectDir = path.join(workspace, 'tradeconnect');
    
    const projects = [];
    
    // GitHub repos
    try {
      const { stdout } = await execAsync('gh repo list ilro --limit 50 --json name,description,url,updatedAt 2>/dev/null');
      const repos = JSON.parse(stdout || '[]');
      // Sort by updatedAt descending (most recent first)
      repos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      for (const repo of repos) {
        projects.push({ 
          name: repo.name, 
          type: 'github', 
          path: repo.url, 
          description: repo.description || '',
          updatedAt: repo.updatedAt,
          hasGit: true,
          hasPkg: false 
        });
      }
    } catch (e) {
      // GitHub not available, continue without
    }
    
    // Agents projects (exclude - shown in Venture Studio instead)
    if (fs.existsSync(agentsDir)) {
      const agents = fs.readdirSync(agentsDir).filter(d => fs.statSync(path.join(agentsDir, d)).isDirectory());
      for (const agent of agents) {
        const agentPath = path.join(agentsDir, agent);
        const hasGit = fs.existsSync(path.join(agentPath, '.git'));
        const pkgPath = path.join(agentPath, 'package.json');
        const hasPkg = fs.existsSync(pkgPath);
        // Only add if not already in list (some agents might be repos)
        if (!projects.find(p => p.name === agent)) {
          projects.push({ name: agent, type: 'agent', path: agentPath, hasGit, hasPkg });
        }
      }
    }
    
    // TradeConnect projects
    if (fs.existsSync(tradeconnectDir)) {
      const items = fs.readdirSync(tradeconnectDir).filter(d => {
        const p = path.join(tradeconnectDir, d);
        return fs.statSync(p).isDirectory() && !d.startsWith('.');
      });
      for (const item of items) {
        const itemPath = path.join(tradeconnectDir, item);
        const hasGit = fs.existsSync(path.join(itemPath, '.git'));
        const pkgPath = path.join(itemPath, 'package.json');
        const hasPkg = fs.existsSync(pkgPath);
        projects.push({ name: `tradeconnect/${item}`, type: 'project', path: itemPath, hasGit, hasPkg });
      }
    }
    
    res.json({ projects });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== MEMORIES ====================

app.get('/api/memories', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    const memoryDir = path.join(workspace, 'memory');
    const memories = [];
    
    if (fs.existsSync(memoryDir)) {
      const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const filePath = path.join(memoryDir, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf-8');
        const preview = content.substring(0, 200).replace(/[#\n]/g, ' ').trim();
        memories.push({ name: file, preview, size: stats.size, modified: stats.mtime });
      }
    }
    
    res.json({ memories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== FILES ====================

app.get('/api/docs', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    const docs = [];
    
    const docFiles = ['MEMORY.md', 'USER.md', 'IDENTITY.md', 'AGENTS.md', 'SOUL.md', 'TOOLS.md', 'MISSION.md', 'HEARTBEAT.md'];
    
    for (const doc of docFiles) {
      const docPath = path.join(workspace, doc);
      if (fs.existsSync(docPath)) {
        const stats = fs.statSync(docPath);
        docs.push({ name: doc, size: stats.size, modified: stats.mtime });
      }
    }
    
    res.json({ docs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== DOCUMENT CONTENT ====================

app.get('/api/docs/:name', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    const docPath = path.join(workspace, req.params.name);
    
    // Security: ensure the path is within workspace
    if (!docPath.startsWith(workspace)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const content = fs.readFileSync(docPath, 'utf-8');
    res.json({ name: req.params.name, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==================== MEMORY CONTENT ====================

app.get('/api/memories/:name', async (req, res) => {
  try {
    const workspace = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace');
    const memoryPath = path.join(workspace, 'memory', req.params.name);
    
    // Security: ensure the path is within workspace/memory
    const memoryDir = path.join(workspace, 'memory');
    if (!memoryPath.startsWith(memoryDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!fs.existsSync(memoryPath)) {
      return res.status(404).json({ error: 'Memory not found' });
    }
    
    const content = fs.readFileSync(memoryPath, 'utf-8');
    res.json({ name: req.params.name, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;

// Serve static frontend
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});

// ==================== EXECUTIVES ====================

app.get('/api/executives', async (req, res) => {
  try {
    const execDir = path.join(process.env.HOME || '/home/ilro', '.openclaw/workspace/agents');
    const executives = ['cpo', 'cto', 'cmo', 'coo', 'cfo'];
    const execData = [];
    
    for (const exec of executives) {
      const execPath = path.join(execDir, exec);
      const soulPath = path.join(execPath, 'SOUL.md');
      const memoryPath = path.join(execPath, 'MEMORY.md');
      
      let soul = '';
      let memory = '';
      
      if (fs.existsSync(soulPath)) {
        soul = fs.readFileSync(soulPath, 'utf-8').substring(0, 500);
      }
      if (fs.existsSync(memoryPath)) {
        memory = fs.readFileSync(memoryPath, 'utf-8').substring(0, 300);
      }
      
      execData.push({
        name: exec.toUpperCase(),
        title: {
          cpo: 'Chief Product Officer',
          cto: 'Chief Technology Officer',
          cmo: 'Chief Marketing Officer',
          coo: 'Chief Operating Officer',
          cfo: 'Chief Financial Officer'
        }[exec],
        soul,
        memory,
        status: 'active'
      });
    }
    
    res.json({ executives: execData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
