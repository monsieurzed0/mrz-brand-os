import { useCallback, useEffect, useMemo, useState } from 'react';

export function useApiQuery<T>(queryFn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sécurité runtime : si une page passe `{}` au lieu de `[]`,
  // on évite le crash React qui provoque l'écran noir.
  const safeDeps = useMemo(() => (Array.isArray(deps) ? deps : []), [deps]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [queryFn]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const result = await queryFn();
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [queryFn, ...safeDeps]);

  return { data, loading, error, setData, refetch };
}
