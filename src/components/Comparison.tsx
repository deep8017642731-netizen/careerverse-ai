import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import type { CareerWorld } from '../lib/types';
import { formatLPA, formatINR } from '../lib/financialModel';

interface ComparisonProps {
  worlds: CareerWorld[];
  onSelectWorld: (id: string) => void;
  onBack: () => void;
}

export const Comparison: React.FC<ComparisonProps> = ({ worlds, onSelectWorld, onBack }) => {
  
  // Transform data for Radar Chart
  const radarData = [
    { subject: 'Fit Score', fullMark: 100 },
    { subject: 'Job Security', fullMark: 100 },
    { subject: 'Happiness', fullMark: 100 },
    { subject: 'Work-Life Balance', fullMark: 100 },
    { subject: 'Meaning/Purpose', fullMark: 100 },
  ].map(axis => {
    const dataPoint: any = { subject: axis.subject, fullMark: axis.fullMark };
    worlds.forEach(w => {
      let val = 0;
      switch (axis.subject) {
        case 'Fit Score': val = w.fitScore; break;
        case 'Job Security': val = w.jobSecurityScore; break;
        case 'Happiness': val = w.happinessMetrics.overall; break;
        case 'Work-Life Balance': val = w.happinessMetrics.workLifeBalance; break;
        case 'Meaning/Purpose': val = w.happinessMetrics.meaningPurpose; break;
      }
      dataPoint[w.careerTitle] = val;
    });
    return dataPoint;
  });

  const colors = ['#0D9488', '#D97706', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Helper to find best values in rows
  const findMax = (getter: (w: CareerWorld) => number) => Math.max(...worlds.map(getter));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-8 bg-slate-50 min-h-screen"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="text-slate-500 hover:text-teal-600 font-medium text-sm transition-colors"
        >
          ← Back to Worlds
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Side-by-Side Comparison</h1>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        {/* Radar Chart */}
        <div className="xl:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center">
          <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-center">Attribute Radar</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                {worlds.map((w, idx) => (
                  <Radar
                    key={w.id}
                    name={w.careerTitle}
                    dataKey={w.careerTitle}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.1}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-500 w-1/4 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Dimension</th>
                {worlds.map((w, idx) => (
                  <th key={w.id} className="p-4 align-top w-[15%] min-w-[140px]">
                    <div 
                      className="font-bold text-slate-800 text-sm hover:text-teal-600 cursor-pointer transition-colors"
                      onClick={() => onSelectWorld(w.id)}
                    >
                      <div className="w-3 h-3 rounded-full mb-2 inline-block mr-2" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                      {w.careerTitle}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              
              {/* Fit Score */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Fit Score</td>
                {worlds.map(w => {
                  const isMax = w.fitScore === findMax(world => world.fitScore);
                  return <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>{w.fitScore}/100</td>
                })}
              </tr>

              {/* Year 1 Salary */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Starting Salary (Yr 1)</td>
                {worlds.map(w => {
                  const s = w.salaryTrajectory[0]?.ctcLPA || 0;
                  const isMax = s === findMax(world => world.salaryTrajectory[0]?.ctcLPA || 0);
                  return <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>{formatLPA(s)}</td>
                })}
              </tr>

              {/* Year 10 Salary */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Salary (Yr 10)</td>
                {worlds.map(w => {
                  const s = w.salaryTrajectory[w.salaryTrajectory.length-1]?.ctcLPA || 0;
                  const isMax = s === findMax(world => world.salaryTrajectory[world.salaryTrajectory.length-1]?.ctcLPA || 0);
                  return <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>{formatLPA(s)}</td>
                })}
              </tr>

              {/* Net Worth Yr 10 */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Proj. Net Worth (Yr 10)</td>
                {worlds.map(w => {
                  const nw = w.netWorthProjection[w.netWorthProjection.length-1]?.netWorthLakhs || 0;
                  const isMax = nw === findMax(world => world.netWorthProjection[world.netWorthProjection.length-1]?.netWorthLakhs || 0);
                  return <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>{formatINR(nw)}</td>
                })}
              </tr>

              {/* Happiness */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Overall Happiness</td>
                {worlds.map(w => {
                  const isMax = w.happinessMetrics.overall === findMax(world => world.happinessMetrics.overall);
                  return <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>{w.happinessMetrics.overall}/100</td>
                })}
              </tr>

              {/* Job Security */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Job Security</td>
                {worlds.map(w => {
                  const isMax = w.jobSecurityScore === findMax(world => world.jobSecurityScore);
                  return (
                    <td key={w.id} className={`p-4 ${isMax ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600'}`}>
                      {w.jobSecurityScore}/100
                      <span className="block text-xs font-normal opacity-70 capitalize mt-1">{w.demandTrend}</span>
                    </td>
                  )
                })}
              </tr>

              {/* Time to comfortable */}
              <tr className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-700 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Time to "Comfortable"</td>
                {worlds.map(w => (
                  <td key={w.id} className="p-4 text-slate-600">{w.timelineToComfortable}</td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="p-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"></td>
                {worlds.map(w => (
                  <td key={w.id} className="p-4">
                    <button 
                      onClick={() => onSelectWorld(w.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md font-semibold transition-colors text-xs"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
