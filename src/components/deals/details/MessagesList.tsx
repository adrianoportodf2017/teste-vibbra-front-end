import { useEffect, useMemo, useRef, useState } from "react";
import type { Message } from "../../../types";

type MessagesListProps = {
  items: Message[];
  loading?: boolean;
  dealId: number;
  /** id do usuário logado; se não vier, busca em localStorage */
  currentUserId?: number;
  /** destinatário quando o dono está falando com um interessado (chat 1:1) */
  toUserId?: number;
  /** o backend usa o token p/ identificar o remetente; aqui só mandamos title/message e, se for o dono, to_user_id */
  onSend?: (payload: { title?: string; message: string; to_user_id?: number }) => Promise<void>;
  onUpdate?: (messageId: number, payload: Partial<Message>) => Promise<void>;
};

export default function MessagesList({
  items,
  loading = false,
  dealId,
  currentUserId,
  toUserId,
  onSend,
}: MessagesListProps) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // descobre meu id se não foi passado
  const myId = useMemo<number | undefined>(() => {
    if (typeof currentUserId === "number") return currentUserId;
    try {
      const raw = localStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : null;
      return typeof u?.id === "number" ? u.id : undefined;
    } catch {
      return undefined;
    }
  }, [currentUserId]);

  // rolar sempre para o fundo quando itens mudarem
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [items.length, loading]);

  // mensagens ordenadas (se o parent já ordena, isso vira só um clone estável)
  const ordered = useMemo(() => [...items], [items]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const body = msg.trim();
    if (!body || !onSend) return;

    setSending(true);
    try {
      await onSend({
        title: "Mensagem",
        message: body,
        // quando o dono está falando com alguém específico
        ...(toUserId ? { to_user_id: toUserId } : {}),
      });
      setMsg("");
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border bg-white dark:border-gray-700 dark:bg-gray-800">
      {/* Área de mensagens */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4"
        aria-live="polite"
      >
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`max-w-[75%] animate-pulse rounded-2xl p-3 ${
                  i % 2 === 0
                    ? "ml-auto bg-blue-200/60 dark:bg-blue-900/40"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
                style={{ height: 48 }}
              />
            ))}
          </div>
        ) : ordered.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-gray-500">
            Nenhuma mensagem ainda. Dê um oi! 👋
          </div>
        ) : (
          <ul className="space-y-2">
            {ordered.map((m, idx) => {
              const mine = typeof myId === "number" ? m.user_id === myId : false;
              const readAt = (m as any).read_at as string | undefined; // opcional, se você implementou read_at
              return (
                <li
                  key={idx}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  {/* avatar simples (iniciais) do outro lado */}
                  {!mine && (
                    <div className="mr-2 hidden h-8 w-8 select-none items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700 sm:flex">
                      {String(m.user_id ?? "U").slice(-2).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[70%] ${
                      mine
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                    }`}
                  >
                    {/* título discreto */}
                    {m.title && (
                      <div
                        className={`mb-0.5 text-[11px] ${
                          mine ? "text-white/80" : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {m.title}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{m.message}</div>

                    {/* status estilo “telegramzinho” */}
                    {mine && (
                      <div className="mt-0.5 text-[10px] opacity-80">
                        {readAt ? "✓✓ lida" : "✓ enviada"}
                      </div>
                    )}
                  </div>

                  {mine && (
                    <div className="ml-2 hidden h-8 w-8 select-none items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-900 sm:flex">
                      Eu
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Composer */}
      {onSend && (
        <form onSubmit={handleSend} className="border-t p-2 sm:p-3 dark:border-gray-700">
          <div className="flex items-end gap-2">
            <textarea
              className="min-h-[44px] max-h-40 flex-1 resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              placeholder="Escreva uma mensagem…"
              rows={2}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              type="submit"
              disabled={sending || !msg.trim()}
              className="h-[44px] shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Enviando…" : "Enviar"}
            </button>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Enter para enviar • Shift+Enter para quebrar linha
          </div>
        </form>
      )}
    </div>
  );
}
