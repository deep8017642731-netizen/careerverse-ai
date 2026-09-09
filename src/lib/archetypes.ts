import React from 'react';
import { 
  Code, 
  Briefcase, 
  Palette, 
  Rocket, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import type { CareerArchetype } from './types';

export interface ArchetypeConfig {
  name: string;
  badge: string;
  description: string;
  bgLight: string;
  borderLight: string;
  textPrimary: string;
  accentBg: string;
  accentText: string;
  badgeBg: string;
  badgeBorder: string;
  glowColor: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export const ARCHETYPE_CONFIG: Record<CareerArchetype, ArchetypeConfig> = {
  technical: {
    name: 'Technical & Specialist',
    badge: 'Specialist / Tech',
    description: 'Deep domain expertise, systems engineering, high-scale digital leverage',
    bgLight: 'bg-sky-50/70',
    borderLight: 'border-sky-200 hover:border-sky-400',
    textPrimary: 'text-sky-900',
    accentBg: 'bg-sky-500',
    accentText: 'text-sky-600',
    badgeBg: 'bg-sky-100/80 text-sky-800',
    badgeBorder: 'border-sky-300/80',
    glowColor: 'rgba(14, 165, 233, 0.15)',
    icon: Code
  },
  business: {
    name: 'Business & Strategy',
    badge: 'Strategy / Mgmt',
    description: 'P&L growth, cross-functional leadership, commercial operations & product',
    bgLight: 'bg-teal-50/70',
    borderLight: 'border-teal-200 hover:border-teal-400',
    textPrimary: 'text-teal-900',
    accentBg: 'bg-teal-600',
    accentText: 'text-teal-700',
    badgeBg: 'bg-teal-100/80 text-teal-800',
    badgeBorder: 'border-teal-300/80',
    glowColor: 'rgba(13, 148, 136, 0.15)',
    icon: Briefcase
  },
  creative: {
    name: 'Creative & People-Facing',
    badge: 'Creative / UX',
    description: 'Human-centered design, storytelling, brand architecture, stakeholder empathy',
    bgLight: 'bg-purple-50/70',
    borderLight: 'border-purple-200 hover:border-purple-400',
    textPrimary: 'text-purple-900',
    accentBg: 'bg-purple-600',
    accentText: 'text-purple-700',
    badgeBg: 'bg-purple-100/80 text-purple-800',
    badgeBorder: 'border-purple-300/80',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    icon: Palette
  },
  entrepreneurial: {
    name: 'Entrepreneurial & Independent',
    badge: 'Founder / Solo',
    description: 'Maximum autonomy, uncapped equity upside, direct client advisory & ventures',
    bgLight: 'bg-amber-50/70',
    borderLight: 'border-amber-200 hover:border-amber-400',
    textPrimary: 'text-amber-900',
    accentBg: 'bg-amber-500',
    accentText: 'text-amber-700',
    badgeBg: 'bg-amber-100/80 text-amber-900',
    badgeBorder: 'border-amber-300/80',
    glowColor: 'rgba(217, 119, 6, 0.15)',
    icon: Rocket
  },
  structured: {
    name: 'Structured & Stability-First',
    badge: 'Stability / Core',
    description: 'High security, strong institutional governance, PSU/Govt and corporate ladders',
    bgLight: 'bg-emerald-50/70',
    borderLight: 'border-emerald-200 hover:border-emerald-400',
    textPrimary: 'text-emerald-900',
    accentBg: 'bg-emerald-600',
    accentText: 'text-emerald-800',
    badgeBg: 'bg-emerald-100/80 text-emerald-900',
    badgeBorder: 'border-emerald-300/80',
    glowColor: 'rgba(5, 150, 105, 0.15)',
    icon: ShieldCheck
  }
};

export function getArchetypeConfig(archetype?: CareerArchetype): ArchetypeConfig {
  if (archetype && ARCHETYPE_CONFIG[archetype]) {
    return ARCHETYPE_CONFIG[archetype];
  }
  return {
    name: 'General Career Path',
    badge: 'Career Path',
    description: 'Balanced career progression',
    bgLight: 'bg-slate-50',
    borderLight: 'border-slate-200 hover:border-slate-400',
    textPrimary: 'text-slate-900',
    accentBg: 'bg-slate-700',
    accentText: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-700',
    badgeBorder: 'border-slate-300',
    glowColor: 'rgba(100, 116, 139, 0.1)',
    icon: Layers
  };
}
