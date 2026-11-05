/**
 * Candidate base forms for simple English inflections, most likely first.
 * learns -> learn, studies -> study, running -> run, liked -> like, bigger -> big.
 * The caller checks each candidate against the dictionary.
 */
export function lemmaCandidates(raw: string): string[] {
  const w = raw.trim().toLowerCase();
  const out: string[] = [];
  const add = (s: string) => {
    if (s.length >= 2 && s !== w && !out.includes(s)) out.push(s);
  };

  if (w.endsWith('ies')) add(w.slice(0, -3) + 'y');
  if (w.endsWith('ied')) add(w.slice(0, -3) + 'y');
  if (/(ss|sh|ch|x|z|o)es$/.test(w)) add(w.slice(0, -2));
  if (w.endsWith('es')) add(w.slice(0, -1)); // makes -> make
  if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1));

  for (const suffix of ['ing', 'ed']) {
    if (w.endsWith(suffix) && w.length > suffix.length + 2) {
      const stem = w.slice(0, -suffix.length);
      add(stem); // walking -> walk
      add(stem + 'e'); // making -> make
      if (/(.)\1$/.test(stem)) add(stem.slice(0, -1)); // running -> run
    }
  }
  if (w.endsWith('er') || w.endsWith('est')) {
    const stem = w.endsWith('er') ? w.slice(0, -2) : w.slice(0, -3);
    add(stem);
    add(stem + 'e');
    if (/(.)\1$/.test(stem)) add(stem.slice(0, -1)); // bigger -> big
    if (stem.endsWith('i')) add(stem.slice(0, -1) + 'y'); // happier -> happy
  }

  const irregular: Record<string, string> = {
    went: 'go',
    gone: 'go',
    ate: 'eat',
    eaten: 'eat',
    saw: 'see',
    seen: 'see',
    took: 'take',
    taken: 'take',
    gave: 'give',
    given: 'give',
    wrote: 'write',
    written: 'write',
    spoke: 'speak',
    spoken: 'speak',
    came: 'come',
    ran: 'run',
    bought: 'buy',
    knew: 'know',
    known: 'know',
    thought: 'think',
    made: 'make',
    children: 'child',
    men: 'man',
    women: 'woman',
    better: 'good',
    best: 'good',
    worse: 'bad',
    worst: 'bad',
  };
  if (irregular[w]) out.unshift(irregular[w]);
  return out;
}
