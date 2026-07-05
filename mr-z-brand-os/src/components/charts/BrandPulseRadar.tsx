interface RadarProps {
  data: { label: string; value: number }[];
}

export default function BrandPulseRadar({ data }: RadarProps) {
  const cx = 120, cy = 120, r = 85;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;

  const points = data.map((d, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const val = (d.value / 100) * r;
    return { x: cx + val * Math.cos(angle), y: cy + val * Math.sin(angle) };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 240 240" className="w-full h-full">
      {/* Background glow */}
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D67A2C" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#D67A2C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r + 10} fill="url(#radarGlow)" />
      
      {/* Grid polygons */}
      {gridLevels.map(level => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const dist = level * r;
            return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
          }).join(' ')}
          fill="none"
          stroke="#7A6F67"
          strokeWidth="0.5"
          opacity={0.2 + level * 0.1}
        />
      ))}
      
      {/* Axes */}
      {data.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="#7A6F67"
            strokeWidth="0.5"
            opacity={0.15}
          />
        );
      })}
      
      {/* Data area fill */}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="#D67A2C"
        fillOpacity={0.12}
      />
      
      {/* Data area stroke */}
      <polygon
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
        fill="none"
        stroke="#D67A2C"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          {/* Outer glow */}
          <circle cx={p.x} cy={p.y} r="6" fill="#D67A2C" fillOpacity="0.2" />
          {/* Inner point */}
          <circle cx={p.x} cy={p.y} r="3.5" fill="#EF9F27" stroke="#D67A2C" strokeWidth="1" />
        </g>
      ))}
      
      {/* Labels */}
      {data.map((d, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const lx = cx + (r + 22) * Math.cos(angle);
        const ly = cy + (r + 22) * Math.sin(angle);
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[9px] fill-muted font-semibold"
            style={{ fontFamily: 'Raleway, sans-serif' }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
