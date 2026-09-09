import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BrainCircuit, ChevronDown, Database, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { getSimulationHistory } from '../lib/storage';
import type { SimulationRecord } from '../lib/types';

interface LandingProps {
  onStart: () => void;
  onViewSimulation?: (record: SimulationRecord) => void;
}

const steps = [
  ['01', 'Understand you', 'A focused assessment maps your values, constraints, strengths, and operating style.'],
  ['02', 'Simulate reality', 'Experience career scenarios with different stakes, contexts, and tradeoffs.'],
  ['03', 'Read the signals', 'Your decisions shape the next challenge and reveal patterns worth developing.'],
  ['04', 'Build your route', 'Turn the evidence into a practical roadmap for the path you want to test.'],
];

const paths = ['Software engineering', 'Product development', 'Data & analytics', 'Cybersecurity', 'Product management'];

export default function Landing({ onStart, onViewSimulation }: LandingProps) {
  const [history] = useState<SimulationRecord[]>(() => getSimulationHistory());
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f7f6] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f5f7f6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3" aria-label="Career Verse AI home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-teal-300">CV</span>
            <span className="text-[15px] font-semibold tracking-tight">Career Verse <span className="text-teal-700">AI</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex" aria-label="Primary navigation">
            <button onClick={() => scrollTo('how-it-works')} className="transition hover:text-slate-950">How it works</button>
            <button onClick={() => scrollTo('methodology')} className="transition hover:text-slate-950">Methodology</button>
            <button onClick={() => scrollTo('career-paths')} className="transition hover:text-slate-950">Career paths</button>
            <button onClick={() => scrollTo('about')} className="transition hover:text-slate-950">About</button>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onStart} className="hidden items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:inline-flex">Start assessment <ArrowRight size={15} /></button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="rounded-lg border border-slate-300 p-2 lg:hidden" aria-label="Toggle navigation menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {menuOpen && <nav className="border-t border-slate-200 bg-[#f5f7f6] px-5 py-4 lg:hidden">{['how-it-works', 'methodology', 'career-paths', 'about'].map(id => <button key={id} onClick={() => scrollTo(id)} className="block w-full py-3 text-left text-sm font-medium capitalize text-slate-600">{id.replaceAll('-', ' ')}</button>)}<button onClick={onStart} className="mt-2 w-full rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white">Start assessment <ArrowRight className="ml-2 inline" size={15} /></button></nav>}
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute left-[-10rem] top-10 h-80 w-80 rounded-full bg-teal-200/30 blur-3xl" />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-700/20 bg-teal-700/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.17em] text-teal-800"><span className="h-1.5 w-1.5 rounded-full bg-teal-600" /> AI-powered career intelligence</div>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-6xl">Make your next career decision <span className="text-teal-700">with data.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Complete a 10-minute assessment, experience realistic career simulations, and get a personalized roadmap based on how you think, decide, and work.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-800">Start my career simulation <ArrowRight size={17} /></button><button onClick={() => scrollTo('how-it-works')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/60 px-5 py-3.5 font-semibold text-slate-700 transition hover:border-slate-500">How it works <ChevronDown size={16} /></button></div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-wider text-slate-500"><span>10 min assessment</span><span className="text-teal-700">•</span><span>5 personalized worlds</span><span className="text-teal-700">•</span><span>Free to explore</span></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.1 }} className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] border border-teal-900/10 bg-white/30" />
            <div className="relative rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10 sm:p-7">
              <div className="flex items-start justify-between border-b border-slate-100 pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Sample profile</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Career intelligence</h2></div><div className="rounded-lg bg-teal-50 p-2 text-teal-700"><BrainCircuit size={21} /></div></div>
              <div className="mt-6 grid grid-cols-[1fr_112px] items-center gap-5"><div><p className="text-sm text-slate-500">Career fit signal</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-semibold tracking-tight text-slate-950">82</span><span className="mb-1 text-sm font-medium text-teal-700">/ 100</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[82%] rounded-full bg-teal-600" /></div><p className="mt-2 text-xs text-slate-400">Illustrative sample data</p></div><div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-teal-100 border-t-teal-700 border-r-teal-700"><div className="text-center"><p className="text-2xl font-semibold">4.2</p><p className="text-[10px] font-bold uppercase text-slate-400">signal</p></div></div></div>
              <div className="mt-7 space-y-4">{[['Technical aptitude', 91, 'teal'], ['Decision making', 74, 'amber'], ['Communication', 63, 'slate'], ['Learning agility', 89, 'teal']].map(([label, value, color]) => <div key={label as string}><div className="mb-1.5 flex justify-between text-xs font-medium"><span className="text-slate-600">{label}</span><span className="text-slate-900">{value}</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className={`h-full rounded-full ${color === 'amber' ? 'bg-amber-500' : color === 'slate' ? 'bg-slate-500' : 'bg-teal-600'}`} style={{ width: `${value}%` }} /></div></div>)}</div>
              <div className="mt-7 border-t border-slate-100 pt-5"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Top career matches</p><span className="text-[10px] font-semibold uppercase text-amber-700">Demo</span></div>{[['Software engineer', '87%'], ['Product engineer', '81%'], ['Data analyst', '76%']].map(([name, score], index) => <div key={name} className="flex items-center gap-3 py-2 text-sm"><span className="w-5 text-xs font-bold text-slate-400">0{index + 1}</span><span className="flex-1 font-medium text-slate-700">{name}</span><span className="font-semibold text-teal-700">{score}</span></div>)}</div>
            </div>
          </motion.div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">A better starting point</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your career is a set of decisions, not a personality label.</h2></div><div className="mt-12 grid gap-8 md:grid-cols-4">{steps.map(([number, title, body]) => <div key={number} className="relative border-t-2 border-slate-200 pt-5"><span className="text-xs font-bold tracking-[0.16em] text-amber-600">{number}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></div>)}</div></div></section>

        <section id="methodology" className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:py-28"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Personalization engine</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Different answers should create a different journey.</h2><p className="mt-5 max-w-lg leading-7 text-slate-600">Career Verse turns assessment answers into a profile of strengths, constraints, preferences, and decision patterns. Scenarios then adapt to what you choose, not just what you selected at the beginning.</p><button onClick={onStart} className="mt-7 inline-flex items-center gap-2 font-semibold text-teal-800 hover:text-teal-950">Build your profile <ArrowRight size={16} /></button></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Database className="text-teal-700" size={22} /><h3 className="mt-5 font-semibold">Profile signals</h3><p className="mt-2 text-sm leading-6 text-slate-600">Skills, risk tolerance, work style, financial reality, learning orientation, and the values behind your choices.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><BarChart3 className="text-amber-600" size={22} /><h3 className="mt-5 font-semibold">Decision evidence</h3><p className="mt-2 text-sm leading-6 text-slate-600">Tradeoffs, reflections, and follow-up performance become part of your career fit signal.</p></div><div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:col-span-2"><Sparkles className="text-teal-300" size={22} /><h3 className="mt-5 font-semibold">Guidance, not prophecy</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Results explain why a path fits based on your responses. They are a useful evidence trail, not a guarantee about your future.</p></div></div></section>

        <section id="career-paths" className="border-y border-slate-200 bg-[#e9efec]"><div className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Career worlds</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Your career. Your decisions. Your simulation.</h2></div><p className="max-w-md text-sm leading-6 text-slate-600">These are example directions. Your assessment determines which paths, contexts, and difficulty levels are worth exploring.</p></div><div className="mt-10 flex flex-wrap gap-3">{paths.map((path, index) => <div key={path} className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800"><span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-teal-600' : index === 1 ? 'bg-amber-500' : 'bg-slate-400'}`} />{path}<ArrowRight size={14} className="text-slate-400" /></div>)}</div></div></section>

        {history.length > 0 && <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8"><div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Your workspace</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Continue exploring</h2></div><span className="text-sm text-slate-500">{history.length} saved {history.length === 1 ? 'simulation' : 'simulations'}</span></div><div className="mt-8 grid gap-4 md:grid-cols-3">{history.slice(0, 3).map(record => <button key={record.id} onClick={() => onViewSimulation?.(record)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-teal-300"><div className="flex justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-teal-700">{record.field || 'Career simulation'}</span><span className="text-xs text-slate-400">{record.fitScore}%</span></div><h3 className="mt-4 font-semibold">{record.careerTitle}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{record.recommendation}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-900">View results <ArrowRight size={15} /></span></button>)}</div></section>}

        <section id="about" className="bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-300">Career Verse AI</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight">A calmer, clearer way to make a consequential choice.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">Built for students, early-career professionals, and thoughtful career switchers who want evidence before committing years of effort.</p></div><button onClick={onStart} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3.5 font-semibold text-white transition hover:bg-teal-500">Start your assessment <ArrowRight size={17} /></button></div></section>
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 px-5 pb-8 text-sm text-slate-500 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 pt-6 sm:flex-row"><span>© Career Verse AI</span><span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> Data-informed guidance. No guaranteed outcomes.</span></div></footer>
    </div>
  );
}