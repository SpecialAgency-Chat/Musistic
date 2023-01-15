import {
  WebhookClient,
  codeBlock,
  EmbedBuilder,
  BaseMessageOptions,
} from 'discord.js';
import { inspect } from 'util';
import { Musistic } from '@/Musistic';

export class ChannelManager {
  private readonly client: Musistic;
  constructor(client: Musistic) {
    this.client = client;
  }
  static async sendErrorLog(content: unknown) {
    const hook = new WebhookClient({
      url: process.env['ERROR_LOG_WEBHOOK_URL'] as string,
    });
    await hook.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Error Log')
          .setDescription(codeBlock('js', inspect(content, { depth: 3 })))
          .setTimestamp(new Date()),
      ],
    });
  }
}