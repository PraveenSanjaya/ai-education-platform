import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/ui';
import Dashboard from './Dashboard';
import Landing from './Landing';

/** "/" shows the dashboard for learners and the hero for visitors. */
export default function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  return user ? <Dashboard /> : <Landing />;
}
