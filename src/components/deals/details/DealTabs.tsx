// src/components/deals/DealTabs.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import BidsList from "./BidsList";
import DeliveryPanel from "./DeliveryPanel";
import { dealsService } from "../../../services/api";
import type { Bid, Delivery } from "../../../types";
import { getCurrentUserId } from "../../../utils/auth";

export type TabKey = 'details' | 'bids' | 'delivery';
 

   export default function DealTabs() {
  const { id } = useParams<{ id: string }>();
  const dealId = Number(id);

  const currentUserId = useMemo<number | null>(() => {
    const v = getCurrentUserId();
    return v != null ? Number(v) : null;
  }, []);

   const [subLoading, setSubLoading] = useState(false);

  const [bids, setBids] = useState<Bid[] | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [active, setActive] = useState<TabKey>("bids");

  // dono do deal (para decidir se mostra ações de aceitar/rejeitar)
  const [dealOwnerId, setDealOwnerId] = useState<number | null>(null);
  const isOwner = useMemo(() => {
    if (dealOwnerId == null || currentUserId == null) return false;
    return Number(dealOwnerId) === Number(currentUserId);
  }, [dealOwnerId, currentUserId]);

  // carrega só o dono da negociação (sem duplicar dados)
  useEffect(() => {
    if (!dealId) return;
    (async () => {
      try {
        const res = await dealsService.getDealById(dealId);
        const owner =
          (res.deal as any)?.user_id ??
          (res.deal as any)?.user?.id ??
          null;
        setDealOwnerId(owner != null ? Number(owner) : null);
      } catch {
        // silencioso; a aba de lances ainda funciona com o boolean vindo do pai (se houver)
      }
    })();
  }, [dealId]);

  const refreshBids = useCallback(async () => {
    if (!dealId) return;
    setSubLoading(true);
    try {
      const list = await dealsService.getDealBids(dealId); // GET /deal/{id}/bids
      setBids(list.map((w: any) => w.bid));
    } finally {
      setSubLoading(false);
    }
  }, [dealId]);

  const refreshDelivery = useCallback(async () => {
    if (!dealId) return;
    setSubLoading(true);
    try {
      const d = await dealsService.getDelivery(dealId); // GET /deal/{id}/delivery
      setDelivery(d);
    } finally {
      setSubLoading(false);
    }
  }, [dealId]);

  // lazy-load por aba
  useEffect(() => {
    if (!dealId) return;
    if (active === "bids" && bids == null) refreshBids();
    if (active === "delivery" && delivery == null) refreshDelivery();
  }, [active, dealId, bids, delivery, refreshBids, refreshDelivery]);

  if (!dealId) return <div className="text-sm text-red-600">ID inválido.</div>;
  if (currentUserId == null)
    return (
      <div className="text-sm text-yellow-800 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2">
        Sessão expirada. Faça login novamente.
      </div>
    );

  return (
    <div className="mt-6">
      {/* Navegação das abas */}
      <div className="mb-4 flex gap-2 border-b border-gray-300 dark:border-gray-700">
        {(["bids", "delivery"] as TabKey[]).map((key) => (
          <button
            key={key}
            className={`px-4 py-2 text-sm font-medium ${
              active === key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 dark:text-gray-400"
            }`}
            onClick={() => setActive(key)}
          >
            {key === "bids" ? "Lances" : "Entrega"}
          </button>
        ))}
      </div>

      {/* Conteúdo das abas */}
      <div>
        {active === "bids" && (
          <BidsList
            key={`bids-${isOwner ? "owner" : "user"}`} // força re-mount ao alternar modo
            loading={subLoading && bids == null}
            items={bids ?? []}
            currentUserId={currentUserId}
            isOwner={isOwner}
            dealOwnerId={dealOwnerId ?? undefined}
            onCreate={async (payload) => {
              await dealsService.createBid(dealId, { ...payload });
              await refreshBids(); // garante estado atualizado (inclui aceites)
            }}
            onUpdate={async (bidId, payload) => {
              await dealsService.updateBid(dealId, bidId, payload);
              await refreshBids(); // recarrega após aceitar/rejeitar/editar
            }}
          />
        )}

        {active === "delivery" && (
          <DeliveryPanel
            loading={subLoading && delivery == null}
            delivery={delivery}
            onRefresh={refreshDelivery}
            onCalculate={async (userId: number) => {
              const d = await dealsService.calculateDelivery(dealId, userId); // POST /deal/{id}/delivery
              setDelivery(d);
            }}
          />
        )}
      </div>
    </div>
  );
}
