// components/layout/Header.tsx
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { dealsService, invitesService, usersService } from '../../services/api';
import type { Deal, Location, User } from '../../types';

interface HeaderProps {
  onToggleSideMenu: () => void;
  isNotificationsMenuOpen: boolean;
  setNotificationsMenuOpen: Dispatch<SetStateAction<boolean>>;
  isProfileMenuOpen: boolean;
  setProfileMenuOpen: Dispatch<SetStateAction<boolean>>;
}

function getStoredUser(): User | null {
  try { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; } catch { return null; }
}
function setStoredUser(u: User) { localStorage.setItem('user', JSON.stringify(u)); }

export default function Header({
  onToggleSideMenu,
  isNotificationsMenuOpen,
  setNotificationsMenuOpen,
  isProfileMenuOpen,
  setProfileMenuOpen,
}: HeaderProps) {
  const navigate = useNavigate();

  // ===== USER (localStorage)
  const [user, setUser] = useState<User | null>(getStoredUser());
  const userId = user?.id; // <- ideal: vir do backend no /authenticate

  // ===== Busca (simples, reaproveita seus services)
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Deal[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q.trim() || q.trim().length < 2) { setSuggestions([]); return; }
      const res = await dealsService.searchDeals({ term: q.trim() });
      setSuggestions(res.map((w: any) => w.deal).slice(0, 6));
      setSearchOpen(true);
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  function goToDeal(id: number) {
    setQ(''); setSuggestions([]); setSearchOpen(false);
    navigate(`/deals/${id}`);
  }

  // ===== Notificações (contadores)
  const [notifLoading, setNotifLoading] = useState(false);
  const [countMine, setCountMine] = useState(0);
  const [countOffers, setCountOffers] = useState(0);
  const [countInvites, setCountInvites] = useState(0);

  useEffect(() => {
    if (!isNotificationsMenuOpen) return;
    (async () => {
      setNotifLoading(true);
      try {
        const [mineRes, offersRes, invitesRes] = await Promise.all([
          dealsService.getMyDeals(),
          dealsService.getMyOfferDeals(),
          userId ? invitesService.getMyInvites() : Promise.resolve([] as any),
        ]);
        setCountMine((mineRes?.deals ?? []).length);
        setCountOffers((offersRes?.items ?? []).length);
        setCountInvites((invitesRes ?? []).length);
      } finally {
        setNotifLoading(false);
      }
    })();
  }, [isNotificationsMenuOpen, userId]);

  const notifTotal = countMine + countOffers + countInvites;

  // ===== Avatar
  const avatarUrl = user?.avatar_url || '';
  const initials = useMemo(() => {
    const base = user?.name || user?.login || 'U';
    return base.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase();
  }, [user]);

  return (
    <header className="z-10 bg-white py-4 shadow-md">
      <div className="container mx-auto flex h-full items-center justify-between px-6 text-purple-600">
        {/* Mobile hamburger */}
        <button
          className="mr-5 -ml-1 rounded-md p-1 md:hidden focus:outline-none focus:ring-2 focus:ring-purple-400/40"
          onClick={onToggleSideMenu}
          aria-label="Menu"
        >
          <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4A1 1 0 013 5zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 000 2h12a1 1 0 100-2H4z" clipRule="evenodd" /></svg>
        </button>

        {/* Search */}
        <div className="relative flex flex-1 items-center justify-center lg:mr-32">
          <div className="relative w-full max-w-xl">
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchOpen(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
              placeholder="Buscar negociações…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            {searchOpen && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <ul className="max-h-80 overflow-auto divide-y divide-gray-100">
                  {suggestions.map((d) => (
                    <li key={d.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-gray-50"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => d.id && goToDeal(d.id)}>
                      <img src={d.photos?.[0]?.src || 'https://picsum.photos/seed/thumb/80/50'} alt=""
                           className="h-10 w-14 rounded-md object-cover ring-1 ring-gray-200" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{d.description}</p>
                        <p className="truncate text-xs text-gray-500">
                          {d.location?.city} / {d.location?.state}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">#{d.id}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <ul className="flex flex-shrink-0 items-center space-x-6">
          {/* Notifications */}
          <li className="relative">
            <button
              onClick={() => { setNotificationsMenuOpen(v => !v); setProfileMenuOpen(false); }}
              className="relative rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Notifications"
              aria-haspopup="true"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
              {notifTotal > 0 && (
                <span className="absolute right-0 top-0 inline-block h-3 min-w-3 -translate-y-1 translate-x-1 rounded-full border-2 border-white bg-red-600 px-0.5 text-[10px] leading-3 text-white">
                  {notifTotal}
                </span>
              )}
            </button>
            {isNotificationsMenuOpen && (
              <ul className="absolute right-0 mt-2 w-72 space-y-2 rounded-md border border-gray-100 bg-white p-2 text-gray-600 shadow-md" aria-label="submenu">
                <li className="flex items-center justify-between rounded-md px-2 py-1 text-sm">
                  <span>Minhas negociações</span><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200">{notifLoading?'…':countMine}</span>
                </li>
                <li className="flex items-center justify-between rounded-md px-2 py-1 text-sm">
                  <span>Minhas ofertas/mensagens</span><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200">{notifLoading?'…':countOffers}</span>
                </li>
                <li className="flex items-center justify-between rounded-md px-2 py-1 text-sm">
                  <span>Convites enviados</span><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-200">{notifLoading?'…':countInvites}</span>
                </li>
                <li className="mt-1 grid grid-cols-3 gap-2 px-1">
                  <button onClick={() => navigate('/deals/create')} className="rounded-lg bg-gray-900 px-2 py-1.5 text-xs font-medium text-white hover:bg-black">Novo Negócio</button>
                  <button onClick={() => navigate('/deals/my-deals')} className="rounded-lg ring-1 ring-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50">Meus Negócios</button>
                  <button onClick={() => navigate('/invites')} className="rounded-lg ring-1 ring-gray-300 px-2 py-1.5 text-xs font-medium hover:bg-gray-50">Convites</button>
                </li>
              </ul>
            )}
          </li>

          {/* Profile -> abre modal */}
          <li>
            <button
              onClick={() => { setProfileMenuOpen(true); setNotificationsMenuOpen(false); }}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Account"
            >
              {avatarUrl ? (
                <img className="h-8 w-8 rounded-full object-cover" src={avatarUrl} alt="avatar" />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                  {initials}
                </div>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Modal de Perfil */}
      {isProfileMenuOpen && user && (
        <ProfileModal
          user={user}
          onClose={() => setProfileMenuOpen(false)}
          onSaved={(updated) => { setUser(updated); setStoredUser(updated); }}
        />
      )}
    </header>
  );
}

/** =============== Modal de Perfil =============== */
function ProfileModal({ user, onClose, onSaved }:{
  user: User; onClose: () => void; onSaved: (u: User) => void;
}) {
  const [name, setName] = useState(user.name || '');
  const [login, setLogin] = useState(user.login || '');
  const [email] = useState(user.email || '');
  const [location, setLocation] = useState<Location>(user.location || { lat: 0, lng: 0, address: '', city: '', state: '', zip_code: 0 });

  // senha
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const [saving, setSaving] = useState(false);
  const userId = user.id;

  async function saveProfile() {
    if (!userId) { alert('ID do usuário não encontrado. Garanta que /authenticate retorne { user: { id, ... } }.'); return; }
    setSaving(true);
    try {
      const payload: UpdateUserData = { name: name.trim(), login: login.trim(), location };
      const r = await usersService.updateUser(userId, payload);
      onSaved({ ...user, ...r.user });
      onClose();
    } catch (e:any) {
      alert(e?.message || 'Falha ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!userId) { alert('ID do usuário não encontrado.'); return; }
    if (!newPwd || newPwd.length < 6) return alert('A nova senha deve ter pelo menos 6 caracteres.');
    if (newPwd !== confirmPwd) return alert('Confirmação de senha não confere.');
    setSaving(true);
    try {
      await usersService.updateUser(userId, { password: newPwd } as UpdateUserData);
      setNewPwd(''); setConfirmPwd('');
      alert('Senha atualizada!');
    } catch (e:any) {
      alert(e?.message || 'Falha ao atualizar senha.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Meu perfil</h3>
          <button onClick={onClose} className="rounded p-2 hover:bg-gray-100" aria-label="Fechar">✕</button>
        </div>

        <div className="mt-4 grid gap-4">
          {/* dados básicos */}
          <div className="grid md:grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Nome</span>
              <input className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-purple-300"
                     value={name} onChange={(e)=>setName(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Login</span>
              <input className="rounded border border-gray-300 p-2 focus:ring-2 focus:ring-purple-300"
                     value={login} onChange={(e)=>setLogin(e.target.value)} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className="text-sm text-gray-600">Email</span>
              <input className="rounded border border-gray-200 bg-gray-100 p-2 text-gray-600"
                     value={email} disabled />
            </label>
          </div>

          {/* endereço */}
          <fieldset className="grid gap-3 rounded border border-gray-200 p-4">
            <legend className="px-2 text-sm text-gray-700">Endereço</legend>
            <label className="grid gap-1">
              <span className="text-sm text-gray-600">Endereço</span>
              <input className="rounded border border-gray-300 p-2"
                     value={location.address} onChange={(e)=>setLocation({...location, address: e.target.value})} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded border border-gray-300 p-2" placeholder="Cidade"
                     value={location.city} onChange={(e)=>setLocation({...location, city: e.target.value})}/>
              <input className="rounded border border-gray-300 p-2" placeholder="UF"
                     value={location.state} onChange={(e)=>setLocation({...location, state: e.target.value})}/>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input className="rounded border border-gray-300 p-2" placeholder="CEP"
                     value={String(location.zip_code || '')}
                     onChange={(e)=>setLocation({...location, zip_code: Number(e.target.value.replace(/\D/g,'')) || 0})}/>
              <input className="rounded border border-gray-300 p-2" placeholder="Lat"
                     value={String(location.lat || '')}
                     onChange={(e)=>setLocation({...location, lat: Number(e.target.value) || 0})}/>
              <input className="rounded border border-gray-300 p-2" placeholder="Lng"
                     value={String(location.lng || '')}
                     onChange={(e)=>setLocation({...location, lng: Number(e.target.value) || 0})}/>
            </div>
          </fieldset>

          {/* senha */}
          <div className="rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Atualizar senha</h4>
              <button className="text-sm text-purple-600 hover:underline" onClick={()=>setShowPwd(v=>!v)}>
                {showPwd ? 'Ocultar' : 'Alterar'}
              </button>
            </div>
            {showPwd && (
              <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <input className="rounded border border-gray-300 p-2" type="password"
                       placeholder="Nova senha" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} />
                <input className="rounded border border-gray-300 p-2" type="password"
                       placeholder="Confirmar nova senha" value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)} />
                <button onClick={changePassword} disabled={saving}
                        className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {saving ? 'Atualizando…' : 'Salvar senha'}
                </button>
              </div>
            )}
          </div>

          {!userId && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              Não encontrei <code>user.id</code> 
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-gray-300 hover:bg-gray-50">Cancelar</button>
          <button onClick={saveProfile} disabled={saving || !userId}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
