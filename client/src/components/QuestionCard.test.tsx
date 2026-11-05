import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionCard from './QuestionCard';
import { isAnswerCorrect, normalise } from '../lib/grading';
import type { GrammarQuestion } from '../lib/types';

const fillQ: GrammarQuestion = {
  id: 'q1',
  type: 'fill',
  prompt: 'We ___ visit Kandy next week.',
  answers: ['are going to', 'will'],
  explanation: 'A plan: are going to.',
};
const tfQ: GrammarQuestion = {
  id: 'q2',
  type: 'tf',
  prompt: '"I will to go" is correct.',
  options: ['True', 'False'],
  answers: ['false'],
  explanation: 'No "to" after will.',
};

describe('grading helpers', () => {
  it('accepts any listed answer, ignoring case and spacing', () => {
    expect(normalise('  Are  Going To. ')).toBe('are going to');
    expect(isAnswerCorrect(fillQ, 'WILL')).toBe(true);
    expect(isAnswerCorrect(fillQ, 'would')).toBe(false);
    expect(isAnswerCorrect(fillQ, '')).toBe(false);
  });
});

describe('QuestionCard', () => {
  it('accepts several correct answers for fill in the blank and explains', async () => {
    const onNext = vi.fn();
    render(<QuestionCard question={fillQ} isLast={false} onNext={onNext} />);
    await userEvent.type(screen.getByLabelText(/your answer/i), 'will{Enter}');
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
    expect(screen.getByRole('status')).toHaveTextContent('A plan');
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ correct: true }));
  });

  it('marks a wrong true/false choice and shows the right answer', async () => {
    render(<QuestionCard question={tfQ} isLast onNext={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'True' }));
    expect(screen.getByRole('status')).toHaveTextContent(/incorrect.*false/i);
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
  });
});
