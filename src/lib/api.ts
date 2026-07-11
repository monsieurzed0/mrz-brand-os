const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

const TABLES = {
  weekly: {
    table: 'weekly_command',
    fields: ['week_label', 'focus_primary', 'focus_secondary', 'focus_tertiary', 'main_risk', 'decision_note', 'status'],
    orderBy: 'updated_at DESC',
  },
  'content-ideas': {
    table: 'content_ideas',
    fields: ['sujet', 'angle', 'cible', 'produit', 'plateforme', 'duree', 'cta', 'caption', 'source', 'status'],
    orderBy: 'updated_at DESC',
  },
  scripts: {
    table: 'scripts',
    fields: ['content_idea_id', 'sujet', 'hook', 'script', 'cta_genere', 'caption', 'angle', 'cible', 'produit', 'plateforme', 'status'],
    orderBy: 'updated_at DESC',
  },
  leads: {
    table: 'leads',
    fields: ['name', 'source', 'besoin', 'niveau', 'note', 'next_action', 'relance_brouillon', 'relance_email', 'relance_whatsapp', 'status'],
    orderBy: 'updated_at DESC',
  },
  projects: {
    table: 'projects',
    fields: ['client_name', 'offre', 'phase', 'blocage', 'livrables', 'status'],
    orderBy: 'updated_at DESC',
  },
  proofs: {
    table: 'proofs',
    fields: ['project_id', 'type_preuve', 'contenu', 'asset_url', 'usage_possible', 'is_validated'],
    orderBy: 'updated_at DESC',
  },
  'visual-prompts': {
    table: 'visual_prompts',
    fields: ['related_script_id', 'sujet', 'angle', 'produit', 'hook_visuel', 'prompt_principal', 'prompt_chatgpt', 'prompt_nano_banana', 'variante_a', 'variante_b', 'variante_c', 'negative_prompt', 'photoshop_note', 'status'],
    orderBy: 'updated_at DESC',
  },
  'content-engine-outputs': {
    table: 'content_engine_outputs',
    fields: ['content_idea_id', 'output_type', 'output_label', 'platforme', 'contenu', 'status'],
    orderBy: 'updated_at DESC',
  },
  'market-intel': {
    table: 'market_intel',
    fields: ['category', 'title', 'insight', 'source', 'impact_score', 'status'],
    orderBy: 'created_at DESC',
  },
  'agent-runs': {
    table: 'agent_runs',
    fields: ['agent_name', 'input_summary', 'output_summary', 'run_status', 'error_text', 'provider', 'model', 'latency_ms', 'tokens_in', 'tokens_out'],
    orderBy: 'created_at DESC',
  },
};

// ============================================================================
// SMART ROUTER CONFIG — MODEL TIER PER AGENT
// ============================================================================

const AGENT_ROUTER = {
  'chief-of-staff': {
    complexity: 2,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'groq', model: 'llama-3.1-70b-versatile', maxTokens: 2048 },
      { provider: 'openrouter', model: 'nvidia/llama-3.1-nemotron-70b-instruct:free', maxTokens: 4096 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
  },
  'market-intel': {
    complexity: 2,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'groq', model: 'llama-3.1-70b-versatile', maxTokens: 2048 },
      { provider: 'openrouter', model: 'qwen/qwen-2.5-7b-instruct:free', maxTokens: 4096 },
      { provider: 'workers-ai', model: '@cf/mistral/mistral-7b-instruct', maxTokens: 2048 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
  },
  'content-strategist': {
    complexity: 1,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'openrouter', model: 'qwen/qwen-2.5-7b-instruct:free', maxTokens: 2048 },
      { provider: 'groq', model: 'llama-3.1-70b-versatile', maxTokens: 2048 },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free', maxTokens: 4096 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
    batchable: true,
  },
  'scriptwriter': {
    complexity: 2,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'groq', model: 'llama-3.1-70b-versatile', maxTokens: 2048 },
      { provider: 'openrouter', model: 'nvidia/llama-3.1-nemotron-70b-instruct:free', maxTokens: 4096 },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free', maxTokens: 4096 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
      { provider: 'cerebras', model: 'gpt-oss-120b', maxTokens: 4096 },
    ],
  },
  'prompt-engineer': {
    complexity: 1,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'openrouter', model: 'google/gemma-2-9b-it:free', maxTokens: 2048 },
      { provider: 'workers-ai', model: '@cf/mistral/mistral-7b-instruct', maxTokens: 2048 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
  },
  'sales-lead-ops': {
    complexity: 1,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'workers-ai', model: '@cf/mistral/mistral-7b-instruct', maxTokens: 2048 },
      { provider: 'openrouter', model: 'qwen/qwen-2.5-7b-instruct:free', maxTokens: 2048 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
  },
  'proof-delivery': {
    complexity: 1,
    tiers: [
      { provider: 'groq', model: 'llama-3.1-8b-instant', maxTokens: 2048 },
      { provider: 'workers-ai', model: '@cf/mistral/mistral-7b-instruct', maxTokens: 2048 },
      { provider: 'openrouter', model: 'qwen/qwen-2.5-7b-instruct:free', maxTokens: 2048 },
      { provider: 'gemini', model: 'gemini-2.5-flash', maxTokens: 2048 },
    ],
  },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), env, request);
    }

    try {
      // HEALTH
      if (url.pathname === '/api/health' && method === 'GET') {
        return ok({
          ok: true,
          service: 'mrz-brand-os-api',
          env: env.APP_ENV || 'production',
          time: new Date().toISOString(),
        }, env, request);
      }

      // DASHBOARD
      if (url.pathname === '/api/dashboard/summary' && method === 'GET') {
        return ok(await getDashboardSummary(env), env, request);
      }

      // BRAND MEMORY
      if (url.pathname === '/api/brand-memory' && method === 'GET') {
        const rows = await env.DB.prepare('SELECT * FROM brand_memory ORDER BY section_key ASC').all();
        return ok(rows.results || [], env, request);
      }
      if (url.pathname.startsWith('/api/brand-memory/') && method === 'PUT') {
        const sectionKey = decodeURIComponent(url.pathname.split('/').pop() || '');
        const body = await readJson(request);
        await upsertBrandMemory(env, sectionKey, body);
        return ok({ ok: true, sectionKey }, env, request);
      }

      // MEDIA LINKS
      if (url.pathname === '/api/media-links' && method === 'GET') {
        const rows = await env.DB.prepare('SELECT * FROM media_links ORDER BY sort_order ASC').all();
        return ok(rows.results || [], env, request);
      }

      // NOTIFICATIONS
      if (url.pathname === '/api/notifications' && method === 'GET') {
        const rows = await env.DB.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all();
        return ok(rows.results || [], env, request);
      }
      if (url.pathname === '/api/notifications/mark-read' && method === 'POST') {
        const body = await readJson(request);
        const id = String(body.id || '').trim();
        if (!id) return badRequest('id notification manquant', env, request);
        await env.DB.prepare("UPDATE notifications SET status = 'read', read_at = ? WHERE id = ?").bind(nowIso(), id).run();
        await pruneOldReadNotifications(env);
        return ok({ ok: true, id }, env, request);
      }
      if (url.pathname === '/api/notifications/mark-all-read' && method === 'POST') {
        await env.DB.prepare("UPDATE notifications SET status = 'read', read_at = ? WHERE status = 'unread'").bind(nowIso()).run();
        await pruneOldReadNotifications(env);
        return ok({ ok: true }, env, request);
      }

      // SEARCH
      if (url.pathname === '/api/search' && method === 'GET') {
        const q = (url.searchParams.get('q') || '').trim();
        if (!q) return ok([], env, request);
        return ok(await searchAll(env, q), env, request);
      }

      // AGENT RUNS
      if (url.pathname === '/api/agent-runs' && method === 'GET') {
        const rows = await env.DB.prepare('SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT 100').all();
        return ok(rows.results || [], env, request);
      }

      // MARKET INTEL
      if (url.pathname === '/api/market-intel' && method === 'GET') {
        const rows = await env.DB.prepare('SELECT * FROM market_intel ORDER BY created_at DESC LIMIT 50').all();
        return ok(rows.results || [], env, request);
      }

      // AGENTS
      if (url.pathname === '/api/agents/chief-of-staff/run' && method === 'POST') {
        return ok(await runChiefOfStaff(request, env), env, request);
      }
      if (url.pathname === '/api/agents/market-intel/run' && method === 'POST') {
        return ok(await runMarketIntel(request, env), env, request);
      }
      if (url.pathname === '/api/agents/content-strategist/run' && method === 'POST') {
        return ok(await runContentStrategist(request, env), env, request);
      }
      if (url.pathname === '/api/agents/scriptwriter/run' && method === 'POST') {
        return ok(await runScriptwriter(request, env), env, request);
      }
      if (url.pathname === '/api/agents/prompt-engineer/run' && method === 'POST') {
        return ok(await runPromptEngineer(request, env), env, request);
      }
      if (url.pathname === '/api/agents/sales-lead-ops/run' && method === 'POST') {
        return ok(await runSalesLeadOps(request, env), env, request);
      }
      if (url.pathname === '/api/agents/proof-delivery/run' && method === 'POST') {
        return ok(await runProofDelivery(request, env), env, request);
      }

      // CRUD
      const generic = await handleGenericCrud(request, env, url, method);
      if (generic) return generic;

      return notFound(env, request);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      return json({ ok: false, error: message }, 500, env, request);
    }
  },
};

// ============================================================================
// CHIEF OF STAFF — Orchestration, rapport hebdomadaire, alignement
// ============================================================================

