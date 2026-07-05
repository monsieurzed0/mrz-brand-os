import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';

function formatDoualaTime(): { date: string; time: string } {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    timeZone: 'Africa/Douala', 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short',
  };
  const timeOptions: Intl.DateTimeFormatOptions = { 
    timeZone: 'Africa/Douala', 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  };
  
  const dateParts = new Intl.DateTimeFormat('fr-FR', options).format(now);
  const timeParts = new Intl.DateTimeFormat('fr-FR', timeOptions).format(now);
  
  // Capitalize first letter of day
  const formattedDate = dateParts.charAt(0).toUpperCase() + dateParts.slice(1);
  
  return { date: formattedDate, time: timeParts };
}

export default function SystemClock() {
  const [clock, setClock] = useState(formatDoualaTime());

  useEffect(() => {
    const interval = setInterval(() => setClock(formatDoualaTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-carbon/40 border border-exec/8">
      <Clock size={13} className="text-copper" />
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-ivory">{clock.time}</span>
        <span className="text-[10px] text-subtle">·</span>
        <span className="text-xs text-muted">{clock.date}</span>
      </div>
      <div className="flex items-center gap-0.5 text-[9px] text-subtle/60">
        <MapPin size={9} />
        <span>Douala</span>
      </div>
    </div>
  );
}
