import { DMChannel, Message, MessageReaction, NewsChannel, TextChannel, User } from 'discord.js';

export declare type MessageFilter = (nextMsg: Message) => boolean;
export declare type ReactionFilter = (msgReaction: MessageReaction, reactor: User) => boolean;
export declare type MessageRetriever = (nextMsg: Message) => Promise<any | undefined>;
export declare type ReactionRetriever = (
    msgReaction: MessageReaction,
    reactor: User
) => Promise<any | undefined>;
export declare type ExpireFunction = () => Promise<any>;

export declare interface CollectOptions {
    time: number;
    reset: boolean;
}

export class CollectorUtils {
    /**
     * Collect a response by messages.
     * @param channel The channel to collect messages on.
     * @param filter Filter which takes an incoming message and returns a boolean as to whether the message should be collected or not.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected message and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMessage(
        channel: TextChannel | DMChannel | NewsChannel,
        filter: MessageFilter,
        stopFilter: MessageFilter,
        retrieve: MessageRetriever,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let collector = channel.createMessageCollector(filter, { time: options.time });
            let expired = true;

            collector.on('collect', async (nextMsg: Message) => {
                let stop = stopFilter(nextMsg);
                if (stop) {
                    expired = false;
                    collector.stop();
                    resolve(undefined);
                    return;
                }

                let result = await retrieve(nextMsg);
                if (result === undefined) {
                    if (options.reset) {
                        collector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    collector.stop();
                    resolve(result);
                    return;
                }
            });

            collector.on('end', async collected => {
                if (expired) {
                    await expire();
                }
            });
        });
    }

    /**
     * Collect a response by reactions.
     * @param msg The message to collect reactions on.
     * @param filter Filter which takes an incoming reaction and returns a boolean as to whether the reaction should be collected or not.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByReaction(
        msg: Message,
        filter: ReactionFilter,
        stopFilter: MessageFilter,
        retrieve: ReactionRetriever,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let reactionCollector = msg.createReactionCollector(filter, { time: options.time });

            let msgCollector = msg.channel.createMessageCollector(
                (nextMsg: Message) => true,
                // Make sure message collector is ahead of reaction collector
                { time: options.time + 1000 }
            );

            let expired = true;

            reactionCollector.on('collect', async (msgReaction: MessageReaction, reactor: User) => {
                let result = await retrieve(msgReaction, reactor);
                if (result === undefined) {
                    if (options.reset) {
                        reactionCollector.resetTimer();
                        msgCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    reactionCollector.stop();
                    resolve(result);
                    return;
                }
            });

            reactionCollector.on('end', async collected => {
                msgCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            msgCollector.on('collect', async (nextMsg: Message) => {
                let stop = stopFilter(nextMsg);
                if (stop) {
                    expired = false;
                    reactionCollector.stop();
                    resolve(undefined);
                    return;
                }
            });
        });
    }
}