async function runChiefOfStaff(request, env) {
  const body = await readJson(request);
  const mode = body.mode || 'report'; // 'report' | 'orchestrate'

  const metrics = await getDashboardSummary(env);
  const weekly = await env.DB.prepare('SELECT * FROM weekly_command ORDER BY updated_at DESC LIMIT 1').first();
  const memory = await getCompressedBrandMemory(env);

  const now = nowIso();
  let result = null;
  let aiError = null;
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  try {
    const prompt = buildChiefOfStaffPrompt({ mode, metrics, weekly, memory });
    const llmResult = await callLLM(env, 'chief-of-staff', prompt, 2048);
    latency = llmResult.latency;
    providerUsed = llmResult.provider;
    modelUsed = llmResult.model;
    result = parseChiefOfStaffOutput(llmResult.text);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    const runId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(runId, 'Chief of Staff', `mode=${mode}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
    throw new Error(`Chief of Staff failed: ${aiError}`);
  }

  // Log run
  const runId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Chief of Staff', `mode=${mode}`, result.title || 'Rapport COS', aiError ? 'done-fallback' : 'done', aiError, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  // Insert weekly report into brand_memory as COS report
  if (result.report && mode === 'report') {
    await upsertBrandMemory(env, 'cos_weekly_report', {
      title: `Rapport COS — ${weekly?.week_label || 'Semaine courante'}`,
      content_md: result.report,
    });
  }

  // Notification
  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'cos_report', 'Rapport Chief of Staff', result.summary || 'Rapport hebdomadaire généré.', 'cos_report', runId, 'unread', now, null).run();

  return { ok: true, mode, result, runId, aiError, fallback: !!aiError, provider: providerUsed || 'fallback' };
}

function buildChiefOfStaffPrompt({ mode, metrics, weekly, memory }) {
  return `
Tu es le Chief of Staff de Mr Z Brand. Tu es un orchestrateur stratégique, pas un créatif.

Mémoire marque :
${memory}

Contexte hebdomadaire :
Semaine=${weekly?.week_label || 'N/A'}
P1=${weekly?.focus_primary || ''}
P2=${weekly?.focus_secondary || ''}
P3=${weekly?.focus_tertiary || ''}
Risque=${weekly?.main_risk || ''}
Décision=${weekly?.decision_note || ''}

Métriques OS :
Ideas ready=${metrics?.metrics?.ideasReady || 0}
Scripts review=${metrics?.metrics?.scriptsReview || 0}
Hot leads=${metrics?.metrics?.hotLeads || 0}
Active projects=${metrics?.metrics?.activeProjects || 0}
Proofs validated=${metrics?.metrics?.proofsValidated || 0}
Agent runs=${metrics?.metrics?.agentRuns || 0}
Unread notifications=${metrics?.metrics?.unreadNotifications || 0}

Mode=${mode}

Si mode=report : génère un rapport hebdomadaire structuré.
Si mode=orchestrate : génère des recommandations d'actions concrètes pour les agents.

Règles :
- Français uniquement
- Pas de markdown complexe
- Pas de chiffres inventés (utilise les métriques fournies)
- Ton direct, premium, structuré

Retourne exactement 4 lignes :
TITRE=...
SOMMAIRE=...
PRIORITE_1=...
PRIORITE_2=...
`.trim();
}

function parseChiefOfStaffOutput(raw) {
  const lines = String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
  const get = (label) => {
    const line = lines.find(l => {
      const up = l.toUpperCase();
      return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
    });
    return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
  };
  return {
    title: get('TITRE') || get('TITLE') || 'Rapport Chief of Staff',
    summary: get('SOMMAIRE') || get('SUMMARY') || get('RESUME') || '',
    priority1: get('PRIORITE_1') || get('PRIORITE1') || get('P1') || get('PRIORITY_1') || '',
    priority2: get('PRIORITE_2') || get('PRIORITE2') || get('P2') || get('PRIORITY_2') || '',
    report: raw,
  };
}

function buildFallbackChiefOfStaff({ mode, metrics, weekly }) {
  const m = metrics?.metrics || {};
  const ideas = m.ideasReady || 0;
  const scripts = m.scriptsReview || 0;
  const leads = m.hotLeads || 0;
  const projects = m.activeProjects || 0;

  let report = '';
  if (mode === 'report') {
    report = `Rapport hebdomadaire Mr Z Brand.

${ideas} idées prêtes, ${scripts} scripts en revue, ${leads} leads chauds, ${projects} projets actifs.

Priorité : maintenir le flux de contenu et qualifier les leads entrants. Le risque principal reste la conversion. Il faut transformer la visibilité en vente structurée.`;
  } else {
    report = `Recommandations orchestration :
1. Lancer le Content Strategist si ideas < 3.
2. Lancer le Scriptwriter si scripts review > 0.
3. Activer Sales & Lead Ops si leads chauds > 0.`;
  }

  return {
    title: `Rapport COS — ${weekly?.week_label || 'Semaine courante'}`,
    summary: `${ideas} idées, ${scripts} scripts, ${leads} leads, ${projects} projets.`,
    priority1: 'Maintenir le flux de contenu.',
    priority2: 'Qualifier les leads et structurer les projets actifs.',
    report,
  };
}

// ============================================================================
// MARKET INTEL — Veille, analyse marché, opportunités
// ============================================================================

async function runMarketIntel(request, env) {
  const body = await readJson(request);
  const category = String(body.category || 'general').trim(); // 'general' | 'competitors' | 'trends' | 'opportunities'

  const memory = await getCompressedBrandMemory(env);
  const now = nowIso();
  let result = null;
  let aiError = null;
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  try {
    const prompt = buildMarketIntelPrompt({ category, memory });
    const llmResult = await callLLM(env, 'market-intel', prompt, 2048);
    latency = llmResult.latency;
    providerUsed = llmResult.provider;
    modelUsed = llmResult.model;
    result = parseMarketIntelOutput(llmResult.text);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    const runId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(runId, 'Market Intel', `category=${category}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
    throw new Error(`Market Intel failed: ${aiError}`);
  }

  const runId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Market Intel', `category=${category}`, result.title || 'Veille marché', aiError ? 'done-fallback' : 'done', aiError, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  // Insert intel items
  const inserted = [];
  if (result.items && Array.isArray(result.items)) {
    for (const item of result.items.slice(0, 5)) {
      const id = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO market_intel (id, category, title, insight, source, impact_score, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, category, item.title || 'Insight', item.insight || '', item.source || 'Market Intel AI', item.impact || 3, 'active', now, now).run();
      inserted.push({ id, ...item });
    }
  }

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'market_intel', 'Veille marché mise à jour', `${inserted.length} insights ajoutés pour ${category}.`, 'market_intel_batch', runId, 'unread', now, null).run();

  return { ok: true, category, items: inserted, runId, aiError, fallback: !!aiError, provider: providerUsed || 'fallback' };
}

function buildMarketIntelPrompt({ category, memory }) {
  return `
Tu es Market Intel pour Mr Z Brand. Tu analyses le marché du branding, design et stratégie en Afrique francophone et global.

Mémoire marque :
${memory}

Catégorie de veille : ${category}

Règles :
- Français uniquement
- Analyse factuelle, pas d'invention
- 3 insights maximum
- Format ultra court

Retourne exactement 3 blocs (INSIGHT_1, INSIGHT_2, INSIGHT_3), chacun avec 4 lignes :
TITRE=...
ANALYSE=...
OPPORTUNITE=...
SOURCE=...

Commence chaque bloc par INSIGHT_N sur sa propre ligne.
`.trim();
}

function parseMarketIntelOutput(raw) {
  const items = [];
  const text = String(raw || '');
  const blocks = text.split(/INSIGHT_\d+|Insight\s+\d+|#{1,3}\s+\d+\s*[:.)\-]?/i).filter(b => b.trim());
  for (const block of blocks.slice(0, 3)) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const get = (label) => {
      const line = lines.find(l => {
        const up = l.toUpperCase();
        return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
      });
      return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
    };
    items.push({
      title: get('TITRE') || get('TITLE') || get('SUJET') || lines[0] || 'Insight',
      insight: get('ANALYSE') || get('ANALYSIS') || get('INSIGHT') || get('CONTENU') || lines.slice(1).join(' ').substring(0, 200),
      opportunity: get('OPPORTUNITE') || get('OPPORTUNITY') || get('OPPORTUNITÉ') || '',
      source: get('SOURCE') || get('SRC') || 'Market Intel AI',
      impact: 3
    });
  }
  return { title: 'Veille marché', items };
}

function buildFallbackMarketIntel({ category }) {
  const items = [
    { title: 'Fragmentation des offres de branding', insight: 'Le marché africain est saturé de généralistes. La différenciation vient de la structure, pas du visuel.', opportunity: 'Positionner Mr Z Brand comme la méthode, pas le design.', source: 'Market Intel (fallback)', impact: 5 },
    { title: 'WhatsApp comme canal B2B dominant', insight: 'En Afrique francophone, WhatsApp dépasse email pour le business. Peu de marques le structurent comme canal de conversion.', opportunity: 'Renforcer SIGNAL™ by Mr Z comme solution WhatsApp structurée.', source: 'Market Intel (fallback)', impact: 4 },
    { title: 'Formation sans méthode = churn élevé', insight: 'Les formations en ligne explosent, mais les apprenants abandonnent faute de structure claire.', opportunity: 'PROSKILLS FR doit vendre la méthode avant le savoir.', source: 'Market Intel (fallback)', impact: 4 },
  ];
  return { title: 'Veille marché — fallback', items: category === 'competitors' ? items.slice(0, 2) : items };
}

// ============================================================================
// CONTENT STRATEGIST — BATCHED (1 call = 5 ideas)
// ============================================================================

