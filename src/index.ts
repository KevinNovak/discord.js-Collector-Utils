import {
    ButtonInteraction,
    CommandInteraction,
    Message,
    MessageReaction,
    ModalSubmitInteraction,
    TextBasedChannel,
    User,
} from 'discord.js';

export declare type MessageFilter = (nextMsg: Message) => boolean;
export declare type ReactionFilter = (msgReaction: MessageReaction, reactor: User) => boolean;
export declare type ButtonFilter = (intr: ButtonInteraction) => boolean;
export declare type ModalFilter = (intr: ModalSubmitInteraction) => boolean;
export declare type MessageRetriever<T> = (nextMsg: Message) => Promise<T | undefined>;
export declare type ReactionRetriever<T> = (
    msgReaction: MessageReaction,
    reactor: User
) => Promise<T | undefined>;
export declare type ButtonRetriever<T> = (intr: ButtonInteraction) => Promise<{
    intr: ButtonInteraction;
    value: T;
}>;
export declare type ModalRetriever<T> = (intr: ModalSubmitInteraction) => Promise<{
    intr: ModalSubmitInteraction;
    value: T;
}>;
export declare type ExpireFunction = () => Promise<void>;

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
    public static async collectByMessage<T>(
        channel: TextBasedChannel,
        filter: MessageFilter,
        stopFilter: MessageFilter,
        retrieve: MessageRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let collector = channel.createMessageCollector({ filter, time: options.time });
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
    public static async collectByReaction<T>(
        msg: Message,
        filter: ReactionFilter,
        stopFilter: MessageFilter,
        retrieve: ReactionRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let reactionCollector = msg.createReactionCollector({ filter, time: options.time });

            let msgCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                { filter: (nextMsg: Message) => true, time: options.time + 1000 }
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

    /**
     * Collect a response by buttons.
     * @param msg The message to collect button interactions on.
     * @param filter Filter which takes an incoming interaction and returns a boolean as to whether the interaction should be collected or not.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected interaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByButton<T>(
        msg: Message,
        filter: ButtonFilter,
        stopFilter: MessageFilter,
        retrieve: ButtonRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<
        | {
              intr: ButtonInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let buttonCollector = msg.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter,
                time: options.time,
            });

            let msgCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                { filter: (nextMsg: Message) => true, time: options.time + 1000 }
            );

            let expired = true;

            buttonCollector.on('collect', async (intr: ButtonInteraction) => {
                let result = await retrieve(intr);
                if (result === undefined) {
                    if (options.reset) {
                        buttonCollector.resetTimer();
                        msgCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    buttonCollector.stop();
                    resolve(result);
                    return;
                }
            });

            buttonCollector.on('end', async collected => {
                msgCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            msgCollector.on('collect', async (nextMsg: Message) => {
                let stop = stopFilter(nextMsg);
                if (stop) {
                    expired = false;
                    buttonCollector.stop();
                    resolve(undefined);
                    return;
                }
            });
        });
    }

    /**
     * Collect a response by buttons.
     * @param intr The message to collect button interactions on.
     * @param filter Filter which takes an incoming interaction and returns a boolean as to whether the interaction should be collected or not.
     * @param retrieve Method which takes a collected interaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T>(
        intr: CommandInteraction,
        filter: ModalFilter,
        retrieve: ModalRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<
        | {
              intr: ModalSubmitInteraction;
              value: T;
          }
        | undefined
    > {
        let modalIntr: ModalSubmitInteraction;
        try {
            modalIntr = await intr.awaitModalSubmit({
                filter,
                time: options.time + 1000,
            });
        } catch (error) {
            // TODO: Check that this error was caused by an expiration
            await expire();
            return;
        }

        let result = await retrieve(modalIntr);
        if (result === undefined) {
            if (options.reset) {
                // TODO: Send validation message somehow?
                // Collect again
            }
            return;
        } else {
            return result;
        }
    }
}
