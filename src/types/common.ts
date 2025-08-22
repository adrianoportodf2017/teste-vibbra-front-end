export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; }
export interface SelectOption { label: string; value: string | number; }