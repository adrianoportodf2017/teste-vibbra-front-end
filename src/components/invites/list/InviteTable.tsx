// src/pages/invites/components/InviteTable.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { invitesService } from '../../../services/api';
import type { Invite } from '../../../types';
import { getCurrentUserId } from '../../../utils/auth';

function StatusPill({ text = 'Enviado' }: { text?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
      {text}
    </span>
  );
}

export default function InviteTable() {
  const currentUserId = useMemo<number | null>(() => getCurrentUserId(), []);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Invite[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await invitesService.getMyInvites();
      setItems(res);
    } catch (e: any) {
      setError(e?.message || 'Falha ao carregar convites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('INVITES_SHOULD_REFRESH', handler);
    return () => window.removeEventListener('INVITES_SHOULD_REFRESH', handler);
  }, [load]);

  const data = useMemo(() => items, [items]);

  function startEdit(inv: Invite) {
    setEditingId(Number((inv as any).id));
    setEditName((inv as any).name ?? '');
    setEditEmail((inv as any).email ?? '');
  }
  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditEmail('');
  }
  async function confirmEdit() {
    if (editingId == null) return;
    if (!editName.trim()) return alert('Informe o nome.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) return alert('Email inválido.');

    try {
      setSaving(true);
      await invitesService.updateInvite(Number(editingId), {
        name: editName.trim(),
        email: editEmail.trim(),
      });
      cancelEdit();
      await load();
    } catch (e: any) {
      alert(e?.message || 'Falha ao atualizar convite.');
    } finally {
      setSaving(false);
    }
  }

  if (currentUserId == null) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Sessão expirada. Faça login novamente.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-600">
        Você ainda não enviou convites.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <Th>Convidado</Th>
            <Th>Email</Th>
            <Th>ID do convidado</Th>
            <Th>Status</Th>
            <Th className="text-right">Ações</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((inv) => {
            const isEditing = editingId === (inv as any).id;
            return (
              <tr key={String((inv as any).id)} className="hover:bg-gray-50">
                <Td>
                  {isEditing ? (
                    <input
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <span className="font-medium">{(inv as any).name}</span>
                  )}
                </Td>
                <Td>
                  {isEditing ? (
                    <input
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    (inv as any).email
                  )}
                </Td>
                <Td>#{(inv as any).user_invited ?? '-'}</Td>
                <Td>
                  <StatusPill text={(inv as any).status ?? 'Enviado'} />
                </Td>
                <Td className="text-right">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={confirmEdit}
                        disabled={saving}
                        className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                      >
                        {saving ? 'Salvando…' : 'Salvar'}
                      </button>
                      <button onClick={cancelEdit} className="text-xs text-gray-700 hover:underline">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(inv)}
                      className="text-xs text-gray-700 hover:underline"
                      title="Editar convite"
                    >
                      Editar
                    </button>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
