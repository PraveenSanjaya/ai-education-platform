import { maxReveals, pendingChallenge, revealLetters, rulesFor } from './challenge';

describe('revealLetters', () => {
  it('shows one more letter per step', () => {
    expect(revealLetters('cat', 0)).toBe('_ _ _');
    expect(revealLetters('cat', 1)).toBe('c _ _');
    expect(revealLetters('cat', 2)).toBe('c a _');
  });

  it('never reveals the whole word', () => {
    expect(maxReveals('cat')).toBe(2);
    expect(revealLetters('cat', 3)).toBe('c a _');
    expect(revealLetters('cat', 99)).toBe('c a _');
    expect(revealLetters('a', 1)).toBe('_');
  });

  it('ignores negative counts and keeps non-letters visible', () => {
    expect(revealLetters('cat', -2)).toBe('_ _ _');
    expect(revealLetters('ice-cream', 1)).toBe('i _ _ - _ _ _ _ _');
  });
});

describe('challenge rules', () => {
  it('easy: 3 choices, hints, slower speech', () => {
    expect(rulesFor('easy')).toMatchObject({ choices: 3, hints: true, speechRate: 0.85 });
  });

  it('hard: 4 choices, no hints, normal speech', () => {
    expect(rulesFor('hard')).toMatchObject({ choices: 4, hints: false, speechRate: 1 });
  });

  it('defaults to easy', () => {
    expect(rulesFor(undefined).label).toBe('Easy');
  });
});

describe('pendingChallenge', () => {
  it('remembers a choice made before registering', () => {
    localStorage.clear();
    expect(pendingChallenge.get()).toBeNull();
    pendingChallenge.set('hard');
    expect(pendingChallenge.get()).toBe('hard');
    pendingChallenge.clear();
    expect(pendingChallenge.get()).toBeNull();
  });
});
