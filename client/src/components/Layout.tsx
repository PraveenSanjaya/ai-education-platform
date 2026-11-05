import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../lib/theme';

/** Bilingual navigation: English label with the Sinhala label underneath. */
const NAV = [
  { to: '/', en: 'Dashboard', si: 'මුල් පිටුව', end: true },
  { to: '/words', en: 'Words', si: 'වචන' },
  { to: '/vocab-tests', en: 'Vocab tests', si: 'වචන පරීක්ෂණ' },
  { to: '/grammar', en: 'Grammar', si: 'ව්‍යාකරණ' },
  { to: '/grammar-tests', en: 'Grammar tests', si: 'ව්‍යාකරණ පරීක්ෂණ' },
  { to: '/history', en: 'History', si: 'ඉතිහාසය' },
  { to: '/profile', en: 'Profile', si: 'පැතිකඩ' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-1.5 text-center text-sm font-medium leading-tight ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
  }`;

function NavLabel({ en, si }: { en: string; si: string }) {
  return (
    <>
      <span className="block">{en}</span>
      <span lang="si" className="block text-[11px] font-normal opacity-80">
        {si}
      </span>
    </>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items =
    user?.role === 'admin' ? [...NAV, { to: '/admin', en: 'Admin', si: 'පරිපාලක' }] : NAV;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-2"
      >
        Skip to content
      </a>
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 p-3">
          <Link to="/" className="mr-2 text-lg font-bold text-indigo-700">
            English for Sinhala
          </Link>
          <div className="ml-auto flex items-center gap-2 lg:order-last">
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded px-3 py-1.5 text-sm hover:bg-slate-200"
            >
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            {user && (
              <>
                <button
                  className="rounded px-3 py-1.5 text-sm font-medium leading-tight hover:bg-slate-200"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  <NavLabel en="Log out" si="ඉවත් වන්න" />
                </button>
                <button
                  className="rounded px-3 py-1.5 text-sm hover:bg-slate-200 lg:hidden"
                  aria-expanded={open}
                  aria-controls="main-nav"
                  onClick={() => setOpen(!open)}
                >
                  ☰ Menu
                </button>
              </>
            )}
          </div>
          {user && (
            <nav
              id="main-nav"
              aria-label="Main"
              className={`${open ? 'block' : 'hidden'} w-full lg:block lg:w-auto`}
            >
              <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:flex">
                {items.map((n) => (
                  <li key={n.to}>
                    <NavLink
                      to={n.to}
                      end={n.end}
                      className={linkClass}
                      onClick={() => setOpen(false)}
                    >
                      <NavLabel en={n.en} si={n.si} />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl p-4 focus:outline-none">
        <Outlet />
      </main>
    </div>
  );
}
