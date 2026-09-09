// ============================================================
// CareerVerse AI — API Client
// ============================================================

import type {
  AssessmentAnswers,
  CandidateProfile,
  ProfileResponse,
  SimulationResponse,
  RoadmapResponse,
  CareerWorld,
  AdaptiveScenario,
  AdaptiveSimulationResponse,
  MarketResearch,
} from './types';

const API_BASE = '/api';

export async function understandCandidate(
  answers: AssessmentAnswers
): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE}/understand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Candidate profiling failed (${res.status})`);
  }

  return res.json();
}

export async function generateSimulation(
  answers: AssessmentAnswers,
  candidateProfile?: CandidateProfile,
  research?: unknown
): Promise<SimulationResponse> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, candidateProfile, research }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Simulation failed (${res.status})`);
  }

  return res.json();
}

export async function researchCareerPaths(
  answers: AssessmentAnswers,
  candidateProfile: CandidateProfile
): Promise<{ research: MarketResearch }> {
  const res = await fetch(`${API_BASE}/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, candidateProfile }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Career research failed (${res.status})`);
  }

  return res.json();
}

export async function startAdaptiveSimulation(
  answers: AssessmentAnswers,
  candidateProfile: CandidateProfile,
  world: CareerWorld,
  history: string[] = []
): Promise<AdaptiveSimulationResponse> {
  const res = await fetch(`${API_BASE}/simulation/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, candidateProfile, world, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Adaptive simulation failed (${res.status})`);
  }

  return res.json();
}

export async function submitAdaptiveDecision(
  answers: AssessmentAnswers,
  candidateProfile: CandidateProfile,
  world: CareerWorld,
  scenario: AdaptiveScenario,
  decision: { optionId: string; reflection: string },
  history: string[] = []
): Promise<AdaptiveSimulationResponse> {
  const res = await fetch(`${API_BASE}/simulation/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, candidateProfile, world, scenario, decision, history }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Decision evaluation failed (${res.status})`);
  }

  return res.json();
}

export async function generateRoadmap(
  world: CareerWorld,
  answers: AssessmentAnswers,
  candidateProfile?: CandidateProfile
): Promise<RoadmapResponse> {
  const res = await fetch(`${API_BASE}/roadmap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ worldId: world.id, world, answers, candidateProfile }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `Roadmap generation failed (${res.status})`);
  }

  return res.json();
}
