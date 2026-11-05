import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { rulesFor } from '../lib/challenge';
import { useTheme } from '../lib/theme';

/** Main navigation. Desktop shows English + Sinhala labels; the phone tab bar shows an icon and a short label. */
const NAV = [
  { to: '/', en: 'Home', si: 'මුල් පිටුව', icon: '🏠', end: true },
  { to: '/words', en: 'Words', si: 'වචන', icon: '📚' },
  { to: '/grammar', en: 'Grammar', si: 'ව්‍යාකරණ', icon: '✏️' },
  { to: '/tests', en: 'Tests', si: 'පරීක්ෂණ', icon: '🧪' },
  { to: '/history', en: 'History', si: 'ඉතිහාසය', icon: '🕘' },
  { to: '/profile', en: 'Profile', si: 'පැතිකඩ', icon: '👤' },
];

const topLink = ({ isActive }: { isActive: boolean }) =>
  `block rounded px-3 py-1.5 text-center text-sm font-medium leading-tight ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'
  }`;

const tabLink = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center gap-0.5 px-1 py-1.5 text-[11px] font-medium ${
    isActive ? 'text-indigo-700' : 'text-slate-600'
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const items =
    user?.role === 'admin'
      ? [...NAV, { to: '/admin', en: 'Admin', si: 'පරිපාලක', icon: '🛠️' }]
      : NAV;

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
          {user && (
            <nav aria-label="Main" className="hidden min-[700px]:block">
              <ul className="flex gap-1">
                {items.map((n) => (
                  <li key={n.to}>
                    <NavLink to={n.to} end={n.end} className={topLink}>
                      <span className="block">{n.en}</span>
                      <span lang="si" className="block text-[11px] font-normal opacity-80">
                        {n.si}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="ml-auto flex items-center gap-2">
            {user && (
              <Link
                to="/challenge"
                aria-label={`Challenge: ${rulesFor(user.challenge).label}. Change challenge`}
                className="rounded-full border border-indigo-600 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
              >
                {rulesFor(user.challenge).label}
              </Link>
            )}
            <button
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded px-3 py-1.5 text-sm hover:bg-slate-200"
            >
              <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
              <span className="ml-1 hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            {user && (
              <button
                className="rounded px-3 py-1.5 text-sm font-medium leading-tight hover:bg-slate-200"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                <span className="block">Log out</span>
                <span lang="si" className="block text-[11px] font-normal opacity-80">
                  ඉවත් වන්න
                </span>
              </button>
            )}
            {!user && (
              <Link
                to="/login"
                className="rounded px-3 py-1.5 text-sm font-medium hover:bg-slate-200"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        className={`mx-auto max-w-5xl p-4 focus:outline-none ${user ? 'pb-24 min-[700px]:pb-4' : ''}`}
      >
        <Outlet />
      </main>
      {user && (
        <nav
          aria-label="Main (phone)"
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-white min-[700px]:hidden"
        >
          <ul className="mx-auto grid max-w-lg grid-flow-col auto-cols-fr">
            {items.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end} className={tabLink}>
                  <span aria-hidden="true" className="text-xl">
                    {n.icon}
                  </span>
                  {n.en}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
