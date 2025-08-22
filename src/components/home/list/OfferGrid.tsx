// src/components/home/list/OfferGrid.tsx
import OfferCard from './OfferCard';

type Item = {
  id: number;
  title: string;
  price: number;
  type: 1 | 2 | 3;
  photo?: string;
  distance?: string;
};

export default function OfferGrid({
  items,
  loading = false,
  skeletonCount = 6,
}: {
  items?: Item[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((it) => (
        <OfferCard key={it.id} {...it} />
      ))}
    </div>
  );
}
