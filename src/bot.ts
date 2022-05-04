import {
  Channel,
  Client,
  CommandInteraction,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  InteractionReplyOptions,
  Message,
  MessageActionRow,
  MessageEmbed,
  Permissions,
  Snowflake,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  StreamType,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import dotenv from "dotenv";
import Text from "./text";
import { EventEmitter } from "./eventemitter";
import { MessageOptions } from "child_process";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import yts from "yt-search";
import { Playing } from "./util";
import { Queue, GuildState, LoopMap, LoopMode, LoopNum } from "./static";

const reply = (
  interaction: CommandInteraction,
  content: string | null,
  options?: InteractionReplyOptions
): Promise<Message> => {
  return interaction.reply({
    content,
    fetchReply: true,
    ...options,
  }) as unknown as Promise<Message>;
};

const edit = (message: Message, content: string, options?: MessageOptions) => {
  return message.edit({ content, ...options }) as Promise<Message>;
};

const isVoice = (channel: unknown): channel is VoiceChannel => {
  if (channel instanceof VoiceChannel) return true;
  return false;
};

const states: Map<Snowflake, GuildState> = new Map();

class Bot extends EventEmitter {
  public client: Client;
  public constructor() {
    super();
    this.client = new Client({
      intents: 32509,
      allowedMentions: { parse: [], repliedUser: false },
    });
    dotenv.config();
  }
  public start() {
    this.client.login(process.env.BOT_TOKEN);
    this.client.on("ready", () => {
      this.emit("ready", this.client);
    });
    this.client.on("interactionCreate", (i) => this.interactionCreate(i));
  }
  private async interactionCreate(i: Interaction) {
    if (i.isCommand()) {
      const command = i.commandName;
      if (!i.inCachedGuild()) {
        reply(i, Text["bot.command.errors.notInGuild"], { ephemeral: true });
        return;
      }
      const selfPerm = i.channel?.permissionsFor(i.guild.me as GuildMember);
      if (
        !selfPerm?.has(Permissions.FLAGS.VIEW_CHANNEL) ||
        !selfPerm.has(Permissions.FLAGS.SEND_MESSAGES)
      ) {
        reply(i, Text["bot.command.errors.botNoPermission"], {
          ephemeral: true,
        });
        return;
      }
      if (command === "leave" || command === "loop" || command === "volume" || command === "queue") {
        if (!states.get(i.guild.id)) {
          reply(i, Text["bot.command.errors.notInVoice"], { ephemeral: true });
          return;
        }
      }
      switch (command) {
        case "join":
          this.join(i);
          break;
        case "leave":
          this.leave(i);
          break;
        case "play":
          this.play(i);
          break;
        case "loop":
          this.loop(i);
          break;
        case "volume":
          this.volume(i);
          break;
        case "queue":
          this.queue(i);
          break;
        case "skip":
          this.skip(i);
          break;
      }
    }
  }
  private _join(channel: VoiceChannel): GuildState {
    if (
      !channel
        .permissionsFor(channel.guild.me as GuildMember)
        .has(Permissions.FLAGS.CONNECT)
    ) {
      throw new Error("Bot has no permissions to join this channel");
    }
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    connection.subscribe(player);
    const content: GuildState = {
      channel: channel.id,
      id: channel.guild.id,
      player,
      queue: [],
      loop: "none",
      volume: 100,
    };
    states.set(channel.guild.id, content);
    return content;
  }
  private async join(i: CommandInteraction<"cached">) {
    const channel = i.member.voice.channel || i.options.getChannel("channel");
    if (!channel) {
      return reply(i, Text["bot.command.errors.notInVoice"], {
        ephemeral: true,
      });
    }
    if (!isVoice(channel)) {
      return reply(i, Text["bot.command.errors.invalidChannelType"], {
        ephemeral: true,
      });
    }
    if (states.get(channel.guild.id)?.player) {
      return reply(i, Text["bot.command.errors.alreadyInVoice"], {
        ephemeral: true,
      });
    }

    const msg = await reply(i, Text["bot.command.joiningText"]);
    try {
      this._join(channel);
      await edit(msg, Text["bot.command.joinedText"]);
    } catch {
      await edit(msg, Text["bot.command.errors.cantJoin"]);
      return;
    }
  }
  private async leave(i: CommandInteraction<"cached">) {
    const state = states.get(i.guild.id);
    if (!state) {
      return reply(i, Text["bot.command.errors.notInVoice"], {
        ephemeral: true,
      });
    }
    const msg = await reply(i, Text["bot.command.leavingText"]);
    const connection = getVoiceConnection(state.id);
    connection?.destroy();
    states.delete(i.guild.id);
    await edit(msg, Text["bot.command.leftText"]);
  }
  private async _play(
    guildId: string,
    channel: GuildTextBasedChannel
  ): Promise<any> {
    const state = states.get(guildId);
    if (!state) {
      throw new Error("No state found");
    }
    const queue = state.queue;
    if (queue.length === 0) {
      return states.delete(guildId);
    }
    const current = queue[0];
    const connection = getVoiceConnection(state.id);
    if (!connection) {
      throw new Error("No connection found");
    }
    const player = state.player;
    const stream = ytdl(current.url, {
      filter: (format) =>
        format.audioCodec === "opus" && format.container === "webm",
      quality: "highest",
      highWaterMark: 32 * 1024 * 1024,
    });
    const resource = createAudioResource(stream, {
      inputType: StreamType.WebmOpus,
      inlineVolume: true,
    });
    resource.volume?.setVolume(Math.round(state.volume / 10) / 10);
    state.resource = resource;
    player.play(resource);
    await channel.send({
      embeds: [
        Playing(
          state.queue[0].title,
          state.queue[0].url,
          state.queue[0].thumbnail,
          state.queue[0].views
        ),
      ],
    });
    await entersState(player, AudioPlayerStatus.Playing, 10 * 1000);
    this.emit("musicStart", current);
    await entersState(player, AudioPlayerStatus.Idle, 24 * 60 * 60 * 1000);
    this.emit("musicEnd", current);
    if (state.loop === "song") {
      return this._play(guildId, channel);
    } else if (state.loop === "queue") {
      state.queue.push(state.queue.shift() as Queue);
      states.set(guildId, state);
      return this._play(guildId, channel);
    }
    state.queue.shift();
    states.set(guildId, state);
    return this._play(guildId, channel);
  }
  private async play(i: CommandInteraction<"cached">) {
    let state = states.get(i.guild.id);
    let msg: Message;
    const query = i.options.getString("query");
    if (!query) {
      return reply(i, Text["bot.command.errors.invalidArguments"], {
        ephemeral: true,
      });
    }
    if (!state) {
      if (!i.member.voice.channel) {
        return reply(i, Text["bot.command.errors.notInVoice"], {
          ephemeral: true,
        });
      }
      if (!isVoice(i.member.voice.channel)) {
        return reply(i, Text["bot.command.errors.invalidChannelType"], {
          ephemeral: true,
        });
      }
      msg = await reply(i, Text["bot.command.joiningText"]);
      try {
        state = this._join(i.member.voice.channel);
        msg = await edit(msg, Text["bot.command.joinedText.fromPlay"]);
      } catch {
        await edit(msg, Text["bot.command.errors.cantJoin"]);
        return;
      }
    } else {
      msg = await reply(i, Text["bot.command.searchingText"]);
    }
    const isSong = (url: string) => ytdl.validateURL(url);
    const isPlaylist = (url: string) => ytpl.validateID(url);
    const isResult = async (query: string) => {
      const Result = await yts(query);
      return 1 <= Result.videos.length ? Result.videos[0].url : null;
    };
    if (isSong(query)) {
      const songInfo = await ytdl.getInfo(query);
      const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        thumbnail: songInfo.videoDetails.thumbnails[0].url,
        time: Number(songInfo.videoDetails.lengthSeconds),
        views: Number(songInfo.videoDetails.viewCount),
        description: songInfo.videoDetails.description,
      } as const;
      state.queue.push(song);
      states.set(i.guild.id, state);
      await edit(msg, Text["bot.command.addedToQueueText"](song.title));
    } else if (isPlaylist(query)) {
      const songInfo = await ytpl(query);
      for (const item of songInfo.items) {
        const viewcount = await ytdl.getInfo(item.shortUrl);
        const song = {
          title: item.title,
          url: item.shortUrl,
          thumbnail: item.thumbnails[0].url as string,
          time: item.durationSec as number,
          index: item.index,
          views: Number(viewcount.videoDetails.viewCount),
          description: viewcount.videoDetails.description,
        };
        state.queue.push(song);
      }
      let times = 0;
      songInfo.items.forEach((items) => (times += items.durationSec as number));
      await edit(
        msg,
        Text["bot.command.addedToQueueMulti"](`${songInfo.estimatedItemCount}`)
      );
    } else {
      const qqq = await isResult(query);
      if (!qqq) {
        return edit(msg, Text["bot.command.errors.notFound"]);
      }
      const songInfo = await ytdl.getInfo(qqq);
      const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
        thumbnail: songInfo.videoDetails.thumbnails[0].url,
        time: Number(songInfo.videoDetails.lengthSeconds),
        views: Number(songInfo.videoDetails.viewCount),
        description: songInfo.videoDetails.description,
      };
      state.queue.push(song);
      await edit(msg, Text["bot.command.addedToQueueText"](song.title));
    }
    states.set(i.guild.id, state);
    state = states.get(i.guild.id) as GuildState;
    if (state.queue.length === 1) {
      this._play(i.guild.id, i.channel!);
    }
  }
  private async loop(i: CommandInteraction<"cached">) {
    const arg = i.options.getInteger("type");
    if (arg !== 0 && !arg) {
      return;
    }
    const r = LoopMap.get(arg as LoopNum) as LoopMode;
    const state = states.get(i.guild.id) as GuildState;
    state.loop = r;
    states.set(i.guild.id, state);
    return reply(i, Text["bot.command.loopedText"](r));
  }
  private async volume(i: CommandInteraction<"cached">) {
    const arg = i.options.getInteger("volume");
    if (arg !== 0 && !arg) {
      return;
    }
    const state = states.get(i.guild.id) as GuildState;
    state.volume = arg;
    states.set(i.guild.id, state);
    const player = state.player;
    if (player) {
      state.resource?.volume?.setVolume(Math.round(state.volume / 10) / 10);
    }
    return reply(i, Text["bot.command.changedVolumeText"](arg));
  }
  private async queue(i: CommandInteraction<"cached">) {
    const state = states.get(i.guild.id) as GuildState;
    const queue = state.queue;
    await reply(i, null, {
      embeds: [
        new MessageEmbed()
          .setTitle(Text["bot.embed.queues.title"])
          .setColor("BLUE")
          .setFooter({ text: Text["bot.embed.queues.footer"](queue.length) })
          .setFields(queue.map((song, index) => {
            return {
              name: `${index + 1}. ${song.title}`,
              value: `[${song.description?.slice(0, 50).replace(/(\r|\n)/g, " ") || Text["bot.embed.queues.noDescription"]}${song.description && song.description.length > 50 ? "...":""}](${song.url})\n\n${song.time}s`,
            }
          }))
      ]
    });
  }
  private async skip(i: CommandInteraction<"cached">) {
    const state = states.get(i.guild.id) as GuildState;
    const player = state.player;
    if (!player) {
      return;
    }
    if (state.queue.length === 0) {
      return reply(i, Text["bot.command.errors.queueEmpty"]);
    }
    player.stop();
    state.queue.shift();
    states.set(i.guild.id, state);
    if (state.queue.length === 0) {
      return reply(i, Text["bot.command.skippedTextQueueEmpty"]);
    } else {
      this._play(i.guild.id, i.channel!);
    }
    return reply(i, Text["bot.command.skippedText"]);
  }
}

export default new Bot();
