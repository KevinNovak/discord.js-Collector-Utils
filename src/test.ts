import {
    ButtonStyle,
    Client,
    ComponentType,
    Events,
    IntentsBitField,
    ModalBuilder,
    TextInputStyle,
} from 'discord.js';
import { CollectorUtils } from '.';

let Config = require('../config/config.json');

async function start(): Promise<void> {
    let client = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildMessageReactions,
            IntentsBitField.Flags.MessageContent,
        ],
    });

    client.on(Events.ClientReady, () => {
        console.log(`Logged in as '${client.user.tag}'!`);
    });

    client.on(Events.MessageCreate, async event => {
        try {
            let client = event.client;
            let channel = event.channel;
            let user = event.author;
            let args = event.content.split(' ');

            let command = args[0]?.toLowerCase();
            if (command !== 'test') {
                return;
            }

            let subCommand = args[1]?.toLowerCase();
            if (!subCommand) {
                await channel.send('Please supply a test to run.');
                return;
            }

            switch (subCommand) {
                case 'button': {
                    let prompt = await channel.send({
                        content: 'Please select your favorite fruit!',
                        components: [
                            {
                                type: ComponentType.ActionRow,
                                components: [
                                    {
                                        type: ComponentType.Button,
                                        customId: 'watermelon',
                                        emoji: '🍉',
                                        style: ButtonStyle.Primary,
                                    },
                                    {
                                        type: ComponentType.Button,
                                        customId: 'apple',
                                        emoji: '🍎',
                                        style: ButtonStyle.Primary,
                                    },
                                    {
                                        type: ComponentType.Button,
                                        customId: 'banana',
                                        emoji: '🍌',
                                        style: ButtonStyle.Primary,
                                    },
                                ],
                            },
                        ],
                    });

                    let result = await CollectorUtils.collectByButton(
                        prompt,
                        // Retrieve Result
                        async buttonInteraction => {
                            switch (buttonInteraction.customId) {
                                case 'watermelon':
                                    return { intr: buttonInteraction, value: 'Watermelon' };
                                case 'apple':
                                    return { intr: buttonInteraction, value: 'Apple' };
                                case 'banana':
                                    return { intr: buttonInteraction, value: 'Banana' };
                                default:
                                    return;
                            }
                        },
                        // Options
                        {
                            time: 10000,
                            reset: true,
                            target: user,
                            stopFilter: message => message.content.toLowerCase() === 'stop',
                            onExpire: async () => {
                                await channel.send('Too slow! Try being more decisive next time.');
                            },
                        }
                    );

                    if (result === undefined) {
                        return;
                    }

                    await result.intr.reply(`You selected **${result.value}**. Nice choice!`);
                    return;
                }

                case 'select-menu': {
                    let prompt = await channel.send({
                        content: 'Please select your favorite fruit!',
                        components: [
                            {
                                type: ComponentType.ActionRow,
                                components: [
                                    {
                                        type: ComponentType.SelectMenu,
                                        customId: 'select_menu',
                                        options: [
                                            {
                                                emoji: '🍉',
                                                label: 'Watermelon',
                                                value: 'Watermelon',
                                            },
                                            {
                                                emoji: '🍎',
                                                label: 'Apple',
                                                value: 'Apple',
                                            },
                                            {
                                                emoji: '🍌',
                                                label: 'Banana',
                                                value: 'Banana',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    });

                    let result = await CollectorUtils.collectBySelectMenu(
                        prompt,
                        // Retrieve Result
                        async selectMenuInteraction => {
                            return {
                                intr: selectMenuInteraction,
                                value: selectMenuInteraction.values[0],
                            };
                        },
                        // Options
                        {
                            time: 10000,
                            reset: true,
                            target: user,
                            stopFilter: message => message.content.toLowerCase() === 'stop',
                            onExpire: async () => {
                                await channel.send('Too slow! Try being more decisive next time.');
                            },
                        }
                    );

                    if (result === undefined) {
                        return;
                    }

                    await result.intr.reply(`You selected **${result.value}**. Nice choice!`);
                    return;
                }

                case 'modal': {
                    let prompt = await channel.send({
                        content: 'What is your favorite movie?',
                        components: [
                            {
                                type: ComponentType.ActionRow,
                                components: [
                                    {
                                        type: ComponentType.Button,
                                        customId: 'enter_response',
                                        emoji: '⌨️',
                                        label: 'Enter Response',
                                        style: ButtonStyle.Primary,
                                    },
                                ],
                            },
                        ],
                    });

                    let result = await CollectorUtils.collectByModal(
                        prompt,
                        new ModalBuilder({
                            customId: 'modal', // Will be overwritten
                            title: client.user.username,
                            components: [
                                {
                                    type: ComponentType.ActionRow,
                                    components: [
                                        {
                                            type: ComponentType.TextInput,
                                            customId: 'favorite_movie',
                                            label: 'Favorite Movie',
                                            required: true,
                                            style: TextInputStyle.Short,
                                        },
                                    ],
                                },
                            ],
                        }),
                        // Retrieve Result
                        async modalSubmitInteraction => {
                            let textInput = modalSubmitInteraction.components[0].components[0];
                            if (textInput.type !== ComponentType.TextInput) {
                                return;
                            }

                            if (textInput.value.toLowerCase().includes('fight club')) {
                                await modalSubmitInteraction.reply(
                                    `We don't talk about fight club. Try again.`
                                );
                                return;
                            }

                            return { intr: modalSubmitInteraction, value: textInput.value };
                        },
                        // Options
                        {
                            time: 10000,
                            reset: true,
                            target: user,
                            stopFilter: message => message.content.toLowerCase() === 'stop',
                            onExpire: async () => {
                                await channel.send('Too slow! Try being more decisive next time.');
                            },
                        }
                    );

                    if (result === undefined) {
                        return;
                    }

                    await result.intr.reply(`Oh, **${result.value}**? That one's hilarious!`);
                    return;
                }

                case 'reaction': {
                    let prompt = await channel.send('Please select your favorite fruit!');

                    prompt.react('🍉');
                    prompt.react('🍎');
                    prompt.react('🍌');

                    let favoriteFruit = await CollectorUtils.collectByReaction(
                        prompt,
                        // Retrieve Result
                        async (messageReaction, user) => {
                            switch (messageReaction.emoji.name) {
                                case '🍉':
                                    return 'Watermelon';
                                case '🍎':
                                    return 'Apple';
                                case '🍌':
                                    return 'Banana';
                                default:
                                    return;
                            }
                        },
                        // Options
                        {
                            time: 10000,
                            reset: true,
                            target: user,
                            stopFilter: message => message.content.toLowerCase() === 'stop',
                            onExpire: async () => {
                                await channel.send('Too slow! Try being more decisive next time.');
                            },
                        }
                    );

                    if (favoriteFruit === undefined) {
                        return;
                    }

                    await channel.send(`You selected **${favoriteFruit}**. Nice choice!`);
                    return;
                }

                case 'message': {
                    await channel.send('What is your favorite color?');

                    let favoriteColor = await CollectorUtils.collectByMessage(
                        channel,
                        // Retrieve Result
                        async message => {
                            let colorOptions = [
                                'red',
                                'orange',
                                'yellow',
                                'green',
                                'blue',
                                'purple',
                            ];

                            let favoriteColor = colorOptions.find(
                                colorOption => colorOption === message.content.toLowerCase()
                            );

                            if (!favoriteColor) {
                                await channel.send(`Sorry, that color is not an option.`);
                                return;
                            }

                            if (favoriteColor === 'yellow') {
                                await channel.send(
                                    `Ew, **yellow**?! Please choose a better color.`
                                );
                                return;
                            }

                            return favoriteColor;
                        },
                        // Options
                        {
                            time: 10000,
                            reset: true,
                            target: user,
                            stopFilter: message => message.content.toLowerCase() === 'stop',
                            onExpire: async () => {
                                await channel.send(`Too slow! Try being more decisive next time.`);
                            },
                        }
                    );

                    if (favoriteColor === undefined) {
                        return;
                    }

                    await channel.send(`You selected **${favoriteColor}**. Nice choice!`);
                    return;
                }

                default: {
                    await channel.send('Unknown test.');
                }
            }
        } catch (error) {
            console.log(error);
        }
    });

    await client.login(Config.client.token);
}

start().catch(error => {
    console.error(error);
});
