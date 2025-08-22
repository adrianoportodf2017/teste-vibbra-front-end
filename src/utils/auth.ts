// src/utils/auth.ts
export function getCurrentUserId(): number | null {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      return u?.id ?? null;
    } catch { return null; }
  }
  