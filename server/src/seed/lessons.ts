import { Lesson } from '../models/Lesson.js';
import { lessonsSeed } from '../data/lessonsData.js';

/** Upsert lessons by slug. New lessons can also be inserted straight into the `lessons` collection. */
export async function seedLessons() {
  await Lesson.bulkWrite(
    lessonsSeed.map((l) => ({
      updateOne: { filter: { slug: l.slug }, update: { $set: l as object }, upsert: true },
    })),
  );
  console.log(`Lessons seeded: ${lessonsSeed.length}`);
}
