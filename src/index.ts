import chalk from "chalk";
import ora from "ora";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import bot from "./bot";
import Text from "./text";
import { Client } from "discord.js";

// one liner sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
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
  await sleep(600);
  o.color = "blue";
  o.text = Text["core.loadingEnvFile"];
  await sleep(200);
  if (!fs.existsSync(path.join(__dirname, "..", ".env"))) {
    o.fail(Text["core.errors.noEnvFile"]);
    process.exit(1);
  }
  dotenv.config();
  o.succeed(Text["core.foundEnvFile"]);
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
})();
