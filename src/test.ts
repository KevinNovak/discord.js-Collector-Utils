import {
    ButtonInteraction,
    Client,
    Intents,
    Message,
    MessageReaction,
    Modal,
    ModalSubmitInteraction,
    User,
} from 'discord.js';
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

    client.on('messageCreate', async (msg: Message) => {
        let args = msg.content.split(' ');
        let command = args[0];
        if (command !== 'test') {
            return;
        }

        let subCommand = args[1];
        if (!subCommand) {
            await msg.channel.send('Please supply a test to run.');
            return;
        }

        switch (subCommand) {
            case 'message': {
                await msg.channel.send('What is your favorite color?');

                let favoriteColor = await CollectorUtils.collectByMessage(
                    msg.channel,
                    // Collect Filter
                    (nextMsg: Message) => nextMsg.author.id === msg.author.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === msg.author.id &&
                        nextMsg.content.toLowerCase() === 'stop',
                    // Retrieve Result
                    async (nextMsg: Message) => {
                        let colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

                        let favoriteColor = colorOptions.find(
                            colorOption => colorOption === nextMsg.content.toLowerCase()
                        );

                        if (!favoriteColor) {
                            await msg.channel.send(`Sorry, that color is not an option.`);
                            return;
                        }

                        if (favoriteColor === 'yellow') {
                            await msg.channel.send(
                                `Ew, **yellow**?! Please choose a better color.`
                            );
                            return;
                        }

                        return favoriteColor;
                    },
                    // Expire Function
                    async () => {
                        await msg.channel.send(`Too slow! Try being more decisive next time.`);
                    },
                    // Options
                    { time: 10000, reset: true }
                );

                if (favoriteColor === undefined) {
                    return;
                }

                await msg.channel.send(`You selected **${favoriteColor}**. Nice choice!`);
                return;
            }

            case 'reaction': {
                let prompt = await msg.channel.send('Please select your favorite fruit!');

                prompt.react('🍉');
                prompt.react('🍎');
                prompt.react('🍌');

                let favoriteFruit = await CollectorUtils.collectByReaction(
                    prompt,
                    // Collect Filter
                    (msgReaction: MessageReaction, reactor: User) => reactor.id === msg.author.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === msg.author.id && nextMsg.content === 'stop',
                    // Retrieve Result
                    async (msgReaction: MessageReaction, reactor: User) => {
                        switch (msgReaction.emoji.name) {
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
                    // Expire Function
                    async () => {
                        await msg.channel.send('Too slow! Try being more decisive next time.');
                    },
                    // Options
                    { time: 10000, reset: true }
                );

                if (favoriteFruit === undefined) {
                    return;
                }

                await msg.channel.send(`You selected **${favoriteFruit}**. Nice choice!`);
                return;
            }

            case 'button': {
                let prompt = await msg.channel.send({
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
                    // Collect Filter
                    (intr: ButtonInteraction) => intr.user.id === msg.author.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === msg.author.id && nextMsg.content === 'stop',
                    // Retrieve Result
                    async (intr: ButtonInteraction) => {
                        switch (intr.customId) {
                            case 'watermelon':
                                return { intr, value: 'Watermelon' };
                            case 'apple':
                                return { intr, value: 'Apple' };
                            case 'banana':
                                return { intr, value: 'Banana' };
                            default:
                                return;
                        }
                    },
                    // Expire Function
                    async () => {
                        await msg.channel.send('Too slow! Try being more decisive next time.');
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

            default: {
                await msg.channel.send('Unknown test.');
            }
        }
    });

    client.on('interactionCreate', async intr => {
        const modal = new Modal({
            customId: `modal-${intr.id}`,
            title: 'Hello World',
            components: [
                {
                    type: 'ACTION_ROW',
                    components: [
                        {
                            type: 'TEXT_INPUT',
                            customId: 'apple',
                            required: true,
                            label: 'Test Input',
                            style: 'SHORT',
                        },
                    ],
                },
            ],
        });

        if (intr.isButton()) {
            try {
                let result = await CollectorUtils.collectByModal(
                    intr,
                    modal,
                    // Collect Filter
                    (modalIntr: ModalSubmitInteraction) =>
                        modalIntr.customId === `modal-${intr.id}`,
                    // Retrieve Result
                    async (intr: ModalSubmitInteraction) => {
                        let input = intr.components[0].components[0];

                        if (input.value.length > 5) {
                            await intr.reply('Too long. Try again!');
                            return;
                        }

                        return { intr, value: input.value };
                    },
                    // Expire Function
                    async () => {
                        await intr.channel.send('Too slow! Try being more decisive next time.');
                    },
                    // Options
                    { time: 60000, reset: true }
                );

                if (result === undefined) {
                    return;
                }

                await result.intr.reply(`You selected **${result.value}**. Nice choice!`);
                return;
            } catch (error) {
                console.log(error);
                return;
            }
        }
    });

    await client.login(Config.client.token);
}

start().catch(error => {
    console.error(error);
});
