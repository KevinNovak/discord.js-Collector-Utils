import { REST } from '@discordjs/rest';
import { ApplicationCommandOptionType, Routes } from 'discord-api-types/v9';
import {
    ButtonInteraction,
    ChatInputApplicationCommandData,
    Client,
    CommandInteraction,
    Intents,
    Interaction,
    Message,
    MessageReaction,
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

    client.on('interactionCreate', async (intr: Interaction) => {
        if (!(intr instanceof CommandInteraction)) {
            return;
        }

        if (intr.commandName !== 'test') {
            return;
        }

        await intr.deferReply();

        switch (intr.options.getString('name')) {
            case 'message': {
                await intr.followUp('What is your favorite color?');

                let favoriteColor: string = await CollectorUtils.collectByMessage(
                    intr.channel,
                    // Collect Filter
                    (nextMsg: Message) => nextMsg.author.id === intr.user.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === intr.user.id &&
                        nextMsg.content.toLowerCase() === 'stop',
                    // Retrieve Result
                    async (nextMsg: Message) => {
                        let colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

                        let favoriteColor = colorOptions.find(
                            colorOption => colorOption === nextMsg.content.toLowerCase()
                        );

                        if (!favoriteColor) {
                            await intr.followUp(`Sorry, that color is not an option.`);
                            return;
                        }

                        if (favoriteColor === 'yellow') {
                            await intr.followUp(`Ew, **yellow**?! Please choose a better color.`);
                            return;
                        }

                        return favoriteColor;
                    },
                    // Expire Function
                    async () => {
                        await intr.followUp(`Too slow! Try being more decisive next time.`);
                    },
                    // Options
                    { time: 10000, reset: true }
                );

                if (favoriteColor === undefined) {
                    return;
                }

                await intr.followUp(`You selected **${favoriteColor}**. Nice choice!`);
                return;
            }

            case 'reaction': {
                let prompt = await intr.followUp('Please select your favorite fruit!');

                prompt.react('🍉');
                prompt.react('🍎');
                prompt.react('🍌');

                let favoriteFruit: string = await CollectorUtils.collectByReaction(
                    prompt,
                    // Collect Filter
                    (msgReaction: MessageReaction, reactor: User) => reactor.id === intr.user.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === intr.user.id && nextMsg.content === 'stop',
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
                        await intr.followUp('Too slow! Try being more decisive next time.');
                    },
                    // Options
                    { time: 10000, reset: true }
                );

                if (favoriteFruit === undefined) {
                    return;
                }

                await intr.followUp(`You selected **${favoriteFruit}**. Nice choice!`);
                return;
            }

            case 'button': {
                let prompt = await intr.followUp({
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

                let favoriteFruit: string = await CollectorUtils.collectByButton(
                    prompt,
                    // Collect Filter
                    (intr: ButtonInteraction) => intr.user.id === intr.user.id,
                    // Stop Filter
                    (nextMsg: Message) =>
                        nextMsg.author.id === intr.user.id && nextMsg.content === 'stop',
                    // Retrieve Result
                    async (intr: ButtonInteraction) => {
                        switch (intr.customId) {
                            case 'watermelon':
                                return 'Watermelon';
                            case 'apple':
                                return 'Apple';
                            case 'banana':
                                return 'Banana';
                            default:
                                return;
                        }
                    },
                    // Expire Function
                    async () => {
                        await intr.followUp('Too slow! Try being more decisive next time.');
                    },
                    // Options
                    { time: 10000, reset: true }
                );

                if (favoriteFruit === undefined) {
                    return;
                }

                await intr.followUp(`You selected **${favoriteFruit}**. Nice choice!`);
                return;
            }
        }
    });

    let commands: ChatInputApplicationCommandData[] = [
        {
            name: 'test',
            description: 'Run a test.',
            options: [
                {
                    name: 'name',
                    description: 'Name of the test to run.',
                    required: true,
                    type: ApplicationCommandOptionType.String.valueOf(),
                    choices: [
                        {
                            name: 'message',
                            value: 'message',
                        },
                        {
                            name: 'reaction',
                            value: 'reaction',
                        },
                        {
                            name: 'button',
                            value: 'button',
                        },
                    ],
                },
            ],
        },
    ];

    // Register
    if (process.argv[2] === '--register') {
        await registerCommands(commands);
        process.exit();
    }

    await client.login(Config.client.token);
}

async function registerCommands(commands: ChatInputApplicationCommandData[]): Promise<void> {
    console.log(`Registering commands: ${commands.map(command => `'${command.name}'`).join(', ')}`);

    let rest = new REST({ version: '9' }).setToken(Config.client.token);
    await rest.put(Routes.applicationCommands(Config.client.id), { body: [] });
    await rest.put(Routes.applicationCommands(Config.client.id), { body: commands });

    console.log('Commands registered.');
}

start().catch(error => {
    console.error(error);
});
