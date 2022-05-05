import { Client, ClientApplication } from "discord.js";
import Text from "./text"
import dotenv from "dotenv";
dotenv.config();

(async () => {
  const client = new Client({ intents: 0 });
  if (!process.env.BOT_TOKEN) {
    console.error("Error: No BOT_TOKEN provided");
    process.exit(1);
  }
  client.token = process.env.BOT_TOKEN;
  //@ts-expect-error
  client.application = new ClientApplication(client, {});
  await client.application!.fetch();
  await client.application!.commands.set([
    {
      name: "join",
      description: Text["slash.command.joinDescription"],
      options: [
        {
          type: "CHANNEL",
          name: "channel",
          description: Text["slash.command.joinArguments"],
          channelTypes: [2, 13],
        },
      ],
    },
    {
      name: "leave",
      description: Text["slash.command.leaveDescription"],
    },
    {
      name: "play",
      description: Text["slash.command.playDescription"],
      options: [
        {
          type: "STRING",
          name: "query",
          description: Text["slash.command.playArguments"],
          required: true
        },
      ]
    },
    {
      name: "loop",
      description: Text["slash.command.loopDescription"],
      options: [
        {
          type: "INTEGER",
          name: "type",
          description: Text["slash.command.loopArguments"],
          required: true,
          choices: [
            {
              name: "none",
              value: 0
            },
            {
              name: "song",
              value: 1
            },
            {
              name: "queue",
              value: 2
            },
          ]
        }
      ]
    },
    {
      name: "volume",
      description: Text["slash.command.volumeDescription"],
      options: [
        {
          type: "INTEGER",
          name: "volume",
          description: Text["slash.command.volumeArguments"],
          required: true,
          minValue: 0,
          maxValue: 200
        }
      ]
    },
    {
      name: "skip",
      description: Text["slash.command.skipDescription"],
    },
    {
      name: "queue",
      description: Text["slash.command.queueDescription"],
    },
    {
      name: "pause",
      description: Text["slash.command.pauseDescription"],
    },
  ], process.argv[2]);
  console.log("Done");
})();
