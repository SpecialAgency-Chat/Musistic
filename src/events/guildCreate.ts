import type { Musistic } from '@/Musistic';
import { Event } from '@/interface';
import { Guild } from 'discord.js';
import { database, guildManager } from '@/manager';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'guildCreate');
  }

  public async run(guild: Guild): Promise<void> {
    this.logger.info('Guild joined -', guild.name + ' (' + guild.id + ')');

    const guildData = await guildManager.getGuildData(guild.id);
    if (!guildData) {
      let guildLocale = String(guild.preferredLocale);

      // サーバー名に日本語が含まれていた場合は日本語へ
      if (
        guild.name.match(
          /[\u{3000}-\u{301C}\u{3041}-\u{3093}\u{309B}-\u{309E}\u{3000}-\u{301C}\u{30A1}-\u{30F6}\u{30FB}-\u{30FE}]/mu
        )
      ) {
        guildLocale = 'ja';
      }

      await database.guilds.create({
        guild_id: guild.id,
        language: guildLocale,
      });
    }
  }
}
