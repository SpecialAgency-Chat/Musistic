import { Snowflake, MessageButton } from "discord.js";
import { AudioPlayer, AudioResource } from "@discordjs/voice";

interface Queue {
  index?: number;
  title: string;
  url: string;
  thumbnail: string;
  time: number;
  views: number;
  description: string | null;
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
};

const back = (customId: string) => new MessageButton()
  .setCustomId(customId)
  .setEmoji("⬅️")
  .setStyle("SECONDARY");

const forward = (customId: string) => new MessageButton()
  .setCustomId(customId)
  .setEmoji("➡️️")
  .setStyle("SECONDARY");

export { Queue, GuildState, LoopMode, LoopNum, LoopMap };