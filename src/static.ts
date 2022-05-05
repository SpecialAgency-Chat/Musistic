import { Snowflake, MessageButton, MessageActionRow } from "discord.js";
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

const backward = (customId: string) => new MessageButton()
  .setCustomId(customId + "-backward")
  .setEmoji("⬅️")
  .setStyle("SECONDARY");

const forward = (customId: string) => new MessageButton()
  .setCustomId(customId + "-forward")
  .setEmoji("➡️")
  .setStyle("SECONDARY");

const paginationRow = (customId: string) => new MessageActionRow()
  .addComponents([backward(customId), forward(customId)]);

export { Queue, GuildState, LoopMode, LoopNum, LoopMap, paginationRow, backward, forward };