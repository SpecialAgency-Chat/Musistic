import type { Musistic } from '@/Musistic';
import type {
  BaseMessageOptions,
  DiscordAPIError,
  Interaction,
} from 'discord.js';
import { inspect } from 'util';
import { Colors } from 'discord.js';
import { Event } from '@/interface';
import { guildManager, ChannelManager, i18n } from '@/manager';

export default class extends Event {
  public constructor(client: Musistic) {
    super(client, 'interactionCreate');
  }

  public async run(interaction: Interaction): Promise<void> {
    this.logger.trace('Received interaction event');

    try {
      if (
        interaction.isChatInputCommand() ||
        interaction.isContextMenuCommand()
      ) {
        await this.client.commandManager
          .get(interaction.commandName)
          ?.run(interaction);
      }
      if (interaction.isButton() || interaction.isStringSelectMenu()) {
        let componentFile = this.client.componentManager.get(
          interaction.customId
        );
        if (componentFile) {
          await componentFile.run(interaction);
        } else {
          componentFile = this.client.componentManager.find(
            (component) =>
              component.data.type === 'startsWith' &&
              interaction.customId.startsWith(component.data.customId)
          );
          componentFile?.run(interaction);
        }
      }
    } catch (e) {
      this.logger.error(e);

      const guildData = await guildManager.getGuildData(
        interaction.guildId || ''
      );

      const exec =
        /^\/interactions\/\d+\/(?<token>.+)\/callback$/.exec(
          (e as DiscordAPIError).url
        )?.groups ?? {};
      const message: BaseMessageOptions = {
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

      if (
        interaction.isChatInputCommand() ||
        interaction.isContextMenuCommand() ||
        interaction.isButton() ||
        interaction.isStringSelectMenu()
      ) {
        if (interaction.replied || interaction.deferred) {
          await interaction
            .editReply(message)
            .catch((err) => this.logger.error(err));
        } else {
          await interaction
            .reply(message)
            .catch((err) => this.logger.error(err));
        }
      }
    }
  }
}
