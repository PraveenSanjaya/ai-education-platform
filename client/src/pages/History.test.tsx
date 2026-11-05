import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import History from './History';

const payload = {
  summary: { sessions: 1, averagePercent: 67, mistakes: 3, streak: 2 },
  items: [
    {
      id: '1',
      kind: 'grammar',
      title: 'Articles: a, an, the',
      score: 6,
      total: 9,
      percent: 67,
      createdAt: '2025-03-10T10:00:00Z',
      wrongItems: [
        {
          prompt: 'She is ___ teacher.',
          response: 'an',
          correctAnswer: 'a',
          explanation: 'Consonant sound.',
        },
      ],
    },
  ],
};

afterEach(() => vi.restoreAllMocks());

describe('History page', () => {
  it('shows summary, missed answers and clears after in-page confirmation', async () => {
    let cleared = false;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        cleared = true;
        return { ok: true, status: 204, json: async () => null };
      }
      const data = cleared
        ? { summary: { sessions: 0, averagePercent: 0, mistakes: 0, streak: 0 }, items: [] }
        : payload;
      return { ok: true, status: 200, json: async () => data };
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<History />);
    expect(await screen.findByText('Articles: a, an, the')).toBeInTheDocument();
    expect(screen.getByText('67%', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('She is ___ teacher.')).toBeInTheDocument(); // missed question inside details

    await userEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(cleared).toBe(false); // nothing deleted until confirmed
    await userEvent.click(screen.getByRole('button', { name: /yes, clear history/i }));

    await waitFor(() => expect(cleared).toBe(true));
    expect(await screen.findByText(/nothing here yet/i)).toBeInTheDocument();
  });
});
