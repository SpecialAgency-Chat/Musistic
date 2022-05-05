import { LoopMode } from "./static";

const data = {
  // Core Text
  "core.loading": "Loading...",
  "core.loadingEnvFile": "Loading .env file...",
  "core.errors.noEnvFile": "No .env file found!",
  "core.foundEnvFile": "Found .env file!",
  "core.loadingBotToken": "Loading Bot Token...",
  "core.errors.noBotToken": "No Bot Token found! please add BOT_TOKEN in .env file",
  "core.foundBotToken": "Bot Token found!",
  "core.launchingBot": "Launching Bot...",
  "core.launchedBot": (tag: string) => "Bot Launched! Tag: " + tag,
  // Bot Text
  "bot.command.joiningText": "Joining...",
  "bot.command.joinedText": "Joined!",
  "bot.command.joinedText.fromPlay": "Joined! Searching...",
  "bot.command.leavingText": "Leaving...",
  "bot.command.leftText": "Left!",
  "bot.command.searchingText": "Searching...",
  "bot.command.addedToQueueText": (text: string) => `**${text}** Added to queue!`,
  "bot.command.addedToQueueMulti": (text: string) => `**${text}** Songs Added to queue!`,
  "bot.command.loopedText": (type: LoopMode) => `Succesfully changed Loop mode: ${type}`,
  "bot.command.changedVolumeText": (volume: number) => `Succesfully changed volume to ${volume}%`,
  "bot.command.skippedText": "Skipped!",
  "bot.command.skippedTextQueueEmpty": "Skipped. Queue is empty.",
  "bot.command.errors.notInGuild": "This command can only be used in a guild!",
  "bot.command.errors.notInVoice": "You must be in a voice channel to use this command!",
  "bot.command.errors.noPermission": "You do not have permission to use this command!",
  "bot.command.errors.botNoPermission": "I do not have permission to view channel or send messages!",
  "bot.command.errors.cantJoin": "I can't join that voice channel!",
  "bot.command.errors.invalidArguments": "Invalid arguments!",
  "bot.command.errors.invalidChannelType": "Invalid channel type!",
  "bot.command.errors.alreadyInVoice": "I am already in a voice channel!",
  "bot.command.errors.notFound": "Not found!",
  "bot.command.errors.queueEmpty": "Queue is empty!",
  "bot.embed.playing.author": "Now Playing",
  "bot.embed.playing.footer": (viewCount: number) => `Views: ${viewCount}`,
  "bot.embed.queues.title": "Queues",
  "bot.embed.queues.footer": (totalQueue: number) => `${totalQueue} Songs`,
  "bot.embed.queues.decomposeFooterTotalQueue": (footer: string): number => {
    const [totalQueue] = footer.split(" ");
    return Number(totalQueue);
  },
  "bot.embed.queues.noDescription": "No description",
  // Slash Command Text
  "slash.command.joinDescription": "Joins the voice channel you are currently in or the channel specified by the argument",
  "slash.command.joinArguments": "Channel to join",
  "slash.command.leaveDescription": "Leaves the voice channel I am currently in",
  "slash.command.playDescription": "Plays the song specified by the argument",
  "slash.command.playArguments": "Song to play (URL or Search Query)",
  "slash.command.loopDescription": "loops the currently playing song or the queue",
  "slash.command.loopArguments": "loop the current song or the queue",
  "slash.command.volumeDescription": "Changes the volume of the player",
  "slash.command.volumeArguments": "Volume to set",
  "slash.command.skipDescription": "Skips the currently playing song",
  "slash.command.queueDescription": "Shows the queue",
  "slash.command.pauseDescription": "Pauses the player",
  "slash.command.resumeDescription": "Resumes the player",
} as const;

export default data;