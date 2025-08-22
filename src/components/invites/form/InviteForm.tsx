// src/pages/invites/components/InviteForm.tsx
import { useMemo, useState } from 'react';
import { invitesService } from '../../../services/api';
import { getCurrentUserId } from '../../../utils/auth';

type Props = { onCreated?: () => void };

export default function InviteForm({ onCreated }: Props) {
  const currentUserId = useMemo<number | null>(() => getCurrentUserId(), []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function validate(): string | null {
    if (!name.trim()) return 'Informe o nome do convidado.';
    if (!email.trim()) return 'Informe o email do convidado.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Email inválido.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (currentUserId == null) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    const err = validate();
    if (err) return setError(err);

    try {
      setSending(true);
      // agora o backend usa o usuário do token (sem userId na rota)
      await invitesService.createInvite({
        name: name.trim(),
        email: email.trim(),
      });
      setSuccess('Convite enviado!');
      setName('');
      setEmail('');
      // avisa a tabela para recarregar
      window.dispatchEvent(new Event('INVITES_SHOULD_REFRESH'));
      onCreated?.();
    } catch (e: any) {
      setError(e?.message || 'Falha ao enviar convite.');
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-200">
      <div>
        <h2 className="text-base font-semibold">Novo convite</h2>
        <p className="text-sm text-gray-600">Informe os dados do convidado.</p>
      </div>

      {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</div>}

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Nome completo</span>
        <input
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Maria Silva"
        />
      </label>

      <label className="grid gap-1">
        <span className="text-sm text-gray-600">Email</span>
        <input
          type="email"
          className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="maria@email.com"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {sending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {sending ? 'Enviando…' : 'Enviar convite'}
        </button>
      </div>
    </form>
  );
}
