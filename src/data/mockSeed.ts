import type { AppState } from '@/types';

// Production-safe seed.
// No fake clients, fake proofs, fake revenue, fake testimonials, or fake projects.
// The OS must be fed only by real data from D1/API or by explicit user input.
export const mockSeed: AppState = {
  contentIdeas: [],
  scripts: [],
  leads: [],
  projects: [],
  agentRuns: [],
  proofs: [],
  notifications: [],
  weeklyPlans: [],
  brandMemory: [],
  agents: [],
};
