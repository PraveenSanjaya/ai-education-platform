import { jest } from '@jest/globals';
import { clearDb, startTestDb, stopTestDb } from './testUtils';
import { config } from './config';

// translate.ts reads the key at call time, so setting it on the shared config object is enough.
config.translateKey = 'test-key';

beforeAll(startTestDb);
afterAll(stopTestDb);
beforeEach(clearDb);
afterEach(() => jest.restoreAllMocks());

describe('translation fallback', () => {
  it('calls the API for a word missing from the dictionary, then serves it from the cache', async () => {
    const { lookupWord } = await import('./services/dictionary.js');
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: { translations: [{ translatedText: 'දුරකථන ගුවන් විදුලිය' }] } }),
    } as Response);

    const first = await lookupWord('Walkie-talkie');
    expect(first).toMatchObject({ found: true, source: 'api', sinhala: 'දුරකථන ගුවන් විදුලිය' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('translation.googleapis.com');
    expect(JSON.parse(init.body as string)).toMatchObject({ q: 'walkie-talkie', target: 'si' });

    const second = await lookupWord('walkie-talkie');
    expect(second).toMatchObject({ found: true, source: 'dictionary' });
    expect(fetchMock).toHaveBeenCalledTimes(1); // cached, no second API call
  });

  it('reports not found when the API fails', async () => {
    const { lookupWord } = await import('./services/dictionary.js');
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    expect(await lookupWord('qwertyuiop')).toEqual({ found: false });
  });
});
