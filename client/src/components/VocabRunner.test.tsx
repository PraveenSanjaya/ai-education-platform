import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VocabRunner, { isSpellingCorrect } from './VocabRunner';
import type { VocabQuestion } from '../lib/types';

const questions: VocabQuestion[] = [
  {
    wordId: '1',
    format: 'en-si',
    prompt: 'book',
    options: ['පොත', 'පෑන', 'මේසය', 'දොර'],
    answer: 'පොත',
  },
  { wordId: '2', format: 'spelling', prompt: 'වතුර', answer: 'water' },
];

describe('isSpellingCorrect', () => {
  it('ignores case and surrounding spaces', () => {
    expect(isSpellingCorrect('  Water ', 'water')).toBe(true);
    expect(isSpellingCorrect('watter', 'water')).toBe(false);
  });
});

describe('VocabRunner', () => {
  it('shows feedback, then collects answers across both formats', async () => {
    const onFinish = vi.fn();
    render(<VocabRunner questions={questions} onFinish={onFinish} />);

    await userEvent.click(screen.getByRole('button', { name: 'පෑන' }));
    expect(screen.getByRole('status')).toHaveTextContent(/incorrect.*පොත/i);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    await userEvent.type(screen.getByLabelText(/your answer/i), 'water{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    await userEvent.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onFinish).toHaveBeenCalledTimes(1);
    const answers = onFinish.mock.calls[0][0];
    expect(answers.map((a: { correct: boolean }) => a.correct)).toEqual([false, true]);
  });
});

describe('VocabRunner keyboard support', () => {
  it('answers with a number key and moves on with Enter', async () => {
    const onFinish = vi.fn();
    render(<VocabRunner questions={[questions[0]]} onFinish={onFinish} />);
    await userEvent.keyboard('1'); // option 1 is the first listed option; shuffled by the server, here 'පොත'
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    await userEvent.keyboard('{Enter}'); // the Finish button is focused automatically
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
