import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
 }

const navLinkBase =
  'inline-flex w-full items-center text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200';
const activeClasses = 'text-gray-800 dark:text-gray-100';

function Item({
  to,
  icon,
  label,
  exact = false,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  return (
    <li className="relative px-6 py-3">
      <NavLink
        to={to}
        end={exact}
        className={({ isActive }) => `${navLinkBase} ${isActive ? activeClasses : ''}`}
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span
                className="absolute inset-y-0 left-0 w-1 rounded-br-lg rounded-tr-lg bg-purple-600"
                aria-hidden="true"
              />
            )}
            {icon}
            <span className="ml-4">{label}</span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function Sidebar({ isOpen }: SidebarProps) {
  // Ícones (SVG inline)
  const HomeIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l2-2 7-7 7 7-2 2v8a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
  const CreateIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
  const DealsIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13V7a2 2 0 00-2-2h-3l-2-2-2 2H6a2 2 0 00-2 2v6" />
      <path d="M8 21h8a2 2 0 002-2v-5H6v5a2 2 0 002 2z" />
    </svg>
  );
  const InvitesIcon = (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="z-20 hidden w-64 flex-shrink-0 overflow-y-auto bg-white dark:bg-gray-800 md:block">
        <div className="py-4 text-gray-500 dark:text-gray-400">
          <div className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">
            Bom Negócio
          </div>

          <ul className="mt-6">
            <Item to="/" label="Início (Ofertas)" icon={HomeIcon} exact />
          </ul>

          <ul>
            <Item to="/deals/create" label="Criar negociação" icon={CreateIcon} />
            <Item to="/deals/my-deals" label="Minhas negociações" icon={DealsIcon} />
            <Item to="/invites" label="Meus convites" icon={InvitesIcon} />
          </ul>

          <div className="my-6 px-6">
            <a
              href="/logout"
              className="flex w-full items-center justify-between rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            >
              Sair
              <span className="ml-2" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <aside
        className={`fixed inset-y-0 z-20 mt-16 w-64 flex-shrink-0 transform overflow-y-auto bg-white transition-transform duration-150 dark:bg-gray-800 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-80'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-4 text-gray-500 dark:text-gray-400">
          <div className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200">
          Bom Negócio
          </div>

          <ul className="mt-6">
            <Item to="/" label="Início (Ofertas)" icon={HomeIcon} exact />
          </ul>

          <ul>
            <Item to="/deals/create" label="Criar negociação" icon={CreateIcon} />
            <Item to="/deals/my-deals" label="Minhas negociações" icon={DealsIcon} />
            <Item to="/invites" label="Meus convites" icon={InvitesIcon} />
          </ul>

          <div className="my-6 px-6">
            <a
              href="/logout"
              className="flex w-full items-center justify-between rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
            >
              Sair
              <span className="ml-2" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
