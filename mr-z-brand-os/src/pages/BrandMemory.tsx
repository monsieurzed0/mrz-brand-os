import { useState } from 'react';
import { BookOpen, Save, Edit3 } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { useStore } from '@/lib/useStore';
import { ASSETS } from '@/lib/constants';

export default function BrandMemory() {
  const { state, updateBrandMemory } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const saveEdit = (id: string) => {
    updateBrandMemory(id, { content: editContent });
    setEditingId(null);
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
          {state.brandMemory.map(section => (
            <SectionCard
              key={section.id}
              title={`${sectionIcons[section.title] || '◆'} ${section.title}`}
              headerRight={
                editingId === section.id ? (
                  <button onClick={() => saveEdit(section.id)} className="flex items-center gap-1 text-xs text-copper hover:text-copper-light transition">
                    <Save size={12} /> Sauvegarder
                  </button>
                ) : (
                  <button onClick={() => startEdit(section.id, section.content)} className="flex items-center gap-1 text-xs text-subtle hover:text-copper transition">
                    <Edit3 size={12} /> Modifier
                  </button>
                )
              }
            >
              {editingId === section.id ? (
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full bg-deep border border-exec/15 rounded-lg px-3 py-2 text-sm text-ivory focus:outline-none focus:border-copper/30 resize-none"
                />
              ) : (
                <p className="text-sm text-muted whitespace-pre-wrap leading-relaxed">{section.content}</p>
              )}
            </SectionCard>
          ))}
        </div>
      </div>
    </div>
  );
}
