import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Vocabulary from './pages/Vocabulary';
import VocabTests from './pages/VocabTests';
import Grammar from './pages/Grammar';
import Lesson from './pages/Lesson';
import GrammarTests from './pages/GrammarTests';
import History from './pages/History';
import Home from './pages/Home';
import Challenge from './pages/Challenge';
import Tests from './pages/Tests';
import PictureGame from './pages/PictureGame';
import ListenType from './pages/ListenType';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/challenge" element={<Challenge />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/words" element={<Vocabulary />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/play" element={<PictureGame />} />
          <Route path="/listen" element={<ListenType />} />
          <Route path="/vocab-tests" element={<VocabTests />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/grammar/:id" element={<Lesson />} />
          <Route path="/grammar-tests" element={<GrammarTests />} />
          <Route path="/history" element={<History />} />
        </Route>
        <Route element={<ProtectedRoute admin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}
