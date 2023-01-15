import type { Musistic } from '@/Musistic';
import { Event } from '@/interface';
import { ChannelManager } from '@/manager';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'error');
  }

  public run(error: Error): void {
    this.logger.error('DJS Error -', error);
    ChannelManager.sendErrorLog(error);
  }
}
