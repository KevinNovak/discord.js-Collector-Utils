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
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectBySelectMenu<T>(options: CollectBySelectMenuOptions<T>): Promise<
        | {
              intr: SelectMenuInteraction;
              value: T;
          }
        | undefined
    > {
        return new Promise(async (resolve, reject) => {
            let smCollector = options.message.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
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

            smCollector.on('collect', async (intr: SelectMenuInteraction) => {
                let result = await options.retriever(intr);
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
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T>(options: CollectByModalOptions<T>): Promise<
        | {
              intr: ModalSubmitInteraction;
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
                options.modal.customId = `modal-${intr.id}`;
                await intr.showModal(options.modal);

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

                let result = await options.retriever(modalIntr);
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
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByReaction<T>(options: CollectByReactionOptions<T>): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let reactCollector = options.message.createReactionCollector({
                filter: (msgReaction, reactor) => reactor.id === options.target.id,
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

            reactCollector.on('collect', async (msgReaction: MessageReaction, reactor: User) => {
                let result = await options.retriever(msgReaction, reactor);
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
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMessage<T>(options: CollectByMessageOptions<T>): Promise<T> {
        return new Promise(async (resolve, reject) => {
            let msgCollector = options.channel.createMessageCollector({
                filter: message => message.author.id === options.target.id,
                time: options.time,
            });

            let stopCollector = options.channel.createMessageCollector(
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

                let result = await options.retriever(nextMsg);
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
    stopFilter: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: () => Promise<void>;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}

interface CollectBySelectMenuOptions<T> {
    /**
     * Message to collect select menu interactions on.
     */
    message: Message;
    /**
     * Target user to collect from.
     */
    target: User;
    /**
     * Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     */
    retriever: (intr: SelectMenuInteraction) => Promise<{
        intr: SelectMenuInteraction;
        value: T;
    }>;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: () => Promise<void>;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}

interface CollectByModalOptions<T> {
    /**
     * Message to collect button interactions on.
     */
    message: Message;
    /**
     * The modal to show when the button is clicked.
     */
    modal: Modal;
    /**
     * Target user to collect from.
     */
    target: User;
    /**
     * Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
     */
    retriever: (intr: ModalSubmitInteraction) => Promise<{
        intr: ModalSubmitInteraction;
        value: T;
    }>;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: () => Promise<void>;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}

interface CollectByReactionOptions<T> {
    /**
     * Message to collect reactions on.
     */
    message: Message;
    /**
     * Target user to collect from.
     */
    target: User;
    /**
     * Method which takes a collected reaction and returns a desired result, or `undefined` if invalid.
     */
    retriever: (msgReaction: MessageReaction, reactor: User) => Promise<T | undefined>;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: () => Promise<void>;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}

interface CollectByMessageOptions<T> {
    /**
     * Channel to collect messages on.
     */
    channel: TextBasedChannel;
    /**
     * Target user to collect from.
     */
    target: User;
    /**
     * Method which takes a collected message and returns a desired result, or `undefined` if invalid.
     */
    retriever: (nextMsg: Message) => Promise<T | undefined>;
    /**
     * Method which takes message and returns a boolean as to whether the collector should be silently stopped.
     */
    stopFilter: (message: Message) => boolean;
    /**
     * Method which is run if the timer expires.
     */
    onExpire: () => Promise<void>;
    /**
     * Time in milliseconds before the collector expires.
     */
    time: number;
    /**
     * Whether the collector time should be reset on a invalid response.
     */
    reset: boolean;
}
