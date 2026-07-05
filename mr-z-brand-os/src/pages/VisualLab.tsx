import { useState } from 'react';
import { Palette, Sparkles, Copy, Layers } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';
import { PRODUCTS, PLATFORMS } from '@/lib/constants';

export default function VisualLab() {
  const { showToast } = useStore();
  const [form, setForm] = useState({
    subject: '', angle: '', product: 'Mr Z Brand', platform: 'TikTok', format: '1080x1350 (Portrait)', objective: '',
  });
  const [result, setResult] = useState<{
    hookVisual: string;
    mainPrompt: string;
    variantA: string;
    variantB: string;
    variantC: string;
    negativePrompt: string;
    notePS: string;
  } | null>(null);

  const formats = ['1080x1350 (Portrait)', '1080x1080 (Carré)', '1920x1080 (Paysage)', '1080x1920 (Story)', '2560x1440 (Cover)'];

  const generate = () => {
    if (!form.subject) { showToast('Entrez un sujet'); return; }
    setResult({
      hookVisual: `Bold typographic composition: "${form.subject.split(' ').slice(0, 6).join(' ')}" — Raleway ExtraBold, #F0EDE8 on #0D0D10, copper accent line #D67A2C, minimal asymmetric layout, ${form.format}`,
      mainPrompt: `Cinematic brand visual, ${form.subject}, premium dark editorial aesthetic, copper and charcoal palette (#D67A2C, #1F1F21, #0D0D10), ${form.angle || 'modern'} composition, professional studio lighting, depth of field, architectural precision, ${form.product} brand universe, texture and materiality, no text --ar ${form.format.includes('Portrait') ? '4:5' : form.format.includes('Carré') ? '1:1' : '16:9'} --style raw --v 6`,
      variantA: `Dark luxury brand scene, ${form.subject}, close-up detail shot, warm copper light accents, shallow depth of field, editorial magazine aesthetic, ${form.product}, premium African design influence --ar ${form.format.includes('Portrait') ? '4:5' : '16:9'} --style raw`,
      variantB: `Abstract geometric composition inspired by ${form.subject}, interlocking shapes in charcoal and copper tones, Bauhaus meets African design, minimal premium, ${form.product} brand identity --ar ${form.format.includes('Carré') ? '1:1' : '16:9'} --style raw`,
      variantC: `Atmospheric moody scene, ${form.subject}, dramatic side lighting, ${form.angle || 'editorial'} mood, dark environment with copper highlights, texture-rich surfaces, architectural depth, ${form.product} --ar ${form.format.includes('Portrait') ? '4:5' : '16:9'} --style raw`,
      negativePrompt: 'text, watermark, logo, bright colors, blue tones, purple, neon, green glow, cartoon, illustration, anime, low quality, blurry, generic stock photo, smiling business people, laptops, white background, startup cliché, crypto aesthetic',
      notePS: `Calques Photoshop recommandés :\n1. Fond — #0D0D10 solid\n2. Image générée — mode Luminosité, 85% opacité\n3. Overlay texture hero-bg.jpg — Multiply, 8% opacité\n4. Gradient — dégradé bas → #0D0D10, 40% hauteur\n5. Titre — Raleway Bold, #F0EDE8, corps 48pt\n6. Sous-titre — Raleway Medium, #A1A1AA, corps 18pt\n7. Accent — rectangle #D67A2C, 3px\n8. Logo ${form.product} — coin inférieur droit\n9. Export : ${form.format.split(' ')[0]} PNG 300dpi + JPG web`,
    });
    showToast('Prompts visuels générés');
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copié');
  };

  const moodColors = ['#0D0D10', '#141416', '#1F1F21', '#7A6F67', '#D67A2C', '#EF9F27', '#F0EDE8'];

  return (
    <div>
      <Topbar title="Visual Lab" />
      <div className="p-6 space-y-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-2">
          <Palette size={20} className="text-copper" />
          <h2 className="text-lg font-bold text-ivory">Visual Lab</h2>
          <span className="text-xs text-subtle">— Direction artistique et prompts visuels</span>
        </div>

        {/* Form */}
        <SectionCard title="Brief visuel">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2"><label className="text-xs text-subtle font-semibold">Sujet</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="Ex: L'excellence du branding africain" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
            <div><label className="text-xs text-subtle font-semibold">Angle</label><input value={form.angle} onChange={e => setForm({...form, angle: e.target.value})} placeholder="Ex: Éditorial, cinématique" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
            <div><label className="text-xs text-subtle font-semibold">Produit</label><select value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">{PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="text-xs text-subtle font-semibold">Plateforme</label><select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">{PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="text-xs text-subtle font-semibold">Format</label><select value={form.format} onChange={e => setForm({...form, format: e.target.value})} className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30">{formats.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
            <div className="lg:col-span-3"><label className="text-xs text-subtle font-semibold">Objectif visuel</label><input value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} placeholder="Ex: Post Instagram premium pour acquisition leads" className="w-full mt-1 bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30" /></div>
          </div>
          <button onClick={generate} className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-copper text-dark text-sm font-bold hover:bg-copper-light transition">
            <Sparkles size={14} /> Générer les prompts visuels
          </button>
        </SectionCard>

        {/* Mood panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SectionCard title="Palette de marque">
            <div className="flex gap-2">
              {moodColors.map(c => (
                <div key={c} className="flex-1">
                  <div className="h-12 rounded-lg border border-exec/10" style={{ backgroundColor: c }} />
                  <p className="text-[9px] text-subtle text-center mt-1 font-mono">{c}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Formats recommandés">
            <div className="grid grid-cols-2 gap-2">
              {formats.map(f => (
                <div key={f} className="p-2 rounded bg-deep border border-exec/5 text-xs text-muted text-center">{f}</div>
              ))}
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

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-copper" />
              <h3 className="text-sm font-bold text-ivory uppercase tracking-wider">Résultats générés</h3>
            </div>

            {/* Hook visuel */}
            <div className="rounded-xl border border-copper/20 bg-copper/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-copper">Hook visuel</span>
                <button onClick={() => copy(result.hookVisual)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <p className="text-sm text-ivory">{result.hookVisual}</p>
            </div>

            {/* Prompts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { label: 'Prompt principal', content: result.mainPrompt },
                { label: 'Variante A', content: result.variantA },
                { label: 'Variante B', content: result.variantB },
                { label: 'Variante C', content: result.variantC },
              ].map(p => (
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

            {/* Negative prompt */}
            <div className="rounded-xl border border-red-900/20 bg-red-950/10 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-red-400">Negative prompt</span>
                <button onClick={() => copy(result.negativePrompt)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <p className="text-xs text-red-300/80">{result.negativePrompt}</p>
            </div>

            {/* Note Photoshop */}
            <SectionCard title="Note Photoshop">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-subtle">Guide de composition</span>
                <button onClick={() => copy(result.notePS)} className="text-xs text-muted hover:text-copper flex items-center gap-1"><Copy size={11} /> Copier</button>
              </div>
              <div className="p-3 rounded-lg bg-deep border border-exec/5">
                <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{result.notePS}</p>
              </div>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}
