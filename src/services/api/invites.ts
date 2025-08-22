// src/services/api/invitesService.ts
import api from '../http';
import type { Invite } from '../../types';

const normalize = (data: any): Invite[] => {
  const rows = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
  return rows.map((w: any) => w?.invite ?? w);
};

export const invitesService = {
  async getMyInvites(): Promise<Invite[]> {
    const r = await api.get('/invites');
    return normalize(r.data);
  },

  async createInvite(payload: { name: string; email: string; user_invited?: number | null }) {
    const r = await api.post('/invites', payload);
    return r.data?.invite ?? r.data;
  },

  async updateInvite(inviteId: number, payload: Partial<Pick<Invite, 'name' | 'email' | 'status'>>) {
    const r = await api.put(`/invites/${inviteId}`, payload);
    return r.data?.invite ?? r.data;
  },

  async deleteInvite(inviteId: number) {
    await api.delete(`/invites/${inviteId}`);
  },
};
