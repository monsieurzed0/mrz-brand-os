export const STATUS_MAP: Record<string, string> = {
  idea_pending: 'À idéer',
  idea_ready: 'Idée prête',
  script_pending: 'À scripter',
  draft: 'Brouillon',
  ready_review: 'À valider',
  approved: 'Validé',
  produced: 'Produit',
  published: 'Publié',
  archived: 'Archivé',
  lead_new: 'Nouveau',
  lead_qualified: 'Qualifié',
  lead_followup: 'Relance',
  lead_meeting: 'Rendez-vous',
  lead_proposal: 'Proposition',
  lead_won: 'Gagné',
  lead_lost: 'Perdu',
  project_planned: 'Planifié',
  project_active: 'En cours',
  project_waiting: 'En attente',
  project_delivered: 'Livré',
  project_archived: 'Archivé',
  queued: 'En file',
  running: 'En cours',
  done: 'Terminé',
  failed: 'Échec',
  unread: 'Non lu',
  read: 'Lu',
  active: 'Actif',
  idle: 'Inactif',
  error: 'Erreur',
};

export const STATUS_COLORS: Record<string, string> = {
  idea_pending: 'bg-subtle/20 text-muted',
  idea_ready: 'bg-copper/20 text-copper-light',
  script_pending: 'bg-exec/20 text-exec',
  draft: 'bg-subtle/20 text-muted',
  ready_review: 'bg-copper-light/20 text-copper-light',
  approved: 'bg-copper/20 text-copper',
  produced: 'bg-exec/20 text-ivory',
  published: 'bg-copper/30 text-copper-light',
  archived: 'bg-dark text-subtle',
  lead_new: 'bg-copper-light/20 text-copper-light',
  lead_qualified: 'bg-copper/20 text-copper',
  lead_followup: 'bg-exec/20 text-exec',
  lead_meeting: 'bg-copper/30 text-copper-light',
  lead_proposal: 'bg-copper-light/30 text-copper-light',
  lead_won: 'bg-copper/40 text-ivory',
  lead_lost: 'bg-dark text-subtle',
  project_planned: 'bg-subtle/20 text-muted',
  project_active: 'bg-copper/20 text-copper-light',
  project_waiting: 'bg-copper-light/20 text-copper-light',
  project_delivered: 'bg-copper/30 text-ivory',
  project_archived: 'bg-dark text-subtle',
  queued: 'bg-subtle/20 text-muted',
  running: 'bg-copper-light/20 text-copper-light',
  done: 'bg-copper/20 text-copper',
  failed: 'bg-red-900/30 text-red-400',
  active: 'bg-copper/20 text-copper-light',
  idle: 'bg-subtle/20 text-muted',
  error: 'bg-red-900/30 text-red-400',
};

export const PRODUCTS: string[] = ['Mr Z Brand', 'SIGNAL™ by Mr Z', 'PROSKILLS FR'];
export const PLATFORMS: string[] = ['TikTok', 'YouTube Shorts', 'Instagram Reel', 'LinkedIn', 'Facebook'];
export const DURATIONS: number[] = [30, 45, 60, 90];

export const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/mrzbrand0', handle: '@mrzbrand0', description: 'Page Facebook officielle' },
  { name: 'YouTube', url: 'https://www.youtube.com/@mrzbrand0', handle: '@mrzbrand0', description: 'Chaîne YouTube officielle' },
  { name: 'Instagram', url: 'https://www.instagram.com/mrzbrand0', handle: '@mrzbrand0', description: 'Profil Instagram officiel' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mrzbrand0', handle: 'mrzbrand0', description: 'Profil LinkedIn professionnel' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@mrz.brand', handle: '@mrz.brand', description: 'Compte TikTok officiel' },
  { name: 'Behance', url: 'https://be.net/hervezeh', handle: 'hervezeh', description: 'Portfolio créatif Behance' },
];

export const CONTACT_LINKS = [
  { name: 'WhatsApp', url: 'https://wa.me/237682722237', handle: '+237 682 722 237', description: 'Contact direct WhatsApp' },
  { name: 'Email', url: 'mailto:contact@mrzbrand.online', handle: 'contact@mrzbrand.online', description: 'Email professionnel' },
];

export const SITE_LINKS = [
  { name: 'Site principal', url: 'https://mrzbrand.online', handle: 'mrzbrand.online', description: 'Portail Mr Z Brand', icon: 'monitor' },
  { name: 'SIGNAL™ by Mr Z', url: 'https://signal.mrzbrand.online', handle: 'signal.mrzbrand.online', description: 'Stratégie WhatsApp Business', icon: 'signal' },
  { name: 'PROSKILLS FR', url: 'https://proskillsfr.mrzbrand.online', handle: 'proskillsfr.mrzbrand.online', description: 'Formation & personal branding', icon: 'graduation' },
];

export const CLIENT_LOGOS = [
  { name: 'EASPAY', url: 'https://assets.mrzbrand.online/Assets/logo_easpay.png' },
  { name: 'DF Logistics', url: 'https://assets.mrzbrand.online/Assets/logo_df_logistics.png' },
  { name: 'DB Excellence Group', url: 'https://assets.mrzbrand.online/Assets/logo_db_excellence.png' },
  { name: 'CAPELLI', url: 'https://assets.mrzbrand.online/Assets/logo_capelli.png' },
  { name: 'ROGA', url: 'https://assets.mrzbrand.online/Assets/logo_roga.png' },
  { name: 'Carré des Officiers', url: 'https://assets.mrzbrand.online/Assets/logo_carre_officiers.png' },
];

export const ASSETS = {
  logo: 'https://assets.mrzbrand.online/Assets/mrz-logo-dark.png',
  founderPhoto: 'https://assets.mrzbrand.online/Assets/mr_z_photo.png',
  heroBg: 'https://assets.mrzbrand.online/Assets/hero-bg.jpg',
  signalLogo: 'https://assets.mrzbrand.online/Assets/logo_signal_dark.png',
  proskillsLogo: 'https://assets.mrzbrand.online/Assets/P1.png',
};

// All digital presence for dashboard quick access
export const DIGITAL_PRESENCE = [
  { name: 'Facebook', url: 'https://www.facebook.com/mrzbrand0' },
  { name: 'YouTube', url: 'https://www.youtube.com/@mrzbrand0' },
  { name: 'Instagram', url: 'https://www.instagram.com/mrzbrand0' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@mrz.brand' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/mrzbrand0' },
  { name: 'Behance', url: 'https://be.net/hervezeh' },
  { name: 'WhatsApp', url: 'https://wa.me/237682722237' },
  { name: 'Site', url: 'https://mrzbrand.online' },
  { name: 'SIGNAL™', url: 'https://signal.mrzbrand.online' },
  { name: 'PROSKILLS FR', url: 'https://proskillsfr.mrzbrand.online' },
];
