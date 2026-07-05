import { Globe, ExternalLink, MessageCircle, Mail, Monitor, GraduationCap, Zap } from 'lucide-react';
import Topbar from '@/components/Topbar';
import SectionCard from '@/components/SectionCard';
import { SOCIAL_LINKS, CONTACT_LINKS, SITE_LINKS, CLIENT_LOGOS, ASSETS } from '@/lib/constants';

function SvgIcon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d={path} /></svg>;
}

const socialIconMap: Record<string, React.ReactNode> = {
  Facebook: <SvgIcon path="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  YouTube: <SvgIcon path="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" />,
  Instagram: <SvgIcon path="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />,
  LinkedIn: <SvgIcon path="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />,
  TikTok: <SvgIcon path="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.8.1V9a6.27 6.27 0 0 0-.8-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.2 8.2 0 0 0 3.76.92V6.69z" />,
  Behance: <SvgIcon path="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zM9.5 18H2V3h8.845c4.258 0 4.96 2.385 4.96 4.047 0 1.903-1.177 3.07-2.533 3.453C14.602 10.96 16 11.91 16 14.37c0 2.725-2.142 3.63-6.5 3.63zm-4.5-7h5c1.666 0 2.395-.835 2.395-2.17 0-1.397-.825-2.33-2.395-2.33H5v4.5zm0 5h5.5c1.778 0 2.664-.81 2.664-2.205 0-1.397-.886-2.295-2.664-2.295H5V16z" />,
};

const siteIconMap: Record<string, React.ReactNode> = {
  'Site principal': <Monitor size={22} />,
  'SIGNAL™ by Mr Z': <Zap size={22} />,
  'PROSKILLS FR': <GraduationCap size={22} />,
};

function MediaCard({ icon, name, handle, description, url, featured }: { 
  icon: React.ReactNode; 
  name: string; 
  handle: string; 
  description: string; 
  url: string;
  featured?: boolean;
}) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`group rounded-xl border bg-carbon p-5 hover:border-copper/30 transition-all duration-300 flex items-start gap-4 ${
        featured ? 'border-copper/20 bg-copper/5' : 'border-exec/10'
      }`}
    >
      <div className={`p-3 rounded-xl transition ${
        featured 
          ? 'bg-copper/20 text-copper' 
          : 'bg-exec/10 text-exec group-hover:bg-copper/15 group-hover:text-copper'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold transition ${
          featured ? 'text-copper-light' : 'text-ivory group-hover:text-copper-light'
        }`}>{name}</p>
        <p className="text-xs text-copper font-semibold mt-0.5">{handle}</p>
        <p className="text-xs text-subtle mt-1.5 leading-relaxed">{description}</p>
      </div>
      <ExternalLink size={14} className="text-subtle group-hover:text-copper transition shrink-0 mt-1" />
    </a>
  );
}

export default function MediaCenter() {
  return (
    <div>
      <Topbar title="Media & Ecosystem Center" />
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Hero */}
        <div className="relative rounded-xl border border-exec/15 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-[0.04]" style={{ backgroundImage: `url(${ASSETS.heroBg})` }} />
          <div className="relative p-6 flex items-center gap-6">
            <img src={ASSETS.founderPhoto} alt="Mr Z" className="w-16 h-16 rounded-full object-cover border-2 border-copper/40 shadow-premium" />
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <Globe size={20} className="text-copper" />
                <h2 className="text-xl font-bold text-ivory">Écosystème digital</h2>
              </div>
              <p className="text-sm text-subtle">Hub centralisé de la présence en ligne Mr Z Brand</p>
            </div>
            <div className="flex gap-4 items-center">
              <img src={ASSETS.logo} alt="Mr Z Brand" className="h-10 opacity-60 hover:opacity-100 transition" />
              <img src={ASSETS.signalLogo} alt="SIGNAL™ by Mr Z" className="h-10 opacity-50 hover:opacity-100 transition" />
              <img src={ASSETS.proskillsLogo} alt="PROSKILLS FR" className="h-10 opacity-50 hover:opacity-100 transition" />
            </div>
          </div>
        </div>

        {/* Sites & Platforms - Featured section */}
        <SectionCard title="Sites & plateformes" subtitle="Propriétés web Mr Z Brand">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {SITE_LINKS.map(link => (
              <MediaCard
                key={link.name}
                icon={siteIconMap[link.name] || <Monitor size={22} />}
                name={link.name}
                handle={link.handle}
                description={link.description}
                url={link.url}
                featured={link.name === 'SIGNAL™ by Mr Z' || link.name === 'Site principal'}
              />
            ))}
          </div>
        </SectionCard>

        {/* Social Networks */}
        <SectionCard title="Réseaux sociaux" subtitle="Présence sur les plateformes majeures">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOCIAL_LINKS.map(link => (
              <MediaCard
                key={link.name}
                icon={socialIconMap[link.name] || <Globe size={20} />}
                name={link.name}
                handle={link.handle}
                description={link.description}
                url={link.url}
              />
            ))}
          </div>
        </SectionCard>

        {/* Contact */}
        <SectionCard title="Contact direct" subtitle="Canaux de communication prioritaires">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTACT_LINKS.map(link => (
              <MediaCard
                key={link.name}
                icon={link.name === 'WhatsApp' ? <MessageCircle size={22} /> : <Mail size={22} />}
                name={link.name}
                handle={link.handle}
                description={link.description}
                url={link.url}
                featured={link.name === 'WhatsApp'}
              />
            ))}
          </div>
        </SectionCard>

        {/* Portfolio & visibility */}
        <SectionCard title="Portfolio & visibilité" subtitle="Références clients et projets">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CLIENT_LOGOS.map(c => (
              <div key={c.name} className="flex flex-col items-center justify-center p-4 rounded-xl bg-deep border border-exec/8 hover:border-copper/20 transition group">
                <img src={c.url} alt={c.name} className="max-h-10 max-w-full object-contain opacity-60 group-hover:opacity-100 transition" />
                <p className="text-[10px] text-subtle mt-3 text-center font-medium">{c.name}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
