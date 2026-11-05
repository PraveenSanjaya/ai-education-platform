import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAnswerCorrect } from '../lib/grading';
import type { GrammarQuestion } from '../lib/types';
import { Button, TextInput } from './ui';

export interface Answered {
  question: GrammarQuestion;
  response: string;
  correct: boolean;
}

/** One grammar question with instant feedback (correct / incorrect, right answer, explanation). */
export default function QuestionCard({
  question,
  isLast,
  onNext,
}: {
  question: GrammarQuestion;
  isLast: boolean;
  onNext: (a: Answered) => void;
}) {
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState<Answered | null>(null);

  function check(response: string) {
    if (result) return;
    setResult({ question, response, correct: isAnswerCorrect(question, response) });
  }

  function choiceClass(opt: string) {
    if (!result) return 'bg-white hover:bg-slate-50';
    if (isAnswerCorrect(question, opt)) return 'border-green-600 bg-green-50';
    if (opt === result.response) return 'border-red-600 bg-red-50';
    return 'bg-white opacity-70';
  }

  return (
    <div>
      <p className="my-2 text-xl font-semibold">{question.prompt}</p>

      {question.type === 'fill' && (
        <form
          className="flex gap-2"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            check(typed);
          }}
        >
          <TextInput
            aria-label="Your answer"
            autoFocus
            autoComplete="off"
            value={typed}
            disabled={!!result}
            onChange={(e) => setTyped(e.target.value)}
          />
          {!result && <Button type="submit">Check</Button>}
        </form>
      )}

      {(question.type === 'mc' || question.type === 'tf') && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {question.options!.map((opt) => (
            <li key={opt}>
              <button
                disabled={!!result}
                onClick={() => check(question.type === 'tf' ? opt.toLowerCase() : opt)}
                className={`w-full rounded border p-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${choiceClass(
                  question.type === 'tf' ? opt.toLowerCase() : opt,
                )}`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}

      {result && (
        <div className="mt-4" role="status">
          <p
            className={
              result.correct ? 'font-semibold text-green-700' : 'font-semibold text-red-700'
            }
          >
            {result.correct ? 'Correct!' : `Incorrect. Right answer: ${question.answers[0]}`}
          </p>
          {question.explanation && <p className="text-sm text-slate-700">{question.explanation}</p>}
          <Button className="mt-3" autoFocus onClick={() => onNext(result)}>
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </div>
  );
}
