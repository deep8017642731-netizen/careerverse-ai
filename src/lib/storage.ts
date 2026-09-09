import type { 
  AssessmentAnswers, 
  CandidateProfile, 
  CareerWorld, 
  CareerRoadmap, 
  SavedRecord, 
  SavedRoadmapItem, 
  SimulationRecord,
  UserSettings,
  MarketResearch,
  SimulationDecisionRecord,
  FinalCareerAnalysis
} from './types';

const HISTORY_KEY = 'careerverse_simulation_history';
const RECORDS_KEY = 'careerverse_saved_records';
const ROADMAPS_KEY = 'careerverse_saved_roadmaps';
const SETTINGS_KEY = 'careerverse_user_settings';
const ACTIVE_SESSION_KEY = 'careerverse_active_session';

// --- Session History ---

export function getSimulationHistory(): SimulationRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading simulation history from localStorage:', err);
    return [];
  }
}

export function saveSimulationToHistory(
  worlds: CareerWorld[],
  answers: AssessmentAnswers,
  candidateProfile?: CandidateProfile,
  existingSessionId?: string,
  research?: MarketResearch
): SimulationRecord | null {
  if (!worlds || worlds.length === 0) return null;

  try {
    const topWorld = worlds[0];
    const sessionId = existingSessionId || `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const newRecord: SimulationRecord = {
      id: sessionId,
      careerTitle: topWorld.careerTitle,
      field: topWorld.field,
      date: new Date().toISOString(),
      fitScore: topWorld.fitScore,
      tagline: topWorld.tagline,
      recommendation: topWorld.fitReasons?.[0] || topWorld.tagline || 'Top career alignment',
      candidateProfile,
      worlds,
      answers,
      research,
      startedAt: new Date().toISOString(),
      currentStep: 'worlds'
    };

    const currentHistory = getSimulationHistory();
    const updatedHistory = [newRecord, ...currentHistory.filter(item => item.id !== sessionId)].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    // Also save as active session
    saveActiveSession({ sessionId, answers, candidateProfile, worlds });
    
    return newRecord;
  } catch (err) {
    console.error('Error saving simulation to localStorage:', err);
    return null;
  }
}

export function saveJourneySession(session: SimulationRecord): SimulationRecord | null {
  try {
    const currentHistory = getSimulationHistory();
    const updated = [session, ...currentHistory.filter(item => item.id !== session.id)].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    saveActiveSession({
      sessionId: session.id,
      answers: session.answers,
      candidateProfile: session.candidateProfile,
      worlds: session.worlds,
      selectedWorldId: session.selectedWorldId,
      roadmap: session.roadmap,
      currentStep: session.currentStep,
      research: session.research,
      decisions: session.decisions,
      finalAnalysis: session.finalAnalysis
    });
    return session;
  } catch (err) {
    console.error('Error saving complete journey session:', err);
    return null;
  }
}

export function updateJourneySession(
  sessionId: string,
  patch: Partial<Pick<SimulationRecord, 'selectedWorldId' | 'decisions' | 'finalAnalysis' | 'roadmap' | 'currentStep' | 'completedAt' | 'research'>>
): SimulationRecord | null {
  const session = getSimulationHistory().find(item => item.id === sessionId);
  if (!session) return null;
  return saveJourneySession({ ...session, ...patch });
}

export function deleteSimulationFromHistory(sessionId: string): void {
  try {
    const current = getSimulationHistory();
    const filtered = current.filter(s => s.id !== sessionId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting simulation session:', err);
  }
}

// --- Active Session Resume Support ---

export interface ActiveSessionState {
  sessionId?: string;
  answers?: Partial<AssessmentAnswers>;
  candidateProfile?: CandidateProfile;
  worlds?: CareerWorld[];
  selectedWorldId?: string | null;
  roadmap?: CareerRoadmap | null;
  currentStep?: string;
  research?: MarketResearch;
  decisions?: SimulationDecisionRecord[];
  finalAnalysis?: FinalCareerAnalysis;
}

export function getActiveSession(): ActiveSessionState | null {
  try {
    const data = localStorage.getItem(ACTIVE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveActiveSession(state: ActiveSessionState): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving active session:', err);
  }
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
}

// --- Saved Records (Bookmarked Worlds) ---

export function getSavedRecords(): SavedRecord[] {
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading saved records:', err);
    return [];
  }
}

export function isWorldBookmarked(worldId: string, worldTitle?: string): boolean {
  const records = getSavedRecords();
  return records.some(r => r.worldId === worldId || (worldTitle && r.world.careerTitle === worldTitle));
}

export function toggleSavedRecord(
  world: CareerWorld, 
  candidateProfile?: CandidateProfile, 
  sessionId?: string
): { isSaved: boolean; record?: SavedRecord } {
  try {
    const records = getSavedRecords();
    const existingIndex = records.findIndex(r => r.worldId === world.id || r.world.careerTitle === world.careerTitle);

    if (existingIndex >= 0) {
      // Remove
      records.splice(existingIndex, 1);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      return { isSaved: false };
    } else {
      // Add
      const newRecord: SavedRecord = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        worldId: world.id,
        sessionId,
        world,
        candidateProfile,
        savedAt: new Date().toISOString()
      };
      records.unshift(newRecord);
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
      return { isSaved: true, record: newRecord };
    }
  } catch (err) {
    console.error('Error toggling saved record:', err);
    return { isSaved: false };
  }
}

export function removeSavedRecord(recordId: string): void {
  try {
    const records = getSavedRecords().filter(r => r.id !== recordId && r.worldId !== recordId);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error removing record:', err);
  }
}

// --- Saved Roadmaps with Progress Tracking ---

export function getSavedRoadmaps(): SavedRoadmapItem[] {
  try {
    const data = localStorage.getItem(ROADMAPS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading saved roadmaps:', err);
    return [];
  }
}

export function saveRoadmapProgress(
  roadmap: CareerRoadmap,
  world: CareerWorld,
  completedMilestoneIds: string[],
  candidateProfile?: CandidateProfile
): SavedRoadmapItem {
  const roadmaps = getSavedRoadmaps();
  const existingIdx = roadmaps.findIndex(r => r.worldId === world.id || r.careerTitle === world.careerTitle);

  const now = new Date().toISOString();
  if (existingIdx >= 0) {
    const updated: SavedRoadmapItem = {
      ...roadmaps[existingIdx],
      roadmap,
      completedMilestoneIds,
      candidateProfile: candidateProfile || roadmaps[existingIdx].candidateProfile,
      lastUpdated: now
    };
    roadmaps[existingIdx] = updated;
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
    return updated;
  } else {
    const newItem: SavedRoadmapItem = {
      id: `rdm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      worldId: world.id,
      careerTitle: world.careerTitle,
      archetype: world.archetype,
      roadmap,
      world,
      candidateProfile,
      completedMilestoneIds,
      createdAt: now,
      lastUpdated: now
    };
    roadmaps.unshift(newItem);
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
    return newItem;
  }
}

