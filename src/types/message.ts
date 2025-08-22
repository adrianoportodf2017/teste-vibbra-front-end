 export interface Message {
    id?: number;
    user_id: number;      // remetente
    to_user_id?: number;  // destinatário (novo)
    title: string;
    message: string;
  }

 