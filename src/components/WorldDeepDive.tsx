import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, Legend
} from 'recharts';
import type { CareerWorld } from '../lib/types';
import { formatINR, formatLPA } from '../lib/financialModel';

interface WorldDeepDiveProps {
  world: CareerWorld;
  onBack: () => void;
  onBuildRoadmap: (worldId: string) => void;
  onStartAdaptiveSimulation?: () => void;
}

export const WorldDeepDive: React.FC<WorldDeepDiveProps> = ({ world, onBack, onBuildRoadmap, onStartAdaptiveSimulation }) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const formatCurrencyAxis = (value: number) => {
    if (value >= 100) return `${(value / 100).toFixed(1)}Cr`;
    return `${value}L`;
  };

  const happinessData = [
    { name: 'Work/Life', score: world.happinessMetrics.workLifeBalance },
    { name: 'Meaning', score: world.happinessMetrics.meaningPurpose },
    { name: 'Calm', score: 100 - world.happinessMetrics.stressLevel },
    { name: 'Status', score: world.happinessMetrics.socialStatus },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-5xl mx-auto px-4 py-8 bg-slate-50 min-h-screen"
    >
      {/* Header */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-500 hover:text-teal-600 transition-colors font-medium text-sm"
      >
        ← Back to Worlds
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {world.field}
              </span>
              {world.isUnconventional && (
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
                  💡 Unexpected Fit
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-2">{world.careerTitle}</h1>
            <p className="text-lg text-slate-600">{world.tagline}</p>
          </div>

          <div className="flex flex-col items-center bg-teal-50 px-6 py-4 rounded-xl border border-teal-100 shadow-sm shrink-0">
            <span className="text-4xl font-black text-teal-700">{world.fitScore}</span>
            <span className="text-sm font-bold text-teal-600 uppercase">Match Score</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Why this fits you</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {world.fitReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-teal-500 mt-0.5">✓</span>
                <span className="text-slate-700">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Financials */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Salary Trajectory (CTC)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={world.salaryTrajectory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    formatter={(value: any) => [formatLPA(Number(value) || 0), 'CTC']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="ctcLPA" stroke="#0D9488" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Net Worth Projection</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={world.netWorthProjection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" tickFormatter={(v) => `Yr ${v}`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatINR(Number(value) || 0), name === 'savingsLakhs' ? 'Savings' : 'Investments']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Area type="monotone" dataKey="investmentsLakhs" stackId="1" stroke="#D97706" fill="#FBBF24" fillOpacity={0.6} name="Investments" />
                  <Area type="monotone" dataKey="savingsLakhs" stackId="1" stroke="#0D9488" fill="#5EEAD4" fillOpacity={0.6} name="Liquid Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column - Metrics & Details */}
        <div className="space-y-8">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Happiness Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={happinessData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} width={70} />
                  <Tooltip cursor={{ fill: '#F1F5F9' }} />
                  <Bar dataKey="score" fill="#0D9488" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Job Security & Demand</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex flex-col items-center justify-center border-4 border-teal-500">
                <span className="text-xl font-bold text-slate-800">{world.jobSecurityScore}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  Trend: <span className="capitalize">{world.demandTrend}</span> 
                  {world.demandTrend === 'growing' ? ' 📈' : world.demandTrend === 'stable' ? ' ➖' : ' 📉'}
                </p>
                <p className="text-sm text-slate-600 mt-1">{world.jobSecurityReasoning}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Timelines</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-600">Comfortable in</span>
                <span className="font-bold text-slate-900">{world.timelineToComfortable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Peak earning in</span>
                <span className="font-bold text-slate-900">{world.timelineToPeak}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Skills */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Skill Gap Analysis</h3>
          <ul className="space-y-3">
            {world.skillGap.map((skill, idx) => (
              <li key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  {skill.hasSkill ? (
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm">✗</div>
                  )}
                  <span className={`font-medium ${skill.hasSkill ? 'text-slate-800' : 'text-slate-600'}`}>{skill.skill}</span>
                </div>
                <span className={`text-xs font-bold uppercase px-2 py-1 rounded-md ${
                  skill.importance === 'critical' ? 'bg-amber-100 text-amber-800' :
                  skill.importance === 'important' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {skill.importance}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Real World Details */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Where You Could Work</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Premium / Top Tier</h4>
                <div className="flex flex-wrap gap-2">
                  {world.exampleCompanies.premium.map(c => (
                    <span key={c} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Growth Stage</h4>
                <div className="flex flex-wrap gap-2">
                  {world.exampleCompanies.growthStage.map(c => (
                    <span key={c} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-6">
            <h3 className="text-xl font-bold text-rose-900 mb-4 flex items-center gap-2">
              <span>⚠️</span> Honest Risks & Downsides
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-rose-800 text-sm">
              {world.risks.map((risk, idx) => (
                <li key={idx}>{risk}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Day in Life */}
      <div className="bg-slate-800 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute opacity-10 text-9xl top-[-20px] left-2 font-serif">"</div>
        <h3 className="text-xl font-bold text-teal-400 mb-4 relative z-10">A Day in the Life (Year 3)</h3>
        <p className="text-lg leading-relaxed text-slate-200 relative z-10 font-medium italic">
          {world.dayInTheLife}
        </p>
      </div>

      {/* Methodology */}
      <div className="mb-12">
        <button 
          onClick={() => setShowMethodology(!showMethodology)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2"
        >
          {showMethodology ? 'Hide' : 'Show'} Methodology Data <span>{showMethodology ? '↑' : '↓'}</span>
        </button>
        <AnimatePresence>
          {showMethodology && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-mono">
                {world.methodology}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="sticky bottom-6 z-50 flex flex-col justify-center gap-3 sm:flex-row">
        {onStartAdaptiveSimulation && (
          <button
            onClick={onStartAdaptiveSimulation}
            className="flex items-center justify-center gap-2 rounded-full border-2 border-teal-700 bg-white px-7 py-4 text-lg font-bold text-teal-800 shadow-xl shadow-slate-900/10 transition hover:-translate-y-1 hover:bg-teal-50"
          >
            Run an adaptive scenario <span className="text-xl">→</span>
          </button>
        )}
        <button
          onClick={() => onBuildRoadmap(world.id)}
          className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 transform transition hover:-translate-y-1 flex items-center gap-2 border-2 border-slate-700 hover:border-slate-600"
        >
          Build My Roadmap for This Career <span className="text-xl">→</span>
        </button>
      </div>

    </motion.div>
  );
};