export function toggleMilestoneCheck(
  worldId: string, 
  milestoneKey: string
): { completed: boolean; totalMilestones: number; completedCount: number } {
  const roadmaps = getSavedRoadmaps();
  const item = roadmaps.find(r => r.worldId === worldId || r.world.id === worldId);
  if (!item) return { completed: false, totalMilestones: 0, completedCount: 0 };

  const set = new Set(item.completedMilestoneIds || []);
  let isDone = false;
  if (set.has(milestoneKey)) {
    set.delete(milestoneKey);
  } else {
    set.add(milestoneKey);
    isDone = true;
  }
  item.completedMilestoneIds = Array.from(set);
  item.lastUpdated = new Date().toISOString();

  localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));

  const total = item.roadmap.phases.reduce((acc, p) => acc + (p.milestones?.length || 0), 0);
  return { completed: isDone, totalMilestones: total, completedCount: item.completedMilestoneIds.length };
}

export function deleteSavedRoadmap(roadmapId: string): void {
  try {
    const roadmaps = getSavedRoadmaps().filter(r => r.id !== roadmapId && r.worldId !== roadmapId);
    localStorage.setItem(ROADMAPS_KEY, JSON.stringify(roadmaps));
  } catch (err) {
    console.error('Error deleting roadmap:', err);
  }
}

// --- User Settings ---

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  headline: 'Product & Tech Aspirant',
  targetLocation: 'Bengaluru / Hybrid',
  theme: 'light',
  emailNotifications: true,
  milestoneReminders: true,
  dataPrivacyConsent: true
};

export function getUserSettings(): UserSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  try {
    const current = getUserSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error saving user settings:', err);
    return DEFAULT_SETTINGS;
  }
}
