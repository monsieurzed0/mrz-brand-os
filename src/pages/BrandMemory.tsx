import { useState, useEffect } from 'react';
import { BookOpen, Save, Edit3 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';
import { api } from '@/lib/api';
import { ASSETS } from '@/lib/constants';

function renderContent(text: string) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^###\s+(.*)$/gm, '<strong>$1</strong>');
  html = html.replace(/^-\s+(.*)$/gm, '• $1');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

export default function BrandMemory() {
  const { showToast } = useStore();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getBrandMemory()
      .then(data => {
        if (Array.isArray(data)) {
          setSections(
            data.map((s: any) => ({
              id: s.id,
              section_key: s.section_key || s.sectionKey,
              title: s.title,
              content: s.content_md || s.content || '',
            }))
          );
        }
      })
      .catch(() => {
        showToast('Erreur chargement Brand Memory');
      })
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const saveEdit = async (id: string) => {
    const section = sections.find((s: any) => s.id === id);
    if (!section || !section.section_key) return;

    setSaving(true);
    try {
      await api.updateBrandMemory(section.section_key, {
        title: section.title,
        content_md: editContent,
      });
      setSections((prev: any[]) =>
        prev.map((s: any) => (s.id === id ? { ...s, content: editContent } : s))
      );
      setEditingId(null);
      showToast('Brand Memory sauvegardée');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const sectionIcons: Record<string, string> = {
    'Identité': '◆',
    'Voix': '◇',
    'Interdits': '✕',
    'Offres': '→',
    'Preuves autorisées': '✓',
    'CTA validés': '▸',
    'Réseaux': '◉',
    'Direction artistique': '◈',
  };

  return (
    <div>
      <Topbar title="Brand Memory" />
      <div className="p-6 space-y-5 animate-fade-in">
        {/* Header with hero bg */}
        <div className="relative rounded-xl border border-exec/10 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-5" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen size={22} className="text-copper" />
              <div>
                <h2 className="text-lg font-bold text-ivory">Brand Memory</h2>
                <p className="text-xs text-subtle">Mémoire centrale de marque — éditable et persistante</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <img src={ASSETS.logo} alt="Mr Z Brand" className="h-10 opacity-70" />
              <img src={ASSETS.signalLogo} alt="SIGNAL™ by Mr Z" className="h-10 opacity-50" />
              <img src={ASSETS.proskillsLogo} alt="PROSKILLS FR" className="h-10 opacity-50" />
            </div>
          </div>
        </div>

        {/* Memory sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            <div className="lg:col-span-2 text-sm text-subtle">Chargement...</div>
          ) : (
            sections.map((section: any) => (
              <SectionCard
                key={section.id}
                title={`${sectionIcons[section.title] || '◆'} ${section.title}`}
                headerRight={
                  editingId === section.id ? (
                    <button
                      onClick={() => saveEdit(section.id)}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs text-copper hover:text-copper-light transition disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="inline-block w-3 h-3 border border-copper border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Save size={12} />
                      )}
                      Sauvegarder
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(section.id, section.content)}
                      className="flex items-center gap-1 text-xs text-subtle hover:text-copper transition"
                    >
                      <Edit3 size={12} /> Modifier
                    </button>
                  )
                }
              >
                {editingId === section.id ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className="w-full bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none"
                  />
                ) : (
                  <div
                    className="text-sm text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: renderContent(section.content) }}
                  />
                )}
              </SectionCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
