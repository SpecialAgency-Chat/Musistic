import { Client } from "discord.js";
import { EventEmitter } from "events";
import { Queue } from "./static";

interface BotEvent {
  ready: (client: Client) => void;
  musicStart: (queue: Queue) => void;
  musicEnd: (queue: Queue) => void;
};
class NewEventEmitter extends EventEmitter {
  on<T extends keyof BotEvent>(eventName: T, listener: BotEvent[T]): this {
    super.on(eventName, listener);
    return this;
  }
  emit<T extends keyof BotEvent>(eventName: T, ...args: Parameters<BotEvent[T]>): boolean {
    return super.emit(eventName, ...args);
  }
  addListener<T extends keyof BotEvent>(eventName: T, listener: BotEvent[T]): this {
    super.addListener(eventName, listener);
    return this;
  }
  once<T extends keyof BotEvent>(eventName: T, listener: BotEvent[T]): this {
    super.once(eventName, listener);
    return this;
  }
  off<T extends keyof BotEvent>(eventName: T, listener: BotEvent[T]): this {
    super.off(eventName, listener);
    return this;
  }
  removeListener<T extends keyof BotEvent>(eventName: T, listener: BotEvent[T]): this {
    super.removeListener(eventName, listener);
    return this;
  }
}

const a = new NewEventEmitter();

export { NewEventEmitter as EventEmitter, BotEvent };