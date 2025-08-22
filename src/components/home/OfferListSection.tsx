import { OfferGrid } from '.';
import type { Photo } from '../../types';
import type { UiDeal } from '../../hooks/useDealsSearch';
import { kmFormat } from '../../utils/geo';

type Props = {
  status: 'idle'|'loading'|'success'|'error';
  items: UiDeal[];
  error?: string | null;
  onRetry: () => void;
};

export function OfferListSection({ status, items, error, onRetry }: Props) {
  if (status === 'loading') {
    return <OfferGrid loading skeletonCount={9} />;
  }

  if (status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700
                      dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
        {error}
        <button
          onClick={onRetry}
          className="ml-3 inline-flex rounded border border-red-300 px-2 py-1 text-xs hover:bg-red-100
                     dark:border-red-700 dark:hover:bg-red-900/40"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (status === 'success' && items.length === 0) {
    return (
      <div className="grid place-items-center rounded-xl border bg-white p-10 text-center
                      text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <div className="mb-2 text-lg font-medium">Nenhuma oferta encontrada</div>
        <p className="text-sm">Ajuste os filtros ou tente outro termo de busca.</p>
      </div>
    );
  }

  return (
    <OfferGrid
      items={items.map((d) => ({
        id: d._id,
        title: d.description,
        price: d.value,
        type: d.type,
        photo: (d.photos as Photo[])?.[0]?.src,
        distance: kmFormat(d._distanceKm),
      }))}
    />
  );
}
