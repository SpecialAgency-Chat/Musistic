import { Snowflake } from "discord.js";
import { AudioPlayer, AudioResource } from "@discordjs/voice";

interface Queue {
  index?: number;
  title: string;
  url: string;
  thumbnail: string;
  time: number;
  views: number;
}

type LoopNum = 0 | 1 | 2;
type LoopMode = "none" | "song" | "queue";
const LoopMap: ReadonlyMap<LoopNum, LoopMode> = new Map([
  [0, "none"],
  [1, "song"],
  [2, "queue"],
]);

interface GuildState {
  id: Snowflake,
  player: AudioPlayer
  queue: Queue[],
  channel: Snowflake;
  loop: LoopMode;
  volume: number;
  resource?: AudioResource;
}

export { Queue, GuildState, LoopMode, LoopNum, LoopMap };