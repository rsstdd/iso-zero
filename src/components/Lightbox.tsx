import { useEffect, useState } from "react";

type Photo = { src: string; alt: string; caption?: string };

/**
 * The one React island. Load it with client:visible so it costs nothing until
 * a gallery scrolls into view.
 *
 * Note what is absent: no useCallback, no useMemo, no React.memo. The React
 * Compiler handles memoization, so the only hooks here are the two that carry
 * real semantics (state, and a subscription that needs cleanup).
 */
export default function Lightbox({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = () => setIndex(null);
  const move = (delta: number) =>
    setIndex((i) => (i === null ? null : (i + delta + photos.length) % photos.length));

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Bound to a local rather than indexed twice, because noUncheckedIndexedAccess
  // types photos[index] as possibly undefined and narrowing does not survive a
  // second access.
  const active = index === null ? undefined : photos[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {photos.map((photo, i) => (
          <li key={photo.src}>
            <button type="button" onClick={() => setIndex(i)} className="block w-full">
              <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full" />
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        >
          <img src={active.src} alt={active.alt} className="max-h-[90vh] max-w-[90vw]" />
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 p-4 text-white"
          >
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}
