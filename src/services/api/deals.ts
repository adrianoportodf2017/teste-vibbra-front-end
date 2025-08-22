import api from '../http';
import type { Deal, DealSearchFilters, Bid, Message, ConversationItem, Delivery } from '../../types';

export const dealsService = {
  async getDealById(id: number): Promise<{ deal: Deal }> {
    const r = await api.get<{ deal: Deal }>(`/deal/${id}`);
    return r.data;
  },

  async searchDeals(filters: DealSearchFilters): Promise<{ deal: Deal }[]> {
    const r = await api.post<{ deal: Deal }[]>('/deal/search', filters);
    return r.data;
  },

  async createDeal(dealData: Deal): Promise<{ deal: Deal }> {
    const r = await api.post<{ deal: Deal }>('/deal', dealData);
    return r.data;
  },

  async updateDeal(id: number, dealData: Deal): Promise<{ deal: Deal }> {
    const r = await api.put<{ deal: Deal }>(`/deal/${id}`, dealData);
    return r.data;
  },

  async deleteDeal(id: number) {
    return api.delete(`/deal/${id}`);
  },

    // MINHAS NEGOCIAÇÕES (criadas por mim)
    async getMyDeals(): Promise<{ deals: Deal[] }> {
      // simulação conforme especificação
      const r = await api.get<{ deals: Deal[] }>('/me/deals');
      return r.data;
    },
  
    // NEGOCIAÇÕES ONDE FIZ OFERTA OU ENVIEI MENSAGEM
    async getMyOfferDeals(): Promise<{
      items: Array<{ deal: Deal; bid?: Bid; last_message?: Message }>;
    }> {
      const r = await api.get<{
        items: Array<{ deal: Deal; bid?: Bid; last_message?: Message }>;
      }>('/me/offers');
      return r.data;
    },

  // Bids
  async getBidById(dealId: number, bidId: number): Promise<{ bid: Bid }> {
    const r = await api.get<{ bid: Bid }>(`/deal/${dealId}/bid/${bidId}`);
    return r.data;
  },
  async getDealBids(dealId: number): Promise<{ bid: Bid }[]> {
    const r = await api.get<{ bid: Bid }[]>(`/deal/${dealId}/bid`);
    return r.data;
  },
  async createBid(dealId: number, bidData: Bid): Promise<{ bid: Bid }> {
    const r = await api.post<{ bid: Bid }>(`/deal/${dealId}/bid`, bidData);
    return r.data;
  },
  async updateBid(dealId: number, bidId: number, bidData: Partial<Bid>): Promise<{ bid: Bid }> {
    const r = await api.put<{ bid: Bid }>(`/deal/${dealId}/bid/${bidId}`, bidData);
    return r.data;
  },

  // Messages
  async getMessageById(dealId: number, messageId: number): Promise<{ message: Message }> {
    const r = await api.get<{ message: Message }>(`/deal/${dealId}/message/${messageId}`);
    return r.data;
  },
  async getDealMessages(dealId: number, withUserId?: number): Promise<{ message: Message }[]> {
    const r = await api.get<{ message: Message }[]>(
      `/deal/${dealId}/message`,
      { params: withUserId ? { with_user: withUserId } : {} }
    );
    return r.data;
  },
  async createMessage(dealId: number, messageData: Partial<Message>): Promise<{ message: Message }> {
    const r = await api.post<{ message: Message }>(`/deal/${dealId}/message`, messageData);
    return r.data;
  },
  async updateMessage(dealId: number, messageId: number, messageData: Message): Promise<{ message: Message }> {
    const r = await api.put<{ message: Message }>(`/deal/${dealId}/message/${messageId}`, messageData);
    return r.data;
  },
  

  // Delivery
  async getDelivery(dealId: number): Promise<Delivery> {
    const r = await api.get<Delivery>(`/deal/${dealId}/delivery`);
    return r.data;
  },
  async calculateDelivery(dealId: number, userId: number): Promise<Delivery> {
    const r = await api.post<Delivery>(`/deal/${dealId}/delivery`, { user_id: userId });
    return r.data;
  },

  async getConversations(dealId: number): Promise<{ items: ConversationItem[] }> {
    const r = await api.get<{ items: ConversationItem[] }>(`/deal/${dealId}/conversations`);
    return r.data;
  },
  
  async markConversationRead(dealId: number, withUserId: number): Promise<{ ok: boolean }> {
    const r = await api.post<{ ok: boolean }>(`/deal/${dealId}/message/read`, { with_user: withUserId });
    return r.data;
  },
};
