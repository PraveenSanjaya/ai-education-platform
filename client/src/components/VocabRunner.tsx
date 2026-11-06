import { useState } from 'react';
import type { FormEvent } from 'react';
import type { VocabQuestion } from '../lib/types';
import { Button, Card, TextInput } from './ui';
import { useChoiceHotkeys } from '../lib/useHotkeys';
import { maxReveals, revealLetters } from '../lib/challenge';

export interface VocabAnswer {
  question: VocabQuestion;
  response: string;
  correct: boolean;
}

export const isSpellingCorrect = (response: string, answer: string) =>
  response.trim().toLowerCase() === answer.trim().toLowerCase();

export default function VocabRunner({
  questions,
  hints = false,
  onFinish,
}: {
  questions: VocabQuestion[];
  /** Easy challenge: spelling questions show a first-letter hint and a letter reveal. */
  hints?: boolean;
  onFinish: (answers: VocabAnswer[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<VocabAnswer[]>([]);
  const [typed, setTyped] = useState('');
  const [current, setCurrent] = useState<VocabAnswer | null>(null);
  const [reveals, setReveals] = useState(1);

  const q = questions[index];
  const isLast = index === questions.length - 1;

  function check(response: string) {
    if (current) return;
    const correct =
      q.format === 'spelling' ? isSpellingCorrect(response, q.answer) : response === q.answer;
    setCurrent({ question: q, response, correct });
  }

  useChoiceHotkeys(q.options?.length ?? 0, !current && q.format !== 'spelling', (i) =>
    check(q.options![i]),
  );

  function next() {
    if (!current) return;
    const all = [...answers, current];
    setAnswers(all);
    setCurrent(null);
    setTyped('');
    setReveals(1);
    if (isLast) onFinish(all);
    else setIndex(index + 1);
  }

  const heading =
    q.format === 'en-si'
      ? 'What is the Sinhala meaning?'
      : q.format === 'si-en'
        ? 'Which English word matches?'
        : q.format === 'cloze'
          ? 'Complete the sentence'
          : 'Type the English word';

  return (
    <Card>
      <p className="text-sm text-slate-600">
        Question {index + 1} of {questions.length}
      </p>
      <div
        className="my-2 h-2 rounded bg-slate-200"
        role="progressbar"
        aria-label="Test progress"
        aria-valuenow={index}
        aria-valuemin={0}
        aria-valuemax={questions.length}
      >
        <div
          className="h-2 rounded bg-indigo-500"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>
      <h2 className="mt-4 text-sm font-medium text-slate-600">{heading}</h2>
      <p
        lang={q.format === 'si-en' || q.format === 'spelling' ? 'si' : 'en'}
        className={`my-2 font-bold ${q.format === 'cloze' ? 'text-2xl' : 'text-3xl'}`}
      >
        {q.prompt}
      </p>

      {q.format === 'spelling' ? (
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!current) check(typed);
          }}
          className="flex gap-2"
        >
          <TextInput
            aria-label="Your answer"
            autoFocus
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            value={typed}
            disabled={!!current}
            onChange={(e) => setTyped(e.target.value)}
          />
          {!current && <Button type="submit">Check</Button>}
        </form>
      ) : null}
      {q.format === 'spelling' && hints && !current && (
        <div className="mt-2 flex items-center gap-3">
          <p aria-live="polite" className="font-mono text-xl tracking-widest">
            {revealLetters(q.answer, reveals)}
          </p>
          <Button
            type="button"
            variant="secondary"
            disabled={reveals >= maxReveals(q.answer)}
            onClick={() => setReveals(reveals + 1)}
          >
            Reveal a letter
          </Button>
        </div>
      )}
      {q.format === 'spelling' ? null : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {q.options!.map((opt, i) => {
            const isAnswer = current && opt === q.answer;
            const isWrongPick = current && opt === current.response && !current.correct;
            return (
              <li key={opt}>
                <button
                  disabled={!!current}
                  onClick={() => check(opt)}
                  lang={q.format === 'en-si' ? 'si' : 'en'}
                  className={`w-full rounded border p-3 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isAnswer
                      ? 'border-green-600 bg-green-50'
                      : isWrongPick
                        ? 'border-red-600 bg-red-50'
                        : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <kbd aria-hidden="true" className="mr-2 text-xs opacity-60">
                    {i + 1}
                  </kbd>
                  {opt}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {current && (
        <div className="mt-4" role="status">
          <p
            className={
              current.correct ? 'font-semibold text-green-700' : 'font-semibold text-red-700'
            }
          >
            {current.correct ? 'Correct!' : `Incorrect. The answer is “${q.answer}”.`}
          </p>
          <Button className="mt-3" autoFocus onClick={next}>
            {isLast ? 'Finish' : 'Next'}
          </Button>
        </div>
      )}
    </Card>
  );
}
