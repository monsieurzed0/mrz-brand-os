import { useMemo, useState } from 'react';
import { Palette, Sparkles, Copy, Layers, Wand2, Loader2 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';
import { PRODUCTS, PLATFORMS } from '@/lib/constants';

type VisualResult = {
  id?: string;
  hookVisual: string;
  mainPrompt: string;
  promptChatgpt: string;
  promptNanoBanana: string;
  variantA: string;
  variantB: string;
  variantC: string;
  negativePrompt: string;
  notePS: string;
};

export default function VisualLab() {
  const { showToast } = useStore();
  const { data: visualPromptsData, setData: setVisualPromptsData } = useApiQuery(api.getVisualPrompts, []);
  const { data: scriptsData } = useApiQuery(api.getScripts, []);
  const [form, setForm] = useState({
    subject: '',
    angle: '',
    product: 'Mr Z Brand',
    platform: 'TikTok',
    format: '1080x1350 (Portrait)',
    objective: '',
  });
  const [result, setResult] = useState<VisualResult | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  const formats = [
    '1080x1350 (Portrait)',
    '1080x1080 (Carré)',
    '1920x1080 (Paysage)',
    '1080x1920 (Story)',
    '2560x1440 (Cover)',
  ];

  const moodColors = [
    '#0D0D10', '#141416', '#1F1F21', '#7A6F67', '#D67A2C', '#EF9F27', '#F0EDE8',
  ];

  const aspectRatio = useMemo(() => {
    if (form.format.includes('Portrait')) return '4:5';
    if (form.format.includes('Carré')) return '1:1';
    if (form.format.includes('Story')) return '9:16';
    return '16:9';
  }, [form.format]);

  const buildVisualResult = (): VisualResult => {
    const chatgptPrompt = `Cinematic brand visual, ${form.subject}, premium dark editorial aesthetic, copper and charcoal palette (#D67A2C, #1F1F21, #0D0D10), ${form.angle || 'modern'} composition, professional studio lighting, depth of field, architectural precision, ${form.product} brand universe, texture and materiality, no text --ar ${aspectRatio} --style raw --v 6`;
    const nanoPrompt = `((masterpiece, best quality, ultra-detailed, 8k uhd)), cinematic brand visual, ${form.subject}, premium dark editorial aesthetic, deep copper and charcoal palette, ${form.angle || 'modern'} composition, professional studio lighting, depth of field, architectural precision, ${form.product} brand universe, texture and materiality, film grain, photorealistic, no text, no watermark, no logo, no bright colors, no cartoon, no illustration`;
    return {
      hookVisual: `Bold typographic composition: "${form.subject.split(' ').slice(0, 6).join(' ')}" — Raleway ExtraBold, #F0EDE8 on #0D0D10, copper accent line #D67A2C, minimal asymmetric layout, ${form.format}`,
      mainPrompt: chatgptPrompt,
      promptChatgpt: chatgptPrompt,
      promptNanoBanana: nanoPrompt,
      variantA: `Dark luxury brand scene, ${form.subject}, close-up detail shot, warm copper light accents, shallow depth of field, editorial magazine aesthetic, ${form.product}, premium African design influence --ar ${aspectRatio} --style raw`,
      variantB: `Abstract geometric composition inspired by ${form.subject}, interlocking shapes in charcoal and copper tones, Bauhaus meets African design, minimal premium, ${form.product} brand identity --ar ${form.format.includes('Carré') ? '1:1' : aspectRatio} --style raw`,
      variantC: `Atmospheric moody scene, ${form.subject}, dramatic side lighting, ${form.angle || 'editorial'} mood, dark environment with copper highlights, texture-rich surfaces, architectural depth, ${form.product} --ar ${aspectRatio} --style raw`,
      negativePrompt: 'text, watermark, logo, bright colors, blue tones, purple, neon, green glow, cartoon, illustration, anime, low quality, blurry, generic stock photo, smiling business people, laptops, white background, startup cliché, crypto aesthetic',
      notePS: `Calques Photoshop recommandés :\n1. Fond — #0D0D10 solid\n2. Image générée — mode Luminosité, 85% opacité\n3. Overlay texture hero-bg.jpg — Multiply, 8% opacité\n4. Gradient — dégradé bas → #0D0D10, 40% hauteur\n5. Titre — Raleway Bold, #F0EDE8, corps 48pt\n6. Sous-titre — Raleway Medium, #A1A1AA, corps 18pt\n7. Accent — rectangle #D67A2C, 3px\n8. Logo ${form.product} — coin inférieur droit\n9. Export : ${form.format.split(' ')[0]} PNG 300dpi + JPG web`,
    };
  };

  const generateLocal = async () => {
    if (!form.subject.trim()) { showToast('Entrez un sujet'); return; }
    const generated = buildVisualResult();
    try {
      const payload = {
        related_script_id: null,
        sujet: form.subject,
        angle: form.angle,
        produit: form.product,
        hook_visuel: generated.hookVisual,
        prompt_principal: generated.mainPrompt,
        prompt_chatgpt: generated.promptChatgpt,
        prompt_nano_banana: generated.promptNanoBanana,
        variante_a: generated.variantA,
        variante_b: generated.variantB,
        variante_c: generated.variantC,
        negative_prompt: generated.negativePrompt,
        photoshop_note: generated.notePS,
        status: 'draft',
      };
      const response: any = await api.createVisualPrompt(payload);
      const persisted = { id: response.id, ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setVisualPromptsData((prev: any) => [...(prev || []), persisted]);
      setResult({ ...generated, id: response.id });
      showToast('Prompts visuels générés et enregistrés');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la génération');
    }
  };

  const generateAI = async () => {
    const scripts = Array.isArray(scriptsData) ? scriptsData : [];
    if (scripts.length === 0) {
      showToast('Aucun script disponible. Générez un script d\'abord.');
      return;
    }
    const lastScript = scripts[0];
    setGeneratingAI(true);
    try {
      const res: any = await api.runPromptEngineer({ script_id: lastScript.id });
      const vp = res?.visualPrompt;
      if (vp) {
        setResult({
          hookVisual: vp.hook_visuel || '',
          mainPrompt: vp.prompt_principal || '',
          promptChatgpt: vp.prompt_chatgpt || vp.prompt_principal || '',
          promptNanoBanana: vp.prompt_nano_banana || vp.prompt_principal || '',
          variantA: vp.variante_a || '',
          variantB: vp.variante_b || '',
          variantC: vp.variante_c || '',
          negativePrompt: vp.negative_prompt || '',
          notePS: vp.photoshop_note || '',
          id: vp.id,
        });
        setVisualPromptsData((prev: any) => [...(prev || []), vp]);
        showToast(`Prompts IA générés (${res.mode === 'fallback' ? 'fallback' : 'AI'})`);
      } else {
        showToast('Réponse inattendue du Prompt Engineer');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur Prompt Engineer');
    } finally {
      setGeneratingAI(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copié');
  };

  const latestSaved = useMemo(() => {
    const safe = Array.isArray(visualPromptsData) ? visualPromptsData : [];
    if (safe.length === 0) return null;
    const last = safe[safe.length - 1];
    return {
      hookVisual: last.hook_visuel || '',
      mainPrompt: last.prompt_principal || '',
      promptChatgpt: last.prompt_chatgpt || last.prompt_principal || '',
      promptNanoBanana: last.prompt_nano_banana || last.prompt_principal || '',
      variantA: last.variante_a || '',
      variantB: last.variante_b || '',
      variantC: last.variante_c || '',
      negativePrompt: last.negative_prompt || '',
      notePS: last.photoshop_note || '',
    };
  }, [visualPromptsData]);

  const displayResult = result || latestSaved;

  return (
    <div>
      <Topbar title="Visual Lab" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={20} className="text-copper" />
          <h2 className="text-lg font-bold text-ivory">Visual Lab</h2>
          <span className="text-xs text-subtle">— Direction artistique et prompts visuels</span>
        </div>

        <SectionCard title="Brief visuel">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <label className="text-xs text-subtle font-semibold">Sujet</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex: L'excellence du branding africain" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Angle</label>
              <input value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} placeholder="Ex: Éditorial, cinématique" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Produit</label>
              <select value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                {PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Plateforme</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-subtle font-semibold">Format</label>
              <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">
                {formats.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs text-subtle font-semibold">Objectif visuel</label>
              <input value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="Ex: Post Instagram premium pour acquisition leads" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={generateLocal} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">
              <Sparkles size={14} /> Générer prompts (local)
            </button>
            <button onClick={generateAI} disabled={generatingAI} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-carbon border border-copper/30 text-copper-light text-sm font-semibold hover:bg-copper/10 transition disabled:opacity-50">
              {generatingAI ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              Générer via IA
            </button>
          </div>
        </SectionCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Palette de marque">
            <div className="flex gap-2">
              {moodColors.map((c) => (
                <div key={c} className="flex-1">
                  <div className="h-12 rounded-lg border border-exec/10" style={{ backgroundColor: c }} />
                  <p className="text-[9px] text-subtle text-center mt-1 font-mono">{c}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Formats recommandés">
            <div className="grid grid-cols-2 gap-2">
              {formats.map((f) => <div key={f} className="p-2 rounded bg-deep border border-exec/5 text-xs text-muted text-center">{f}</div>)}
            </div>
          </SectionCard>
          <SectionCard title="Composition">
            <div className="space-y-1.5 text-xs text-muted">
              <p>→ Asymétrie contrôlée</p>
              <p>→ Espace négatif généreux</p>
              <p>→ Texte en zone safe (20% marge)</p>
              <p>→ Point focal haut ou centre</p>
              <p>→ Profondeur par layers</p>
              <p>→ Accent cuivré limité</p>
            </div>
          </SectionCard>
        </div>

        {displayResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-copper" />
              <h3 className="text-sm font-bold text-ivory uppercase tracking-wider">Résultats générés</h3>
            </div>
            <div className="rounded-xl border border-copper/20 bg-copper/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-copper">Hook visuel</span>
                <button onClick={() => copy(displayResult.hookVisual)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <p className="text-sm text-ivory">{displayResult.hookVisual}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { label: 'Prompt ChatGPT (DALL-E / MJ v6)', content: displayResult.promptChatgpt },
                { label: 'Prompt Nano Banana Pro (SD/FLUX)', content: displayResult.promptNanoBanana },
                { label: 'Variante A', content: displayResult.variantA },
                { label: 'Variante B', content: displayResult.variantB },
                { label: 'Variante C', content: displayResult.variantC },
              ].map((p) => (
                <div key={p.label} className="rounded-xl border border-exec/10 bg-carbon p-4 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-ivory">{p.label}</span>
                    <button onClick={() => copy(p.content)} className="opacity-0 group-hover:opacity-100 transition text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
                  </div>
                  <div className="p-3 rounded-lg bg-deep border border-exec/5">
                    <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{p.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400">Negative prompt</span>
                <button onClick={() => copy(displayResult.negativePrompt)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <p className="text-xs text-red-300/80">{displayResult.negativePrompt}</p>
            </div>
            <SectionCard title="Note Photoshop">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-subtle">Guide de composition</span>
                <button onClick={() => copy(displayResult.notePS)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <div className="p-3 rounded-lg bg-deep border border-exec/5">
                <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{displayResult.notePS}</p>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
