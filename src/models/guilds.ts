import { Schema, model } from 'mongoose';

export interface Guild {
  guild_id: string;
  is_banned: boolean;
  language: string;
  queue: string[];
}

const schema = new Schema<Guild>({
  guild_id: { type: String, required: true, unique: true },
  is_banned: { type: Boolean, required: true, default: false },
  language: { type: String, required: true, default: 'en' },
  // @ts-expect-error
  queue: { type: Array, required: true, default: [] },
});

export default model('Guild', schema);