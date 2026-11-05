import { DictionaryEntry } from '../models/DictionaryEntry.js';
import { dictionarySeed } from '../data/dictionaryData.js';

/** Upsert the seed dictionary. Safe to run repeatedly; API-cached entries are untouched. */
export async function seedDictionary() {
  await DictionaryEntry.bulkWrite(
    dictionarySeed.map((e) => ({
      updateOne: {
        filter: { english: e.english },
        update: { $set: { ...e, source: 'seed' } },
        upsert: true,
      },
    })),
  );
  console.log(`Dictionary seeded with ${dictionarySeed.length} words`);
}
