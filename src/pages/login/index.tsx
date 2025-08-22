import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

export default function LoginPage() {
  const [login, setLogin] = useState('antonio@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const r = await authService.login({ login, password });
      localStorage.setItem('token', r.token);
      if (r.user) {
        localStorage.setItem('user', JSON.stringify(r.user)); // precisa conter id, name, email, login, avatar_url?, location?
      }
      navigate('/', { replace: true });
    } catch {
      setErr('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto h-full w-full max-w-4xl flex-1 overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-800">
        <div className="flex flex-col overflow-y-auto md:flex-row">
          {/* Lado da imagem */}
          <div className="h-32 md:h-auto md:w-1/2">
            {/* Light */}
            <img
              aria-hidden="true"
              className="h-full w-full object-cover dark:hidden"
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop"
              alt="Office"
            />
            {/* Dark */}
            <img
              aria-hidden="true"
              className="hidden h-full w-full object-cover dark:block"
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop"
              alt="Office dark"
            />
          </div>

          {/* Lado do formulário */}
          <div className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
            <div className="w-full">
              <h1 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
                Login
              </h1>

              <form onSubmit={onSubmit} className="space-y-4">
                <label className="block text-sm">
                  <span className="text-gray-700 dark:text-gray-400">Login</span>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="seu.usuario ou email"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="username"
                  />
                </label>

                <label className="block text-sm">
                  <span className="text-gray-700 dark:text-gray-400">Senha</span>
                  <input
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/40 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="***************"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>

                {err && (
                  <p className="text-sm text-red-600 dark:text-red-400">{err}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 block w-full rounded-lg border border-transparent bg-purple-600 px-4 py-2 text-center text-sm font-medium leading-5 text-white transition-colors duration-150 hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <hr className="my-8" />

              <div className="flex items-center justify-between text-sm">
                
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
