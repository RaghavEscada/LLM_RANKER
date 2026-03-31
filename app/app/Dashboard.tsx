'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Database, GitBranch, TerminalSquare,
  Search, ChevronUp, ChevronDown, Filter, Cpu,
  TrendingUp, BarChart2, Network, BookOpen, Code, FileCode
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompanyRank {
  company_name: string;
  LLM_score: number;
  rank: number;
  tier: string;
}

interface Stats {
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  r_squared: number;
  tier_high: number;
  tier_medium: number;
  tier_low: number;
}

interface DashboardProps {
  companies: CompanyRank[];
  stats: Stats | null;
}

type Tab = 'overview' | 'leaderboard' | 'analytics' | 'model' | 'technical';
type SortKey = 'rank' | 'LLM_score' | 'tier';
type SortDir = 'asc' | 'desc';

const TIER_COLOR = (tier: string) => {
  if (tier === 'High') return '#22c55e';
  if (tier === 'Medium') return '#eab308';
  return '#ef4444';
};

const WEIGHTS: { label: string; weight: number }[] = [
  { label: 'content_quality', weight: 0.20 },
  { label: 'ai_readability',  weight: 0.20 },
  { label: 'technical_seo',   weight: 0.15 },
  { label: 'brand_mentions',  weight: 0.15 },
  { label: 'backlinks',       weight: 0.10 },
  { label: 'semantic_depth',  weight: 0.10 },
  { label: 'faq_presence',    weight: 0.05 },
  { label: 'authority_score', weight: 0.05 },
];

const NAV = [
  { id: 'overview',    label: 'OVERVIEW',  icon: Activity },
  { id: 'leaderboard', label: 'INDEX',     icon: Database },
  { id: 'analytics',   label: 'ANALYTICS', icon: BarChart2 },
  { id: 'model',       label: 'MODEL',     icon: BookOpen },
  { id: 'technical',   label: 'TECHNICAL', icon: Code },
];

