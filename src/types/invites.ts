export interface Invite { id?: number; name: string; email: string; user: number; user_invited: number; }
export interface CreateInviteData { name: string; email: string; user: number; user_invited: number; }
export interface InviteResponse { invite: Invite; }
