/**
 * Champ cuivré de fond — section 6.4.
 * Trois couches fixes derrière le contenu, jamais interactives.
 * Aucune information n'est portée par cette couche : elle est purement
 * atmosphérique et disparaît sous `prefers-reduced-motion` sans rien coûter.
 */
export default function AmbientField() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* 1 — orbes cuivrées en dérive lente */}
      <div className="absolute -top-1/4 -left-[10%] w-[55vw] h-[55vw] rounded-full bg-copper/[0.07] blur-[100px] mz-orb-a" />
      <div className="absolute top-1/3 -right-[15%] w-[45vw] h-[45vw] rounded-full bg-copper-light/[0.05] blur-[100px] mz-orb-b" />

      {/* 2 — grille en perspective, fuyant vers le bas */}
      <div className="absolute inset-x-0 bottom-0 h-[65%] mz-grid" />

      {/* 3 — grain fixe, immobile */}
      <div className="absolute inset-0 opacity-[0.035] mz-grain" />
    </div>
  );
}
