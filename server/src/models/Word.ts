import { Schema, model, type InferSchemaType, type Types } from 'mongoose';

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  english: { type: String, required: true, trim: true, lowercase: true },
  sinhala: { type: String, required: true, trim: true },
  partOfSpeech: { type: String, default: '' },
  example: { type: String, default: '' },
  strength: { type: Number, min: 0, max: 5, default: 0 },
  seenCount: { type: Number, default: 0 },
  needsReview: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
schema.index({ userId: 1, english: 1 }, { unique: true });

export type WordDoc = InferSchemaType<typeof schema> & { _id: Types.ObjectId };
export const Word = model('Word', schema);

export function toPublicWord(w: WordDoc) {
  return {
    id: String(w._id),
    english: w.english,
    sinhala: w.sinhala,
    partOfSpeech: w.partOfSpeech,
    example: w.example,
    strength: w.strength,
    seenCount: w.seenCount,
    needsReview: w.needsReview,
    createdAt: w.createdAt,
  };
}
