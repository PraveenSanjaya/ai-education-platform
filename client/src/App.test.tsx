import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

function renderAt(path: string) {
  localStorage.clear();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const body = url.includes('/public/stats')
        ? { words: 241, sentences: 482, lessons: 9, questionTypes: 10 }
        : url.includes('/public/sample')
          ? { words: [{ english: 'apple', sinhala: 'ඇපල්', imageUrl: '🍎' }] }
          : {};
      return { ok: true, status: 200, json: async () => body };
    }),
  );
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('App routing', () => {
  it('sends logged-out visitors from a private page to the login page', async () => {
    renderAt('/words');
    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows the home hero to visitors with both buttons, the demo card and real stats', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      /see, hear and say/i,
    );
    expect(screen.getByRole('link', { name: 'Start playing' })).toHaveAttribute(
      'href',
      '/register',
    );
    expect(screen.getByRole('link', { name: 'Choose your challenge' })).toHaveAttribute(
      'href',
      '/challenge',
    );
    expect(await screen.findByRole('region', { name: /try one word/i })).toBeInTheDocument();
    const stats = await screen.findByRole('list', { name: /app statistics/i });
    expect(stats).toHaveTextContent('241');
    expect(stats).toHaveTextContent('482');
    expect(stats).toHaveTextContent('grammar lessons');
  });
});
