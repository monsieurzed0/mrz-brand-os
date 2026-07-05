// ===== STATUS TYPES =====
export type ContentIdeaStatus = 'idea_pending' | 'idea_ready' | 'script_pending' | 'archived';
export type ScriptStatus = 'draft' | 'ready_review' | 'approved' | 'produced' | 'published' | 'archived';
export type LeadStatus = 'lead_new' | 'lead_qualified' | 'lead_followup' | 'lead_meeting' | 'lead_proposal' | 'lead_won' | 'lead_lost';
export type ProjectStatus = 'project_planned' | 'project_active' | 'project_waiting' | 'project_delivered' | 'project_archived';
export type AgentRunStatus = 'queued' | 'running' | 'done' | 'failed';
export type NotificationStatus = 'unread' | 'read';

export type Product = 'Mr Z Brand' | 'SIGNAL™ by Mr Z' | 'PROSKILLS FR';
export type Platform = 'TikTok' | 'YouTube Shorts' | 'Instagram Reel' | 'LinkedIn' | 'Facebook';
export type Duration = 30 | 45 | 60 | 90;

// ===== DATA MODELS =====
export interface ContentIdea {
  id: string;
  subject: string;
  angle: string;
  target: string;
  product: Product;
  platform: Platform;
  duration: Duration;
  cta: string;
  source: string;
  status: ContentIdeaStatus;
  createdAt: string;
}

export interface Script {
  id: string;
  ideaId?: string;
  subject: string;
  hook: string;
  script: string;
  ctaGenerated: string;
  caption: string;
  angle: string;
  target: string;
  product: Product;
  platform: Platform;
  status: ScriptStatus;
  versions: { version: number; content: string; date: string }[];
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  source: string;
  need: string;
  level: 'cold' | 'warm' | 'hot';
  nextAction: string;
  followupDraft: string;
  status: LeadStatus;
  createdAt: string;
}

export interface Project {
  id: string;
  client: string;
  offer: string;
  phase: string;
  blockers: string;
  deliverables: string[];
  status: ProjectStatus;
  milestones: { label: string; done: boolean }[];
  createdAt: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: AgentRunStatus;
  summary: string;
  startedAt: string;
  completedAt?: string;
}

export interface Proof {
  id: string;
  type: string;
  projectLinked: string;
  content: string;
  usage: string;
  validated: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  module: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface WeeklyPlan {
  id: string;
  weekLabel: string;
  priority1: string;
  priority2: string;
  priority3: string;
  mainRisk: string;
  decisions: string[];
  notes: string;
  createdAt: string;
}

export interface BrandMemorySection {
  id: string;
  title: string;
  content: string;
}

export interface Agent {
  id: string;
  name: string;
  mission: string;
  icon: string;
  status: 'active' | 'idle' | 'error';
  lastRun?: string;
  lastSummary?: string;
}

export interface AppState {
  contentIdeas: ContentIdea[];
  scripts: Script[];
  leads: Lead[];
  projects: Project[];
  agentRuns: AgentRun[];
  proofs: Proof[];
  notifications: Notification[];
  weeklyPlans: WeeklyPlan[];
  brandMemory: BrandMemorySection[];
  agents: Agent[];
}
