import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Vocabulary from './pages/Vocabulary';
import VocabTests from './pages/VocabTests';
import Grammar from './pages/Grammar';
import Lesson from './pages/Lesson';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/words" element={<Vocabulary />} />
          <Route path="/vocab-tests" element={<VocabTests />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/grammar/:id" element={<Lesson />} />
        </Route>
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}
