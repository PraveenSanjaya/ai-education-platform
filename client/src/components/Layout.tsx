import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const link = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-200'}`;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 p-3">
          <Link to="/" className="mr-4 text-lg font-bold text-indigo-700">
            English for Sinhala
          </Link>
          {user && (
            <>
              <NavLink to="/" end className={link}>
                Dashboard
              </NavLink>
              <NavLink to="/words" className={link}>
                Words
              </NavLink>
              <NavLink to="/vocab-tests" className={link}>
                Vocab tests
              </NavLink>
              <NavLink to="/grammar" className={link}>
                Grammar
              </NavLink>
              <NavLink to="/profile" className={link}>
                Profile
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" className={link}>
                  Admin
                </NavLink>
              )}
              <button
                className="ml-auto rounded px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
