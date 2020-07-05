import { DMChannel, Message, MessageReaction, NewsChannel, TextChannel, User } from 'discord.js';

export declare type MessageFilter = (nextMsg: Message) => boolean;
export declare type ReactionFilter = (msgReaction: MessageReaction, reactor: User) => boolean;
export declare type MessageRetriever = (nextMsg: Message) => Promise<any | undefined>;
export declare type ReactionRetriever = (
    msgReaction: MessageReaction,
    reactor: User
) => Promise<any | undefined>;
export declare type ExpireFunction = () => Promise<any>;

export declare interface CollectByMessageOptions {
    time: number;
    resetInvalid: boolean;
}

export declare interface CollectByReactionOptions {
    time: number;
    resetInvalid: boolean;
}

export abstract class CollectorUtils {
    public static async collectByMessage(
        channel: TextChannel | DMChannel | NewsChannel,
        filter: MessageFilter,
        stopFilter: MessageFilter,
        retrieve: MessageRetriever,
        expire: ExpireFunction,
        options: CollectByMessageOptions = { time: 60000, resetInvalid: false }
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
                    if (options.resetInvalid) {
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

    public static async collectByReaction(
        msg: Message,
        filter: ReactionFilter,
        stopFilter: MessageFilter,
        retrieve: ReactionRetriever,
        expire: ExpireFunction,
        options: CollectByReactionOptions = { time: 60000, resetInvalid: false }
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
                    if (options.resetInvalid) {
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
