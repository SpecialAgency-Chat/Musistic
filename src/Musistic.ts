import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import configLogger from "./logger";
import log4js from "log4js";

// one liner sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class Musistic extends Client {
  private readonly logger = log4js.getLogger("Musistic");
  private _ready = false;

  public readonly commandManager: CommandManager;
  public readonly componentManager: ComponentManager;

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
      partials: [Partials.Channel],
      allowedMentions: { repliedUser: false },
    });
    configLogger();
  }

  async start() {
  console.log(
    chalk.cyan(
      String.raw`┏━┳━┓╋┏━┳┳━┳┓┏┓
┃┃┃┃┣┳┫━╋┫━┫┗╋╋━┓
┃┃┃┃┃┃┣━┃┣━┃┏┫┃━┫
┗┻━┻┻━┻━┻┻━┻━┻┻━┛`
    )
  );
  console.log("\n");
  let o = ora(Text["core.loading"]).start();
  o.color = "blue";
  o = ora(Text["core.loadingBotToken"]);
  o.color = "green";
  o.start();
  await sleep(200);
  if (!process.env.BOT_TOKEN) {
    o.fail(Text["core.errors.noBotToken"]);
    process.exit(1);
  }
  o.succeed(Text["core.foundBotToken"]);
  await sleep(200);
  o = ora(Text["core.launchingBot"]);
  o.color = "yellow";
  o.start();
  bot.start();
  bot.on("ready", (client: Client) => {
    o.succeed(Text["core.launchedBot"](client.user!.tag));
  })
}

}

export default Musistic;