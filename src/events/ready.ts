import type { Musistic } from '@/Musistic';
import type { Client } from 'discord.js';
import { Event } from '@/interface';
import fs from 'fs';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'ready');
  }

  public async run(client: Client<true>): Promise<void> {
    this.logger.info('Succesfully logged in and is Ready.');
    this.logger.trace(
      `Cached ${this.client.guilds.cache.size} guild${
        client.guilds.cache.size <= 1 ? '' : 's'
      }`
    );

    this.client.ready = true;

    setInterval(() => {
      let count = 0;
      if (fs.existsSync('./count.txt')) {
        const file = fs.readFileSync('./count.txt', 'utf8');
        count = Number(file);
      }

      client.user.setActivity({
        name: `Reply @Mention | Generated ${count.toLocaleString()} images`,
      });
    }, 10000);

    this.logger.info('Starting to subscribe commands to Discord Server');
    await this.client.commandManager
      .subscribe()
      .then(() =>
        this.logger.info('Succesfully subscribed commands to Discord Server')
      )
      .catch((e) => this.logger.error('There was an error subscribing', e));
  }
}
