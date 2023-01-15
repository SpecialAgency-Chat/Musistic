import type { Musistic } from '@/Musistic';
import type { Logger } from 'log4js';
import log4js from 'log4js';

export abstract class Event {
  protected readonly logger: Logger;

  protected constructor(
    protected readonly client: Musistic,
    public readonly name: string
  ) {
    this.logger = log4js.getLogger(name);
  }

  public abstract run(...args: unknown[]): void;
}
