import { createApp } from './app.js';
import { connectDb } from './db.js';
import { config } from './config.js';
import { DictionaryEntry } from './models/DictionaryEntry.js';
import { seedDictionary } from './seed/dictionary.js';
import { Lesson } from './models/Lesson.js';
import { seedLessons } from './seed/lessons.js';

async function main() {
  await connectDb();
  // First run convenience: make sure the dictionary is populated.
  if ((await DictionaryEntry.estimatedDocumentCount()) === 0) await seedDictionary();
  if ((await Lesson.estimatedDocumentCount()) === 0) await seedLessons();
  createApp().listen(config.port, () => console.log(`API listening on :${config.port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
