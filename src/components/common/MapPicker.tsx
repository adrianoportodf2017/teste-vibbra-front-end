import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../../types';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  value?: Location | null;
  onChange: (loc: Location) => void;
  className?: string;
};

// fallback inicial: São Paulo
const DEFAULT_CENTER: [number, number] = [-23.55052, -46.633308];
const DEFAULT_ZOOM = 12;

async function reverseGeocode(lat: number, lng: number) {
  // Nominatim (uso leve): https://nominatim.org/release-docs/latest/api/Reverse/
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error('Falha ao consultar endereço');
  const data = await res.json();
  const a = data?.address || {};
  // city/town/village podem variar
  const city = a.city || a.town || a.village || a.hamlet || '';
  const state = a.state || a.region || '';
  const postcode = (a.postcode || '').replace(/\D/g, '');
  const road = a.road || a.pedestrian || a.footway || a.neighbourhood || '';
  const house = a.house_number ? `, ${a.house_number}` : '';
  const suburb = a.suburb ? ` - ${a.suburb}` : '';
  const address = [road && `${road}${house}${suburb}`, a.city_district]
    .filter(Boolean)
    .join(' ');

  return {
    address: address || data?.display_name || '',
    city,
    state,
    zip_code: postcode ? Number(postcode) : 0,
  };
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange, className }: Props) {
  const [center, setCenter] = useState<[number, number]>(
    value ? [value.lat, value.lng] : DEFAULT_CENTER
  );
  const [marker, setMarker] = useState<[number, number] | null>(
    value ? [value.lat, value.lng] : null
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setCenter([value.lat, value.lng]);
      setMarker([value.lat, value.lng]);
    }
  }, [value?.lat, value?.lng]);

  async function pick(lat: number, lng: number) {
    setErr(null);
    setMarker([lat, lng]);
    setBusy(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      onChange({
        lat,
        lng,
        address: addr.address || '',
        city: addr.city || '',
        state: addr.state || '',
        zip_code: addr.zip_code || 0,
      });
    } catch (e: any) {
      setErr(e?.message || 'Não foi possível obter o endereço.');
      // ainda assim devolve lat/lng para o formulário
      onChange({
        lat, lng,
        address: value?.address || '',
        city: value?.city || '',
        state: value?.state || '',
        zip_code: value?.zip_code || 0,
      });
    } finally {
      setBusy(false);
    }
  }

  async function useMyLocation() {
    setErr(null);
    if (!('geolocation' in navigator)) {
      setErr('Seu navegador não suporta geolocalização.');
      return;
    }
    if (!window.isSecureContext) {
      setErr('Geolocalização requer HTTPS (ou localhost em desenvolvimento).');
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCenter([lat, lng]);
        await pick(lat, lng);
        setBusy(false);
      },
      (error) => {
        setBusy(false);
        const reason =
          error.code === 1
            ? 'Permissão negada. Libere a localização no navegador.'
            : error.code === 2
            ? 'Posição indisponível.'
            : error.code === 3
            ? 'Tempo esgotado.'
            : 'Falha ao obter localização.';
        setErr(reason);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const latlngText = useMemo(() => {
    if (!marker) return 'Lat: — | Lng: —';
    const [lat, lng] = marker;
    return `Lat: ${lat.toFixed(5)} | Lng: ${lng.toFixed(5)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marker?.[0], marker?.[1]]);

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-gray-900 text-white"
        >
          {busy && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          Usar minha localização
        </button>
        <span className="text-sm text-gray-600">{latlngText}</span>
        {err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-72 w-full rounded-xl overflow-hidden ring-1 ring-gray-200"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={pick} />
        {marker && <Marker position={marker} icon={markerIcon} />}
      </MapContainer>

      <p className="mt-2 text-xs text-gray-500">
        Clique no mapa para escolher o ponto. Tentaremos preencher o endereço automaticamente.
      </p>
    </div>
  );
}
