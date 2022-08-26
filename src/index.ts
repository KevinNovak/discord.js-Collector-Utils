import {
    ButtonInteraction,
    Message,
    MessageReaction,
    Modal,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    TextBasedChannel,
    User,
} from 'discord.js';

export declare type StopFilter = (nextMsg: Message) => boolean;
export declare type ButtonRetriever<T> = (intr: ButtonInteraction) => Promise<{
    intr: ButtonInteraction;
    value: T;
}>;
export declare type SelectMenuRetriever<T> = (intr: SelectMenuInteraction) => Promise<{
    intr: SelectMenuInteraction;
    value: T;
}>;
export declare type ModalRetriever<T> = (intr: ModalSubmitInteraction) => Promise<{
    intr: ModalSubmitInteraction;
    value: T;
}>;
export declare type ReactionRetriever<T> = (
    msgReaction: MessageReaction,
    reactor: User
) => Promise<T | undefined>;
export declare type MessageRetriever<T> = (nextMsg: Message) => Promise<T | undefined>;
export declare type ExpireFunction = () => Promise<void>;

export declare interface CollectOptions {
    time: number;
    reset: boolean;
}

export class CollectorUtils {
    /**
     * Collect a response by buttons.
     * @param msg Message to collect button interactions on.
     * @param target Target user to collect from.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected button interaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByButton<T>(
        msg: Message,
        target: User,
        stopFilter: StopFilter,
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
            let btnCollector = msg.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === target.id,
                time: options.time,
            });

            let stopCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            btnCollector.on('collect', async (intr: ButtonInteraction) => {
                let result = await retrieve(intr);
                if (result === undefined) {
                    if (options.reset) {
                        btnCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    btnCollector.stop();
                    resolve(result);
                    return;
                }
            });

            btnCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                btnCollector.stop();
                resolve(undefined);
            });
        });
    }

    /**
     * Collect a response by select menu.
     * @param msg Message to collect select menu interactions on.
     * @param target Target user to collect from.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectBySelectMenu<T>(
        msg: Message,
        target: User,
        stopFilter: StopFilter,
        retrieve: SelectMenuRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<
        | {
              intr: SelectMenuInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let smCollector = msg.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                filter: intr => intr.user.id === target.id,
                time: options.time,
            });

            let stopCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            smCollector.on('collect', async (intr: SelectMenuInteraction) => {
                let result = await retrieve(intr);
                if (result === undefined) {
                    if (options.reset) {
                        smCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    smCollector.stop();
                    resolve(result);
                    return;
                }
            });

            smCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                smCollector.stop();
                resolve(undefined);
            });
        });
    }

    /**
     * Collect a response through a modal.
     * @param msg Message to collect button interactions on.
     * @param modal The modal to show when the button is clicked.
     * @param target Target user to collect from.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T>(
        msg: Message,
        modal: Modal,
        target: User,
        stopFilter: StopFilter,
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
        return new Promise(async (resolve, reject) => {
            let btnCollector = msg.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === target.id,
                time: options.time,
            });

            let stopCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            btnCollector.on('collect', async (intr: ButtonInteraction) => {
                modal.customId = `modal-${intr.id}`;
                await intr.showModal(modal);

                let modalIntr: ModalSubmitInteraction;
                try {
                    modalIntr = await intr.awaitModalSubmit({
                        filter: (modalIntr: ModalSubmitInteraction) =>
                            modalIntr.customId === `modal-${intr.id}`,
                        time: options.time,
                    });
                } catch (error) {
                    // Timed out
                    return;
                }

                let result = await retrieve(modalIntr);
                if (result === undefined) {
                    if (options.reset) {
                        btnCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    btnCollector.stop();
                    resolve(result);
                    return;
                }
            });

            btnCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                btnCollector.stop();
                resolve(undefined);
            });
        });
    }

    /**
     * Collect a response by reactions.
     * @param msg Message to collect reactions on.
     * @param target Target user to collect from.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByReaction<T>(
        msg: Message,
        target: User,
        stopFilter: StopFilter,
        retrieve: ReactionRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let reactCollector = msg.createReactionCollector({
                filter: (msgReaction, reactor) => reactor.id === target.id,
                time: options.time,
            });

            let stopCollector = msg.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            reactCollector.on('collect', async (msgReaction: MessageReaction, reactor: User) => {
                let result = await retrieve(msgReaction, reactor);
                if (result === undefined) {
                    if (options.reset) {
                        reactCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    reactCollector.stop();
                    resolve(result);
                    return;
                }
            });

            reactCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                reactCollector.stop();
                resolve(undefined);
            });
        });
    }

    /**
     * Collect a response by messages.
     * @param channel Channel to collect messages on.
     * @param target Target user to collect from.
     * @param stopFilter Filter which takes an incoming message and returns a boolean as to whether the collector should be silently stopped.
     * @param retrieve Method which takes a collected message and returns a desired result, or `undefined` if invalid.
     * @param expire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMessage<T>(
        channel: TextBasedChannel,
        target: User,
        stopFilter: StopFilter,
        retrieve: MessageRetriever<T>,
        expire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let msgCollector = channel.createMessageCollector({
                filter: message => message.author.id === target.id,
                time: options.time,
            });

            let stopCollector = channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            msgCollector.on('collect', async (nextMsg: Message) => {
                let stop = stopFilter(nextMsg);
                if (stop) {
                    // Let the stopCollector handle
                    return;
                }

                let result = await retrieve(nextMsg);
                if (result === undefined) {
                    if (options.reset) {
                        msgCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    msgCollector.stop();
                    resolve(result);
                    return;
                }
            });

            msgCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired) {
                    await expire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                msgCollector.stop();
                resolve(undefined);
            });
        });
    }
}
