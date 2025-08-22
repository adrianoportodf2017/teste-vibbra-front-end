import type { ReactNode } from 'react';

export default function Modal({ open, children }: { open: boolean; children: ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'grid', placeItems: 'center' }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 10, minWidth: 300 }}>
        {children}
      </div>
    </div>
  );
}
