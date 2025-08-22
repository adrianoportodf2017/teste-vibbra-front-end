// components/deals/ConversationsList.tsx
import type { ConversationItem } from "../../../types";

export default function ConversationsList({
  items,
  loading,
  activeId,
  onSelect,
  onRefresh,
}: {
  items: ConversationItem[];
  loading?: boolean;
  activeId?: number | null;
  onSelect: (userId: number) => void;
  onRefresh?: () => void;
}) {
  return (
    <div className="rounded-xl border bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Conversas</h4>
        {onRefresh && (
          <button onClick={onRefresh} className="text-xs text-blue-600 hover:underline">
            Atualizar
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-xs text-gray-500">Sem interessados ainda.</div>
      ) : (
        <ul className="space-y-1">
          {items.map((c) => (
            <li key={c.user.id}>
              <button
                onClick={() => onSelect(c.user.id)}
                className={`w-full rounded-lg px-2 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  activeId === c.user.id ? "ring-2 ring-blue-500" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={
                      c.user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.name)}&size=64`
                    }
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{c.user.name}</span>
                      {c.unread > 0 && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    {c.last_message && (
                      <div className="truncate text-xs text-gray-500">
                        {c.last_message.from_me ? "Você: " : ""}
                        {c.last_message.message}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
