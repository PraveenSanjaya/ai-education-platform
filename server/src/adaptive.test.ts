import { pickWeighted, updateStrength, weightOf } from './services/adaptive';

describe('updateStrength', () => {
  it('adds 1 for a correct answer, capped at 5', () => {
    expect(updateStrength({ strength: 2, needsReview: false }, true).strength).toBe(3);
    expect(updateStrength({ strength: 5, needsReview: false }, true).strength).toBe(5);
  });

  it('subtracts 2 for a wrong answer, floored at 0, and flags review', () => {
    expect(updateStrength({ strength: 4, needsReview: false }, false)).toEqual({
      strength: 2,
      needsReview: true,
    });
    expect(updateStrength({ strength: 1, needsReview: false }, false).strength).toBe(0);
  });

  it('keeps needsReview below strength 3 and clears it from strength 3', () => {
    expect(updateStrength({ strength: 0, needsReview: true }, true)).toEqual({
      strength: 1,
      needsReview: true,
    });
    expect(updateStrength({ strength: 1, needsReview: true }, true).needsReview).toBe(true);
    expect(updateStrength({ strength: 2, needsReview: true }, true)).toEqual({
      strength: 3,
      needsReview: false,
    });
  });
});

describe('pickWeighted', () => {
  it('weights by (6 - strength)', () => {
    expect(weightOf(0)).toBe(6);
    expect(weightOf(5)).toBe(1);
  });

  it('returns distinct items and never more than available', () => {
    const items = [{ strength: 0 }, { strength: 3 }, { strength: 5 }];
    const picked = pickWeighted(items, 10);
    expect(picked).toHaveLength(3);
    expect(new Set(picked).size).toBe(3);
  });

  it('prefers weak words statistically', () => {
    const weak = { strength: 0, id: 'weak' };
    const strong = { strength: 5, id: 'strong' };
    let weakFirst = 0;
    for (let i = 0; i < 2000; i++) {
      if (pickWeighted([weak, strong], 1)[0] === weak) weakFirst++;
    }
    // expected 6/7 ~ 0.857
    expect(weakFirst / 2000).toBeGreaterThan(0.78);
    expect(weakFirst / 2000).toBeLessThan(0.93);
  });

  it('is deterministic with an injected rng', () => {
    const items = [
      { strength: 0, id: 'a' },
      { strength: 5, id: 'b' },
    ];
    expect(pickWeighted(items, 1, () => 0)[0].id).toBe('a');
    expect(pickWeighted(items, 1, () => 0.99)[0].id).toBe('b');
  });
});
