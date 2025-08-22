export type DealType = 1 | 2 | 3; // 1 – Venda, 2 – Troca, 3 – Desejo
export type UrgencyType = 1 | 2 | 3 | 4; // 1 – Baixa, 2 – Média, 3 – Alta, 4 – Data

export interface Location { lat: number; lng: number; address: string; city: string; state: string; zip_code: number; }
export interface Photo {id?: number; src: string; }
export interface Urgency { type: UrgencyType; limit_date?: string; }

export interface Deal {
  id?: number;
  type: DealType;
  value: number;
  description: string;
  trade_for?: string;
  location: Location;
  urgency: Urgency;
  photos: Photo[];
}

export interface DealSearchFilters {
  type?: DealType;
  value_start?: number;
  value_end?: number;
  term?: string;
  lat?: number;
  lng?: number;
}

export interface Bid { id?: number; user_id: number; accepted: boolean; value: number; description: string; }
 
export interface DeliveryStep { location: string; incoming_date: string; outcoming_date: string; }
export interface Delivery { from: Location; to: Location; value: number; steps: DeliveryStep[]; }
