import { Schema, model, type Types } from 'mongoose';

export const HISTORY_KINDS = ['vocab', 'grammar', 'mixed', 'placement'] as const;
export type HistoryKind = (typeof HISTORY_KINDS)[number];

const wrongItemSchema = new Schema(
  {
    prompt: { type: String, required: true },
    response: { type: String, default: '' },
    correctAnswer: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false },
);

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: HISTORY_KINDS, required: true },
  title: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true },
  wrongItems: { type: [wrongItemSchema], default: [] },
  createdAt: { type: Date, default: Date.now, index: true },
});

export interface HistoryDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  kind: HistoryKind;
  title: string;
  score: number;
  total: number;
  percent: number;
  wrongItems: { prompt: string; response: string; correctAnswer: string; explanation: string }[];
  createdAt: Date;
}

export const History = model('History', schema);
