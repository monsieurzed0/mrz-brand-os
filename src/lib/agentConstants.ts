export const AGENTS = [
  { id: 'chief-of-staff', name: 'Chief of Staff', short: 'COS', icon: 'Crown', mission: 'Orchestration générale, rapport hebdomadaire, alignement des priorités' },
  { id: 'market-intel', name: 'Market Intel', short: 'Intel', icon: 'Radar', mission: 'Veille concurrentielle, analyse marché, détection d\'opportunités' },
  { id: 'content-strategist', name: 'Content Strategist', short: 'Content', icon: 'Lightbulb', mission: 'Génération d\'idées, analyse tendances, planification éditoriale' },
  { id: 'scriptwriter', name: 'Scriptwriter', short: 'Script', icon: 'PenTool', mission: 'Rédaction de scripts, hooks, captions, CTA' },
  { id: 'prompt-engineer', name: 'Prompt Engineer', short: 'Prompt', icon: 'Palette', mission: 'Création de prompts visuels, direction artistique IA' },
  { id: 'sales-lead-ops', name: 'Sales & Lead Ops', short: 'Sales', icon: 'Target', mission: 'Qualification leads, scoring, préparation relances' },
  { id: 'proof-delivery', name: 'Proof & Delivery', short: 'Proof', icon: 'Shield', mission: 'Suivi livraisons, collecte de preuves, documentation' },
] as const;

export type AgentId = typeof AGENTS[number]['id'];
