import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TypeWordRound from './TypeWordRound';
import type { PicWord } from '../lib/types';

vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ user: { challenge: 'easy' } }) }));

const word: PicWord = {
  english: 'apple',
  sinhala: 'ඇපල්',
  imageUrl: '🍎',
  sentence: 'I eat an apple.',
};

function stubSpeech() {
  const speak = vi.fn((u: { onstart?: () => void }) => u.onstart?.());
  vi.stubGlobal('SpeechSynthesisUtterance', function (this: { text: string }, text: string) {
    this.text = text;
  });
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak,
      cancel: vi.fn(),
      getVoices: () => [{ lang: 'en-US', name: 'Test voice' }],
    },
  });
  return speak;
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'speechSynthesis');
});

const round = (props: Partial<React.ComponentProps<typeof TypeWordRound>> = {}) => (
  <TypeWordRound
    word={word}
    mode="picture"
    rate={1}
    allowReveal
    isLast
    onDone={() => {}}
    {...props}
  />
);

describe('picture round', () => {
  it('reveals one more letter per tap and stops before the last letter', async () => {
    render(round());
    const reveal = screen.getByRole('button', { name: /reveal a letter/i });
    await userEvent.click(reveal);
    expect(screen.getByText('a _ _ _ _')).toBeInTheDocument();
    await userEvent.click(reveal);
    expect(screen.getByText('a p _ _ _')).toBeInTheDocument();
    await userEvent.click(reveal);
    await userEvent.click(reveal);
    expect(screen.getByText('a p p l _')).toBeInTheDocument();
    expect(reveal).toBeDisabled();
  });

  it('has no reveal button when hints are off (Hard)', () => {
    render(round({ allowReveal: false }));
    expect(screen.queryByRole('button', { name: /reveal/i })).not.toBeInTheDocument();
  });

  it('checks the typed word and reports how many letters were revealed', async () => {
    const onDone = vi.fn();
    render(round({ onDone }));
    await userEvent.click(screen.getByRole('button', { name: /reveal a letter/i }));
    await userEvent.type(screen.getByLabelText(/type the english word/i), 'Apple{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(onDone).toHaveBeenCalledWith(expect.objectContaining({ correct: true, reveals: 1 }));
  });

  it('shows the right answer when wrong', async () => {
    render(round());
    await userEvent.type(screen.getByLabelText(/type the english word/i), 'aple{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent(/not quite.*apple/i);
  });
});

describe('listen round', () => {
  const listen = (props: Partial<React.ComponentProps<typeof TypeWordRound>> = {}) =>
    round({ mode: 'listen', allowReveal: false, ...props });

  it('does not auto-play the first word: it shows a tap-to-start button', async () => {
    const speak = stubSpeech();
    render(listen());
    expect(speak).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /tap to start listening/i })).toBeInTheDocument();
  });

  it('auto-plays later words once audio is known to work', async () => {
    const speak = stubSpeech();
    const onAudio = vi.fn();
    render(listen({ autoPlay: true, onAudio }));
    await vi.waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('button', { name: /tap to start/i })).not.toBeInTheDocument();
    await vi.waitFor(() => expect(onAudio).toHaveBeenCalledWith(true));
  });

  it('taps to start, then the big speaker replays at the Easy rate', async () => {
    const speak = stubSpeech();
    const onAudio = vi.fn();
    render(listen({ rate: 0.85, onAudio }));
    await userEvent.click(screen.getByRole('button', { name: /tap to start listening/i }));
    await vi.waitFor(() => expect(onAudio).toHaveBeenCalledWith(true));
    expect(speak.mock.calls[0][0]).toMatchObject({ text: 'apple', lang: 'en-US', rate: 0.85 });
    await userEvent.click(screen.getByRole('button', { name: /play the word again/i }));
    expect(speak).toHaveBeenCalledTimes(2);
  });
});
