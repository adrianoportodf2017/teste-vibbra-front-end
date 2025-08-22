import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Deal, DealType, UrgencyType, Photo, Location } from '../../../types';
import { dealsService } from '../../../services/api';
import MapPicker from '../../common/MapPicker';

const UFS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"] as const;
type FieldErrors = Record<string, string[]>;

function parseCurrencyToNumber(v: string): number {
  if (!v) return 0;
  const cleaned = v.replace(/[^\d.,]/g, '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
function numberToBRLString(n?: number) {
  if (!Number.isFinite(n as number)) return '';
  try { return (n as number).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  catch { return String(n ?? ''); }
}
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

// normaliza nomes comuns -> UF
function normalizeUF(input?: string | null): string | undefined {
  if (!input) return undefined;
  const s = input.trim().toUpperCase();
  if (s.length === 2 && (UFS as readonly string[]).includes(s)) return s;
  const map: Record<string, string> = {
    'ACRE':'AC','ALAGOAS':'AL','AMAPA':'AP','AMAPÁ':'AP','AMAZONAS':'AM','BAHIA':'BA','CEARA':'CE','CEARÁ':'CE',
    'DISTRITO FEDERAL':'DF','ESPIRITO SANTO':'ES','ESPÍRITO SANTO':'ES','GOIAS':'GO','GOIÁS':'GO','MARANHAO':'MA',
    'MARANHÃO':'MA','MATO GROSSO':'MT','MATO GROSSO DO SUL':'MS','MINAS GERAIS':'MG','PARA':'PA','PARÁ':'PA',
    'PARAIBA':'PB','PARAÍBA':'PB','PARANA':'PR','PARANÁ':'PR','PERNAMBUCO':'PE','PIAUI':'PI','PIAUÍ':'PI',
    'RIO DE JANEIRO':'RJ','RIO GRANDE DO NORTE':'RN','RIO GRANDE DO SUL':'RS','RONDONIA':'RO','RONDÔNIA':'RO',
    'RORAIMA':'RR','SANTA CATARINA':'SC','SAO PAULO':'SP','SÃO PAULO':'SP','SERGIPE':'SE','TOCANTINS':'TO',
  };
  return map[s] ?? undefined;
}
function onlyDigits(s?: string | number | null): string | undefined {
  if (s == null) return undefined;
  return String(s).replace(/\D/g, '');
}

export default function DealForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editingId = id ? Number(id) : undefined;
  const isEditing = Number.isFinite(editingId as number);

  const [loading, setLoading] = useState<boolean>(!!isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // principais
  const [type, setType] = useState<DealType>(1);
  const [valueStr, setValueStr] = useState('');
  const [description, setDescription] = useState('');
  const [tradeFor, setTradeFor] = useState('');

  // localização
  const [location, setLocation] = useState<Location | null>(null);
  const [manualAddress, setManualAddress] = useState(false); // <- toggle para digitar
  const uf = useMemo(() => location?.state ?? '', [location]);
  const cep = useMemo(() => location?.zip_code ?? '', [location]);

  // urgência
  const [urgencyType, setUrgencyType] = useState<UrgencyType>(1);
  const [limitDate, setLimitDate] = useState('');

  // fotos
  const [photos, setPhotos] = useState<Photo[]>([]);

  // carregar dados quando estiver editando
  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      try {
        setLoading(true);
        const res = await dealsService.getDealById(editingId!);
        const d = res.deal as Deal;

        setType(d.type);
        setValueStr(numberToBRLString(d.value));
        setDescription(d.description ?? '');
        setTradeFor(d.trade_for ?? '');
        const normUF = normalizeUF(d.location?.state) ?? '';
        setLocation(d.location ? {
          ...d.location,
          state: normUF,
          zip_code: onlyDigits(d.location.zip_code) ?? ''
        } as any : null);
        setUrgencyType(d.urgency?.type ?? 1);
        setLimitDate(d.urgency?.limit_date ?? '');
        setPhotos(d.photos ?? []);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar negociação para edição.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isEditing, editingId]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const arr = await Promise.all(Array.from(files).map(fileToDataURL));
    setPhotos((prev) => [...prev, ...arr.map((src) => ({ src }))]);
  }

  // helpers p/ atualizar campos da localização
  function setLoc<K extends keyof Location>(key: K, value: Location[K]) {
    setLocation((prev) => ({ ...(prev ?? { lat: 0, lng: 0, address: '', city: '', state: '', zip_code: '' } as any), [key]: value }));
  }
  function setUF(newUF: string) {
    setLoc('state', newUF as any);
  }
  function setCEP(newCEP: string) {
    setLoc('zip_code', (onlyDigits(newCEP) ?? '') as any);
  }

  function validateClient(): string | null {
    const value = parseCurrencyToNumber(valueStr);
    if ((type === 1 || type === 2) && value <= 0) return 'Informe um valor válido para Venda/Troca.';
    if (!description || description.trim().length < 6) return 'Descreva melhor sua negociação (mín. 6 caracteres).';

    // Se for manual, exija os campos básicos (lat/lng opcionais).
    if (manualAddress) {
      if (!location?.address?.trim()) return 'Informe o endereço.';
      if (!location?.city?.trim()) return 'Informe a cidade.';
      const normUF = normalizeUF(location?.state);
      if (!normUF) return 'Selecione a UF (ex.: SP, RJ).';
      const cepDigits = onlyDigits(location?.zip_code);
      if (!cepDigits  ) return 'Informe um CEP válido (8 dígitos).';
    } else {
      // modo mapa: esperamos pelo menos coordenadas
      if (!location?.lat || !location?.lng) return 'Escolha a localização no mapa ou ative a edição manual.';
      const normUF = normalizeUF(location?.state);
      if (!normUF) return 'Selecione a UF (ex.: SP, RJ).';
      const cepDigits = onlyDigits(location?.zip_code);
      if (!cepDigits ) return 'Informe um CEP válido (8 dígitos).';
    }

    if (urgencyType === 4 && !limitDate) return 'Defina a data limite para a urgência do tipo "Até uma data".';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const err = validateClient();
    if (err) return setError(err);

    const value = parseCurrencyToNumber(valueStr);
    const normUF = normalizeUF(location?.state)!;
    const cepDigits = onlyDigits(location?.zip_code)!;

    // lat/lng: permite vazio no manual; backend aceita nullable
    const locPayload: Location = {
      ...(location as Location),
      state: normUF,
      zip_code: Number(cepDigits),
    };
    if (manualAddress) {
      // se strings vazias/não numéricas, tira do payload
      if (locPayload.lat !== undefined && locPayload.lat !== null && isNaN(Number(locPayload.lat as any))) delete (locPayload as any).lat;
      if (locPayload.lng !== undefined && locPayload.lng !== null && isNaN(Number(locPayload.lng as any))) delete (locPayload as any).lng;
    }

    const payload: Deal = {
      type,
      value,
      description: description.trim(),
      trade_for: type === 2 ? (tradeFor || undefined) : undefined,
      location: locPayload,
      urgency: { type: urgencyType, ...(urgencyType === 4 ? { limit_date: limitDate } : {}) },
      photos,
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await dealsService.updateDeal(editingId!, payload);
       // navigate(`/deals/${editingId}`);
      } else {
        const res = await dealsService.createDeal(payload);
        const newId = (res as any)?.deal?.id ?? (res as any)?.id;
        if (!newId) throw new Error('Falha ao obter o ID da negociação criada.');
        //navigate(`/deals/${newId}`);
      }
    } catch (e: any) {
      const data = e?.response?.data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          setError(data.join('\n'));
        } else {
          setFieldErrors(data as FieldErrors);
          const flat = Object.values(data as FieldErrors).flat();
          if (flat.length) setError(flat[0]);
        }
      } else {
        setError(e?.message || (isEditing ? 'Erro ao atualizar negociação.' : 'Erro ao criar negociação.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="rounded-xl border p-4">Carregando dados...</div>;

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-sm ring-1 ring-gray-200 rounded-2xl p-4 grid gap-4 max-w-[720px]">
      {/* header */}
    {/* header */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <h2 className="text-lg font-semibold">
      {isEditing ? 'Editar Negociação' : 'Dados da negociação'}
    </h2>

    {isEditing && (
      <button
        type="button"
        onClick={async () => {
          if (!editingId) return;
          const ok = confirm('Tem certeza que deseja excluir esta negociação? Esta ação não pode ser desfeita.');
          if (!ok) return;
          try {
            // aproveita o mesmo estado de submit para desabilitar botões
            setSubmitting(true);
            await dealsService.deleteDeal(editingId);
            // redirecione para uma listagem ou home
            navigate('/deals/my-deals', { replace: true });
          } catch (e: any) {
            alert(e?.response?.data?.error || e?.message || 'Falha ao excluir a negociação.');
          } finally {
            setSubmitting(false);
          }
        }}
        disabled={submitting}
        className="text-sm rounded-xl border border-red-300 px-3 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
        title="Excluir negociação"
      >
        Excluir
      </button>
    )}


  <button
    type="submit"
    disabled={submitting}
    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-black text-white disabled:opacity-60"
  >
    {submitting && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {submitting ? (isEditing ? 'Atualizando...' : 'Salvando...') : (isEditing ? 'Atualizar' : 'Salvar')}
  </button>
</div>  </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {/* tipo + valor */}
      <div className="grid md:grid-cols-3 gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Tipo</span>
          <select
            className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
            value={type}
            onChange={(e) => setType(Number(e.target.value) as DealType)}
          >
            <option value={1}>Venda</option>
            <option value={2}>Troca</option>
            <option value={3}>Desejo</option>
          </select>
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm text-gray-600">Valor (R$)</span>
          <input
            className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
            placeholder="Ex.: 3.500,00"
            value={valueStr}
            onChange={(e) => setValueStr(e.target.value)}
          />
          {type === 3 && <span className="text-xs text-gray-500">Para “Desejo”, o valor pode ser 0.</span>}
        </label>
      </div>

      {/* descrição e trade_for */}
      <div className="grid md:grid-cols-2 gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-gray-600">Descrição</span>
          <input
            className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Fale sobre o item/necessidade"
          />
          {fieldErrors['description'] && <span className="text-xs text-red-600">{fieldErrors['description'][0]}</span>}
        </label>

        {type === 2 && (
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Troco por</span>
            <input
              className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
              value={tradeFor}
              onChange={(e) => setTradeFor(e.target.value)}
              placeholder="Ex.: notebook gamer, monitor 27''..."
            />
          </label>
        )}
      </div>

      {/* localização */}
      <fieldset className="rounded border border-gray-200 p-4 grid gap-3">
        <legend className="px-2 text-sm text-gray-700">Localização</legend>

        {/* Toggle manual */}
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={manualAddress}
            onChange={(e) => setManualAddress(e.target.checked)}
          />
          Editar endereço manualmente
        </label>

        {/* Mapa (opcional mesmo em manual, útil para pegar lat/lng) */}
        <MapPicker
          value={location}
          onChange={(loc) => {
            const normUF = normalizeUF(loc?.state) ?? '';
            setLocation(loc ? { ...loc, state: normUF, zip_code: onlyDigits(loc?.zip_code) ?? '' } as any : null);
          }}
          className={`w-full ${manualAddress ? 'opacity-60' : ''}`}
          disabled={manualAddress}
        />

        {/* Campos manuais */}
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Endereço</span>
            <input
              className="rounded border border-gray-300 p-2"
              value={location?.address ?? ''}
              onChange={(e) => setLoc('address', e.target.value as any)}
              placeholder="Rua, número, complemento"
              disabled={!manualAddress}
            />
            {fieldErrors['location.address'] && <span className="text-xs text-red-600">{fieldErrors['location.address'][0]}</span>}
          </label>

          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Cidade</span>
            <input
              className="rounded border border-gray-300 p-2"
              value={location?.city ?? ''}
              onChange={(e) => setLoc('city', e.target.value as any)}
              placeholder="Cidade"
              disabled={!manualAddress}
            />
            {fieldErrors['location.city'] && <span className="text-xs text-red-600">{fieldErrors['location.city'][0]}</span>}
          </label>

          <div className="grid grid-cols-[1fr_auto] gap-3 md:col-span-2">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">UF</span>
              <select
                className="rounded border border-gray-300 p-2"
                value={uf}
                onChange={(e) => setUF(e.target.value)}
                disabled={!manualAddress}
              >
                <option value="">UF</option>
                {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              {fieldErrors['location.state'] && <span className="text-xs text-red-600">{fieldErrors['location.state'][0]}</span>}
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-gray-600">CEP</span>
              <input
                className="rounded border border-gray-300 p-2"
                placeholder="00000000"
                inputMode="numeric"
                value={cep}
                onChange={(e) => setCEP(e.target.value)}
                maxLength={9}
                disabled={!manualAddress}
              />
              {fieldErrors['location.zip_code'] && <span className="text-xs text-red-600">{fieldErrors['location.zip_code'][0]}</span>}
            </label>
          </div>

          {/* lat/lng opcionais (ajudam despacho/entrega se você quiser forçar) */}
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Latitude (opcional)</span>
            <input
              type="number"
              className="rounded border border-gray-300 p-2"
              value={location?.lat ?? ''}
              onChange={(e) => setLoc('lat', e.target.value === '' ? ('' as any) : (Number(e.target.value) as any))}
              step="0.000001"
              disabled={!manualAddress}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-600">Longitude (opcional)</span>
            <input
              type="number"
              className="rounded border border-gray-300 p-2"
              value={location?.lng ?? ''}
              onChange={(e) => setLoc('lng', e.target.value === '' ? ('' as any) : (Number(e.target.value) as any))}
              step="0.000001"
              disabled={!manualAddress}
            />
          </label>
        </div>

        {/* Preview textual */}
        {location && (
          <div className="text-sm text-gray-700">
            <div><span className="font-medium">Endereço:</span> {location.address || '—'}</div>
            <div><span className="font-medium">Cidade/UF:</span> {location.city || '—'} / {location.state || '—'}</div>
            <div><span className="font-medium">CEP:</span> {location.zip_code || '—'}</div>
            <div><span className="font-medium">Lat/Lng:</span> {location.lat ?? '—'} / {location.lng ?? '—'}</div>
          </div>
        )}
      </fieldset>

      {/* urgência */}
      <fieldset className="rounded border border-gray-200 p-4 grid gap-4">
        <legend className="px-2 text-sm text-gray-700">Urgência</legend>
        <div className="grid md:grid-cols-2 gap-3">
          <select
            className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
            value={urgencyType}
            onChange={(e) => setUrgencyType(Number(e.target.value) as UrgencyType)}
          >
            <option value={1}>Baixa</option>
            <option value={2}>Média</option>
            <option value={3}>Alta</option>
            <option value={4}>Até uma data</option>
          </select>

          {urgencyType === 4 && (
            <input
              type="date"
              className="rounded border border-gray-300 focus:ring-2 focus:ring-black p-2"
              value={limitDate}
              onChange={(e) => setLimitDate(e.target.value)}
            />
          )}
        </div>
      </fieldset>

      {/* fotos */}
<fieldset className="rounded border border-gray-200 p-4 grid gap-4">
  <legend className="px-2 text-sm text-gray-700">Fotos</legend>

  <input
    type="file"
    accept="image/*"
    multiple
    onChange={(e) => handleFiles(e.target.files)}
    className="block text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-white hover:file:bg-black"
  />

  {photos.length > 0 && (
    <div className="flex flex-wrap gap-3">
      {photos.map((p, i) => (
        <div key={p.id ?? `new-${i}`} className="relative">
          <img
            src={p.src}
            alt={`foto-${i}`}
            className="w-24 h-24 object-cover rounded-xl ring-1 ring-gray-200"
          />
          <button
            type="button"
            onClick={() => {
              setPhotos((prev) => prev.filter((_, idx) => idx !== i));
            }}
            title="Remover"
            className="absolute -right-2 -top-2 rounded-full bg-black/80 text-white w-6 h-6 grid place-items-center text-xs shadow"
          >
            ×
          </button>
          {p.id && (
            <span className="absolute left-1 bottom-1 rounded bg-black/60 px-1 text-[10px] text-white">
              #{p.id}
            </span>
          )}
        </div>
      ))}
    </div>
  )}
</fieldset>
    </form>
  );
}
