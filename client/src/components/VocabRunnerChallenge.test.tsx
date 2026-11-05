import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VocabRunner from './VocabRunner';
import type { VocabQuestion } from '../lib/types';

const spelling: VocabQuestion[] = [
  { wordId: '2', format: 'spelling', prompt: 'වතුර', answer: 'water' },
];
const cloze: VocabQuestion[] = [
  {
    wordId: '3',
    format: 'cloze',
    prompt: 'Please drink enough _____ during the day.',
    options: ['water', 'house', 'bread', 'table'],
    answer: 'water',
  },
];

describe('VocabRunner challenge behaviour', () => {
  it('Easy shows a first-letter hint and a letter reveal for spelling', async () => {
    render(<VocabRunner questions={spelling} hints onFinish={() => {}} />);
    expect(screen.getByText('w _ _ _ _')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /reveal a letter/i }));
    expect(screen.getByText('w a _ _ _')).toBeInTheDocument();
  });

  it('Hard shows no hints for spelling', () => {
    render(<VocabRunner questions={spelling} onFinish={() => {}} />);
    expect(screen.queryByText('w _ _ _ _')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reveal/i })).not.toBeInTheDocument();
  });

  it('renders a complete-the-sentence question with 4 choices', async () => {
    render(<VocabRunner questions={cloze} onFinish={() => {}} />);
    expect(screen.getByText('Complete the sentence')).toBeInTheDocument();
    expect(screen.getByText(/enough _____ during/)).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(4);
    await userEvent.click(screen.getByRole('button', { name: 'water' }));
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
  });
});
