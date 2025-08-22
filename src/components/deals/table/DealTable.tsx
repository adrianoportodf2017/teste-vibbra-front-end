import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dealsService } from '../../../services/api';
import type { Deal, Bid, Message } from '../../../types';

type MyOfferItem = { deal: Deal; bid?: Bid; last_message?: Message; };

function formatMoney(v?: number) {
  if (v == null) return '—';
  try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v); }
  catch { return String(v); }
}
function dealTypeLabel(t: Deal['type']) { return t===1?'Venda':t===2?'Troca':t===3?'Desejo':'—'; }
function urgencyLabel(u?: number) { return u===1?'Baixa':u===2?'Média':u===3?'Alta':u===4?'Até uma data':'—'; }

function TypeBadge({ type }: { type: Deal['type'] }) {
  const map = { 1: 'bg-green-100 text-green-700 ring-green-200', 2: 'bg-blue-100 text-blue-700 ring-blue-200', 3: 'bg-gray-100 text-gray-700 ring-gray-200' } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${map[type]}`}>
      {dealTypeLabel(type)}
    </span>
  );
}

export default function DealTable() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'mine'|'offers'>('mine');

  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const [errorMine, setErrorMine] = useState<string | null>(null);
  const [errorOffers, setErrorOffers] = useState<string | null>(null);

  const [mine, setMine] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<MyOfferItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingMine(true); setErrorMine(null);
        const res = await dealsService.getMyDeals();
        setMine(res?.deals ?? []);
      } catch (e: any) {
        setErrorMine(e?.message || 'Falha ao carregar suas negociações.');
      } finally { setLoadingMine(false); }
    })();
    (async () => {
      try {
        setLoadingOffers(true); setErrorOffers(null);
        const res = await dealsService.getMyOfferDeals();
        setOffers(res?.items ?? []);
      } catch (e: any) {
        setErrorOffers(e?.message || 'Falha ao carregar negociações com suas ofertas.');
      } finally { setLoadingOffers(false); }
    })();
  }, []);

  const mineSorted = useMemo(() => [...mine].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)), [mine]);
  const offersSorted = useMemo(() => [...offers].sort((a, b) => (b.deal.id ?? 0) - (a.deal.id ?? 0)), [offers]);

  return (
    <div className="grid gap-4">
      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 w-fit">
        <button onClick={() => setTab('mine')}
          className={`px-3 py-2 text-sm rounded-lg ${tab==='mine' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          Minhas negociações
        </button>
        <button onClick={() => setTab('offers')}
          className={`px-3 py-2 text-sm rounded-lg ${tab==='offers' ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
          Minhas ofertas
        </button>
      </div>

      {tab === 'mine' ? (
        <section className="bg-transparent">
          <header className="px-1 py-1"><h3 className="font-medium">Todas as negociações que você criou</h3></header>

          {loadingMine ? (
            <CardSkeletonGrid />
          ) : errorMine ? (
            <ErrorBox msg={errorMine} />
          ) : mineSorted.length === 0 ? (
            <EmptyState
              title="Você ainda não criou negociações"
              subtitle="Crie sua primeira negociação e comece a receber ofertas."
              actionLabel="Criar negociação"
              onAction={() => navigate('/deals/create')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mineSorted.map((d) => (
                <DealCard
                  key={d.id}
                  deal={d}
                  onOpen={() => d.id && navigate(`/deals/${d.id}`)}
                  onEdit={() => d.id && navigate(`/deals/create/${d.id}`)} // reusa a página de criação em modo edição
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="bg-transparent">
          <header className="px-1 py-1"><h3 className="font-medium">Negociações onde você fez oferta ou enviou mensagem</h3></header>

          {loadingOffers ? (
            <CardSkeletonGrid />
          ) : errorOffers ? (
            <ErrorBox msg={errorOffers} />
          ) : offersSorted.length === 0 ? (
            <EmptyState
              title="Nenhuma oferta enviada ainda"
              subtitle="Participe de negociações existentes enviando mensagens ou ofertas."
              actionLabel="Explorar negociações"
              onAction={() => navigate('/')}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offersSorted.map((it) => (
                <DealCard
                  key={it.deal.id}
                  deal={it.deal}
                  // aqui não exibimos "Editar", pois não é meu anúncio
                  onOpen={() => it.deal.id && navigate(`/deals/${it.deal.id}`)}
                  hideEdit
                  // info extra no footer (minha oferta/status)
                  extraFooter={
                    <div className="text-xs text-gray-600">
                      {it.bid
                        ? (it.bid.accepted
                            ? <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 ring-1 ring-green-200 text-green-700">Oferta aceita</span>
                            : <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 ring-1 ring-yellow-200 text-yellow-800">Oferta pendente</span>)
                        : <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 ring-1 ring-gray-200 text-gray-700">Sem oferta</span>}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** ---------- UI auxiliares ---------- */

function DealCard({
  deal,
  onOpen,
  onEdit,
  hideEdit = false,
  extraFooter,
}: {
  deal: Deal;
  onOpen: () => void;
  onEdit?: () => void;
  hideEdit?: boolean;
  extraFooter?: React.ReactNode;
}) {
  const thumb = deal.photos?.[0]?.src || 'https://picsum.photos/seed/placeholder/640/400';

  return (
    <div className="group rounded-2xl ring-1 ring-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
        <img
          src={thumb}
          alt={deal.description}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <TypeBadge type={deal.type} />
          {deal.urgency?.type ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 bg-gray-900/80 text-white">
              {urgencyLabel(deal.urgency.type)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-4 grid gap-3">
        <div className="grid gap-1">
          <h4 className="font-semibold line-clamp-2">{deal.description}</h4>
          <div className="text-sm text-gray-600">
            {deal.location?.city} / {deal.location?.state}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{formatMoney(deal.value)}</div>
          <div className="text-xs text-gray-500">ID #{deal.id}</div>
        </div>

        {extraFooter}

        <div className="mt-1 flex items-center justify-between gap-2">
          <button
            onClick={onOpen}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
          >
            Abrir
          </button>

          {!hideEdit && onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-50"
              title="Editar produto"
            >
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CardSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl ring-1 ring-gray-200 bg-white overflow-hidden">
          <div className="h-40 bg-gray-100 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-gray-100 animate-pulse rounded" />
            <div className="h-8 w-28 bg-gray-100 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return <div className="p-4 text-sm text-red-700 bg-red-50 border-t border-red-200 rounded-xl">{msg}</div>;
}

function EmptyState({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="p-8 text-center rounded-2xl ring-1 ring-gray-200 bg-white">
      <h4 className="text-lg font-medium">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      <button
        onClick={onAction}
        className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-gray-900 text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}
