import type { Musistic } from '@/Musistic';
import { Event } from '@/interface';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'warn');
  }

  public run(info: string): void {
    this.logger.warn('DJS Warning -', info);
  }
}
