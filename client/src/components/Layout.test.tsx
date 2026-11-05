import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Test', role: 'user', startLevel: 'Beginner' },
    logout: vi.fn(),
  }),
}));

function setup() {
  return render(
    <MemoryRouter>
      <Layout />
    </MemoryRouter>,
  );
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
  });

  it('shows bilingual navigation labels', () => {
    setup();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Dashboard');
    expect(nav).toHaveTextContent('මුල් පිටුව');
    expect(nav).toHaveTextContent('Grammar');
    expect(nav).toHaveTextContent('ව්‍යාකරණ');
  });

  it('toggles and remembers the dark theme', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('offers a skip link and a menu toggle for small screens', () => {
    setup();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('button', { name: /menu/i })).toHaveAttribute('aria-expanded', 'false');
  });
});
