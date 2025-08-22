import type { ReactNode } from 'react';

 

export default function Card({ children }: { children: ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 16 }}>
      {children}
    </div>
  );
}
