import {
    BaseInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    Collector,
    ComponentType,
    MentionableSelectMenuInteraction,
    Message,
    MessageCollector,
    MessageCollectorOptions,
    MessageReaction,
    ModalBuilder,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    SelectMenuInteraction,
    StringSelectMenuInteraction,
    TextBasedChannel,
    User,
    UserSelectMenuInteraction,
} from 'discord.js';

export class CollectorUtils {
    /**
     * Collect a response by buttons.
     * @param message Message to collect button interactions on.
     * @param retriever Method which takes a collected button interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByButton<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: ButtonRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response by string select menu.
     * @param message Message to collect select menu interactions on.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByStringSelect<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: StringSelectMenuRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response by user select menu.
     * @param message Message to collect select menu interactions on.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByUserSelect<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: UserSelectMenuRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.UserSelect,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response by role select menu.
     * @param message Message to collect select menu interactions on.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByRoleSelect<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: RoleSelectMenuRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.RoleSelect,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response by mentionable select menu.
     * @param message Message to collect select menu interactions on.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByMentionableSelect<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: MentionableSelectMenuRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.MentionableSelect,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response by channel select menu.
     * @param message Message to collect select menu interactions on.
     * @param retriever Method which takes a collected select menu interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByChannelSelect<T1, T2 extends BaseInteraction>(
        message: Message,
        retriever: ChannelSelectMenuRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.ChannelSelect,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(collector, stopCollector, retriever, options);
    }

    /**
     * Collect a response through a modal.
     * @param message Message to collect button interactions on.
     * @param modal Modal to show when the button is clicked.
     * @param retriever Method which takes a collected modal interaction and returns a desired result, or `undefined` if invalid.
     * @param options Options for collection.
     * @returns A desired result, or `undefined` if the collector expired.
     */
    public static async collectByModal<T1, T2 extends BaseInteraction>(
        message: Message,
        modal: ModalBuilder,
        retriever: ModalRetriever<T1, T2>,
        options: CollectOptions = {}
    ): Promise<
        | {
            intr: T2;
            value: T1;
        }
        | undefined
    > {
        options = this.getOptions(options);
        let collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: intr => {
                if (options.target) {
                    return intr.user.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);

        return await this.awaitCollector(
            collector,
            stopCollector,
            async (intr: ButtonInteraction) => {
                modal.setCustomId(`modal-${intr.id}`);
                await intr.showModal(modal);

                let modalIntr: ModalSubmitInteraction;
                try {
                    modalIntr = await intr.awaitModalSubmit({
                        filter: (modalIntr: ModalSubmitInteraction) =>
                            modalIntr.customId === `modal-${intr.id}`,
                        time: options.time,
                    });
                } catch (error) {
                    return;
                }

                return await retriever(modalIntr);
            },
            options
        );
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
        retriever: ReactionRetriever<T>,
        options: CollectOptions = {}
    ): Promise<T | undefined> {
        options = this.getOptions(options);
        let collector = message.createReactionCollector({
            filter: (msgReaction, reactor) => {
                if (options.target) {
                    return reactor.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(message.channel, options);
        return await this.awaitCollector(
            collector,
            stopCollector,
            async (msgReaction: MessageReaction, reactor: User) => {
                return await retriever(msgReaction, reactor);
            },
            options
        );
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
        retriever: MessageRetriever<T>,
        options: CollectOptions = {}
    ): Promise<T | undefined> {
        options = this.getOptions(options);
        let collector = (channel as ChannelWithCollector).createMessageCollector({
            filter: message => {
                if (options.target) {
                    return message.author.id === options.target.id;
                }
                return true;
            },
            time: options.time,
        });
        let stopCollector = this.getStopCollector(channel, options);
        return await this.awaitCollector(
            collector,
            stopCollector,
            async (nextMsg: Message) => {
                if (options.stopFilter && options.stopFilter(nextMsg)) {
                    return;
                }
                return await retriever(nextMsg);
            },
            options
        );
    }

    private static getOptions(options: CollectOptions): CollectOptions {
        return Object.assign(
            {
                time: 120000,
                reset: true,
            } as CollectOptions,
            options
        );
    }

    private static getStopCollector(
        channel: TextBasedChannel,
        options: CollectOptions
    ): MessageCollector {
        return (channel as ChannelWithCollector).createMessageCollector({
            filter: message => {
                if (!options.stopFilter) {
                    return false;
                }
                let stop = options.stopFilter(message);
                if (!stop) {
                    return false;
                }
                if (options.target) {
                    return message.author.id === options.target.id;
                }
                return true;
            },
            time: (options.time || 120000) + 1000,
        });
    }

    private static async awaitCollector<T>(
        mainCollector: Collector<any, any, any>,
        stopCollector: MessageCollector,
        retriever: (...args: any[]) => Promise<T | undefined>,
        options: CollectOptions
    ): Promise<T | undefined> {
        return new Promise(async (resolve, reject) => {
            let expired = true;

            mainCollector.on('collect', async (...args: any[]) => {
                let result = await retriever(...args);
                if (result === undefined) {
                    if (options.reset) {
                        mainCollector.resetTimer();
                        stopCollector.resetTimer();
                    }
                    return;
                } else {
                    expired = false;
                    mainCollector.stop();
                    resolve(result);
                    return;
                }
            });

            mainCollector.on('end', async collected => {
                stopCollector.stop();
                if (expired && options.onExpire) {
                    await options.onExpire();
                }
            });

            stopCollector.on('collect', async (nextMsg: Message) => {
                expired = false;
                mainCollector.stop();
                resolve(undefined);
            });
        });
    }
}

export interface CollectOptions {
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
    stopFilter?: StopFilter;
    /**
     * Method which is run if the timer expires.
     */
    onExpire?: ExpireFunction;
}
export type StopFilter = (message: Message) => boolean;
export type ExpireFunction = () => void | Promise<void>;

export type ChannelWithCollector = TextBasedChannel & {
    createMessageCollector(options?: MessageCollectorOptions): MessageCollector;
};

export type ButtonRetriever<T1, T2 extends BaseInteraction> = (
    buttonInteraction: ButtonInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type SelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: SelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type ModalRetriever<T1, T2 extends BaseInteraction> = (
    modalSubmitInteraction: ModalSubmitInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type ReactionRetriever<T> = (
    messageReaction: MessageReaction,
    reactor: User
) => Promise<T | undefined>;
export type MessageRetriever<T> = (message: Message) => Promise<T | undefined>;

export type StringSelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: StringSelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type UserSelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: UserSelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type RoleSelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: RoleSelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type MentionableSelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: MentionableSelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
export type ChannelSelectMenuRetriever<T1, T2 extends BaseInteraction> = (
    selectMenuInteraction: ChannelSelectMenuInteraction
) => Promise<
    | {
        intr: T2;
        value: T1;
    }
    | undefined
>;
