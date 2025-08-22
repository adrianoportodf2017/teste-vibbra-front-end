// src/hooks/useDealsSearch.ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { dealsService } from '../services/api';
import type { Deal, DealSearchFilters, DealType } from '../types';
import { haversineKm } from '../utils/geo';

type Status = 'idle' | 'loading' | 'success' | 'error';
type GeoStatus = 'idle' | 'asking' | 'denied' | 'ok';

export type UiDeal = Deal & {
  _id: number;
  _distanceKm?: number;
};

export function useDealsSearch() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  // filtros/estado de UI
  const [term, setTerm] = useState('');
  const [type, setType] = useState<DealType | ''>('');
  const [valueStart, setValueStart] = useState<string>('');
  const [valueEnd, setValueEnd] = useState<string>('');
  const [order, setOrder] = useState<'nearby' | 'priceAsc' | 'priceDesc'>('nearby');

  // localização
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');

  const [items, setItems] = useState<UiDeal[]>([]);
  const firstLoadRef = useRef(true);

async function fetchDeals(applyGeo = true, coords?: { lat: number; lng: number }) {
  setStatus('loading');
  setError(null);
  try {
    const pos = coords ?? userPos; // <- usa coords passadas ou o estado
    const filters: DealSearchFilters = {
      term: term || undefined,
      type: (type as DealType) || undefined,
      value_start: valueStart ? Number(valueStart) : undefined,
      value_end: valueEnd ? Number(valueEnd) : undefined,
      ...(applyGeo && pos ? { lat: pos.lat, lng: pos.lng } : {}),
    };

    const res = await dealsService.searchDeals(filters);
    const flat: UiDeal[] = (res || []).map((wrap, idx) => {
      const deal = wrap.deal as Deal;
      const _id = deal.id ?? idx + 1;
      const _distanceKm =
        pos && deal.location
          ? haversineKm(pos, { lat: deal.location.lat, lng: deal.location.lng })
          : undefined;
      return { ...deal, _id, _distanceKm };
    });
    setItems(flat);
    setStatus('success');
  } catch (e: any) {
    setStatus('error');
    setError(e?.message ?? 'Falha ao carregar ofertas.');
  }
}

  // 1ª carga com geolocalização (prioridade por proximidade – requisito da Home)
  useEffect(() => {
    if (!firstLoadRef.current) return;
    firstLoadRef.current = false;

    if (!('geolocation' in navigator)) {
      fetchDeals(false);
      return;
    }

    setGeoStatus('asking');
   navigator.geolocation.getCurrentPosition(
  (pos) => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setUserPos(coords);
    setGeoStatus('ok');
    fetchDeals(true, coords); // <- usa as coords imediatamente
  },
  () => {
    setGeoStatus('denied');
    fetchDeals(false);
  },
  { enableHighAccuracy: false, maximumAge: 300000, timeout: 8000 }
);
  }, []);

  const ordered = useMemo(() => {
    const clone = [...items];
    switch (order) {
      case 'nearby':
        return clone.sort((a, b) => (a._distanceKm ?? Infinity) - (b._distanceKm ?? Infinity));
      case 'priceAsc':
        return clone.sort((a, b) => a.value - b.value);
      case 'priceDesc':
        return clone.sort((a, b) => b.value - a.value);
      default:
        return clone;
    }
  }, [items, order]);

  // API pública do hook
  return {
    // dados
    status, error, items: ordered,
    // filtros
    term, setTerm, type, setType, valueStart, setValueStart, valueEnd, setValueEnd,
    order, setOrder,
    // geo
    geoStatus,
    // ações
    fetchDeals,
  };
}
