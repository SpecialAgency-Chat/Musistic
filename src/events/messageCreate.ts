import type { Musistic } from '@/Musistic';
import {
  BaseMessageOptions,
  DiscordAPIError,
  escapeMarkdown,
  GuildMember,
  Message,
} from 'discord.js';
import { fonts, getHelp, requiredPermissions } from '@/helper';
import { Event, generateOptions } from '@/interface';
import { guildManager, ImageGenManager, ChannelManager, i18n } from '@/manager';
import { Colors } from 'discord.js';
import { inspect } from 'util';

export default class extends Event {
  private genManager = new ImageGenManager();

  public constructor(client: Musistic) {
    super(client, 'messageCreate');
  }

  public async run(message: Message): Promise<void> {
    this.logger.trace('Received message event');

    if (message.author.bot || !message.inGuild()) return;

    // Mention check
    let isMentioned = false;
    if (message.content.match(new RegExp(`<@!?${message.client.user.id}>`))) {
      isMentioned = true;
    } else if (message.mentions.roles.size > 0) {
      const roles = message.mentions.roles.values();

      for (const role of roles) {
        if (role.managed && role.members.has(message.client.user.id)) {
          isMentioned = true;
          break;
        }
      }
    }

    if (!isMentioned) return;

    const guildData = await guildManager.getGuildData(message.guild.id);

    // Permission check
    if (!message.guild.members.me?.permissions.has(requiredPermissions)) {
      message.channel.send(
        i18n.t(guildData.language, 'error.bot_permissions.guild')
      );
    }
    if (
      !message.channel
        .permissionsFor(message.guild.members.me as GuildMember)
        .has(requiredPermissions)
    ) {
      message.channel.send(
        i18n.t(guildData.language, 'error.bot_permissions.channel')
      );
    }

    // Help message
    if (!message.reference?.messageId) {
      await message.reply(getHelp('message', guildData.language));
      return;
    }

    try {
      // Parse message
      const args = message.content
        .toLowerCase()
        .replace(/^<@!?\d{17,19}>/, '')
        .trim()
        .split(/[, \n]/)
        .map((x) => x.trim());

      const msg = await message.channel.messages.fetch(
        message.reference.messageId
      );
      if (!msg) {
        await message.reply(
          i18n.t(guildData.language, 'error.message_not_found')
        );
        return;
      }
      if (!msg.content) {
        await message.reply(i18n.t(guildData.language, 'error.message_empty'));
        return;
      }

      // Blacklist check
      const isBanned = await this.genManager.isBanned(
        message.guild?.id,
        message.author.id
      );
      if (isBanned) {
        await message.reply(i18n.t(guildData.language, 'error.banned'));
        return;
      }

      const isBlocked = await this.genManager.isBlocked(
        message.author.id,
        msg.author.id
      );
      if (isBlocked) {
        await message.reply(i18n.t(guildData.language, 'error.blocked'));
        return;
      }

      let fontName = 'default';
      const font = args.find((arg) => /font=.*/.test(arg));
      if (font) {
        fontName = font.replace('font=', '');

        if (!fonts.map((font) => font.value).includes(fontName)) {
          await message.reply(
            i18n.t(guildData.language, 'error.font_invalid', {
              font: escapeMarkdown(fontName),
            })
          );
          return;
        }
      }

      // Reply
      const reply = await message.reply(
        i18n.t(guildData.language, 'generating', {
          emoji: '<a:loading:989537782152187934>',
        })
      );

      const options: { [key: string]: string } = {
        light: 'l',
        color: 'c',
        bold: 'b',
        flip: 'f',
        new: 'n',
      };
      const newOptions: Partial<generateOptions> = {};

      for (const option of Object.keys(options)) {
        const alias = options[option] || '';

        if (args.includes(option) || args.includes(alias)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          newOptions[option] = true;
        }
        if (args.includes(`-${option}`) || args.includes(`-${alias}`)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          newOptions[option] = false;
        }
      }
      if (fontName !== 'default') {
        newOptions.font = fontName;
      }

      const editMsg = await this.genManager.generateImageFromMsg(
        'message',
        msg,
        message.author.id,
        newOptions
      );
      await reply.edit(editMsg);
    } catch (e) {
      this.logger.error(e);

      const guildData = await guildManager.getGuildData(message.guildId || '');

      const exec =
        /^\/interactions\/\d+\/(?<token>.+)\/callback$/.exec(
          (e as DiscordAPIError).url
        )?.groups ?? {};
      const m: BaseMessageOptions = {
        embeds: [
          {
            color: Colors.Red,
            title: i18n.t(guildData.language, 'error.error'),
            description: inspect(e, {
              depth: 1,
              maxArrayLength: null,
            })
              .substring(0, 4096)
              .replaceAll(exec['token'] ?? 'ABCDEFGHIJKLMN', '*redacted*'),
          },
        ],
      };
      ChannelManager.sendErrorLog(e);

      message.channel.send(m);
    }
  }
}
