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

export class CollectorUtils {
    /**
     * Collect a response by buttons.
     * @param message Message to collect button interactions on.
     * @param retriever Method which takes a collected button interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByButton<T>(
        message: Message,
        retriever: (buttonInteraction: ButtonInteraction) => Promise<{
            intr: ButtonInteraction;
            value: T;
        }>,
        options: CollectOptions = {}
    ): Promise<
        | {
              intr: ButtonInteraction;
              value: T;
          }
        | undefined
    > {
        options = Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );

        return new Promise(async (resolve, reject) => {
            let btnCollector = message.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === options.target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            btnCollector.on('collect', async (intr: ButtonInteraction) => {
                let result = await retriever(intr);
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
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectBySelectMenu<T>(
        message: Message,
        retriever: (selectMenuInteraction: SelectMenuInteraction) => Promise<{
            intr: SelectMenuInteraction;
            value: T;
        }>,
        options: CollectOptions = {}
    ): Promise<
        | {
              intr: SelectMenuInteraction;
              value: T;
          }
        | undefined
    > {
        options = Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );

        return new Promise(async (resolve, reject) => {
            let smCollector = message.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                filter: intr => intr.user.id === options.target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
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
                    await options.onExpire();
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
     * @param modal Modal to show when the button is clicked.
     * @param retriever Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T>(
        message: Message,
        modal: Modal,
        retriever: (modalSubmitInteraction: ModalSubmitInteraction) => Promise<{
            intr: ModalSubmitInteraction;
            value: T;
        }>,
        options: CollectOptions = {}
    ): Promise<
        | {
              intr: ModalSubmitInteraction;
              value: T;
          }
        | undefined
    > {
        options = Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );

        return new Promise(async (resolve, reject) => {
            let btnCollector = message.createMessageComponentCollector({
                componentType: 'BUTTON',
                filter: intr => intr.user.id === options.target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
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
     * Collect a response by reactions.
     * @param message Message to collect reactions on.
     * @param retriever Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByReaction<T>(
        message: Message,
        retriever: (messageReaction: MessageReaction, reactor: User) => Promise<T | undefined>,
        options: CollectOptions = {}
    ): Promise<T> {
        options = Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );

        return new Promise(async (resolve, reject) => {
            let reactCollector = message.createReactionCollector({
                filter: (msgReaction, reactor) => reactor.id === options.target.id,
                time: options.time,
            });

            let stopCollector = message.channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
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
                    await options.onExpire();
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
     * @param retriever Method which takes a collected message and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMessage<T>(
        channel: TextBasedChannel,
        retriever: (message: Message) => Promise<T | undefined>,
        options: CollectOptions = {}
    ): Promise<T> {
        options = Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );

        return new Promise(async (resolve, reject) => {
            let msgCollector = channel.createMessageCollector({
                filter: message => message.author.id === options.target.id,
                time: options.time,
            });

            let stopCollector = channel.createMessageCollector(
                // Make sure message collector is ahead of reaction collector
                {
                    filter: message =>
                        message.author.id === options.target.id && options.stopFilter(message),
                    time: options.time + 1000,
                }
            );

            let expired = true;

            msgCollector.on('collect', async (nextMsg: Message) => {
                let stop = options.stopFilter(nextMsg);
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
                    await options.onExpire();
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

interface CollectOptions {
    /**
     * Time in milliseconds before the collector expires.
     * @defaultValue `120000` (2 minutes)
     */
    time?: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     * @defaultValue `true`
     */
    reset?: boolean;
    /**
     * Target user to collect from.
     */
    target?: User;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter?: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire?: () => void | Promise<void>;
}
