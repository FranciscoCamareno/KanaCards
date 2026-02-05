import React, { useEffect, useMemo, useRef, useState } from 'react';

type StrokeOrderViewerProps = {
  character: string;
};

const getFirstCodePoint = (s: string): number | null => {
  const first = Array.from(s)[0];
  if (!first) return null;
  return first.codePointAt(0) ?? null;
};

const isKana = (codePoint: number): boolean => {
  // Hiragana: 3040–309F, Katakana: 30A0–30FF, Katakana Phonetic Extensions: 31F0–31FF
  return (
    (codePoint >= 0x3040 && codePoint <= 0x309f) ||
    (codePoint >= 0x30a0 && codePoint <= 0x30ff) ||
    (codePoint >= 0x31f0 && codePoint <= 0x31ff)
  );
};

const StrokeOrderViewer: React.FC<StrokeOrderViewerProps> = ({ character }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const codePoint = useMemo(() => getFirstCodePoint(character), [character]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    setError(null);

    if (!codePoint) {
      setError('No character provided.');
      return;
    }

    const abortController = new AbortController();
    let restartTimeout: number | undefined;

    const scheduleRestart = (svgRoot: SVGElement) => {
      const paths = Array.from(svgRoot.querySelectorAll('path[clip-path]'));
      const defaultTSeconds = 0.8;

      let maxEndSeconds = 0;
      for (const p of paths) {
        const styleAttr = p.getAttribute('style') || '';
        const dMatch = styleAttr.match(/--d:\s*([0-9.]+)s/);
        const tMatch = styleAttr.match(/--t:\s*([0-9.]+)s/);
        const d = dMatch ? Number(dMatch[1]) : 0;
        const t = tMatch ? Number(tMatch[1]) : defaultTSeconds;
        const end = d + t;
        if (end > maxEndSeconds) maxEndSeconds = end;
      }

      const pauseMs = 1500;
      const waitMs = Math.max(0, Math.round(maxEndSeconds * 1000)) + pauseMs;

      restartTimeout = window.setTimeout(() => {
        if (!containerRef.current) return;
        // Re-injecting the same SVG restarts the CSS keyframe animations.
        containerRef.current.innerHTML = svgRoot.outerHTML;
        const nextSvg = containerRef.current.querySelector('svg');
        if (nextSvg) scheduleRestart(nextSvg);
      }, waitMs);
    };

    const load = async () => {
      setIsLoading(true);
      try {
        // animCJK initialization: we load the pre-animated SVG directly from the official repository.
        const fileName = `${codePoint}.svg`;
        const base = 'https://raw.githubusercontent.com/parsimonhi/animCJK/master';

        const candidates = isKana(codePoint)
          ? [`${base}/svgsJaKana/${fileName}`, `${base}/svgsJa/${fileName}`]
          : [`${base}/svgsJa/${fileName}`, `${base}/svgsJaKana/${fileName}`];

        let svgText: string | null = null;
        for (const url of candidates) {
          const res = await fetch(url, { signal: abortController.signal });
          if (res.ok) {
            svgText = await res.text();
            break;
          }
        }

        if (!svgText) {
          setError('Stroke order diagram not found for this character.');
          return;
        }

        container.innerHTML = svgText;

        const svg = container.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.maxWidth = '360px';
          svg.style.maxHeight = '360px';
          svg.style.display = 'block';
          svg.style.margin = '0 auto';

          // Loop control: schedule a restart after the last stroke finishes.
          scheduleRestart(svg);
        }
      } catch (e) {
        if (!abortController.signal.aborted) {
          setError('Failed to load stroke order diagram.');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      // Cleanup: abort fetch + remove injected SVG when unmounting or switching characters.
      abortController.abort();
      if (restartTimeout) window.clearTimeout(restartTimeout);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [codePoint]);

  return (
    <div className="w-full">
      {isLoading && (
        <div className="text-center text-slate-400 text-sm font-semibold">Loading…</div>
      )}
      {error && (
        <div className="text-center text-rose-600 text-sm font-semibold">{error}</div>
      )}
      <div ref={containerRef} className="w-full" />
    </div>
  );
};

export default StrokeOrderViewer;
