import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

const auth = vi.hoisted(() => ({
  user: { id: '1', name: 'Test', role: 'user', startLevel: 'Beginner', challenge: 'easy' } as {
    id: string;
    name: string;
    role: string;
    startLevel: string;
    challenge: string;
  } | null,
  logout: () => {},
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

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
    auth.user = { id: '1', name: 'Test', role: 'user', startLevel: 'Beginner', challenge: 'easy' };
  });

  it('shows bilingual navigation labels on desktop', () => {
    setup();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('මුල් පිටුව');
    expect(nav).toHaveTextContent('Grammar');
    expect(nav).toHaveTextContent('ව්‍යාකරණ');
  });

  it('has a phone tab bar with the six short labels', () => {
    setup();
    const bar = within(screen.getByRole('navigation', { name: 'Main (phone)' }));
    for (const label of ['Home', 'Words', 'Grammar', 'Tests', 'History', 'Profile']) {
      expect(bar.getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole('navigation', { name: 'Main (phone)' }).className).toMatch(
      /fixed.*bottom-0.*min-\[700px\]:hidden/,
    );
  });

  it('shows the challenge pill linking to the picker, and updates with the user', () => {
    const { unmount } = setup();
    const pill = screen.getByRole('link', { name: /challenge: easy/i });
    expect(pill).toHaveAttribute('href', '/challenge');
    expect(pill).toHaveTextContent('Easy');
    unmount();
    auth.user!.challenge = 'hard';
    setup();
    expect(screen.getByRole('link', { name: /challenge: hard/i })).toHaveTextContent('Hard');
  });

  it('hides navigation and the pill for visitors but keeps the theme toggle', () => {
    auth.user = null;
    setup();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /challenge/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it('toggles and remembers the dark theme', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: /switch to dark theme/i }));
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    await userEvent.click(screen.getByRole('button', { name: /switch to light theme/i }));
    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('offers a skip link', () => {
    setup();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
  });
});
