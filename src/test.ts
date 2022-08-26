import { Client, Intents, Modal } from 'discord.js';
import { CollectorUtils } from '.';

let Config = require('../config/config.json');

async function start(): Promise<void> {
    let client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        ],
    });

    client.on('ready', () => {
        console.log(`Logged in as '${client.user.tag}'!`);
    });

    client.on('messageCreate', async event => {
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
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        type: 'BUTTON',
                                        customId: 'watermelon',
                                        emoji: '🍉',
                                        style: 'PRIMARY',
                                    },
                                    {
                                        type: 'BUTTON',
                                        customId: 'apple',
                                        emoji: '🍎',
                                        style: 'PRIMARY',
                                    },
                                    {
                                        type: 'BUTTON',
                                        customId: 'banana',
                                        emoji: '🍌',
                                        style: 'PRIMARY',
                                    },
                                ],
                            },
                        ],
                    });

                    let result = await CollectorUtils.collectByButton(
                        prompt,
                        user,
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
                        // Stop Filter
                        message => message.content.toLowerCase() === 'stop',
                        // Expire Function
                        async () => {
                            await channel.send('Too slow! Try being more decisive next time.');
                        },
                        // Options
                        { time: 10000, reset: true }
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
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        type: 'SELECT_MENU',
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
                        user,
                        // Retrieve Result
                        async selectMenuInteraction => {
                            return {
                                intr: selectMenuInteraction,
                                value: selectMenuInteraction.values[0],
                            };
                        },
                        // Stop Filter
                        message => message.content.toLowerCase() === 'stop',
                        // Expire Function
                        async () => {
                            await channel.send('Too slow! Try being more decisive next time.');
                        },
                        // Options
                        { time: 10000, reset: true }
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
                                type: 'ACTION_ROW',
                                components: [
                                    {
                                        type: 'BUTTON',
                                        customId: 'enter_response',
                                        emoji: '⌨️',
                                        label: 'Enter Response',
                                        style: 'PRIMARY',
                                    },
                                ],
                            },
                        ],
                    });

                    let result = await CollectorUtils.collectByModal(
                        prompt,
                        new Modal({
                            customId: 'modal', // Will be overwritten
                            title: client.user.username,
                            components: [
                                {
                                    type: 'ACTION_ROW',
                                    components: [
                                        {
                                            type: 'TEXT_INPUT',
                                            customId: 'favorite_movie',
                                            label: 'Favorite Movie',
                                            required: true,
                                            style: 'SHORT',
                                        },
                                    ],
                                },
                            ],
                        }),
                        user,
                        // Retrieve Result
                        async buttonInteraction => {
                            let textInput = buttonInteraction.components[0].components[0];

                            if (textInput.value.toLowerCase().includes('fight club')) {
                                await buttonInteraction.reply(
                                    `We don't talk about fight club. Try again.`
                                );
                                return;
                            }

                            return { intr: buttonInteraction, value: textInput.value };
                        },
                        // Stop Filter
                        message => message.content.toLowerCase() === 'stop',
                        // Expire Function
                        async () => {
                            await channel.send('Too slow! Try being more decisive next time.');
                        },
                        // Options
                        { time: 10000, reset: true }
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
                        user,
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
                        // Stop Filter
                        message => message.content.toLowerCase() === 'stop',
                        // Expire Function
                        async () => {
                            await channel.send('Too slow! Try being more decisive next time.');
                        },
                        // Options
                        { time: 10000, reset: true }
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
                        user,
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
                        // Stop Filter
                        message => message.content.toLowerCase() === 'stop',
                        // Expire Function
                        async () => {
                            await channel.send(`Too slow! Try being more decisive next time.`);
                        },
                        // Options
                        { time: 10000, reset: true }
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