async function runContentStrategist(request, env) {
  const body = await readJson(request);
  const count = clampCount(Number(body.count || 5));
  const forcedProduct = normalizeAllowedProduct(body.product);
  const forcedPlatform = normalizeAllowedPlatform(body.platforme || body.platform);

  const weekly = await env.DB.prepare('SELECT * FROM weekly_command ORDER BY updated_at DESC LIMIT 1').first();
  const memory = await getCompressedBrandMemory(env);

  const now = nowIso();
  let ideas = [];
  let aiError = null;
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  try {
    const prompt = buildContentStrategistPromptBatch({
      forcedProduct, forcedPlatform, weekly, memory, count,
    });
    const llmResult = await callLLM(env, 'content-strategist', prompt, 2048);
    latency = llmResult.latency;
    providerUsed = llmResult.provider;
    modelUsed = llmResult.model;
    ideas = parseContentStrategistBatch(llmResult.text, count, forcedProduct, forcedPlatform);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    const runId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(runId, 'Content Strategist', `count=${count}; product=${forcedProduct || 'auto'}; platform=${forcedPlatform || 'auto'}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
    throw new Error(`Content Strategist failed: ${aiError}`);
  }

  const inserted = [];
  for (const idea of ideas) {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO content_ideas (id, sujet, angle, cible, produit, plateforme, duree, cta, caption, source, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, idea.sujet, idea.angle, idea.cible, idea.produit, idea.plateforme, idea.duree, idea.cta, idea.caption, idea.source, 'idea_pending', now, now).run();
    inserted.push({ id, ...idea, status: 'idea_pending', created_at: now, updated_at: now });
  }

  const runId = crypto.randomUUID();
  const runSummary = aiError ? `${inserted.length} idées via fallback local` : `${inserted.length} idées via AI (${providerUsed})`;
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Content Strategist', `count=${count}; product=${forcedProduct || 'auto'}; platform=${forcedPlatform || 'auto'}`, runSummary, aiError ? 'done-fallback' : 'done', aiError, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'ideas_ready', 'Nouvelles idées générées', `${inserted.length} idées ajoutées au Content Lab.`, 'content_idea_batch', runId, 'unread', now, null).run();

  return { ok: true, count: inserted.length, fallback: !!aiError, aiError, provider: providerUsed, ideas: inserted, runId };
}

function buildContentStrategistPromptBatch({ forcedProduct, forcedPlatform, weekly, memory, count }) {
  return (
    `Tu es le Content Strategist de Mr Z Brand.

Mémoire :
${memory || 'Aucune'}

Contexte hebdomadaire :
P1=${weekly?.focus_primary || ''}
P2=${weekly?.focus_secondary || ''}
P3=${weekly?.focus_tertiary || ''}
RISQUE=${weekly?.main_risk || ''}

Règles :
- Français uniquement
- Génère exactement ${count} idées
- Chaque idée = 9 lignes
- Aucun markdown
- Aucun lien inventé
- Offres / Produits (choisir UN seul, ne jamais mélanger) :
  1. Mr Z Brand = personal brand de Hervé Kevin ZEH (Mr Z). Consultant branding, design et stratégie digitale. Cible : entrepreneurs, PME africaines. Ton : consultant structuré, premium.
  2. SIGNAL™ by Mr Z = méthode structurée pour créer et déployer un agent commercial virtuel professionnel directement dans son WhatsApp Business. 5 étapes (Structurer, Instruire, Guider, Nourrir, Automatiser). Cible : commerçants, boutiques, restaurants, spas, freelances. Ton : facilitateur, efficacité, clarté.
  3. PROSKILLS FR = produit éducatif (compétences digitales et logiciels professionnels en français, 5 piliers, 4 niveaux). Cible : étudiants, freelances, entrepreneurs, équipes. Ton : mentor exigeant, structure avant contenu.
- Plateformes : TikTok | YouTube Shorts | Instagram Reel | LinkedIn | Facebook
- Durées : 30 | 45 | 60 | 90

Si tu dois choisir un produit, ne confonds JAMAIS la marque personnelle (Mr Z Brand) avec les produits dérivés (SIGNAL™ ou PROSKILLS). Chaque idée vise UNE entité claire.

Produit forcé=${forcedProduct || 'aucun'}
Plateforme forcée=${forcedPlatform || 'aucune'}

RÈGLE ABSOLUE : ne mets AUCUN texte avant ou après les lignes demandées. Pas d'introduction. Pas de conclusion. Pas de markdown. Pas de tirets. Uniquement les lignes exactes ci-dessous.

Format obligatoire (9 lignes par idée, numérotées de 1 à ${count}) :
IDEA_1_SUJET=...
IDEA_1_ANGLE=...
IDEA_1_CIBLE=...
IDEA_1_PRODUIT=...
IDEA_1_PLATEFORME=...
IDEA_1_DUREE=...
IDEA_1_CTA=...
IDEA_1_CAPTION=...
IDEA_1_SOURCE=Agent Content Strategist
...
IDEA_${count}_SOURCE=Agent Content Strategist`
  ).trim();
}

function parseContentStrategistBatch(raw, count, forcedProduct, forcedPlatform) {
  const text = String(raw || '');
  const ideas = [];

  // --- Stratégie 1 : format strict IDEA_N_KEY=... ---
  for (let n = 1; n <= count; n++) {
    const prefix = `IDEA_${n}_`;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.toUpperCase().startsWith(prefix));
    const get = (label) => {
      const line = lines.find(l => l.toUpperCase().startsWith(`${prefix}${label}=`));
      return line ? line.slice((`${prefix}${label}=`).length).trim() : '';
    };
    const sujet = get('SUJET');
    if (sujet) {
      ideas.push(normalizeIdea({
        sujet, angle: get('ANGLE'), cible: get('CIBLE'),
        produit: get('PRODUIT') || forcedProduct, plateforme: get('PLATEFORME') || forcedPlatform,
        duree: Number(get('DUREE')) || 45, cta: get('CTA'), caption: get('CAPTION'), source: get('SOURCE') || 'Agent Content Strategist',
      }, forcedProduct, forcedPlatform));
    }
  }

  // --- Stratégie 2 : format markdown / texte libre (Mistral 7B, petits modèles) ---
  if (ideas.length === 0) {
    const allLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const blocks = [];
    let cur = [];
    for (const line of allLines) {
      if (/^#{1,3}\s+|^\d+[\.\)]\s+|^Idée\s+\d+|^IDEA_\d+/i.test(line)) {
        if (cur.length) blocks.push(cur);
        cur = [line];
      } else { cur.push(line); }
    }
    if (cur.length) blocks.push(cur);

    for (const block of blocks.slice(0, count)) {
      const b = block.join('\n');
      const extract = (keys) => {
        for (const k of keys) {
          const re = new RegExp(`${k}\\s*[=:]\\s*(.+)`, 'i');
          const m = b.match(re);
          if (m) return m[1].trim();
        }
        return '';
      };
      const sujet = extract(['SUJET', 'Sujet', 'Sujet principal', 'Titre', 'TITRE', 'Title']) || block.find(l => l.length > 12 && !/[=:]/.test(l) && !l.startsWith('#') && !/^\d/.test(l)) || '';
      if (sujet && typeof sujet === 'string') {
        ideas.push(normalizeIdea({
          sujet: String(sujet).substring(0, 120),
          angle: extract(['ANGLE', 'Angle', 'Approche', 'Approche éditoriale', 'Point de vue']),
          cible: extract(['CIBLE', 'Cible', 'Public', 'Audience', 'Target']),
          produit: extract(['PRODUIT', 'Produit', 'Product', 'Offre']) || forcedProduct || 'Mr Z Brand',
          plateforme: extract(['PLATEFORME', 'Plateforme', 'Platform', 'Canal', 'Réseau']) || forcedPlatform || 'TikTok',
          duree: Number(extract(['DUREE', 'Durée', 'Duree', 'Duration'])) || 45,
          cta: extract(['CTA', 'Action', 'Call to action', 'Appel à l\'action']),
          caption: extract(['CAPTION', 'Caption', 'Légende', 'Texte accompagnant']),
          source: 'Agent Content Strategist',
        }, forcedProduct, forcedPlatform));
      }
    }
  }

  if (ideas.length === 0) {
    console.log(`[parseContentStrategistBatch] ÉCHEC — Raw (500 chars): ${text.substring(0, 500)}`);
    throw new Error('Aucune idée parsée du batch');
  }
  return ideas;
}

// ============================================================================
// SCRIPTWRITER
// ============================================================================

async function runScriptwriter(request, env) {
  const body = await readJson(request);
  const contentIdeaId = String(body.content_idea_id || '').trim();
  const platformOverride = String(body.platform_override || '').trim();

  let idea = null;
  if (contentIdeaId) {
    idea = await env.DB.prepare('SELECT * FROM content_ideas WHERE id = ? LIMIT 1').bind(contentIdeaId).first();
  } else {
    idea = await env.DB.prepare("SELECT * FROM content_ideas WHERE status IN ('idea_ready', 'script_pending') ORDER BY updated_at DESC LIMIT 1").first();
  }
  if (!idea) throw new Error('Aucune idée prête à scripter');

  const memory = await getCompressedBrandMemory(env);
  const now = nowIso();
  let generated = null;
  let aiError = null;
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  try {
    const prompt = buildScriptwriterPrompt({ idea, memory, platformOverride });
    const llmResult = await callLLM(env, 'scriptwriter', prompt, 2048);
    latency = llmResult.latency;
    providerUsed = llmResult.provider;
    modelUsed = llmResult.model;
    generated = parseScriptwriterText(llmResult.text);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    const runId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(runId, 'Scriptwriter', `content_idea_id=${idea.id}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
    throw new Error(`Scriptwriter failed: ${aiError}`);
  }

  const scriptRow = normalizeScriptOutput(generated, idea, platformOverride);
  const existing = await env.DB.prepare('SELECT id, created_at FROM scripts WHERE content_idea_id = ? ORDER BY updated_at DESC LIMIT 1').bind(idea.id).first();

  let scriptId;
  let createdAt;
  if (existing && existing.id) {
    scriptId = existing.id; createdAt = existing.created_at || now;
    await env.DB.prepare(
      `UPDATE scripts SET sujet=?, hook=?, script=?, cta_genere=?, caption=?, angle=?, cible=?, produit=?, plateforme=?, status=?, updated_at=? WHERE id=?`
    ).bind(scriptRow.sujet, scriptRow.hook, scriptRow.script, scriptRow.cta_genere, scriptRow.caption, scriptRow.angle, scriptRow.cible, scriptRow.produit, scriptRow.plateforme, 'ready_review', now, scriptId).run();
  } else {
    scriptId = crypto.randomUUID(); createdAt = now;
    await env.DB.prepare(
      `INSERT INTO scripts (id, content_idea_id, sujet, hook, script, cta_genere, caption, angle, cible, produit, plateforme, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(scriptId, idea.id, scriptRow.sujet, scriptRow.hook, scriptRow.script, scriptRow.cta_genere, scriptRow.caption, scriptRow.angle, scriptRow.cible, scriptRow.produit, scriptRow.plateforme, 'ready_review', createdAt, now).run();
  }

  await env.DB.prepare('UPDATE content_ideas SET status=?, updated_at=? WHERE id=?').bind('script_pending', now, idea.id).run();

  const runId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Scriptwriter', `content_idea_id=${idea.id}`, `Script pour "${idea.sujet}"`, aiError ? 'done-fallback' : 'done', aiError, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'script_ready', 'Nouveau script à valider', `Script prêt pour "${idea.sujet}".`, 'script', scriptId, 'unread', now, null).run();

  return { ok: true, mode: aiError ? 'fallback' : 'ai', aiError, fallback: !!aiError, provider: providerUsed || 'fallback', runId, script: { id: scriptId, content_idea_id: idea.id, ...scriptRow, status: 'ready_review', created_at: createdAt, updated_at: now } };
}

function buildScriptwriterPrompt({ idea, memory, platformOverride }) {
  return `
Tu es le Scriptwriter de Mr Z Brand.

Mémoire :
${memory || 'Aucune'}

Entrée :
SUJET=${idea.sujet || ''}
ANGLE=${idea.angle || ''}
CIBLE=${idea.cible || ''}
PRODUIT=${idea.produit || ''}
PLATEFORME=${platformOverride || idea.plateforme || ''}
DUREE=${idea.duree || 45}
CTA=${idea.cta || ''}
CAPTION=${idea.caption || ''}

Règles :
- Français uniquement, face caméra, direct
- Hook très court (1 phrase choc)
- Script 80–120 mots max
- CTA 1 phrase
- Caption 1–2 phrases courtes
- Pas de markdown, JSON, placeholders, chiffres inventés, liens inventés

Retourne exactement 4 lignes :
HOOK=...
SCRIPT=...
CTA=...
CAPTION=...
`.trim();
}

function parseScriptwriterText(raw) {
  const lines = String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
  const get = (label) => {
    const line = lines.find(l => {
      const up = l.toUpperCase();
      return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
    });
    return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
  };
  const hook = get('HOOK');
  const script = get('SCRIPT');
  const cta = get('CTA');
  const caption = get('CAPTION');
  if (!hook || !script || !cta || !caption) throw new Error('Script incomplet');
  return { hook, script, cta, caption };
}

function buildFallbackScript(idea, platformOverride) {
  const platform = platformOverride || idea.plateforme || 'TikTok';
  const sujet = idea.sujet || 'Structurer sa marque';
  const produit = idea.produit || 'Mr Z Brand';
  const idx = Math.abs(String(sujet).length % 5);

  const hooks = [
    'Tu veux une marque qui marche ? Commence par la structure.',
    'Visible partout, mais aucun client ? C\'est normal.',
    'Le design ne sauve pas une marque sans fond.',
    'Ton WhatsApp est actif, mais il ne convertit pas.',
    'Tu apprends beaucoup. Mais tu appliques dans quel ordre ?',
  ];
  const scripts = [
    `Beaucoup croient qu'une marque forte, c'est du beau design. C'est faux. La force d'une marque, c'est sa structure interne. Quand message, offre et canal sont alignés, les clients viennent. Sinon, tu restes visible sans convertir. ${produit} ne décore pas. On structure. On clarifie d'abord, on exprime ensuite.`,
    `Tu passes des heures sur TikTok, LinkedIn, Instagram. Tu as du contenu. Mais tu ne sais pas ce qui vend. Pourquoi ? Parce qu'aucun canal n'a une structure claire. SIGNAL™ by Mr Z transforme ton WhatsApp en canal de conversion.`,
    `La plupart des entrepreneurs africains construisent leur marque à l'envers. Logo, couleurs, posts. Mais sans fond stratégique, ça ne tient pas. ${produit} commence par la fondation : qui tu cibles, ce que tu vends, comment tu le dis.`,
    `On te dit de créer du contenu. Alors tu crées. Mais à la fin du mois, aucune vente. Le problème n'est pas la quantité. C'est l'absence de script. Un bon script transforme une idée en message qui convertit. C'est ce que fait le Scriptwriter de ${produit}.`,
    `PROSKILLS FR ne propose pas juste des formations. On propose une méthode structurée pour apprendre, appliquer et facturer. Parce que savoir ne suffit pas. Il faut savoir dans quel ordre on le transmet.`,
  ];
  let cta = 'Écris-moi si tu veux structurer ta marque.';
  if (produit === 'SIGNAL™ by Mr Z') cta = 'Écris-moi sur WhatsApp si tu veux structurer ton canal.';
  if (produit === 'PROSKILLS FR') cta = 'Contacte-moi si tu veux structurer une vraie offre éducative.';
  const captions = [
    `La structure avant la visibilité. C'est le credo de ${produit}.`,
    `Tu ne manques pas de talent. Tu manques de clarté.`,
    `Visible partout, mais sans système ? C'est le problème que ${produit} résout.`,
    `Le standard premium ne s'achète pas. Il se construit.`,
    `Stop aux tactiques dispersées. Commence par la fondation.`,
  ];
  return { hook: hooks[idx], script: scripts[idx], cta, caption: captions[idx] };
}

function normalizeScriptOutput(raw, idea, platformOverride) {
  return {
    sujet: String(idea.sujet || '').trim(),
    hook: stripMarkdownLinks(raw.hook || '').trim(),
    script: stripMarkdownLinks(raw.script || '').trim(),
    cta_genere: sanitizeText(raw.cta || idea.cta || ''),
    caption: sanitizeText(raw.caption || idea.caption || ''),
    angle: String(idea.angle || '').trim(),
    cible: String(idea.cible || '').trim(),
    produit: String(idea.produit || 'Mr Z Brand').trim(),
    plateforme: String(platformOverride || idea.plateforme || 'TikTok').trim(),
  };
}

// ============================================================================
// PROMPT ENGINEER
// ============================================================================

async function runPromptEngineer(request, env) {
  const body = await readJson(request);
  const scriptId = String(body.script_id || '').trim();
  if (!scriptId) throw new Error('script_id manquant');

  const script = await env.DB.prepare('SELECT * FROM scripts WHERE id = ? LIMIT 1').bind(scriptId).first();
  if (!script) throw new Error('Script introuvable');

  const memory = await getCompressedBrandMemory(env);
  const now = nowIso();
  let generated = null;
  let aiError = null;
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  try {
    const prompt = buildPromptEngineerPrompt({ script, memory });
    const llmResult = await callLLM(env, 'prompt-engineer', prompt, 2048);
    latency = llmResult.latency;
    providerUsed = llmResult.provider;
    modelUsed = llmResult.model;
    generated = parsePromptEngineerOutput(llmResult.text);
  } catch (err) {
    aiError = err instanceof Error ? err.message : String(err);
    const runId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(runId, 'Prompt Engineer', `script_id=${scriptId}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
    throw new Error(`Prompt Engineer failed: ${aiError}`);
  }

  const visualId = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO visual_prompts (id, related_script_id, sujet, angle, produit, hook_visuel, prompt_principal, prompt_chatgpt, prompt_nano_banana, variante_a, variante_b, variante_c, negative_prompt, photoshop_note, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(visualId, scriptId, script.sujet, script.angle, script.produit, generated.hook_visuel, generated.prompt_principal, generated.prompt_chatgpt, generated.prompt_nano_banana, generated.variante_a, generated.variante_b, generated.variante_c, generated.negative_prompt, generated.photoshop_note, 'ready_review', now, now).run();

  const runId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Prompt Engineer', `script_id=${scriptId}`, `Prompts visuels pour "${script.sujet}"`, aiError ? 'done-fallback' : 'done', aiError, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'prompt_ready', 'Prompts visuels générés', `Prompts prêts pour "${script.sujet}".`, 'visual_prompt', visualId, 'unread', now, null).run();

  return { ok: true, mode: aiError ? 'fallback' : 'ai', aiError, fallback: !!aiError, provider: providerUsed || 'fallback', runId, visualPrompt: { id: visualId, ...generated, status: 'ready_review', created_at: now, updated_at: now } };
}

function buildPromptEngineerPrompt({ script, memory }) {
  return `
Tu es le Prompt Engineer visuel de Mr Z Brand. Tu crées des prompts Midjourney / Stable Diffusion / DALL-E.

Mémoire :
${memory || 'Aucune'}

Script source :
SUJET=${script.sujet || ''}
HOOK=${script.hook || ''}
CIBLE=${script.cible || ''}
PRODUIT=${script.produit || ''}
PLATEFORME=${script.plateforme || ''}

Règles :
- Prompts en anglais (standard IA visuelle)
- Style premium, africain assumé, minimaliste
- 3 variantes : A (dramatique), B (lifestyle), C (abstract/typo)
- Negative prompt explicite
- Note Photoshop si retouche nécessaire
- Format CHATGPT : description conversationnelle structurée, lignes courtes, compatible DALL-E / Midjourney v6.
- Format NANO BANANA PRO : format technique avec tags, poids entre parenthèses, paramètres de qualité explicites (masterpiece, best quality, ultra-detailed, 8k uhd), style SD/FLUX optimisé.

Retourne exactement 7 lignes :
HOOK_VISUEL=...
PROMPT_CHATGPT=...
PROMPT_NANO_BANANA=...
VARIANTE_A=...
VARIANTE_B=...
VARIANTE_C=...
NEGATIVE_PROMPT=...
PHOTOSHOP_NOTE=...
`.trim();
}

function parsePromptEngineerOutput(raw) {
  const lines = String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
  const get = (label) => {
    const line = lines.find(l => {
      const up = l.toUpperCase();
      return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
    });
    return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
  };
  const promptPrincipal = get('PROMPT_PRINCIPAL') || get('PROMPT') || get('MAIN');
  return {
    hook_visuel: get('HOOK_VISUEL') || get('HOOK'),
    prompt_principal: promptPrincipal,
    prompt_chatgpt: get('PROMPT_CHATGPT') || promptPrincipal,
    prompt_nano_banana: get('PROMPT_NANO_BANANA') || get('PROMPT_NANO') || get('NANO_BANANA') || promptPrincipal,
    variante_a: get('VARIANTE_A') || get('VARIANT_A') || get('A'),
    variante_b: get('VARIANTE_B') || get('VARIANT_B') || get('B'),
    variante_c: get('VARIANTE_C') || get('VARIANT_C') || get('C'),
    negative_prompt: get('NEGATIVE_PROMPT') || get('NEGATIVE'),
    photoshop_note: get('PHOTOSHOP_NOTE') || get('NOTE') || get('PS'),
  };
}

function buildFallbackVisualPrompt(script) {
  const sujet = script.sujet || 'branding';
  const produit = script.produit || 'Mr Z Brand';
  const promptChatgpt = `Premium minimalist branding visual, dark background, elegant typography, subject "${sujet}", African-inspired subtle texture, cinematic lighting, 8k, highly detailed --ar 16:9 --style raw`;
  const promptNano = `((masterpiece, best quality, ultra-detailed, 8k uhd)), premium minimalist branding visual, dark charcoal background #0D0D10, elegant sans-serif typography, subject "${sujet}", subtle african geometric pattern texture, cinematic side lighting, deep copper and gold accent tones, architectural precision, depth of field, film grain, photorealistic, studio quality, no text, no watermark`;
  return {
    hook_visuel: `Visuel premium minimaliste sur fond sombre, typographie élégante, sujet : ${sujet}.`,
    prompt_principal: promptChatgpt,
    prompt_chatgpt: promptChatgpt,
    prompt_nano_banana: promptNano,
    variante_a: `Dramatic close-up portrait, confident entrepreneur, dark studio background, gold accent lighting, cinematic, 8k --ar 9:16`,
    variante_b: `Lifestyle flat lay, premium notebook, coffee, smartphone showing ${produit} logo, warm natural light, clean composition --ar 1:1`,
    variante_c: `Abstract geometric shapes, deep copper and ivory palette, motion blur, premium brand identity, dark background --ar 16:9`,
    negative_prompt: 'blurry, low quality, cartoon, oversaturated, cluttered, watermark, text error, deformed hands',
    photoshop_note: 'Ajuster les niveaux pour un contraste premium. Renforcer la typographie si nécessaire. Exporter en 1080x1920, 1080x1080, 1920x1080.',
  };
}

// ============================================================================
// SALES & LEAD OPS
// ============================================================================

async function runSalesLeadOps(request, env) {
  const body = await readJson(request);
  const mode = body.mode || 'qualify'; // 'qualify' | 'score' | 'relance'
  const leadId = String(body.lead_id || '').trim();

  let leads = [];
  if (leadId) {
    const lead = await env.DB.prepare('SELECT * FROM leads WHERE id = ? LIMIT 1').bind(leadId).first();
    if (lead) leads.push(lead);
  } else {
    const rows = await env.DB.prepare("SELECT * FROM leads WHERE status IN ('new', 'contacted', 'lead_qualified') ORDER BY updated_at DESC LIMIT 10").all();
    leads = rows.results || [];
  }

  if (!leads.length) return { ok: true, mode, leadsProcessed: 0, message: 'Aucun lead à traiter' };

  const memory = await getCompressedBrandMemory(env);
  const now = nowIso();
  const processed = [];

  for (const lead of leads) {
    let result = null;
    let aiError = null;
    let providerUsed = null;
    let modelUsed = null;
    let latency = 0;

    try {
      const prompt = buildSalesLeadOpsPrompt({ lead, mode, memory });
      const llmResult = await callLLM(env, 'sales-lead-ops', prompt, 1024);
      latency = llmResult.latency;
      providerUsed = llmResult.provider;
      modelUsed = llmResult.model;
      result = parseSalesLeadOpsOutput(llmResult.text, mode);
    } catch (err) {
      aiError = err instanceof Error ? err.message : String(err);
      const runId = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(runId, 'Sales & Lead Ops', `lead=${lead.id}; mode=${mode}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
      throw new Error(`Sales & Lead Ops failed: ${aiError}`);
    }

    // Update lead
    const updateFields = {};
    if (mode === 'qualify' && result.niveau) updateFields.niveau = result.niveau;
    if (mode === 'score' && result.score) updateFields.note = `Score: ${result.score}/10. ${result.justification || ''}`;
    if (mode === 'relance') {
      if (result.relance_email) updateFields.relance_email = result.relance_email;
      if (result.relance_whatsapp) updateFields.relance_whatsapp = result.relance_whatsapp;
      // Fallback : si l'un des deux est vide, on copie l'autre
      if (!result.relance_email && result.relance_whatsapp) updateFields.relance_email = result.relance_whatsapp;
      if (!result.relance_whatsapp && result.relance_email) updateFields.relance_whatsapp = result.relance_email;
      // Rétrocompatibilité
      updateFields.relance_brouillon = result.relance_email || result.relance_whatsapp || '';
    }
    if (result.next_action) updateFields.next_action = result.next_action;
    updateFields.status = result.status || lead.status || 'contacted';
    updateFields.updated_at = now;

    if (Object.keys(updateFields).length) {
      const keys = Object.keys(updateFields);
      const assignments = keys.map(k => `${k} = ?`).join(', ');
      await env.DB.prepare(`UPDATE leads SET ${assignments} WHERE id = ?`).bind(...Object.values(updateFields), lead.id).run();
    }

    processed.push({ leadId: lead.id, mode, result, aiError, fallback: !!aiError });
  }

  const runId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Sales & Lead Ops', `mode=${mode}; leads=${leads.length}`, `${processed.length} leads traités`, 'done', null, 'batch', 'mixed', 0, now).run();

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'lead_ops', 'Leads traités', `${processed.length} leads analysés par Sales & Lead Ops.`, 'lead_batch', runId, 'unread', now, null).run();

  return { ok: true, mode, leadsProcessed: processed.length, processed, runId, aiError: processed[0]?.aiError || null, fallback: processed.some(p => p.fallback), provider: 'mixed' };
}

function buildSalesLeadOpsPrompt({ lead, mode, memory }) {
  return `
Tu es Sales & Lead Ops pour Mr Z Brand. Tu qualifies, scores et prépares les relances.

Mémoire :
${memory || 'Aucune'}

Lead :
Nom=${lead.name || 'N/A'}
Source=${lead.source || 'N/A'}
Besoin=${lead.besoin || 'N/A'}
Niveau actuel=${lead.niveau || 'N/A'}
Note=${lead.note || 'N/A'}

Mode=${mode}

Règles :
- Français uniquement
- Direct, premium, structuré
- Pas de promesse inventée

Si mode=qualify :
Retourne :
NIVEAU=chaud|tiède|froid
JUSTIFICATION=...
NEXT_ACTION=...

Si mode=score :
Retourne :
SCORE=1-10
JUSTIFICATION=...

Si mode=relance :
Retourne :
RELANCE_EMAIL=... (formule structurée, objet implicite, ton professionnel)
RELANCE_WHATSAPP=... (court, direct, sans formule lourde, adapté lecture mobile)
NEXT_ACTION=...
`.trim();
}

function parseSalesLeadOpsOutput(raw, mode) {
  const lines = String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
  const get = (label) => {
    const line = lines.find(l => {
      const up = l.toUpperCase();
      return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
    });
    return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
  };
  if (mode === 'qualify') {
    return { niveau: get('NIVEAU') || get('NIVEAU_LEAD') || get('LEVEL'), justification: get('JUSTIFICATION') || get('JUSTIF') || get('WHY'), next_action: get('NEXT_ACTION') || get('ACTION') || get('SUIVI'), status: 'lead_qualified' };
  }
  if (mode === 'score') {
    return { score: get('SCORE') || get('SCORING'), justification: get('JUSTIFICATION') || get('JUSTIF') || '', status: 'contacted' };
  }
  const relanceEmail = get('RELANCE_EMAIL') || get('RELANCE') || get('MESSAGE') || get('TEXT') || get('EMAIL');
  const relanceWhatsapp = get('RELANCE_WHATSAPP') || get('RELANCE') || get('SMS') || get('MESSAGE') || get('TEXT');
  return { relance_email: relanceEmail, relance_whatsapp: relanceWhatsapp, next_action: get('NEXT_ACTION') || get('ACTION') || get('SUIVI'), status: 'contacted' };
}

function buildFallbackSalesLeadOps({ lead, mode }) {
  const besoin = String(lead.besoin || '').toLowerCase();
  const isHot = besoin.includes('urgent') || besoin.includes('rapid') || besoin.includes('imméd');

  if (mode === 'qualify') {
    return { niveau: isHot ? 'chaud' : 'tiède', justification: 'Besoin exprimé clairement, contexte favorable.', next_action: 'Proposer un appel de 15 min cette semaine.', status: 'lead_qualified' };
  }
  if (mode === 'score') {
    return { score: isHot ? '8' : '6', justification: 'Lead structuré avec besoin identifié. Manque de données sur budget et timeline.', status: 'contacted' };
  }
  const baseSubject = lead.besoin || 'votre projet';
  const email = `Bonjour ${lead.name || ''},\n\nJe repasse sur votre demande concernant ${baseSubject}. Notre méthode chez Mr Z Brand est structurée et directe : nous clarifions d'abord la fondation, puis nous déployons.\n\nAuriez-vous 15 minutes cette semaine pour un bref échange ? Je vous propose mardi ou jeudi entre 10h et 16h.\n\nCordialement,\n— Mr Z Brand`;
  const whatsapp = `Bonjour ${lead.name || ''}, je repasse sur votre demande concernant ${baseSubject}. Est-ce que vous avez 10 min cette semaine pour qu'on avance ? Je suis dispo mardi ou jeudi.`;
  return { relance_email: email, relance_whatsapp: whatsapp, next_action: 'Envoyer relance WhatsApp + email.', status: 'contacted' };
}

// ============================================================================
// PROOF & DELIVERY
// ============================================================================

async function runProofDelivery(request, env) {
  const body = await readJson(request);
  const mode = body.mode || 'collect'; // 'collect' | 'document' | 'validate'
  const projectId = String(body.project_id || '').trim();

  let projects = [];
  if (projectId) {
    const p = await env.DB.prepare('SELECT * FROM projects WHERE id = ? LIMIT 1').bind(projectId).first();
    if (p) projects.push(p);
  } else {
    const rows = await env.DB.prepare("SELECT * FROM projects WHERE status IN ('project_active', 'project_delivery') ORDER BY updated_at DESC LIMIT 5").all();
    projects = rows.results || [];
  }

  if (!projects.length) return { ok: true, mode, projectsProcessed: 0, message: 'Aucun projet à traiter' };

  const memory = await getCompressedBrandMemory(env);
  const now = nowIso();
  const processed = [];
  let providerUsed = null;
  let modelUsed = null;
  let latency = 0;

  for (const project of projects) {
    let result = null;
    let aiError = null;

    try {
      const prompt = buildProofDeliveryPrompt({ project, mode, memory });
      const llmResult = await callLLM(env, 'proof-delivery', prompt, 1024);
      latency = llmResult.latency;
      result = parseProofDeliveryOutput(llmResult.text, mode);
      providerUsed = llmResult.provider;
      modelUsed = llmResult.model;
    } catch (err) {
      aiError = err instanceof Error ? err.message : String(err);
      const runId = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(runId, 'Proof & Delivery', `project=${project.id}; mode=${mode}`, 'Tous les providers AI indisponibles', 'failed', aiError, 'none', 'none', 0, now).run();
      throw new Error(`Proof & Delivery failed: ${aiError}`);
    }

    if (mode === 'collect' && result.proof_text) {
      const proofId = crypto.randomUUID();
      await env.DB.prepare(
        'INSERT INTO proofs (id, project_id, type_preuve, contenu, usage_possible, is_validated, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(proofId, project.id, result.type_preuve || 'testimonial', result.proof_text, result.usage || 'Site, réseaux, pitch', 0, now, now).run();
      processed.push({ projectId: project.id, proofId, result, aiError });
    } else if (mode === 'document' && result.document) {
      await env.DB.prepare('UPDATE projects SET livrables = ?, updated_at = ? WHERE id = ?').bind(result.document, now, project.id).run();
      processed.push({ projectId: project.id, result, aiError });
    } else if (mode === 'validate') {
      await env.DB.prepare('UPDATE proofs SET is_validated = 1, updated_at = ? WHERE project_id = ?').bind(now, project.id).run();
      processed.push({ projectId: project.id, validated: true, result, aiError });
    }
  }

  const runId = crypto.randomUUID();
  const runStatus = processed.some(p => p.aiError) ? 'done-fallback' : 'done';
  const errorText = processed.map(p => p.aiError).filter(Boolean).join(' | ') || null;
  await env.DB.prepare(
    'INSERT INTO agent_runs (id, agent_name, input_summary, output_summary, run_status, error_text, provider, model, latency_ms, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(runId, 'Proof & Delivery', `mode=${mode}; projects=${projects.length}`, `${processed.length} projets traités`, runStatus, errorText, providerUsed || 'fallback', modelUsed || 'local', latency, now).run();

  const notifId = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO notifications (id, type, title, body, entity_type, entity_id, status, created_at, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(notifId, 'proof_delivery', 'Proof & Delivery mis à jour', `${processed.length} projets traités en mode ${mode}.`, 'proof_batch', runId, 'unread', now, null).run();

  return { ok: true, mode, projectsProcessed: processed.length, processed, runId, aiError: processed[0]?.aiError || null, fallback: processed.some(p => p.aiError), provider: 'mixed' };
}

function buildProofDeliveryPrompt({ project, mode, memory }) {
  return `
Tu es Proof & Delivery pour Mr Z Brand. Tu documentes les livrables et collectes les preuves sociales.

Mémoire :
${memory || 'Aucune'}

Projet :
Client=${project.client_name || 'N/A'}
Offre=${project.offre || 'N/A'}
Phase=${project.phase || 'N/A'}
Blocage=${project.blocage || 'N/A'}
Livrables=${project.livrables || 'N/A'}

Mode=${mode}

Règles :
- Français uniquement
- Pas de témoignages inventés
- Pas de chiffres inventés

Si mode=collect : suggère un texte de preuve social (témoignage formaté) basé sur le projet.
Si mode=document : résume les livrables en 1 paragraphe structuré.
Si mode=validate : retourne juste OK.

Retourne :
TYPE_PREUVE=... (si collect)
CONTENU=...
USAGE=...
DOCUMENT=... (si document)
`.trim();
}

function parseProofDeliveryOutput(raw, mode) {
  const lines = String(raw || '').split('\n').map(l => l.trim()).filter(Boolean);
  const get = (label) => {
    const line = lines.find(l => {
      const up = l.toUpperCase();
      return up.startsWith(`${label}=`) || up.startsWith(`${label}:`) || up.startsWith(`${label} `);
    });
    return line ? line.replace(new RegExp(`^${label}\s*[=:]?\s*`, 'i'), '').trim() : '';
  };
  if (mode === 'collect') {
    return { type_preuve: get('TYPE_PREUVE') || get('TYPE') || 'testimonial', proof_text: get('CONTENU') || get('TEXTE') || get('TEXT') || lines.join('\n'), usage: get('USAGE') || get('USE') || 'Site, réseaux, pitch' };
  }
  if (mode === 'document') {
    return { document: get('DOCUMENT') || get('DOC') || get('LIVRABLE') || raw };
  }
  return { ok: true };
}

function buildFallbackProofDelivery({ project, mode }) {
  if (mode === 'collect') {
    return {
      type_preuve: 'testimonial',
      proof_text: `"Travailler avec Mr Z Brand sur ${project.offre || 'notre projet'} a transformé notre approche. La structure apportée nous a permis de clarifier notre message et de convertir plus facilement." — ${project.client_name || 'Client'}`,
      usage: 'Site web, réseaux sociaux, proposition commerciale',
    };
  }
  if (mode === 'document') {
    return { document: `Livrables pour ${project.client_name} : audit de marque, stratégie de positionnement, kit visuel, guidelines éditoriales, et plan de déploiement ${project.offre || ''}.` };
  }
  return { ok: true };
}

// ============================================================================
// SMART LLM ROUTER — 5 PROVIDERS + FALLBACK
// ============================================================================

async function callLLM(env, agentName, prompt, maxTokens) {
  const tiers = AGENT_ROUTER[agentName]?.tiers || [];
  const systemPrompt = 'Tu es un assistant expert en marketing, branding et stratégie pour Mr Z Brand. Tu réponds uniquement en français. Tu suis strictement le format demandé. Tu n\'inventes jamais de chiffres, témoignages ou liens.';

  const errors = [];

  for (const tier of tiers) {
    // Circuit breaker : skip si le provider est marqué en panne
    const healthy = await isProviderHealthy(env, tier.provider, tier.model);
    if (!healthy) {
      errors.push(`${tier.provider}: circuit breaker (3 échecs récents)`);
      console.log(`[callLLM] ${tier.provider} skipped by circuit breaker for ${agentName}`);
      continue;
    }

    try {
      let raw = '';
      const start = Date.now();

      switch (tier.provider) {
        case 'workers-ai':
          raw = await callWorkersAI(env, tier.model, systemPrompt, prompt, tier.maxTokens || maxTokens);
          break;
        case 'groq':
          raw = await callGroq(env, tier.model, systemPrompt, prompt, tier.maxTokens || maxTokens);
          break;
        case 'openrouter':
          raw = await callOpenRouter(env, tier.model, systemPrompt, prompt, tier.maxTokens || maxTokens);
          break;
        case 'gemini':
          raw = await callGemini(env, systemPrompt, prompt, tier.maxTokens || maxTokens);
          break;
        case 'cerebras':
          raw = await callCerebras(env, tier.model, systemPrompt, prompt, tier.maxTokens || maxTokens);
          break;
        default:
          continue;
      }

      const latency = Date.now() - start;
      if (!raw || !raw.trim()) throw new Error('Réponse vide');

      await markProviderSuccess(env, tier.provider, tier.model);
      return { text: raw, provider: tier.provider, model: tier.model, latency };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${tier.provider}: ${msg}`);
      await markProviderFail(env, tier.provider, tier.model);
      console.log(`[callLLM] ${tier.provider} failed for ${agentName}: ${msg}`);
    }
  }

  throw new Error(`Tous les providers AI sont indisponibles. Erreurs: ${errors.join(' | ')}`);
}

// ----- Workers AI -----
async function callWorkersAI(env, model, systemPrompt, userPrompt, maxTokens) {
  if (!env.AI) throw new Error('Workers AI binding manquant');
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
  const response = await env.AI.run(model, { messages, max_tokens: maxTokens });
  const text = response?.response || response?.text || response?.content || '';
  if (!text.trim()) throw new Error('Workers AI vide');
  return text;
}

// ----- Groq -----
async function callGroq(env, model, systemPrompt, userPrompt, maxTokens) {
  if (!env.GROQ_API_KEY) throw new Error('GROQ_API_KEY manquant');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.1,
      max_tokens: maxTokens,
      top_p: 0.8,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Groq error: ${JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Groq vide');
  return text;
}

// ----- OpenRouter -----
async function callOpenRouter(env, model, systemPrompt, userPrompt, maxTokens) {
  if (!env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY manquant');
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://mrzbrand.online',
      'X-Title': 'Mr Z Brand OS',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.1,
      max_tokens: maxTokens,
      top_p: 0.8,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenRouter error: ${JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('OpenRouter vide');
  return text;
}

// ----- Gemini -----
async function callGemini(env, systemPrompt, userPrompt, maxTokens) {
  if (!env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY manquant');
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.1, topP: 0.8, maxOutputTokens: maxTokens, responseMimeType: 'text/plain' },
      }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`Gemini error: ${text}`);
  const data = JSON.parse(text);
  const candidate = data?.candidates?.[0] || {};
  const raw = candidate?.content?.parts?.map(p => p.text).filter(Boolean).join('\n') || '';
  if (!raw.trim()) throw new Error('Gemini vide');
  if (candidate?.finishReason === 'MAX_TOKENS') throw new Error(`Gemini tronqué: ${raw}`);
  return raw;
}

// ----- Cerebras -----
async function callCerebras(env, model, systemPrompt, userPrompt, maxTokens) {
  if (!env.CEREBRAS_API_KEY) throw new Error('CEREBRAS_API_KEY manquant');
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.1,
      max_tokens: maxTokens,
      top_p: 0.8,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Cerebras error: ${JSON.stringify(data)}`);
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error('Cerebras vide');
  return text;
}

// ============================================================================
// CIRCUIT BREAKER — Éviter les providers en panne
// ============================================================================

async function isProviderHealthy(env, provider, model) {
  try {
    if (!env.KV) return true;
    const key = `health_${provider}_${model}`;
    const health = await env.KV.get(key);
    if (health) {
      const h = JSON.parse(health);
      // Si 3 échecs consécutifs dans les 5 dernières minutes, skip
      if (h.failCount >= 3 && Date.now() - h.lastFail < 300000) return false;
    }
    return true;
  } catch {
    return true;
  }
}

async function markProviderFail(env, provider, model) {
  try {
    if (!env.KV) return;
    const key = `health_${provider}_${model}`;
    const existing = await env.KV.get(key);
    const h = existing ? JSON.parse(existing) : { failCount: 0, lastFail: 0 };
    h.failCount += 1;
    h.lastFail = Date.now();
    await env.KV.put(key, JSON.stringify(h), { expirationTtl: 3600 });
  } catch { /* ignore */ }
}

async function markProviderSuccess(env, provider, model) {
  try {
    if (!env.KV) return;
    const key = `health_${provider}_${model}`;
    await env.KV.put(key, JSON.stringify({ failCount: 0, lastFail: 0 }), { expirationTtl: 3600 });
  } catch { /* ignore */ }
}

// ============================================================================
// BRAND MEMORY COMPRESSION + KV CACHE
// ============================================================================

async function getCompressedBrandMemory(env) {
  // Try KV cache first
  try {
    if (env.KV) {
      const cached = await env.KV.get('brand_memory_compressed');
      if (cached) return cached;
    }
  } catch (e) { /* ignore */ }

  const rows = await env.DB.prepare('SELECT section_key, title, content_md FROM brand_memory ORDER BY section_key ASC').all();
  const memory = (rows.results || [])
    .map(r => `## ${r.title}\n${r.content_md}`)
    .join('\n\n')
    .slice(0, 1200);

  // Cache in KV for 1 hour
  try {
    if (env.KV) {
      await env.KV.put('brand_memory_compressed', memory, { expirationTtl: 3600 });
    }
  } catch (e) { /* ignore */ }

  return memory;
}

// ============================================================================
// SHARED NORMALIZERS & UTILITIES
// ============================================================================

function normalizeIdea(rawIdea, forcedProduct, forcedPlatform) {
  const allowedDurations = [30, 45, 60, 90];
  const produit = normalizeAllowedProduct(forcedProduct || rawIdea.produit) || 'Mr Z Brand';
  const plateforme = normalizeAllowedPlatform(forcedPlatform || rawIdea.plateforme) || 'TikTok';
  const dureeRaw = Number(rawIdea.duree || 45);
  const duree = allowedDurations.includes(dureeRaw) ? dureeRaw : dureeRaw <= 35 ? 30 : dureeRaw <= 50 ? 45 : dureeRaw <= 75 ? 60 : 90;

  return {
    sujet: String(rawIdea.sujet || '').trim(),
    angle: String(rawIdea.angle || '').trim(),
    cible: String(rawIdea.cible || '').trim(),
    produit,
    plateforme,
    duree,
    cta: sanitizeText(rawIdea.cta || ''),
    caption: stripMarkdownLinks(rawIdea.caption || '').trim(),
    source: String(rawIdea.source || 'Agent Content Strategist').trim(),
  };
}

function buildFallbackIdea({ weekly, forcedProduct, forcedPlatform, iteration }) {
  const plateformes = ['TikTok', 'YouTube Shorts', 'Instagram Reel', 'LinkedIn', 'Facebook'];
  const durees = [30, 45, 60, 90];

  // Idées par produit — sujets et angles spécifiques pour éviter la confusion
  const IDEAS_BY_PRODUCT = {
    'Mr Z Brand': {
      cibles: ['Fondateurs de PME africaines', 'Entrepreneurs de service', 'Dirigeants de petite entreprise', 'Marques personnelles en croissance'],
      sujets: [
        'Pourquoi une marque visible n’est pas forcément structurée',
        'Le vrai problème derrière une communication incohérente',
        'Le standard premium commence avant le design visible',
        'Pourquoi le logo ne suffit pas à construire une marque crédible',
        'Comment clarifier son positionnement en 90 jours',
      ],
      angles: [
        'Montrer que la visibilité seule ne remplace pas un système clair.',
        'Expliquer que le fond stratégique précède l’expression visuelle.',
        'Ramener le premium à la cohérence, pas à la décoration.',
        'Démontrer que le branding est un système de perception, pas une couche graphique.',
        'Proposer un cadre actionnable : audit, plan, exécution.',
      ],
      cta: 'Écris-moi si tu veux structurer ta marque.',
    },
    'SIGNAL™ by Mr Z': {
      cibles: ['Commerçants sur WhatsApp', 'Boutiques en ligne', 'Restaurateurs', 'Freelances surchargés', 'Spas et salons'],
      sujets: [
        'Ce que WhatsApp peut faire quand il est enfin structuré',
        'Pourquoi 90% de vos messages clients peuvent être automatisés',
        'Le vrai coût de répondre à chaque message à la main',
        'Comment un agent virtuel vend pendant que vous dormez',
        'La différence entre WhatsApp actif et WhatsApp convertissant',
      ],
      angles: [
        'Recadrer un canal utilisé sans structure ni intention.',
        'Montrer le temps récupéré et la conversion gagnée.',
        'Confronter la charge manuelle à la solution automatisée.',
        'Démontrer que l’agent ne remplace pas l’humain — il filtre.',
        'Expliquer la méthode 5 étapes (Structurer, Instruire, Guider, Nourrir, Automatiser).',
      ],
      cta: 'Écris-moi sur WhatsApp pour structurer ton canal commercial.',
    },
    'PROSKILLS FR': {
      cibles: ['Étudiants et jeunes diplômés', 'Freelances créatifs', 'Entrepreneurs autodidactes', 'Équipes et RH', 'Professionnels en reconversion'],
      sujets: [
        'Pourquoi apprendre sans méthode fait perdre du temps',
        'La différence entre une bibliothèque de vidéos et un vrai parcours',
        'Pourquoi les compétences seules ne suffisent pas — il faut l’ordre',
        'Comment monter en compétence digitale sans se noyer dans le contenu',
        'Ce que les formations françaises oublient sur l’application concrète',
      ],
      angles: [
        'Mettre l’accent sur la clarté avant la multiplication des contenus.',
        'Distinguer l’accès à l’information de la progression structurée.',
        'Proposer un diagnostic niveau → pilier → parcours.',
        'Montrer que PROSKILLS FR pense en français et en application.',
        'Rassurer : ce n’est pas plus de contenu, c’est plus de structure.',
      ],
      cta: 'Demande une orientation — je t’indique le bon pilier et le bon niveau.',
    },
  };

  const produits = Object.keys(IDEAS_BY_PRODUCT);
  const produit = normalizeAllowedProduct(forcedProduct) || produits[(iteration - 1) % produits.length];
  const cfg = IDEAS_BY_PRODUCT[produit] || IDEAS_BY_PRODUCT['Mr Z Brand'];

  const plateforme = normalizeAllowedPlatform(forcedPlatform) || plateformes[(iteration - 1) % plateformes.length];
  const duree = durees[(iteration - 1) % durees.length];
  const cible = cfg.cibles[(iteration - 1) % cfg.cibles.length];
  const sujet = cfg.sujets[(iteration - 1) % cfg.sujets.length];
  const angle = cfg.angles[(iteration - 1) % cfg.angles.length];

  return { sujet, angle, cible, produit, plateforme, duree, cta: cfg.cta, caption: `${sujet}.`, source: 'Agent Content Strategist (fallback)' };
}

function stripMarkdownLinks(text) {
  return String(text || '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').trim();
}
function sanitizeText(text) {
  return String(text || '').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1').trim();
}
function clampCount(value) {
  if (!value || Number.isNaN(value)) return 5;
  return Math.max(1, Math.min(5, value));
}
function normalizeAllowedPlatform(value) {
  const allowed = ['TikTok', 'YouTube Shorts', 'Instagram Reel', 'LinkedIn', 'Facebook'];
  if (!value) return null;
  const found = allowed.find(i => i.toLowerCase() === String(value).toLowerCase());
  return found || null;
}
function normalizeAllowedProduct(value) {
  const allowed = ['Mr Z Brand', 'SIGNAL™ by Mr Z', 'PROSKILLS FR'];
  if (!value) return null;
  const found = allowed.find(i => i.toLowerCase() === String(value).toLowerCase());
  return found || null;
}

// ============================================================================
// GENERIC CRUD + HELPERS
// ============================================================================

async function handleGenericCrud(request, env, url, method) {
  const clean = url.pathname.replace(/^\/api\//, '');
  const parts = clean.split('/').filter(Boolean);
  const resource = parts[0];
  const id = parts[1];
  const cfg = TABLES[resource];
  if (!cfg) return null;

  if (method === 'GET' && !id) {
    const statusFilter = url.searchParams.get('status');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let sql = `SELECT * FROM ${cfg.table}`;
    const params = [];

    if (statusFilter) {
      sql += ` WHERE status = ?`;
      params.push(statusFilter);
    }

    sql += ` ORDER BY ${cfg.orderBy || 'created_at DESC'}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const rows = await env.DB.prepare(sql).bind(...params).all();
    return ok(rows.results || [], env, request);
  }
  if (method === 'GET' && id) {
    const row = await env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ? LIMIT 1`).bind(id).first();
    if (!row) return notFound(env, request, `${resource} introuvable`);
    return ok(row, env, request);
  }
  if (method === 'POST' && !id) {
    const body = await readJson(request);
    const row = sanitizeBody(body, cfg.fields);
    const newId = crypto.randomUUID();
    const createdAt = nowIso();
    const columns = ['id', ...Object.keys(row), 'created_at', 'updated_at'];
    const placeholders = columns.map(() => '?').join(', ');
    const values = [newId, ...Object.values(row), createdAt, createdAt];
    await env.DB.prepare(`INSERT INTO ${cfg.table} (${columns.join(', ')}) VALUES (${placeholders})`).bind(...values).run();
    return json({ ok: true, id: newId }, 201, env, request);
  }
  if (method === 'PUT' && id) {
    const body = await readJson(request);
    const row = sanitizeBody(body, cfg.fields);
    const keys = Object.keys(row);
    if (!keys.length) return badRequest('Aucun champ valide à mettre à jour', env, request);
    const assignments = [...keys.map(k => `${k} = ?`), 'updated_at = ?'];
    const values = [...Object.values(row), nowIso(), id];
    await env.DB.prepare(`UPDATE ${cfg.table} SET ${assignments.join(', ')} WHERE id = ?`).bind(...values).run();
    return ok({ ok: true, id }, env, request);
  }
  if (method === 'DELETE' && id) {
    await env.DB.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).bind(id).run();
    return ok({ ok: true, id }, env, request);
  }
  return null;
}

async function getDashboardSummary(env) {
  const count = async (table, where) => {
    const sql = where ? `SELECT COUNT(*) as total FROM ${table} WHERE ${where}` : `SELECT COUNT(*) as total FROM ${table}`;
    const row = await env.DB.prepare(sql).first();
    return (row && row.total) || 0;
  };
  const latestWeekly = await env.DB.prepare('SELECT * FROM weekly_command ORDER BY updated_at DESC LIMIT 1').first();
  const latestRuns = await env.DB.prepare('SELECT * FROM agent_runs ORDER BY created_at DESC LIMIT 7').all();
  const latestProofs = await env.DB.prepare('SELECT * FROM proofs ORDER BY updated_at DESC LIMIT 6').all();
  return {
    weekly: latestWeekly || null,
    metrics: {
      ideasReady: await count('content_ideas', "status = 'idea_ready'"),
      scriptsReview: await count('scripts', "status = 'ready_review'"),
      hotLeads: await count('leads', "niveau = 'chaud' OR status IN ('lead_qualified','lead_proposal')"),
      activeProjects: await count('projects', "status = 'project_active'"),
      proofsValidated: await count('proofs', 'is_validated = 1'),
      agentRuns: await count('agent_runs'),
      unreadNotifications: await count('notifications', "status = 'unread'"),
    },
    latestRuns: latestRuns.results || [],
    latestProofs: latestProofs.results || [],
  };
}

async function upsertBrandMemory(env, sectionKey, body) {
  const title = String(body.title || sectionKey);
  const contentMd = String(body.content_md || body.content || '');
  const existing = await env.DB.prepare('SELECT id FROM brand_memory WHERE section_key = ? LIMIT 1').bind(sectionKey).first();
  if (existing && existing.id) {
    await env.DB.prepare('UPDATE brand_memory SET title = ?, content_md = ?, updated_at = ? WHERE section_key = ?').bind(title, contentMd, nowIso(), sectionKey).run();
  } else {
    await env.DB.prepare('INSERT INTO brand_memory (id, section_key, title, content_md, updated_at) VALUES (?, ?, ?, ?, ?)').bind(crypto.randomUUID(), sectionKey, title, contentMd, nowIso()).run();
  }
  // Invalidate KV cache
  try { if (env.KV) await env.KV.delete('brand_memory_compressed'); } catch (e) { /* ignore */ }
}

async function searchAll(env, q) {
  const like = `%${q}%`;
  const bundles = await Promise.all([
    env.DB.prepare("SELECT id, sujet as title, 'content' as type, status, 'Content Lab' as module FROM content_ideas WHERE sujet LIKE ? OR angle LIKE ? OR cible LIKE ? OR produit LIKE ? LIMIT 10").bind(like, like, like, like).all(),
    env.DB.prepare("SELECT id, sujet as title, 'script' as type, status, 'Script Room' as module FROM scripts WHERE sujet LIKE ? OR hook LIKE ? OR script LIKE ? LIMIT 10").bind(like, like, like).all(),
    env.DB.prepare("SELECT id, name as title, 'lead' as type, status, 'Lead Desk' as module FROM leads WHERE name LIKE ? OR besoin LIKE ? OR note LIKE ? LIMIT 10").bind(like, like, like).all(),
    env.DB.prepare("SELECT id, client_name as title, 'project' as type, status, 'Delivery Board' as module FROM projects WHERE client_name LIKE ? OR offre LIKE ? OR blocage LIKE ? LIMIT 10").bind(like, like, like).all(),
    env.DB.prepare("SELECT id, type_preuve as title, 'proof' as type, CASE WHEN is_validated = 1 THEN 'validated' ELSE 'draft' END as status, 'Proof Bank' as module FROM proofs WHERE type_preuve LIKE ? OR contenu LIKE ? LIMIT 10").bind(like, like).all(),
    env.DB.prepare("SELECT id, title as title, 'memory' as type, '' as status, 'Brand Memory' as module FROM brand_memory WHERE title LIKE ? OR content_md LIKE ? LIMIT 10").bind(like, like).all(),
    env.DB.prepare("SELECT id, title as title, 'intel' as type, 'active' as status, 'Market Intel' as module FROM market_intel WHERE title LIKE ? OR insight LIKE ? LIMIT 10").bind(like, like).all(),
  ]);
  return bundles.flatMap(b => b.results || []);
}

async function pruneOldReadNotifications(env) {
  await env.DB.prepare(`
    DELETE FROM notifications WHERE id IN (
      SELECT id FROM notifications WHERE status = 'read' ORDER BY datetime(created_at) DESC LIMIT -1 OFFSET 10
    )
  `).run();
}

function sanitizeBody(body, allowedFields) {
  const out = {};
  for (const f of allowedFields) if (body[f] !== undefined) out[f] = body[f];
  return out;
}
async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}
function nowIso() { return new Date().toISOString(); }

function withCors(response, env, request) {
  const headers = new Headers(response.headers);
  const origin = env.ALLOWED_ORIGIN || request.headers.get('Origin') || '*';
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Vary', 'Origin');
  return new Response(response.body, { status: response.status, headers });
}
function json(data, status, env, request) {
  return withCors(new Response(JSON.stringify(data, null, 2), { status, headers: JSON_HEADERS }), env, request);
}
function ok(data, env, request) { return json(data, 200, env, request); }
function badRequest(message, env, request) { return json({ ok: false, error: message }, 400, env, request); }
function notFound(env, request, message = 'Route introuvable') { return json({ ok: false, error: message }, 404, env, request); }
function notImplemented(message, env, request) { return json({ ok: false, error: message }, 501, env, request); }
