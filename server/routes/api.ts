import { Router, Request, Response } from 'express';
import { generateCandidateProfile, runSimulation, researchCareerPaths } from '../services/simulationEngine';
import { generateRoadmap } from '../services/roadmapEngine';
import { createAdaptiveScenario, evaluateAdaptiveDecision } from '../services/adaptiveSimulationEngine';

const router = Router();

// Stage 1: Understand Candidate DNA
router.post('/understand', async (req: Request, res: Response) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'Assessment answers are required' });
    }
    const profile = await generateCandidateProfile(answers);
    return res.json({
      profile,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Understand candidate route error:', error);
    return res.status(500).json({ error: error.message || 'Profile analysis failed' });
  }
});

// Stage 1.5: Deep Career Research (NEW)
router.post('/research', async (req: Request, res: Response) => {
  try {
    const { answers, candidateProfile } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'Assessment answers are required' });
    }
    
    const profile = candidateProfile || await generateCandidateProfile(answers);
    const research = await researchCareerPaths(answers, profile);

    return res.json({
      research,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Research route error:', error);
    return res.status(500).json({ error: error.message || 'Research generation failed' });
  }
});

// Stage 2: Generate 5 Diverse Career Worlds
router.post('/simulate', async (req: Request, res: Response) => {
  try {
    const { answers, candidateProfile, research } = req.body;
    if (!answers) {
      return res.status(400).json({ error: 'Assessment answers are required' });
    }
    
    // If candidateProfile is not passed, generate it on the fly
    const profile = candidateProfile || await generateCandidateProfile(answers);
    const worlds = await runSimulation(answers, profile, research);

    return res.json({
      profile,
      worlds,
      research: research || null,
      generatedAt: new Date().toISOString(),
      disclaimer: 'Simulations are personalized projections based on your unique profile and Indian market research.'
    });
  } catch (error: any) {
    console.error('Simulation route error:', error);
    return res.status(500).json({ error: error.message || 'Simulation generation failed' });
  }
});

router.post('/simulation/start', async (req: Request, res: Response) => {
  try {
    const { answers, candidateProfile, world, history = [] } = req.body;
    if (!answers || !candidateProfile || !world) {
      return res.status(400).json({ error: 'Answers, candidate profile, and career world are required' });
    }
    const scenario = createAdaptiveScenario(answers, candidateProfile, world, history);
    return res.json({
      scenario,
      completed: false,
      disclaimer: 'This interactive exercise is guidance, not a psychometric or hiring assessment.',
    });
  } catch (error: any) {
    console.error('Adaptive simulation start error:', error);
    return res.status(500).json({ error: error.message || 'Adaptive simulation could not start' });
  }
});

router.post('/simulation/respond', async (req: Request, res: Response) => {
  try {
    const { answers, candidateProfile, world, scenario, decision, history = [] } = req.body;
    if (!answers || !candidateProfile || !world || !scenario || !decision) {
      return res.status(400).json({ error: 'Simulation context and decision are required' });
    }

    const evaluation = evaluateAdaptiveDecision(scenario, decision, candidateProfile);
    const nextHistory = [...history, scenario.scenarioId];
    const completed = nextHistory.length >= 3;
    const nextScenario = completed
      ? scenario
      : createAdaptiveScenario(answers, candidateProfile, world, nextHistory);

    return res.json({
      scenario: nextScenario,
      evaluation,
      completed,
      disclaimer: 'This interactive exercise is guidance, not a psychometric or hiring assessment.',
    });
  } catch (error: any) {
    console.error('Adaptive simulation response error:', error);
    return res.status(500).json({ error: error.message || 'Decision evaluation failed' });
  }
});

// Stage 3: Generate Conditioned Roadmap
router.post('/roadmap', async (req: Request, res: Response) => {
  try {
    const { world, answers, candidateProfile } = req.body;
    if (!world) {
      return res.status(400).json({ error: 'CareerWorld object is required' });
    }
    const roadmap = await generateRoadmap(world, answers || {}, candidateProfile);
    return res.json({ roadmap });
  } catch (error: any) {
    console.error('Roadmap route error:', error);
    return res.status(500).json({ error: error.message || 'Roadmap generation failed' });
  }
});

export default router;
