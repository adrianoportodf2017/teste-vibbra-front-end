// src/pages/home/HomePage.tsx
import { GeoStatus } from '../../components/home/GeoStatus';
import { FiltersBar } from '../../components/home/FiltersBar';
import { SortSelect } from '../../components/home/SortSelect';
import { OfferListSection } from '../../components/home/OfferListSection';
import { useDealsSearch } from '../../hooks/useDealsSearch';

export default function HomePage() {
  const {
    status, error, items,
    term, setTerm, type, setType, valueStart, setValueStart, valueEnd, setValueEnd,
    order, setOrder, geoStatus, fetchDeals
  } = useDealsSearch();

  return (
    <div className="space-y-6">
      {/* Título + geostatus + ordenação */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ofertas próximas</h1>
          <GeoStatus geoStatus={geoStatus} />
        </div>
        <div className="flex gap-2">
          <SortSelect value={order} onChange={setOrder} />
        </div>
      </div>

      {/* Filtros */}
      <FiltersBar
        term={term} setTerm={setTerm}
        type={type} setType={setType}
        valueStart={valueStart} setValueStart={setValueStart}
        valueEnd={valueEnd} setValueEnd={setValueEnd}
        onApply={() => fetchDeals(true)}
      />

      {/* Conteúdo */}
      <OfferListSection
        status={status}
        items={items}
        error={error}
        onRetry={() => fetchDeals(true)}
      />
    </div>
  );
}