export default function Dashboard({ companies, stats }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search, setSearch]       = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [sortKey, setSortKey]     = useState<SortKey>('rank');
  const [sortDir, setSortDir]     = useState<SortDir>('asc');

  const filteredCompanies = useMemo(() => {
    let list = companies.filter(c => {
      const matchSearch = c.company_name.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === 'ALL' || c.tier === tierFilter;
      return matchSearch && matchTier;
    });
    list = [...list].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'tier') return mul * a.tier.localeCompare(b.tier);
      return mul * (a[sortKey] - b[sortKey]);
    });
    return list;
  }, [companies, search, tierFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp   className={cn('w-2.5 h-2.5', sortKey === k && sortDir === 'asc'  && 'opacity-100 text-[#4a90d9]')} />
      <ChevronDown className={cn('w-2.5 h-2.5', sortKey === k && sortDir === 'desc' && 'opacity-100 text-[#4a90d9]')} />
    </span>
  );

  /* ─── MINI SCORE BAR ─── */
  const ScoreBar = ({ score }: { score: number }) => {
    const pct = ((score - (stats?.min ?? 50)) / ((stats?.max ?? 100) - (stats?.min ?? 50))) * 100;
    const color = score > 85 ? '#22c55e' : score > 75 ? '#eab308' : '#ef4444';
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div style={{ width: `${pct}%`, backgroundColor: color }} className="h-full rounded-full transition-all" />
        </div>
        <span className="font-mono text-xs text-white w-10 text-right">{score.toFixed(1)}</span>
      </div>
    );
  };

  /* ── HEADER ── */
  const Header = () => (
    <header className="border-b border-white/10 bg-[#070707] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-white flex items-center justify-center">
          <span className="text-black font-black text-sm">G</span>
        </div>
        <div>
          <span className="text-white font-black tracking-tight text-base mr-2">GEO_RANKER</span>
          <span className="text-[#444] font-mono text-xs">v2.4.1</span>
        </div>
        <div className="ml-6 hidden md:flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[10px] text-[#555] uppercase tracking-widest">R_ENGINE ONLINE</span>
        </div>
      </div>
      <div className="flex items-center gap-6 text-[10px] font-mono text-[#444] uppercase tracking-widest hidden md:flex">
        <span>N=500</span>
        <span>|</span>
        <span>R²={stats?.r_squared.toFixed(4)}</span>
        <span>|</span>
        <span>μ={stats?.mean.toFixed(2)}</span>
        <span>|</span>
        <span>σ={stats?.sd.toFixed(2)}</span>
      </div>
    </header>
  );

  /* ── SIDEBAR ── */
  const Sidebar = () => (
    <aside className="w-52 border-r border-white/10 bg-[#070707] flex flex-col fixed inset-y-0 left-0 pt-[57px]">
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as Tab)}
            className={cn(
              'w-full text-left flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 font-mono text-xs tracking-widest uppercase',
              activeTab === id
                ? 'bg-white/10 text-white border-l-2 border-[#4a90d9]'
                : 'text-[#555] hover:text-[#a0a0a0] hover:bg-white/5 border-l-2 border-transparent'
            )}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Regression Summary Block */}
      <div className="p-4 border-t border-white/5 space-y-3">
        <p className="text-[9px] font-mono text-[#333] uppercase tracking-widest mb-2">Model Stats</p>
        {[
          { k: 'HIGH',   v: stats?.tier_high   ?? 0, c: '#22c55e' },
          { k: 'MED',    v: stats?.tier_medium  ?? 0, c: '#eab308' },
          { k: 'LOW',    v: stats?.tier_low     ?? 0, c: '#ef4444' },
        ].map(({ k, v, c }) => (
          <div key={k} className="flex items-center gap-2">
            <span style={{ color: c }} className="font-mono text-[9px] w-8 uppercase tracking-widest">{k}</span>
            <div className="flex-1 h-0.5 bg-white/5">
              <div style={{ width: `${(v / 500) * 100}%`, backgroundColor: c }} className="h-full" />
            </div>
            <span className="font-mono text-[9px] text-[#555]">{v}</span>
          </div>
        ))}
      </div>
    </aside>
  );

  /* ─── OVERVIEW ─── */
  const renderOverview = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'R² (OLS Fit)', val: stats?.r_squared.toFixed(4), sub: '← Linear Regression', accent: '#4a90d9' },
          { label: 'μ Score',  val: stats?.mean.toFixed(2), sub: `±${stats?.sd.toFixed(2)} std-dev`, accent: '#a855f7' },
          { label: 'Median',   val: stats?.median.toFixed(2), sub: '50th percentile', accent: '#06b6d4' },
          { label: 'Range',    val: `${stats?.min.toFixed(0)}–${stats?.max.toFixed(0)}`, sub: 'min / max score', accent: '#f59e0b' },
        ].map(({ label, val, sub, accent }) => (
          <div key={label} className="border border-white/10 bg-[#0c0c0c] p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
            <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest mb-3">{label}</p>
            <p className="text-2xl font-black text-white mb-1">{val ?? '—'}</p>
            <p className="font-mono text-[10px] text-[#444]">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts: 2+1 layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartPanel title="Rank Decay Curve" tag="loess smoothed · N=500" src="/charts/score_vs_rank.png" span="lg:col-span-2" />
        <ChartPanel title="Tier Segmentation" tag="decision boundary" src="/charts/tier_distribution.png" />
      </div>

      {/* Score Distribution */}
      <ChartPanel title="Score Distribution" tag="ggplot2 histogram · mean ± σ annotated" src="/charts/score_distribution.png" />

      {/* Top Performers Mini-Table */}
      <div className="border border-white/10 bg-[#0c0c0c]">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#4a90d9]" />
          <span className="font-mono text-xs text-[#a0a0a0] uppercase tracking-widest">Top 10 Performers</span>
        </div>
        <div className="divide-y divide-white/5">
          {companies.slice(0, 10).map((c, i) => (
            <div key={c.company_name} className="px-5 py-3 grid grid-cols-12 items-center gap-4 hover:bg-white/3 transition-colors">
              <span className="col-span-1 font-mono text-[10px] text-[#444]">#{i + 1}</span>
              <span className="col-span-3 text-sm font-semibold text-white truncate">{c.company_name}</span>
              <div className="col-span-6"><ScoreBar score={c.LLM_score} /></div>
              <span style={{ color: TIER_COLOR(c.tier) }} className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-right">{c.tier}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  /* ─── INDEX / LEADERBOARD ─── */
  const renderLeaderboard = () => (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555]" />
          <input
            type="text" placeholder="SEARCH ENTITY..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#0c0c0c] border border-white/10 py-2 pl-9 pr-4 text-white placeholder-[#333] font-mono text-xs focus:outline-none focus:border-[#4a90d9]/40 transition-colors uppercase tracking-wide"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#555]" />
          {['ALL', 'High', 'Medium', 'Low'].map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={cn(
                'px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-all',
                tierFilter === t
                  ? 'text-white border-[#4a90d9]/50 bg-[#4a90d9]/10'
                  : 'text-[#555] border-white/5 hover:text-[#a0a0a0]'
              )}>{t}</button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-[#333] uppercase whitespace-nowrap">
          {filteredCompanies.length} / {companies.length} ENTITIES
        </span>
      </div>

      {/* Table */}
      <div className="border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0a0a0a] border-b border-white/10">
            <tr>
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#444]">
                <button onClick={() => toggleSort('rank')} className="flex items-center hover:text-white transition-colors">
                  RANK <SortIcon k="rank" />
                </button>
              </th>
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#444]">ENTITY</th>
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#444]">
                <button onClick={() => toggleSort('LLM_score')} className="flex items-center hover:text-white transition-colors">
                  GEO SCORE <SortIcon k="LLM_score" />
                </button>
              </th>
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#444]">SCORE BAR</th>
              <th className="px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#444]">
                <button onClick={() => toggleSort('tier')} className="flex items-center hover:text-white transition-colors">
                  TIER <SortIcon k="tier" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#080808]">
            {filteredCompanies.slice(0, 100).map((c) => (
              <tr key={c.company_name} className="hover:bg-white/3 transition-colors group">
                <td className="px-5 py-3 font-mono text-xs text-[#555]">#{c.rank}</td>
                <td className="px-5 py-3 font-semibold text-sm text-white">{c.company_name}</td>
                <td className="px-5 py-3 font-mono text-sm text-white">{c.LLM_score.toFixed(2)}</td>
                <td className="px-5 py-3 w-40"><ScoreBar score={c.LLM_score} /></td>
                <td className="px-5 py-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: TIER_COLOR(c.tier) }}>
                    {c.tier}
                  </span>
                </td>
              </tr>
            ))}
            {filteredCompanies.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center font-mono text-xs text-[#333] uppercase">
                NO ENTITIES MATCH QUERY
              </td></tr>
            )}
          </tbody>
        </table>
        {filteredCompanies.length > 100 && (
          <div className="px-5 py-3 border-t border-white/5 font-mono text-[10px] text-[#333] uppercase tracking-widest">
            + {filteredCompanies.length - 100} MORE ENTITIES NOT DISPLAYED
          </div>
        )}
      </div>
    </motion.div>
  );

  /* ─── ANALYTICS ─── */
  const renderAnalytics = () => (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartPanel title="Feature Correlation Matrix" tag="Pearson · ggcorrplot · lower-triangle" src="/charts/correlation_matrix.png" />
        <ChartPanel title="Model Feature Weights" tag="Σ weights = 1.00 · linear model" src="/charts/feature_weights.png" />
      </div>
      <ChartPanel title="Top 20 Ranked Entities" tag="GEO score · color-coded by tier" src="/charts/top20_companies.png" />

      {/* Weight Detail Table */}
      <div className="border border-white/10 bg-[#0c0c0c]">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-[#4a90d9]" />
          <span className="font-mono text-[10px] text-[#a0a0a0] uppercase tracking-widest">Feature Weight Registry</span>
        </div>
        <div className="divide-y divide-white/5">
          {WEIGHTS.map(({ label, weight }) => (
            <div key={label} className="px-5 py-3 grid grid-cols-12 items-center gap-4">
              <code className="col-span-4 text-xs text-[#a0a0a0]">{label}</code>
              <div className="col-span-6 h-1 bg-white/5">
                <div className="h-full bg-[#4a90d9]" style={{ width: `${weight * 100 * 5}%` }} />
              </div>
              <span className="col-span-2 font-mono text-xs text-white text-right">{(weight * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  /* ─── MODEL ─── */
  const renderModel = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div className="border border-white/10 bg-[#0c0c0c] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-3.5 h-3.5 text-[#4a90d9]" />
          <span className="font-mono text-[10px] text-[#a0a0a0] uppercase tracking-widest">Analytical Engine</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-3 leading-tight">
          Generative Engine Optimization
        </h2>
        <p className="text-[#666] font-mono text-sm leading-loose">
          GEO models the likelihood of a startup's brand being retrieved by Large Language Models.
          Unlike keyword-based SEO, GEO is a function of semantic richness, structured content, and machine-readable authority signals.
        </p>
      </div>

      <div className="border border-white/10 bg-[#0c0c0c]">
        <div className="px-5 py-3 border-b border-white/5">
          <span className="font-mono text-[10px] text-[#a0a0a0] uppercase tracking-widest">// Weighted Linear Scoring Model</span>
        </div>
        <pre className="p-5 text-sm text-[#d4d4d4] overflow-x-auto font-mono leading-7">
{`LLM_score <- 
  0.20 * content_quality  +   # Semantic richness, structure
  0.20 * ai_readability   +   # Parsability by LLMs
  0.15 * technical_seo    +   # Schema, metadata signals
  0.15 * brand_mentions   +   # Citation frequency
  0.10 * backlinks        +   # Web authority
  0.10 * semantic_depth   +   # Topical coverage depth
  0.05 * faq_presence     +   # Q&A structured data
  0.05 * authority_score      # Domain trust score`}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Model Type',   val: 'Weighted Linear OLS', icon: GitBranch },
          { label: 'Reg. Output',  val: `R² = ${stats?.r_squared.toFixed(4) ?? '—'}`, icon: TrendingUp },
          { label: 'Engine',       val: 'R 4.x + ggplot2', icon: TerminalSquare },
        ].map(({ label, val, icon: Icon }) => (
          <div key={label} className="border border-white/10 bg-[#0c0c0c] p-5">
            <Icon className="w-4 h-4 text-[#4a90d9] mb-3" />
            <p className="font-mono text-[9px] text-[#444] uppercase tracking-widest mb-1">{label}</p>
            <p className="font-mono text-sm text-white">{val}</p>
          </div>
        ))}
      </div>

      <div className="border border-white/10 bg-[#0c0c0c] p-6">
        <p className="font-mono text-[10px] text-[#444] uppercase tracking-widest mb-3">Future Roadmap</p>
        <ul className="space-y-2">
          {[
            'K-Means Clustering for unsupervised startup segmentation',
            'GLM / Logistic regression for tier-probability modeling',
            'API integration for real-time dataset refresh',
            'PCA for feature dimensionality analysis',
            'Shiny deployments for interactive R-native dashboards',
          ].map(item => (
            <li key={item} className="flex items-start gap-3 text-[#666] font-mono text-xs">
              <span className="text-[#4a90d9] mt-0.5">→</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-white/5 pt-6">
        <p className="font-mono text-[10px] text-[#333] uppercase tracking-[0.25em] text-center">
          "This project demonstrates how R can be used not just for analysis, but to model emerging AI-driven ranking systems in a scalable and interpretable way."
        </p>
      </div>
    </motion.div>
  );

  /* ─── TECHNICAL DOCS ─── */
  const renderTechnical = () => (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-4xl pb-20">
      <div className="border border-white/10 bg-[#0c0c0c] p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileCode className="w-3.5 h-3.5 text-[#4a90d9]" />
          <span className="font-mono text-[10px] text-[#a0a0a0] uppercase tracking-widest">Architecture Overview</span>
        </div>
        <h2 className="text-2xl font-black text-white mb-4">Full-Stack Data Pipeline</h2>
        <p className="text-[#666] font-mono text-sm leading-loose">
          The system operates as a decoupled R-to-Next.js pipeline. 
          1. **R Model**: Executes `ranking.R`, performs OLS regression, and exports `stats.json` / `ranked_companies.csv`.
          2. **Next.js Server**: Performs a synchronous file-system read during SSR (Server Side Rendering).
          3. **Shared Registry**: The `public/` directory acts as the transient data registry.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-mono text-[10px] text-[#444] uppercase tracking-widest">Core Component Library</h3>
        
        <div className="border border-white/10 bg-[#0c0c0c]">
          <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="font-mono text-xs text-white">1. StatCard.tsx</span>
            <span className="font-mono text-[9px] text-[#444]">Bloomberg KPI visualizer</span>
          </div>
          <div className="p-5">
            <p className="text-[#666] text-xs font-mono mb-4 italic">// Renders the top-row OLS regression metrics with dynamic border accents.</p>
            <pre className="text-[11px] text-[#d4d4d4] leading-relaxed overflow-x-auto bg-black/30 p-4 rounded">
{`function StatCard({ label, val, sub, accent }) {
  return (
    <div className="border border-white/10 bg-[#0c0c0c] p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
      <p className="font-mono text-[10px] text-[#555] uppercase tracking-widest mb-3">{label}</p>
      <p className="text-2xl font-black text-white mb-1">{val}</p>
      <p className="font-mono text-[10px] text-[#444]">{sub}</p>
    </div>
  );
}`}
            </pre>
          </div>
        </div>

        <div className="border border-white/10 bg-[#0c0c0c]">
          <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="font-mono text-xs text-white">2. ScoreBar.tsx</span>
            <span className="font-mono text-[9px] text-[#444]">Inline Normalization Visualizer</span>
          </div>
          <div className="p-5">
            <p className="text-[#666] text-xs font-mono mb-4 italic">// Maps LLM_score to a color-coded percentage bar based on min/max bounds.</p>
            <pre className="text-[11px] text-[#d4d4d4] leading-relaxed overflow-x-auto bg-black/30 p-4 rounded">
{`const ScoreBar = ({ score }) => {
  const pct = ((score - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div style={{ width: \`\${pct}%\`, backgroundColor: color }} className="h-full rounded-full" />
      </div>
      <span className="font-mono text-xs text-white w-10 text-right">{score.toFixed(1)}</span>
    </div>
  );
};`}
            </pre>
          </div>
        </div>

        <div className="border border-white/10 bg-[#0c0c0c]">
          <div className="px-5 py-3 border-b border-white/5 flex justify-between items-center">
            <span className="font-mono text-xs text-white">3. Data_Loader.ts</span>
            <span className="font-mono text-[9px] text-[#444]">Synchronous CSV Registry Parser</span>
          </div>
          <div className="p-5">
            <p className="text-[#666] text-xs font-mono mb-4 italic">// Parses the raw exported string from R into typed TypeScript objects.</p>
            <pre className="text-[11px] text-[#d4d4d4] leading-relaxed overflow-x-auto bg-black/30 p-4 rounded">
{`function parseCSV(csvText) {
  const dataLines = csvText.trim().split('\\n').slice(1);
  return dataLines.map((line) => {
    const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));
    return {
      company_name: values[0],
      LLM_score: parseFloat(values[9]),
      rank: parseInt(values[10], 10),
      tier: values[11]
    };
  });
}`}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-52">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <div key={activeTab}>
              {activeTab === 'overview'    && renderOverview()}
              {activeTab === 'leaderboard' && renderLeaderboard()}
              {activeTab === 'analytics'   && renderAnalytics()}
              {activeTab === 'model'       && renderModel()}
              {activeTab === 'technical'   && renderTechnical()}
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─── Shared ChartPanel Component ─── */
function ChartPanel({ title, tag, src, span }: { title: string; tag: string; src: string; span?: string }) {
  return (
    <div className={cn('border border-white/10 bg-[#0c0c0c] overflow-hidden', span)}>
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-3 h-3 text-[#4a90d9]" />
          <span className="font-mono text-xs text-[#a0a0a0]">{title}</span>
        </div>
        <span className="font-mono text-[9px] text-[#333] uppercase tracking-widest">{tag}</span>
      </div>
      <img src={src} alt={title} className="w-full h-auto" />
    </div>
  );
}
