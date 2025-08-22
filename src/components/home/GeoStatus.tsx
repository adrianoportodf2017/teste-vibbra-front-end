 
export function GeoStatus({ geoStatus }: { geoStatus: 'idle'|'asking'|'denied'|'ok' }) {
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {geoStatus === 'ok' && 'Usando sua localização para ordenar por proximidade.'}
      {geoStatus === 'denied' && 'Sem acesso à localização. Mostrando todas as ofertas.'}
      {geoStatus === 'asking' && 'Pedindo permissão de localização...'}
      {geoStatus === 'idle' && 'Listando ofertas.'}
    </p>
  );
}
