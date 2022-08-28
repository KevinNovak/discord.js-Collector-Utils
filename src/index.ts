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
export declare type StopFilter = (nextMsg: Message) => boolean;
export declare type ExpireFunction = () => Promise<void>;

export declare interface CollectOptions {
    time: number;
    reset: boolean;
}

export class CollectorUtils {
    /**
     * Collect a response by buttons.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByButton<T>(options: CollectByButtonOptions<T>): Promise<
        | {
              intr: ButtonInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let btnCollector = options.message.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === options.target.id,
                time: options.time,
            });

            let stopCollector = options.message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            btnCollector.on('collect', async (intr: ButtonInteraction) => {
                let result = await options.retriever(intr);
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
                    await options.onExpire();
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
     * @param message Message to collect select menu interactions on.
     * @param target Target user to collect from.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param stopFilter Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     * @param onExpire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectBySelectMenu<T>(
        message: Message,
        target: User,
        retriever: SelectMenuRetriever<T>,
        stopFilter: StopFilter,
        onExpire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<
        | {
              intr: SelectMenuInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let smCollector = message.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                filter: intr => intr.user.id === target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            smCollector.on('collect', async (intr: SelectMenuInteraction) => {
                let result = await retriever(intr);
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
                    await onExpire();
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
     * @param message Message to collect button interactions on.
     * @param modal The modal to show when the button is clicked.
     * @param target Target user to collect from.
     * @param retriever Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
     * @param stopFilter Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     * @param onExpire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T>(
        message: Message,
        modal: Modal,
        target: User,
        retriever: ModalRetriever<T>,
        stopFilter: StopFilter,
        onExpire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<
        | {
              intr: ModalSubmitInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let btnCollector = message.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
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

                let result = await retriever(modalIntr);
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
                    await onExpire();
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
     * @param message Message to collect reactions on.
     * @param target Target user to collect from.
     * @param retriever Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
     * @param stopFilter Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     * @param onExpire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByReaction<T>(
        message: Message,
        target: User,
        retriever: ReactionRetriever<T>,
        stopFilter: StopFilter,
        onExpire: ExpireFunction,
        options: CollectOptions = { time: 60000, reset: false }
    ): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let reactCollector = message.createReactionCollector({
                filter: (msgReaction, reactor) => reactor.id === target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message => message.author.id === target.id && stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            reactCollector.on('collect', async (msgReaction: MessageReaction, reactor: User) => {
                let result = await retriever(msgReaction, reactor);
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
                    await onExpire();
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
     * @param retriever Method which takes a collected message and returns a desired result, or `undefined` if invalid.
     * @param stopFilter Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     * @param onExpire Method which is run if the timer expires.
     * @param options Options to use for collecting.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMessage<T>(
        channel: TextBasedChannel,
        target: User,
        retriever: MessageRetriever<T>,
        stopFilter: StopFilter,
        onExpire: ExpireFunction,
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

                let result = await retriever(nextMsg);
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
                    await onExpire();
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

interface CollectByButtonOptions<T> {
    /**
     * Message to collect button interactions on.
     */
    message: Message;
    /**
     * Target user to collect from.
     */
    target: User;
    /**
     * Method which takes a collected button interaction and returns a desired result, or `undefined` if invalid.
     */
    retriever: (intr: ButtonInteraction) => Promise<{
        intr: ButtonInteraction;
        value: T;
    }>;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter: StopFilter;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: ExpireFunction;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}
