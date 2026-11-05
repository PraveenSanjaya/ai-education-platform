import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Nimal', startLevel: 'Beginner' } }),
}));

afterEach(() => vi.restoreAllMocks());

function mockProgress(body: object) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body }),
  );
}

const base = {
  streak: 3,
  wordsSaved: 12,
  wordsLearned: 4,
  lessonsMastered: 2,
  totalLessons: 9,
  lastScores: [],
  next: { lessonId: 'abc', title: 'To be: am, is, are', titleSi: 'To be', bestPercent: 55 },
};

describe('Dashboard', () => {
  it('shows stats, the recommended next step and the level-check prompt for new learners', async () => {
    mockProgress(base);
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByText('To be: am, is, are')).toBeInTheDocument();
    expect(screen.getByText(/best so far is 55%/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue lesson/i })).toHaveAttribute(
      'href',
      '/grammar/abc',
    );
    expect(screen.getByText('2 / 9')).toBeInTheDocument();
    expect(screen.getByText('Day streak').nextSibling).toHaveTextContent('3');
    expect(screen.getByRole('link', { name: /go to the level check/i })).toBeInTheDocument();
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument();
  });

  it('draws a bar for each of the last scores', async () => {
    mockProgress({
      ...base,
      lastScores: [
        { id: '1', kind: 'vocab', title: 'Spelling', percent: 80, createdAt: '2025-03-10' },
        { id: '2', kind: 'grammar', title: 'Articles', percent: 40, createdAt: '2025-03-11' },
      ],
    });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    const chart = await screen.findByRole('img', { name: /last 2 scores/i });
    expect(chart.querySelectorAll('rect')).toHaveLength(2);
    expect(screen.queryByText(/not sure where to start/i)).not.toBeInTheDocument();
  });

  it('suggests a mixed review when every lesson is mastered', async () => {
    mockProgress({ ...base, next: null });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('link', { name: /mixed grammar review/i })).toBeInTheDocument();
  });
});
