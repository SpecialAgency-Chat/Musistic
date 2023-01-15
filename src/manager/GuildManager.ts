import { database } from '@/manager';
import type { Guild } from '@/models/guilds';

class GuildManager {
  public async createGuildData(
    guildId: string,
    language?: string
  ): Promise<void> {
    await database.guilds.create({
      guild_id: guildId,
      language: language || 'en',
    });
  }

  public async getGuildData(guildId: string): Promise<Guild> {
    let guild = await database.guilds.findOne({ guild_id: guildId });

    if (!guild) {
      await this.createGuildData(guildId);
      guild = await database.guilds.findOne({ guild_id: guildId });
    }
    if (!guild) throw new Error('Failed to create guild data');

    return guild;
  }

  public async updateGuildData(
    guildId: string,
    data: Partial<Guild>
  ): Promise<void> {
    await this.getGuildData(guildId);

    await database.guilds.updateOne({ guild_id: guildId }, { $set: data });
  }
}

export const guildManager = new GuildManager();