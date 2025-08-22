// src/components/home/list/OfferCard.tsx
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { DealType } from '../../../types';

function typeLabel(t?: DealType) {
  switch (t) {
    case 1: return 'Venda';
    case 2: return 'Troca';
    case 3: return 'Desejo';
    default: return 'Negociação';
  }
}

type Props = {
  id: number;
  title?: string;
  price?: number;
  type?: DealType;
  photo?: string;
  distance?: string;
  /** opcional: conteúdo extra (ex.: botões/flags) */
  children?: ReactNode;
};

export default function OfferCard({
  id,
  title = 'Oferta',
  price,
  type = 1,
  photo,
  distance,
  children,
}: Props) {
  const img = photo || `https://picsum.photos/seed/${id}/640/480`;

  return (
    <Link
      to={`/deals/${id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={img}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
          {typeLabel(type)}
        </div>
        {distance && (
          <div className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-0.5 text-xs font-medium text-gray-700 backdrop-blur dark:bg-gray-900/70 dark:text-gray-200">
            {distance}
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <div className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </div>

        {children ? (
          <div>{children}</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
              {price != null
                ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—'}
            </div>
            <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300">
              Ver detalhes →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
