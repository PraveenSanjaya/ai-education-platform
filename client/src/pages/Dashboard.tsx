import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  return (
    <Card>
      <h1 className="text-xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-slate-600">Level: {user?.startLevel}</p>
    </Card>
  );
}
