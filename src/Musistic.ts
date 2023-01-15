import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import configLogger from "./logger";
import log4js from "log4js";
import { i18n } from "./manager";
import config from "@/config.json";

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

  public set ready(isReady: boolean) {
    this._ready = isReady;
  }

  public get ready(): boolean {
    return this._ready;
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
  let o = ora(i18n.t(config.defaultLanguage, "core.loading")).start();
  o.color = "blue";
  if (!process.env.BOT_TOKEN) {
    o.fail(i18n.t(config.defaultLanguage, "errors.noBotToken"));
    process.exit(1);
  }
  o = ora(i18n.t(config.defaultLanguage, "core.launchingBot"));
  o.color = "yellow";
  o.start();
  
  await import('@/events/error').then((i) =>
    this.on('error', (arg) => new i.default(this).run(arg))
  );
}

}

export { Musistic };