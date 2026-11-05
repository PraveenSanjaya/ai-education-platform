import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

describe('App', () => {
  it('sends logged-out visitors to the login page', async () => {
    localStorage.clear();
    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });
});
