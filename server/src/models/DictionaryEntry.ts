import { Schema, model } from 'mongoose';

const schema = new Schema({
  english: { type: String, required: true, unique: true, lowercase: true, trim: true },
  sinhala: { type: String, required: true },
  partOfSpeech: { type: String, default: '' },
  level: { type: String, default: '' },
  example: { type: String, default: '' },
  source: { type: String, enum: ['seed', 'api'], default: 'seed' },
});

export const DictionaryEntry = model('DictionaryEntry', schema);
