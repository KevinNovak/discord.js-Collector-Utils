import { ButtonInteraction, Client, Intents, Message, MessageReaction, User } from 'discord.js';
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

                let favoriteColor: string = await CollectorUtils.collectByMessage(
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

                let favoriteFruit: string = await CollectorUtils.collectByReaction(
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

                let { btnIntr, result }: { btnIntr: ButtonInteraction; result: string } =
                    await CollectorUtils.collectByButton(
                        prompt,
                        // Collect Filter
                        (intr: ButtonInteraction) => intr.user.id === intr.user.id,
                        // Stop Filter
                        (nextMsg: Message) =>
                            nextMsg.author.id === msg.author.id && nextMsg.content === 'stop',
                        // Retrieve Result
                        async (btnIntr: ButtonInteraction) => {
                            switch (btnIntr.customId) {
                                case 'watermelon':
                                    return { btnIntr, result: 'Watermelon' };
                                case 'apple':
                                    return { btnIntr, result: 'Apple' };
                                case 'banana':
                                    return { btnIntr, result: 'Banana' };
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

                await btnIntr.reply(`You selected **${result}**. Nice choice!`);
                return;
            }

            default: {
                await msg.channel.send('Unknown test.');
            }
        }
    });

    await client.login(Config.client.token);
}

start().catch(error => {
    console.error(error);
});
