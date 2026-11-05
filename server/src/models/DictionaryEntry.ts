import { Schema, model } from 'mongoose';

const schema = new Schema({
  english: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sinhala: { type: String, required: true },
  partOfSpeech: { type: String, default: '' },
  level: { type: String, default: '' },
  example: { type: String, default: '' },
  sentenceEasy: { type: String, default: '' },
  sentenceHard: { type: String, default: '' },
  /** Emoji (or image URL) for the picture words game; set for concrete nouns. */
  imageUrl: { type: String, default: '' },
  source: { type: String, enum: ['seed', 'api'], default: 'seed' },
});

export const DictionaryEntry = model('DictionaryEntry', schema);
