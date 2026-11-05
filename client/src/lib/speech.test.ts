import { AUDIO_UNAVAILABLE, audioFailedBefore, pickEnglishVoice, speak } from './speech';
import { rulesFor } from './challenge';

type Handlers = { onstart?: () => void; onerror?: (e: { error: string }) => void };

function voice(lang: string, name = lang) {
  return { lang, name } as SpeechSynthesisVoice;
}

/** Installs a fake speechSynthesis. `onSpeak` decides what the utterance does. */
function fakeSynth(opts: {
  voices: SpeechSynthesisVoice[];
  laterVoices?: SpeechSynthesisVoice[];
  onSpeak?: (u: SpeechSynthesisUtterance & Handlers) => void;
}) {
  let current = opts.voices;
  const listeners: Array<() => void> = [];
  const spoken: Array<SpeechSynthesisUtterance> = [];
  const synth = {
    getVoices: () => current,
    cancel: vi.fn(),
    addEventListener: (_: string, fn: () => void) => listeners.push(fn),
    removeEventListener: vi.fn(),
    speak: vi.fn((u: SpeechSynthesisUtterance & Handlers) => {
      spoken.push(u);
      (opts.onSpeak ?? ((x) => x.onstart?.()))(u);
    }),
  };
  vi.stubGlobal('SpeechSynthesisUtterance', function (this: Record<string, unknown>, text: string) {
    this.text = text;
  });
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: synth });
  return {
    synth,
    spoken,
    fireVoicesChanged() {
      current = opts.laterVoices ?? current;
      listeners.forEach((fn) => fn());
    },
  };
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'speechSynthesis');
  sessionStorage.clear();
});

describe('speak helper', () => {
  it('uses rate 0.85 on Easy and 1 on Hard', async () => {
    const f = fakeSynth({ voices: [voice('en-US')] });
    await speak('apple', rulesFor('easy').speechRate);
    await speak('apple', rulesFor('hard').speechRate);
    expect(f.spoken.map((u) => u.rate)).toEqual([0.85, 1]);
  });

  it('cancels speech already playing, sets en-US and an English voice', async () => {
    const f = fakeSynth({ voices: [voice('si-LK'), voice('en-GB'), voice('en-US')] });
    expect(await speak('apple', 1)).toBe(true);
    expect(f.synth.cancel).toHaveBeenCalled();
    expect(f.spoken[0].lang).toBe('en-US');
    expect(f.spoken[0].voice?.lang).toBe('en-US');
  });

  it('prefers en-US, falls back to any English voice, else none', () => {
    expect(pickEnglishVoice([voice('en_GB'), voice('en-US')])?.lang).toBe('en-US');
    expect(pickEnglishVoice([voice('fr-FR'), voice('en_AU')])?.lang).toBe('en_AU');
    expect(pickEnglishVoice([voice('fr-FR')])).toBeUndefined();
  });

  it('waits for voiceschanged when the voice list starts empty', async () => {
    const f = fakeSynth({ voices: [], laterVoices: [voice('en-US')] });
    const p = speak('apple', 1);
    await Promise.resolve();
    expect(f.synth.speak).not.toHaveBeenCalled();
    f.fireVoicesChanged();
    expect(await p).toBe(true);
    expect(f.synth.speak).toHaveBeenCalledTimes(1);
  });

  it('gives up after 1.5 s with no English voice and reports failure', async () => {
    vi.useFakeTimers();
    const f = fakeSynth({ voices: [] });
    const p = speak('apple', 1);
    await vi.advanceTimersByTimeAsync(1500);
    expect(await p).toBe(false);
    expect(f.synth.speak).not.toHaveBeenCalled();
    expect(audioFailedBefore()).toBe(true);
  });

  it('reports failure when speech errors out, and remembers it', async () => {
    fakeSynth({
      voices: [voice('en-US')],
      onSpeak: (u) => u.onerror?.({ error: 'synthesis-failed' }),
    });
    expect(await speak('apple', 1)).toBe(false);
    expect(audioFailedBefore()).toBe(true);
  });

  it('does not treat an interrupted word as a failure', async () => {
    fakeSynth({ voices: [voice('en-US')], onSpeak: (u) => u.onerror?.({ error: 'interrupted' }) });
    expect(await speak('apple', 1)).toBe(true);
    expect(audioFailedBefore()).toBe(false);
  });

  it('reports failure when speech never starts', async () => {
    vi.useFakeTimers();
    fakeSynth({ voices: [voice('en-US')], onSpeak: () => {} });
    const p = speak('apple', 1);
    await vi.advanceTimersByTimeAsync(4000);
    expect(await p).toBe(false);
  });

  it('returns false when speechSynthesis does not exist', async () => {
    expect(await speak('apple', 1)).toBe(false);
  });

  it('has the message shown to learners', () => {
    expect(AUDIO_UNAVAILABLE).toBe("Audio isn't available on this device");
  });
});
