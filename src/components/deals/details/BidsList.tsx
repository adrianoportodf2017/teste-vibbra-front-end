import { useMemo, useState } from "react";
import type { Bid } from "../../../types";

type BidsListProps = {
  items: Bid[];
  loading?: boolean;
   currentUserId?: number;
   dealOwnerId?: number;
   isOwner?: boolean;
  onCreate?: (payload: Omit<Bid, "id">) => Promise<void>;
  onUpdate?: (bidId: number, payload: Partial<Bid>) => Promise<void>;
};

function formatBRL(n: number) {
  try { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n); }
  catch { return `R$ ${n.toFixed(2)}`; }
}

export default function BidsList({
  items,
  loading = false,  
  currentUserId,
  dealOwnerId,
  isOwner,
  onCreate,
  onUpdate,
}: BidsListProps) {
  // form criar lance
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // edição inline do próprio lance
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);

  // usuario logado
  const fallbackUserId = useMemo<number | null>(() => {
    try { const raw = localStorage.getItem("user"); const u = raw ? JSON.parse(raw) : null; return u?.id ?? null; }
    catch { return null; }
  }, []);
  const meId = typeof currentUserId === "number" ? currentUserId : (fallbackUserId ?? undefined);

  // Removida variável acceptedBid que não estava sendo usada (erro TS6133)
  
  // recalcula dono do deal localmente (à prova de props bugadas)
  const isDealOwner = useMemo(() => {
    if (dealOwnerId == null || meId == null) return false;
    return Number(dealOwnerId) === Number(meId);
  }, [dealOwnerId, meId]);

  // prioridade: prop do pai; fallback: cálculo local
  const owner = (typeof isOwner === "boolean") ? isOwner : isDealOwner;

  // visibilidade: dono vê tudo; não-dono vê seus lances + o aceito (se houver)
  const visibleBids = useMemo(() => {
    if (owner) return items;
    return items.filter(b => (meId != null && b.user_id === meId) || b.accepted);
  }, [items, owner, meId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!onCreate) return;
    if (meId == null) { setErr("Sessão expirada. Faça login novamente."); return; }

    const num = parseFloat(value.replace(",", "."));
    if (!Number.isFinite(num) || num <= 0) { setErr("Informe um valor válido (> 0)."); return; }

    setSending(true);
    try {
      await onCreate({
        user_id: meId, // backend ignora e usa token; mantido por compat
        accepted: false,
        value: num,
        description: description.trim(),
      } as Omit<Bid, "id">);
      setValue(""); setDescription("");
    } finally {
      setSending(false);
    }
  }

  function startEdit(b: Bid) {
    if (b.id === undefined) {
      console.warn('Bid ID is undefined');
      return;
    }
    setEditingId(b.id);
    setEditValue(String(b.value));
    setEditDesc(b.description ?? "");
  }
  function cancelEdit() { setEditingId(null); setEditValue(""); setEditDesc(""); }
  async function confirmEdit(b: Bid) {
    if (!onUpdate) return;
    const num = parseFloat(editValue.replace(",", "."));
    if (!Number.isFinite(num) || num <= 0) { alert("Informe um valor válido (> 0)."); return; }
    if (b.id === undefined) {
      console.warn('Bid ID is undefined');
      return;
    }
    setSavingId(b.id);
    try {
      await onUpdate(b.id, { value: num, description: editDesc.trim() });
      cancelEdit();
    } finally {
      setSavingId(null);
    }
  }

  async function setAccepted(b: Bid, accept: boolean) {
    if (!onUpdate) return;
    // Correção: verificar se b.id não é undefined antes de usar
    if (b.id === undefined) return;
    
    setSavingId(b.id);
    try {
      await onUpdate(b.id, { accepted: accept });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista */}
      {loading ? (
        <div className="text-gray-500">Carregando ofertas...</div>
      ) : visibleBids.length === 0 ? (
        <div className="text-gray-500">Nenhuma oferta ainda.</div>
      ) : (
        <ul className="space-y-3">
          {visibleBids.map((b) => {
            const mine = meId != null && meId === b.user_id;
            const editing = editingId === b.id;
            return (
              <li
                key={b.id}
                className={`rounded-lg border p-3 shadow-sm dark:border-gray-700 ${
                  b.accepted ? "bg-green-50 dark:bg-green-900/40" : "dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Oferta de usuário #{b.user_id}{mine ? " (você)" : ""}
                  </span>
                  <span className={`text-xs font-medium ${b.accepted ? "text-green-600" : "text-gray-500"}`}>
                    {b.accepted ? "Aceita" : "Pendente"}
                  </span>
                </div>

                {editing ? (
                  <div className="mt-2 space-y-2">
                    <input
                      type="number" step="0.01" min="0"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <textarea
                      rows={2}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmEdit(b)}
                        disabled={savingId === b.id}
                        className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        {savingId === b.id ? "Salvando..." : "Salvar"}
                      </button>
                      <button onClick={cancelEdit} className="text-xs text-gray-700 hover:underline">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-gray-700 dark:text-gray-300">Valor: {formatBRL(b.value)}</div>
                    {b.description && <div className="mt-1 text-xs text-gray-500">{b.description}</div>}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {/* Ações do dono: aceitar/rejeitar */}
                      {owner && (
                        <>
                          <button
                            onClick={() => setAccepted(b, true)}
                            disabled={savingId === b.id || b.accepted}
                            className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                            title="Aceitar este lance"
                          >
                            {savingId === b.id && !b.accepted ? "Aceitando..." : "Aceitar"}
                          </button>
                          {b.accepted && (
                            <button
                              onClick={() => setAccepted(b, false)}
                              disabled={savingId === b.id}
                              className="rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-800 disabled:opacity-50"
                              title="Rejeitar (desfazer aceite)"
                            >
                              {savingId === b.id ? "Atualizando..." : "Rejeitar"}
                            </button>
                          )}
                        </>
                      )}

                      {/* Autor do lance pode editar enquanto não aceito */}
                      {!owner && mine && !b.accepted && (
                        <button
                          onClick={() => startEdit(b)}
                          className="text-xs text-gray-700 hover:underline"
                          title="Editar minha oferta"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Form de nova oferta: esconde se for dono do deal */}
      {onCreate && !owner && (
        <form onSubmit={handleSend} className="rounded-lg border p-3 dark:border-gray-700 dark:bg-gray-800">
          {err && <div className="mb-2 rounded-md bg-red-50 p-2 text-xs text-red-700">{err}</div>}
          <div className="mb-2">
            <input
              type="number" step="0.01" min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Valor da oferta"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Mensagem (opcional)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar oferta"}
          </button>
        </form>
      )}
    </div>
  );
}