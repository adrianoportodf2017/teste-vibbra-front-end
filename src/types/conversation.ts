export type ConversationItem = {
    user: { id: number; name: string; avatar_url?: string | null };
    last_message?: { id: number; from_me: boolean; title?: string; message: string; created_at?: string | null } | null;
    unread: number;
  };