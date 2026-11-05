import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Challenge from './Challenge';
import { pendingChallenge } from '../lib/challenge';

const auth = vi.hoisted(() => ({
  user: null as null | { challenge: string },
  setChallenge: vi.fn(),
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

function setup() {
  render(
    <MemoryRouter initialEntries={['/challenge']}>
      <Routes>
        <Route path="/challenge" element={<Challenge />} />
        <Route path="/" element={<p>dashboard</p>} />
        <Route path="/register" element={<p>register</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  auth.setChallenge = vi.fn().mockResolvedValue(undefined);
});

describe('Challenge picker', () => {
  it('shows Easy and Hard cards with the current one marked Selected', () => {
    auth.user = { challenge: 'easy' };
    setup();
    expect(screen.getByRole('heading', { name: 'Easy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hard' })).toBeInTheDocument();
    expect(screen.getAllByText('Selected')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Continue with Easy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose Hard' })).toBeInTheDocument();
    expect(screen.getByText(/4 answer choices/)).toBeInTheDocument();
    expect(screen.getByText(/3 answer choices/)).toBeInTheDocument();
  });

  it('switches the challenge to Hard and goes on to the dashboard', async () => {
    auth.user = { challenge: 'easy' };
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Choose Hard' }));
    expect(auth.setChallenge).toHaveBeenCalledWith('hard');
    expect(await screen.findByText('dashboard')).toBeInTheDocument();
  });

  it('shows an error if saving fails', async () => {
    auth.user = { challenge: 'easy' };
    auth.setChallenge = vi.fn().mockRejectedValue(new Error('Server down'));
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Choose Hard' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Server down');
  });

  it('lets a visitor choose first and keeps the choice for registration', async () => {
    auth.user = null;
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Choose Hard' }));
    await waitFor(() => expect(screen.getByText('register')).toBeInTheDocument());
    expect(pendingChallenge.get()).toBe('hard');
    expect(auth.setChallenge).not.toHaveBeenCalled();
  });
});
