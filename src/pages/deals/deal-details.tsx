import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  DealHeader,
  PhotosGrid,
  DealTabs,
  MessagesList,
  ConversationsList,
   DeliveryPanel,
} from '../../components/deals';
import { dealsService } from '../../services/api';
import type { Deal, Message, Bid, Delivery, ConversationItem, TabKey } from '../../types';
import { getCurrentUserId } from '../../utils/auth';
 
type Status = 'idle' | 'loading' | 'success' | 'error';

export default function DealDetailsPage() {
  // garante que o ID atual é number (evita bug de comparação)
  const currentUserId = useMemo<number | null>(() => {
    const id = getCurrentUserId();
    return id != null ? Number(id) : null;
  }, []);

  if (currentUserId == null) {
    return <div className="p-4 text-sm text-red-600">Sessão expirada. Faça login novamente.</div>;
  }

  const { id } = useParams<{ id: string }>();
  const dealId = Number(id);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const [deal, setDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('details');

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [bids, setBids] = useState<Bid[] | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  // loaders específicos
  const [subLoading, setSubLoading] = useState(false); // para mensagens/bids/delivery
  const [loadingConvs, setLoadingConvs] = useState(false);

  // chat
  const [peerId, setPeerId] = useState<number | null>(null);
  const [convs, setConvs] = useState<ConversationItem[]>([]);

  // === 1) Carga principal da negociação
  useEffect(() => {
    if (!dealId) return;
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError(null);
      try {
        const res = await dealsService.getDealById(dealId);
        if (cancelled) return;
        setDeal(res.deal as Deal);
        setStatus('success');
      } catch (e: any) {
        if (cancelled) return;
        setStatus('error');
        setError(e?.message ?? 'Falha ao carregar negociação.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dealId]);

  const ownerId = useMemo<number | null>(() => {
    if (!deal) return null;
    const id = (deal as any).user_id ?? (deal as any).user?.id ?? null;
    return id != null ? Number(id) : null;
  }, [deal]);

  const isOwner = useMemo(() => {
    if (ownerId == null || currentUserId == null) return false;
    return Number(ownerId) === Number(currentUserId);
  }, [ownerId, currentUserId]);

  // === 3) Quando não é dono, conversa é com o dono da negociação
  useEffect(() => {
    if (!deal) return;
    if (!isOwner) setPeerId(Number((deal as any).user_id));
  }, [deal, isOwner]);


  // === 4) Carregar conversas (apenas dono)
  const refreshConversations = useCallback(async () => {
    if (!dealId || !isOwner) return;
    setLoadingConvs(true);
    try {
      const raw = await dealsService.getConversations(dealId);
      // aceita tanto { items: [...] } quanto um array direto
      const items: ConversationItem[] = Array.isArray(raw) ? raw : (raw?.items ?? []);
      setConvs(items);

      // se não há peer selecionado, define o primeiro da lista
      if (!peerId && items.length > 0) {
        
        //if (firstPeerId != null) setPeerId(Number(firstPeerId));
      }
    } finally {
      setLoadingConvs(false);
    }
  }, [dealId, isOwner, peerId]);

  // carrega conversas assim que a negociação estiver OK e o usuário for dono
  useEffect(() => {
    if (status === 'success' && isOwner) {
      refreshConversations();
    }
  }, [status, isOwner, dealId, refreshConversations]);

  // === 5) Mensagens
  useEffect(() => {
    if (!dealId || status !== 'success') return;

    let cancelled = false;

    (async () => {
      setSubLoading(true);
      try {
        if (isOwner) {
          // dono precisa de um peer para buscar a thread
          if (peerId == null) return;
          const res = await dealsService.getDealMessages(dealId, peerId);
          if (cancelled) return;
          setMessages(res.map((w: any) => w.message));

          // marca como lida a conversa e atualiza contadores
          await dealsService.markConversationRead(dealId, peerId);
          await refreshConversations();
        } else {
          // não-dono conversa diretamente com o dono
          const res = await dealsService.getDealMessages(dealId);
          if (cancelled) return;
          setMessages(res.map((w: any) => w.message));
        }
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dealId, status, isOwner, peerId, refreshConversations]);

   useEffect(() => {
    if (!dealId || status !== 'success') return;

    async function loadBids() {
      setSubLoading(true);
      try {
        const res = await dealsService.getDealBids(dealId);
        setBids(res.map((w: any) => w.bid));
      } finally {
        setSubLoading(false);
      }
    }

    async function loadDelivery() {
      setSubLoading(true);
      try {
        const d = await dealsService.getDelivery(dealId);
        setDelivery(d);
      } finally {
        setSubLoading(false);
      }
    }

    if (activeTab === 'bids' && bids == null) loadBids();
    if (activeTab === 'delivery' && delivery == null) loadDelivery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dealId, status]);

  if (!dealId) return <div className="p-4 text-sm text-red-600">ID inválido.</div>;
  if (status === 'loading') return <div className="p-4">Carregando negociação...</div>;
  if (status === 'error')
    return (
      <div className="p-4">
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      </div>
    );
  if (!deal) return null;

  return (
    <div className="space-y-6">
      <DealHeader  
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <DealTabs
            active={activeTab}
            onChange={setActiveTab}
            tabs={[
              { key: 'details', label: 'Detalhes' },
              { key: 'bids', label: 'Ofertas' },
              { key: 'delivery', label: 'Entrega' },
            ]}
          />

          <PhotosGrid photos={deal.photos} />

          {activeTab === 'details' && (
            <div className="rounded-xl border p-4 dark:border-gray-700">
              <h2 className="mb-2 text-lg font-semibold">Descrição</h2>
              <p className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-300">
                {deal.description}
              </p>
            </div>
          )}
               

        

          {activeTab === 'delivery' && (
            <DeliveryPanel
              loading={subLoading && delivery == null}
              delivery={delivery}
              onRefresh={async () => {
                const d = await dealsService.getDelivery(dealId);
                setDelivery(d);
              }}
              onCalculate={async (userId: number) => {
                const d = await dealsService.calculateDelivery(dealId, userId);
                setDelivery(d);
              }}
            />
          )}
        </div>

        {/* Chat lateral */}
        <aside className="lg:col-span-4">
        <div className="sticky top-4 space-y-4">
  {isOwner && (
    <ConversationsList
      items={convs}
      loading={loadingConvs}
      activeId={peerId}
      onSelect={(uid) => {
        setPeerId(Number(uid));
        setMessages(null); // limpa enquanto carrega a thread selecionada
        // as mensagens serão recarregadas pelo useEffect
      }}
      onRefresh={refreshConversations}
    />
  )}

  {/* Dono só vê chat após escolher uma conversa; não-dono vê sempre */}
  {(!isOwner || peerId != null) ? (
    <MessagesList
      items={messages ?? []}
      loading={subLoading && messages == null}
      currentUserId={currentUserId}
      toUserId={isOwner ? (peerId ?? undefined) : undefined}
      onSend={async (payload) => {
        await dealsService.createMessage(dealId, {
          ...payload,
          ...(isOwner && peerId != null ? { to_user_id: Number(peerId) } : {}),
        });

        const res = await dealsService.getDealMessages(
          dealId,
          isOwner && peerId != null ? Number(peerId) : undefined
        );
        setMessages(res.map((w: any) => w.message));

        if (isOwner && peerId != null) {
          await dealsService.markConversationRead(dealId, Number(peerId));
          await refreshConversations();
        }
      }}
    />
  ) : (
    // placeholder quando dono ainda não escolheu uma conversa
    <div className="rounded-xl border border-dashed p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
      Selecione uma conversa ao lado para visualizar as mensagens.
    </div>
  )}
</div>
        </aside>
      </div>
    </div>
  );
}
