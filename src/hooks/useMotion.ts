import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/** Lit une media query et suit ses changements. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();

    // `change` suffit sur un navigateur classique ; `resize` couvre les
    // contextes où l'événement de media query n'est pas émis.
    list.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      list.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

type CountUpState = {
  /** Valeur à afficher. */
  display: number;
  /** true le temps d'une brève pulsation, quand la valeur change après le montage. */
  pulsing: boolean;
};

/**
 * Count-up joué une seule fois, au premier affichage d'une valeur.
 * Un changement ultérieur ne relance pas le comptage : il déclenche une pulsation.
 */
export function useCountUp(value: number, options?: { enabled?: boolean; durationMs?: number }): CountUpState {
  const enabled = options?.enabled !== false;
  const durationMs = options?.durationMs ?? 800;
  const reduced = usePrefersReducedMotion();

  const [display, setDisplay] = useState(enabled && !reduced ? 0 : value);
  const [pulsing, setPulsing] = useState(false);

  const hasRunRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const pulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || reduced) {
      setDisplay(value);
      hasRunRef.current = true;
      return;
    }

    // Changement après le premier comptage : pulsation, pas de re-count.
    if (hasRunRef.current) {
      setDisplay(value);
      setPulsing(true);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
      pulseTimerRef.current = setTimeout(() => setPulsing(false), durationMs);
      return;
    }

    // Tant que la donnée n'est pas arrivée, on n'a rien à compter.
    if (value === 0) {
      setDisplay(0);
      return;
    }

    hasRunRef.current = true;
    const start = performance.now();
    const from = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, enabled, reduced, durationMs]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  return { display, pulsing };
}

/**
 * true tant que l'élément est visible dans le viewport ET que l'onglet est au
 * premier plan. Sert à suspendre les boucles d'animation.
 */
export function useIsRenderable(ref: RefObject<HTMLElement | null>): boolean {
  const [visible, setVisible] = useState(true);
  const [foreground, setForeground] = useState(
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => setVisible(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const onVisibility = () => setForeground(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return visible && foreground;
}
