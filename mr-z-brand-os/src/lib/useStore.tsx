import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AppState, ContentIdea, Script, Lead, Project, AgentRun, Proof, Notification, WeeklyPlan, BrandMemorySection } from '@/types';
import { loadState, saveState, resetState, generateId } from '@/lib/storage';

interface StoreContextType {
  state: AppState;
  // Content Ideas
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  updateContentIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteContentIdea: (id: string) => void;
  // Scripts
  addScript: (script: Omit<Script, 'id' | 'createdAt'>) => void;
  updateScript: (id: string, updates: Partial<Script>) => void;
  deleteScript: (id: string) => void;
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Agent Runs
  addAgentRun: (run: Omit<AgentRun, 'id'>) => void;
  updateAgentRun: (id: string, updates: Partial<AgentRun>) => void;
  // Proofs
  addProof: (proof: Omit<Proof, 'id' | 'createdAt'>) => void;
  updateProof: (id: string, updates: Partial<Proof>) => void;
  deleteProof: (id: string) => void;
  // Notifications
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Weekly Plans
  addWeeklyPlan: (plan: Omit<WeeklyPlan, 'id' | 'createdAt'>) => void;
  updateWeeklyPlan: (id: string, updates: Partial<WeeklyPlan>) => void;
  // Brand Memory
  updateBrandMemory: (id: string, updates: Partial<BrandMemorySection>) => void;
  // Reset
  resetStore: () => void;
  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toast, setToast] = useState<string | null>(null);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState(prev => {
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addContentIdea = useCallback((idea: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, contentIdeas: [...s.contentIdeas, { ...idea, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Idée ajoutée');
  }, [update, showToast]);

  const updateContentIdea = useCallback((id: string, updates: Partial<ContentIdea>) => {
    update(s => ({ ...s, contentIdeas: s.contentIdeas.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const deleteContentIdea = useCallback((id: string) => {
    update(s => ({ ...s, contentIdeas: s.contentIdeas.filter(i => i.id !== id) }));
    showToast('Idée supprimée');
  }, [update, showToast]);

  const addScript = useCallback((script: Omit<Script, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, scripts: [...s.scripts, { ...script, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Script ajouté');
  }, [update, showToast]);

  const updateScript = useCallback((id: string, updates: Partial<Script>) => {
    update(s => ({ ...s, scripts: s.scripts.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const deleteScript = useCallback((id: string) => {
    update(s => ({ ...s, scripts: s.scripts.filter(i => i.id !== id) }));
    showToast('Script supprimé');
  }, [update, showToast]);

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, leads: [...s.leads, { ...lead, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Lead ajouté');
  }, [update, showToast]);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    update(s => ({ ...s, leads: s.leads.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const deleteLead = useCallback((id: string) => {
    update(s => ({ ...s, leads: s.leads.filter(i => i.id !== id) }));
    showToast('Lead supprimé');
  }, [update, showToast]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, projects: [...s.projects, { ...project, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Projet ajouté');
  }, [update, showToast]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    update(s => ({ ...s, projects: s.projects.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const deleteProject = useCallback((id: string) => {
    update(s => ({ ...s, projects: s.projects.filter(i => i.id !== id) }));
    showToast('Projet supprimé');
  }, [update, showToast]);

  const addAgentRun = useCallback((run: Omit<AgentRun, 'id'>) => {
    update(s => ({ ...s, agentRuns: [...s.agentRuns, { ...run, id: generateId() }] }));
  }, [update]);

  const updateAgentRun = useCallback((id: string, updates: Partial<AgentRun>) => {
    update(s => ({ ...s, agentRuns: s.agentRuns.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const addProof = useCallback((proof: Omit<Proof, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, proofs: [...s.proofs, { ...proof, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Preuve ajoutée');
  }, [update, showToast]);

  const updateProof = useCallback((id: string, updates: Partial<Proof>) => {
    update(s => ({ ...s, proofs: s.proofs.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const deleteProof = useCallback((id: string) => {
    update(s => ({ ...s, proofs: s.proofs.filter(i => i.id !== id) }));
    showToast('Preuve supprimée');
  }, [update, showToast]);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, notifications: [{ ...n, id: generateId(), createdAt: new Date().toISOString() }, ...s.notifications] }));
  }, [update]);

  const markNotificationRead = useCallback((id: string) => {
    update(s => ({ ...s, notifications: s.notifications.map(n => n.id === id ? { ...n, status: 'read' as const } : n) }));
  }, [update]);

  const markAllNotificationsRead = useCallback(() => {
    update(s => ({ ...s, notifications: s.notifications.map(n => ({ ...n, status: 'read' as const })) }));
    showToast('Notifications marquées comme lues');
  }, [update, showToast]);

  const addWeeklyPlan = useCallback((plan: Omit<WeeklyPlan, 'id' | 'createdAt'>) => {
    update(s => ({ ...s, weeklyPlans: [...s.weeklyPlans, { ...plan, id: generateId(), createdAt: new Date().toISOString() }] }));
    showToast('Plan hebdomadaire créé');
  }, [update, showToast]);

  const updateWeeklyPlan = useCallback((id: string, updates: Partial<WeeklyPlan>) => {
    update(s => ({ ...s, weeklyPlans: s.weeklyPlans.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [update]);

  const updateBrandMemory = useCallback((id: string, updates: Partial<BrandMemorySection>) => {
    update(s => ({ ...s, brandMemory: s.brandMemory.map(i => i.id === id ? { ...i, ...updates } : i) }));
    showToast('Mémoire de marque mise à jour');
  }, [update, showToast]);

  const resetStore = useCallback(() => {
    const fresh = resetState();
    setState(fresh);
    showToast('Données réinitialisées');
  }, [showToast]);

  return (
    <StoreContext.Provider value={{
      state,
      addContentIdea, updateContentIdea, deleteContentIdea,
      addScript, updateScript, deleteScript,
      addLead, updateLead, deleteLead,
      addProject, updateProject, deleteProject,
      addAgentRun, updateAgentRun,
      addProof, updateProof, deleteProof,
      addNotification, markNotificationRead, markAllNotificationsRead,
      addWeeklyPlan, updateWeeklyPlan,
      updateBrandMemory,
      resetStore,
      toast, showToast,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
