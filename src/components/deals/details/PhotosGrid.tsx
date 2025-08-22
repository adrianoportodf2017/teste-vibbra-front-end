import { useMemo, useState } from "react";

type Photo = { src: string };

type PhotosGridProps = {
  photos?: Photo[];
  loading?: boolean;
  className?: string;
};

export default function PhotosGrid({ photos = [], loading = false, className = "" }: PhotosGridProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const hasPhotos = (photos?.length ?? 0) > 0;

  const grid = useMemo(() => {
    // Até 1 → ocupa tudo; 2+ → layout masonry simples
    if (!hasPhotos) return [];
    return photos;
  }, [photos, hasPhotos]);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    );
  }

  if (!hasPhotos) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-sm text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Nenhuma foto enviada para esta negociação.
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {grid.map((p, idx) => (
          <button
            key={`${p.src}-${idx}`}
            type="button"
            onClick={() => setOpenIdx(idx)}
            className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
              idx === 0 && grid.length > 1 ? "sm:col-span-2 lg:col-span-2" : ""
            }`}
            aria-label={`Abrir foto ${idx + 1} em tela cheia`}
          >
            <img
              src={p.src}
              alt={`Foto ${idx + 1} da negociação`}
              className="aspect-video w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/fallback-${idx}/800/450`;
              }}
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute inset-0 bg-black/10" />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox / Modal simples */}
      {openIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpenIdx(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[openIdx].src}
              alt={`Foto ampliada ${openIdx + 1}`}
              className="max-h-[90vh] w-full rounded-xl object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/fallback-full-${openIdx}/1200/800`;
              }}
            />

            {/* Controles */}
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-medium shadow hover:bg-white"
              onClick={() => setOpenIdx(null)}
            >
              Fechar
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold shadow hover:bg-white"
                  onClick={() => setOpenIdx((i) => (i! - 1 + photos.length) % photos.length)}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold shadow hover:bg-white"
                  onClick={() => setOpenIdx((i) => (i! + 1) % photos.length)}
                  aria-label="Próxima foto"
                >
                  ›
                </button>

                <div className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-white/90">
                  {openIdx + 1} / {photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
