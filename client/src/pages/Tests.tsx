import { Link } from 'react-router-dom';
import { speechSupported } from '../lib/speech';

const TESTS = [
  {
    to: '/vocab-tests',
    icon: '📝',
    en: 'Vocabulary tests',
    si: 'වචන පරීක්ෂණ',
    desc: 'Meanings, spelling and mistakes review.',
  },
  {
    to: '/play',
    icon: '🖼️',
    en: 'Picture words',
    si: 'පින්තූර වචන',
    desc: 'Look, listen, reveal and type the word.',
  },
  {
    to: '/listen',
    icon: '🔊',
    en: 'Listen and type',
    si: 'අසා ලියන්න',
    desc: 'Hear the word and type it.',
    needsSpeech: true,
  },
  {
    to: '/grammar-tests',
    icon: '🧩',
    en: 'Grammar tests',
    si: 'ව්‍යාකරණ පරීක්ෂණ',
    desc: 'Mixed review and the level check.',
  },
];

export default function Tests() {
  const canSpeak = speechSupported();
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tests</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {TESTS.filter((t) => !t.needsSpeech || canSpeak).map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className="block rounded-lg border bg-white p-4 shadow-sm hover:border-indigo-400"
            >
              <span aria-hidden="true" className="text-3xl">
                {t.icon}
              </span>
              <p className="font-semibold">{t.en}</p>
              <p lang="si" className="text-sm text-slate-600">
                {t.si}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
