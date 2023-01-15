import type { Musistic } from '@/Musistic';
import type { CloseEvent } from 'discord.js';
import { Event } from '@/interface';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'shardDisconnect');
  }

  public run(event: CloseEvent, id: number): void {
    this.logger.info(
      `Shard: ${id} has disconnected.`,
      `Code: ${event.code}, Reason: ${event.reason}`
    );
  }
}
