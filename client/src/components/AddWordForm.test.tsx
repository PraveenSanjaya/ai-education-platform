import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddWordForm from './AddWordForm';

afterEach(() => vi.restoreAllMocks());

describe('AddWordForm', () => {
  it('fills the Sinhala meaning automatically and lets the user edit it', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ found: true, sinhala: 'පොත', partOfSpeech: 'noun', example: 'A book.' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<AddWordForm onAdded={() => {}} />);
    await userEvent.type(screen.getByLabelText(/english word/i), 'book');

    const sinhala = screen.getByLabelText(/sinhala meaning/i);
    await waitFor(() => expect(sinhala).toHaveValue('පොත'));
    expect(fetchMock).toHaveBeenCalledTimes(1); // debounced: one call for the whole word
    expect(fetchMock.mock.calls[0][0]).toContain('/api/dictionary/lookup?word=book');

    await userEvent.clear(sinhala);
    await userEvent.type(sinhala, 'ග්‍රන්ථය');
    expect(sinhala).toHaveValue('ග්‍රන්ථය');
  });
});
