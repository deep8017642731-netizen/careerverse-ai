import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, CalendarDays, ChevronRight, ClipboardList, Map, RotateCcw } from 'lucide-react';
import type { SimulationRecord } from '../lib/types';

interface HistoryPageProps {
  sessions: SimulationRecord[];
  onOpen: (session: SimulationRecord) => void;
  onNew: () => void;
  onBack: () => void;
}

export default function HistoryPage({ sessions, onOpen, onNew, onBack }: HistoryPageProps) {
  const [selected, setSelected] = useState<SimulationRecord | null>(null);

  if (selected) {
    const profileScores = selected.candidateProfile?.signalScores ? Object.entries(selected.candidateProfile.signalScores) : [];
    return (
      <main className="min-h-screen bg-[#f5f7f6] px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => setSelected(null)} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft size={16} /> Back to journey history</button>
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Session {selected.id}</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{selected.careerTitle}</h1><p className="mt-2 text-sm text-slate-500">Started {new Date(selected.date).toLocaleString()}</p></div><button onClick={() => onOpen(selected)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-teal-800">Open career worlds <ChevronRight size={16} /></button></div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Calculated profile</p><p className="mt-3 leading-7 text-slate-700">{selected.candidateProfile?.summary || 'Profile summary unavailable.'}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{profileScores.map(([label, score]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><div className="flex justify-between text-xs text-slate-500"><span>{label.replace(/([A-Z])/g, ' $1')}</span><strong className="text-slate-950">{score}</strong></div><div className="mt-2 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-teal-600" style={{ width: `${score}%` }} /></div></div>)}</div></section><section className="rounded-2xl border border-teal-200 bg-teal-50 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Session status</p><p className="mt-4 text-4xl font-semibold text-slate-950">{selected.fitScore}<span className="text-lg text-slate-500">/100</span></p><p className="mt-2 text-sm leading-6 text-slate-700">Overall career fit signal</p><p className="mt-6 text-sm text-slate-700">{selected.decisions?.length || 0} decisions recorded</p><p className="mt-2 text-sm text-slate-700">{selected.roadmap ? 'Roadmap generated' : 'Roadmap not yet generated'}</p></section></div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Market research snapshot</p><p className="mt-3 text-sm leading-6 text-slate-700">{selected.research?.marketInsights || 'Research snapshot unavailable.'}</p><div className="mt-4 flex flex-wrap gap-2">{(selected.research?.highGrowthAreas || []).map(item => <span key={item} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{item}</span>)}</div></section><section className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Final analysis</p><p className="mt-3 text-sm leading-6 text-slate-700">{selected.finalAnalysis?.nextActions.join(' · ') || 'Complete a simulation and roadmap to generate final actions.'}</p>{selected.finalAnalysis?.simulationPerformance && <p className="mt-4 text-sm font-semibold text-slate-950">Average simulation score: {selected.finalAnalysis.simulationPerformance.averageScore || 'Pending'}</p>}</section></div>
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Decision trail</p><div className="mt-5 space-y-4">{(selected.decisions || []).length === 0 ? <p className="text-sm text-slate-500">No adaptive decisions recorded yet.</p> : selected.decisions?.map((decision, index) => <div key={`${decision.scenario.scenarioId}-${index}`} className="border-l-2 border-teal-600 pl-4"><p className="text-sm font-semibold text-slate-950">{index + 1}. {decision.scenario.title}</p><p className="mt-1 text-sm text-slate-600">{decision.scenario.decisionOptions.find(option => option.id === decision.optionId)?.label}</p><p className="mt-1 text-xs text-slate-500">{decision.evaluation?.summary}</p></div>)}</div></section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950"><ArrowLeft size={16} /> Back home</button>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">History / My journey</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Your career evidence trail</h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">Every assessment, profile, market snapshot, decision, and roadmap is saved as a separate session you can revisit.</p>
          </div>
          <button onClick={onNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-teal-800"><RotateCcw size={16} /> New assessment</button>
        </div>

        {sessions.length === 0 ? (
          <section className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><ClipboardList className="mx-auto text-teal-700" size={28} /><h2 className="mt-4 text-xl font-semibold">No journeys yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Complete an assessment to create your first profile and career evidence trail.</p><button onClick={onNew} className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800">Start assessment</button></section>
        ) : (
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {sessions.map(session => {
              const decisions = session.decisions?.length || 0;
              const average = session.finalAnalysis?.simulationPerformance.averageScore;
              return (
                <motion.button key={session.id} whileHover={{ y: -3 }} onClick={() => setSelected(session)} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-teal-300 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{session.field || 'Career assessment'}</p><h2 className="mt-3 text-xl font-semibold text-slate-950">{session.careerTitle}</h2></div><ChevronRight className="text-slate-400" size={20} /></div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{session.recommendation || session.tagline}</p>
                  <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5"><span className="text-xs text-slate-500"><CalendarDays className="mb-1 text-slate-400" size={15} />{new Date(session.date).toLocaleDateString()}</span><span className="text-xs text-slate-500"><BarChart3 className="mb-1 text-teal-600" size={15} />Fit {session.fitScore}%</span><span className="text-xs text-slate-500"><Map className="mb-1 text-amber-600" size={15} />{session.roadmap ? 'Roadmap saved' : `${decisions} decisions`}</span></div>
                  {average !== undefined && <p className="mt-4 text-xs font-semibold text-slate-500">Simulation average <span className="text-slate-950">{average}/100</span></p>}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}