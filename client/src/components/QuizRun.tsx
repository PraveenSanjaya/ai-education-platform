import { useState } from 'react';
import type { GrammarQuestion } from '../lib/types';
import QuestionCard from './QuestionCard';
import type { Answered } from './QuestionCard';
import { Card } from './ui';

/**
 * Runs a list of grammar questions one by one.
 * `maxMistakes` ends the run early once that many mistakes are made (used by the level check).
 */
export default function QuizRun({
  questions,
  maxMistakes,
  onFinish,
}: {
  questions: (GrammarQuestion & { lessonTitle?: string })[];
  maxMistakes?: number;
  onFinish: (answers: Answered[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answered[]>([]);
  const q = questions[index];

  function next(a: Answered) {
    const all = [...answers, a];
    const mistakes = all.filter((x) => !x.correct).length;
    const stop = maxMistakes !== undefined && mistakes >= maxMistakes;
    setAnswers(all);
    if (stop || index === questions.length - 1) onFinish(all);
    else setIndex(index + 1);
  }

  return (
    <Card>
      <p className="text-sm text-slate-600">
        Question {index + 1} of {questions.length}
        {q.lessonTitle && ` · ${q.lessonTitle}`}
      </p>
      <QuestionCard key={q.id} question={q} isLast={index === questions.length - 1} onNext={next} />
    </Card>
  );
}
