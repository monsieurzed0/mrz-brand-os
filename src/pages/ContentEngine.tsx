import { useMemo, useState } from 'react';
import { Zap, Video, Type, Image, Copy, Sparkles, FileText, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';

import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { useApiQuery } from '@/hooks/useApiQuery';

interface GeneratedFormat {
  category: 'video' | 'text' | 'visual';
  format: string;
  content: string;
  description: string;
}

type UiIdea = {
  id: string;
  subject: string;
  angle: string;
  target: string;
  product: string;
  platform: string;
  duration: number;
  cta: string;
  caption: string;
  status: string;
};

function mapOutputType(type?: string): 'video' | 'text' | 'visual' {
  if (type === 'video' || type === 'text' || type === 'visual') return type;
  return 'text';
}

function mapDescription(type: string, label: string) {
  if (type === 'video') return `Format vidéo — ${label}`;
  if (type === 'visual') return `Format visuel — ${label}`;
  return `Format texte — ${label}`;
}

export default function ContentEngine() {
  const { showToast } = useStore();
  const navigate = useNavigate();

  const { data: contentIdeasData, loading: loadingIdeas, error: ideasError } = useApiQuery(
    api.getContentIdeas,
    []
  );
  const { data: outputsData, loading: loadingOutputs, error: outputsError } = useApiQuery(
    api.getContentEngineOutputs,
    []
  );

  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [generated, setGenerated] = useState<GeneratedFormat[]>([]);
  const [activeCategory, setActiveCategory] = useState<'video' | 'text' | 'visual' | null>(null);

  const readyIdeas: UiIdea[] = useMemo(() => {
    const safe = Array.isArray(contentIdeasData) ? contentIdeasData : [];
    return safe
      .filter((i: any) => i.status === 'idea_ready' || i.status === 'idea_pending' || i.status === 'script_pending')
      .map((i: any) => ({
        id: i.id,
        subject: i.sujet || '',
        angle: i.angle || '',
        target: i.cible || '',
        product: i.produit || 'Mr Z Brand',
        platform: i.plateforme || 'TikTok',
        duration: Number(i.duree || 45),
        cta: i.cta || '',
        caption: i.caption || '',
        status: i.status || 'idea_pending',
      }));
  }, [contentIdeasData]);

  const selectedIdea = readyIdeas.find((i) => i.id === selectedIdeaId);

  const generate = async () => {
  if (!selectedIdea) {
    showToast('Sélectionnez une idée');
    return;
  }

  const s = selectedIdea;

  const localOutputs: GeneratedFormat[] = [
    {
      category: 'video',
      format: 'TikTok',
      description: 'Vidéo courte format vertical',
      content: `Hook (3s) : "${s.subject.split(' ').slice(0, 6).join(' ')}..."\nDéveloppement (${Math.max(s.duration - 10, 20)}s) : Angle ${s.angle} pour ${s.target}\nCTA (5s) : ${s.cta}`,
    },
    {
      category: 'video',
      format: 'YouTube Shorts',
      description: 'Short vertical optimisé SEO',
      content: `Titre accrocheur : ${s.subject}\nIntro rapide + hook visuel\nCorps : ${s.angle} — valeur pour ${s.target}\nOutro : ${s.cta}\nDescription optimisée SEO`,
    },
    {
      category: 'video',
      format: 'Instagram Reel',
      description: 'Reel avec cover premium',
      content: `Cover : titre typographié premium\nHook visuel 2s\nContenu : ${s.angle} — ${s.subject}\nTransition : signature Mr Z Brand\nCTA : ${s.cta}`,
    },
    {
      category: 'video',
      format: 'Vidéo LinkedIn',
      description: 'Format natif professionnel',
      content: `Format natif carré 1:1\nSous-titres intégrés\nTon professionnel — angle "${s.angle}"\nSujet : ${s.subject}\nCTA : ${s.cta}`,
    },
    {
      category: 'text',
      format: 'Post LinkedIn',
      description: 'Article court professionnel',
      content: `${s.subject}.\n\nLa plupart des gens pensent que c'est simple.\nMais voici ce que ${s.target} ignorent souvent :\n\n→ [Point 1 basé sur "${s.angle}"]\n→ [Point 2]\n→ [Point 3]\n\n${s.cta}\n\n#MrZBrand #${s.product.replace(/\s/g, '')} #Branding`,
    },
    {
      category: 'text',
      format: 'Post Facebook',
      description: 'Publication engageante',
      content: `${s.subject}\n\nSi tu es ${s.target.toLowerCase()}, ce message est pour toi.\n\n${s.angle} : [développement]\n\n${s.cta}`,
    },
    {
      category: 'text',
      format: 'Caption Instagram',
      description: 'Légende storytelling',
      content: `${s.subject}\n\n${s.angle} pour ${s.target}.\n\n${s.cta}\n\n#MrZBrand #Premium #Branding #Design`,
    },
    {
      category: 'text',
      format: 'Caption TikTok',
      description: 'Texte court + hashtags',
      content: `${s.subject} ${s.cta} #MrZBrand #${s.platform.replace(/\s/g, '')}`,
    },
    {
      category: 'text',
      format: 'Description Shorts',
      description: 'Description YouTube',
      content: `${s.subject} — ${s.angle} pour ${s.target}\n\n${s.cta}\n\n#Shorts #MrZBrand`,
    },
    {
      category: 'text',
      format: 'Hook textuel',
      description: 'Accroche copywriting',
      content: `"${s.subject.split(' ').slice(0, 8).join(' ')}... et si tout ce que tu savais était faux ?"`,
    },
    {
      category: 'visual',
      format: 'Prompt visuel premium',
      description: 'Prompt image premium',
      content: `Cinematic brand visual, ${s.subject}, premium dark aesthetic, copper and charcoal tones, editorial composition, ${s.product} branding, professional lighting, depth of field, no text overlay`,
    },
    {
      category: 'visual',
      format: 'Hook visuel',
      description: "Typographie d'accroche",
      content: `Bold typography on dark background: "${s.subject.split(' ').slice(0, 5).join(' ')}" in Raleway Bold, copper accent color #D67A2C, minimal composition`,
    },
    {
      category: 'visual',
      format: 'Concept carrousel',
      description: 'Structure slides Instagram',
      content: `Slide 1: Hook — "${s.subject}"\nSlide 2: Le problème\nSlide 3: La réalité\nSlide 4: La solution (${s.angle})\nSlide 5: CTA — ${s.cta}\nStyle: Fond sombre, typo Raleway, accents cuivrés`,
    },
    {
      category: 'visual',
      format: 'Concept post statique',
      description: 'Design single post',
      content: `Visual card premium\nTitre : ${s.subject}\nSous-titre : ${s.angle}\nLogo ${s.product}\nPalette : noir charbon + cuivre\nFormat : 1080x1350`,
    },
    {
      category: 'visual',
      format: 'Note Photoshop',
      description: 'Guide de composition',
      content: `Calques :\n1. Fond #0D0D10\n2. Texture hero-bg.jpg à 5% opacité\n3. Titre en Raleway Bold #F0EDE8\n4. Accent line #D67A2C\n5. Logo ${s.product}\n6. CTA zone en bas\nExport : 1080x1350 PNG + 1920x1080 pour LinkedIn`,
    },
  ];

  try {
    const saved = await persistOutputs(selectedIdea, localOutputs);
    setGenerated(saved);
    setActiveCategory('video');
    showToast(`${saved.length} formats générés et enregistrés`);
  } catch (err) {
    showToast(err instanceof Error ? err.message : 'Erreur lors de la génération');
  }
};
    const existingOutputs = (Array.isArray(outputsData) ? outputsData : [])
      .filter((item: any) => item.content_idea_id === selectedIdea.id)
      .map((item: any) => ({
        category: mapOutputType(item.output_type),
        format: item.output_label || 'Format',
        content: item.contenu || '',
        description: mapDescription(item.output_type, item.output_label || 'Format'),
      })) as GeneratedFormat[];

    if (existingOutputs.length > 0) {
      setGenerated(existingOutputs);
      setActiveCategory(existingOutputs[0].category);
      showToast(`${existingOutputs.length} formats chargés depuis D1`);
      return;
    }

    const s = selectedIdea;

    setGenerated([
      // Video formats
      {
        category: 'video',
        format: 'TikTok',
        description: 'Vidéo courte format vertical',
        content: `Hook (3s) : "${s.subject.split(' ').slice(0, 6).join(' ')}..."\nDéveloppement (${Math.max(s.duration - 10, 20)}s) : Angle ${s.angle} pour ${s.target}\nCTA (5s) : ${s.cta}`,
      },
      {
        category: 'video',
        format: 'YouTube Shorts',
        description: 'Short vertical optimisé SEO',
        content: `Titre accrocheur : ${s.subject}\nIntro rapide + hook visuel\nCorps : ${s.angle} — valeur pour ${s.target}\nOutro : ${s.cta}\nDescription optimisée SEO`,
      },
      {
        category: 'video',
        format: 'Instagram Reel',
        description: 'Reel avec cover premium',
        content: `Cover : titre typographié premium\nHook visuel 2s\nContenu : ${s.angle} — ${s.subject}\nTransition : signature Mr Z Brand\nCTA : ${s.cta}`,
      },
      {
        category: 'video',
        format: 'Vidéo LinkedIn',
        description: 'Format natif professionnel',
        content: `Format natif carré 1:1\nSous-titres intégrés\nTon professionnel — angle "${s.angle}"\nSujet : ${s.subject}\nCTA : ${s.cta}`,
      },

      // Text formats
      {
        category: 'text',
        format: 'Post LinkedIn',
        description: 'Article court professionnel',
        content: `${s.subject}.\n\nLa plupart des gens pensent que c'est simple.\nMais voici ce que ${s.target} ignorent souvent :\n\n→ [Point 1 basé sur "${s.angle}"]\n→ [Point 2]\n→ [Point 3]\n\n${s.cta}\n\n#MrZBrand #${s.product.replace(/\s/g, '')} #Branding`,
      },
      {
        category: 'text',
        format: 'Post Facebook',
        description: 'Publication engageante',
        content: `${s.subject}\n\nSi tu es ${s.target.toLowerCase()}, ce message est pour toi.\n\n${s.angle} : [développement]\n\n${s.cta}`,
      },
      {
        category: 'text',
        format: 'Caption Instagram',
        description: 'Légende storytelling',
        content: `${s.subject}\n\n${s.angle} pour ${s.target}.\n\n${s.cta}\n\n#MrZBrand #Premium #Branding #Design`,
      },
      {
        category: 'text',
        format: 'Caption TikTok',
        description: 'Texte court + hashtags',
        content: `${s.subject} ${s.cta} #MrZBrand #${s.platform.replace(/\s/g, '')}`,
      },
      {
        category: 'text',
        format: 'Description Shorts',
        description: 'Description YouTube',
        content: `${s.subject} — ${s.angle} pour ${s.target}\n\n${s.cta}\n\n#Shorts #MrZBrand`,
      },
      {
        category: 'text',
        format: 'Hook textuel',
        description: 'Accroche copywriting',
        content: `"${s.subject.split(' ').slice(0, 8).join(' ')}... et si tout ce que tu savais était faux ?"`,
      },

      // Visual formats
      {
        category: 'visual',
        format: 'Prompt visuel premium',
        description: 'Prompt image premium',
        content: `Cinematic brand visual, ${s.subject}, premium dark aesthetic, copper and charcoal tones, editorial composition, ${s.product} branding, professional lighting, depth of field, no text overlay`,
      },
      {
        category: 'visual',
        format: 'Hook visuel',
        description: "Typographie d'accroche",
        content: `Bold typography on dark background: "${s.subject.split(' ').slice(0, 5).join(' ')}" in Raleway Bold, copper accent color #D67A2C, minimal composition`,
      },
      {
        category: 'visual',
        format: 'Concept carrousel',
        description: 'Structure slides Instagram',
        content: `Slide 1: Hook — "${s.subject}"\nSlide 2: Le problème\nSlide 3: La réalité\nSlide 4: La solution (${s.angle})\nSlide 5: CTA — ${s.cta}\nStyle: Fond sombre, typo Raleway, accents cuivrés`,
      },
      {
        category: 'visual',
        format: 'Concept post statique',
        description: 'Design single post',
        content: `Visual card premium\nTitre : ${s.subject}\nSous-titre : ${s.angle}\nLogo ${s.product}\nPalette : noir charbon + cuivre\nFormat : 1080x1350`,
      },
      {
        category: 'visual',
        format: 'Note Photoshop',
        description: 'Guide de composition',
        content: `Calques :\n1. Fond #0D0D10\n2. Texture hero-bg.jpg à 5% opacité\n3. Titre en Raleway Bold #F0EDE8\n4. Accent line #D67A2C\n5. Logo ${s.product}\n6. CTA zone en bas\nExport : 1080x1350 PNG + 1920x1080 pour LinkedIn`,
      },
    ]);

    setActiveCategory('video');
    showToast('15 formats générés');
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copié dans le presse-papier');
  };

  const categoryConfig = {
    video: {
      icon: Video,
      label: 'Vidéo',
      color: 'text-copper',
      bgColor: 'bg-copper/15',
      borderColor: 'border-copper/30',
      count: generated.filter((g) => g.category === 'video').length || 4,
    },
    text: {
      icon: Type,
      label: 'Texte',
      color: 'text-copper-light',
      bgColor: 'bg-copper-light/15',
      borderColor: 'border-copper-light/30',
      count: generated.filter((g) => g.category === 'text').length || 6,
    },
    visual: {
      icon: Image,
      label: 'Visuel',
      color: 'text-exec',
      bgColor: 'bg-exec/15',
      borderColor: 'border-exec/30',
      count: generated.filter((g) => g.category === 'visual').length || 5,
    },
  };

  const currentItems = activeCategory ? generated.filter((g) => g.category === activeCategory) : [];

  return (
    <div>
      <Topbar title="Content Engine" />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-copper/15">
              <Zap size={22} className="text-copper" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-ivory">Content Engine</h2>
              <p className="text-xs text-subtle">Générez plusieurs formats depuis une seule idée</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-subtle">
            <Sparkles size={14} className="text-copper" />
            <span>3 catégories · 15 formats</span>
          </div>
        </div>

        {loadingIdeas ? <div className="text-sm text-subtle">Chargement des idées...</div> : null}
        {ideasError ? <div className="text-sm text-red-400">Erreur idées : {ideasError}</div> : null}
        {loadingOutputs ? <div className="text-sm text-subtle">Chargement des formats...</div> : null}
        {outputsError ? <div className="text-sm text-red-400">Erreur outputs : {outputsError}</div> : null}

        {/* Idea selector */}
        <SectionCard>
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">
            <div className="flex-1">
              <label className="text-xs text-subtle font-semibold uppercase tracking-wider mb-2 block">
                Idée source
              </label>
              <select
                value={selectedIdeaId}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
                className="w-full bg-deep border border-exec/15 rounded-xl px-4 py-3 text-sm text-ivory focus:outline-none focus:border-copper/30 transition"
              >
                <option value="">— Sélectionnez une idée à transformer —</option>
                {readyIdeas.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.subject} ({i.product} · {i.platform})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generate}
              disabled={!selectedIdeaId}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-copper text-dark text-sm font-bold hover:bg-copper-light transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Zap size={16} /> Générer tous les formats
            </button>
          </div>

          {selectedIdea && (
            <div className="mt-4 p-4 rounded-xl bg-deep border border-exec/10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-subtle font-semibold">Angle</span>
                  <p className="text-muted mt-0.5">{selectedIdea.angle}</p>
                </div>
                <div>
                  <span className="text-subtle font-semibold">Cible</span>
                  <p className="text-muted mt-0.5">{selectedIdea.target}</p>
                </div>
                <div>
                  <span className="text-subtle font-semibold">Produit</span>
                  <p className="text-muted mt-0.5">{selectedIdea.product}</p>
                </div>
                <div>
                  <span className="text-subtle font-semibold">CTA</span>
                  <p className="text-muted mt-0.5">{selectedIdea.cta}</p>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* Category tabs */}
        {generated.length > 0 && (
          <>
            <div className="flex gap-3">
              {(['video', 'text', 'visual'] as const).map((cat) => {
                const config = categoryConfig[cat];
                const isActive = activeCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all ${
                      isActive
                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                        : 'border-exec/10 bg-carbon text-muted hover:border-exec/20'
                    }`}
                  >
                    <config.icon size={18} />
                    <span className="font-semibold">{config.label}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-dark/30' : 'bg-deep'
                      }`}
                    >
                      {config.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Generated content grid */}
            {activeCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentItems.map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-exec/10 bg-carbon p-5 hover:border-copper/20 transition group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-ivory">{item.format}</h4>
                        <p className="text-[10px] text-subtle mt-0.5">{item.description}</p>
                      </div>
                      <button
                        onClick={() => copyContent(item.content)}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-copper/10 transition"
                      >
                        <Copy size={14} className="text-copper" />
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-deep border border-exec/5 max-h-36 overflow-y-auto mb-3">
                      <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyContent(item.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-copper/10 border border-copper/20 text-[10px] text-copper-light font-semibold hover:bg-copper/20 transition"
                      >
                        <Copy size={10} /> Copier
                      </button>

                      {item.category === 'video' && (
                      <button
                          onClick={async () => {
                            if (!selectedIdea) return;
                            try {
                              await api.createScript({
                                content_idea_id: selectedIdea.id,
                                sujet: selectedIdea.subject,
                                hook: item.content.split('\n')[0] || '',
                                script: item.content,
                                cta_genere: selectedIdea.cta,
                                caption: selectedIdea.caption,
                                angle: selectedIdea.angle,
                                cible: selectedIdea.target,
                                produit: selectedIdea.product,
                                plateforme: item.format,
                                status: 'draft',
                              });
                              showToast('Envoyé vers Script Room');
                              navigate('/scripts');
                            } catch (err) {
                              showToast(err instanceof Error ? err.message : 'Erreur envoi Script Room');
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-exec/15 text-[10px] text-muted font-semibold hover:border-copper/20 hover:text-copper-light transition"
                        >
                          <FileText size={10} /> Script Room
                      </button>
                      )}

                      {item.category === 'visual' && (
                        <button
                          onClick={async () => {
                            if (!selectedIdea) return;
                            try {
                              await api.createVisualPrompt({
                                related_script_id: null,
                                sujet: selectedIdea.subject,
                                angle: selectedIdea.angle,
                                produit: selectedIdea.product,
                                hook_visuel: item.format === 'Hook visuel' ? item.content : selectedIdea.subject,
                                prompt_principal: item.content,
                                variante_a: '',
                                variante_b: '',
                                variante_c: '',
                                negative_prompt: 'Pas de bleu, pas de néon, pas de stock cheap, pas de texte intégré.',
                                photoshop_note: item.format === 'Note Photoshop' ? item.content : 'Prévoir un espace de titre dans la composition.',
                                status: 'draft',
                              });
                              showToast('Envoyé vers Visual Lab');
                              navigate('/visual-lab');
                            } catch (err) {
                              showToast(err instanceof Error ? err.message : 'Erreur envoi Visual Lab');
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-exec/15 text-[10px] text-muted font-semibold hover:border-copper/20 hover:text-copper-light transition"
                        >
                          <Palette size={10} /> Visual Lab
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {generated.length === 0 && (
          <div className="rounded-xl border border-exec/10 bg-carbon p-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-copper/10 mb-4">
              <Zap size={32} className="text-copper" />
            </div>
            <h3 className="text-base font-bold text-ivory mb-2">Prêt à générer du contenu</h3>
            <p className="text-sm text-subtle max-w-md mx-auto">
              Sélectionnez une idée ci-dessus et cliquez sur "Générer tous les formats" pour créer
              automatiquement des scripts vidéo, posts texte et prompts visuels.
            </p>

            <div className="flex justify-center gap-6 mt-6">
              {Object.entries(categoryConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2 text-xs text-subtle">
                  <config.icon size={14} className={config.color} />
                  <span>
                    {config.count} formats {config.label.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
async function persistOutputs(selectedIdea: any, outputs: GeneratedFormat[]) {
  const saved = [];

  for (const item of outputs) {
    const result: any = await api.createContentEngineOutput({
      content_idea_id: selectedIdea.id,
      output_type: item.category,
      output_label: item.format,
      platforme: selectedIdea.platform,
      contenu: item.content,
      status: 'draft',
    });

    saved.push({
      id: result.id,
      category: item.category,
      format: item.format,
      description: item.description,
      content: item.content,
    });
  }

  return saved;
}
