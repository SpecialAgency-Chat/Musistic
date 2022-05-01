import { MessageEmbed } from "discord.js";
import Text from "./text";

const Playing = (title: string, url: string, thumbnail: string, viewCount: number) => new MessageEmbed()
  .setAuthor({ name: Text["bot.embed.playing.author"] })
  .setColor("AQUA")
  .setTitle(title)
  .setURL(url)
  .setThumbnail(thumbnail)
  .setFooter({ text: Text["bot.embed.playing.footer"](viewCount) });

export { Playing };