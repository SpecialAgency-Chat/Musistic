import type { Musistic } from '@/Musistic';
import { Event } from '@/interface';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'shardReconnecting');
  }

  public run(id: number): void {
    this.logger.info(`Shard: ${id} is now reconnecting.`);
  }
}
