import { Client, Message, MessageReaction, User } from 'discord.js';
import { CollectorUtils } from '.';

let Config = require('../config/config.json');

let client = new Client();

client.on('ready', () => {
    console.log(`Logged in as '${client.user.tag}'!`);
});

client.on('message', async msg => {
    let args = msg.content.split(' ');
    switch (args[0]) {
        case 'testMessage': {
            await msg.channel.send('What is your favorite color?');

            let favoriteColor: string = await CollectorUtils.collectByMessage(
                msg.channel,
                // Collect Filter
                (nextMsg: Message) => nextMsg.author.id === msg.author.id,
                // Stop Filter
                (nextMsg: Message) =>
                    nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === 'stop',
                // Retrieve Result
                async (nextMsg: Message) => {
                    let colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

                    let favoriteColor = colorOptions.find(
                        colorOption => colorOption === nextMsg.content.toLowerCase()
                    );

                    if (!favoriteColor) {
                        await nextMsg.channel.send(`Sorry, that color is not an option.`);
                        return;
                    }

                    if (favoriteColor === 'yellow') {
                        await nextMsg.channel.send(
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

        case 'testReaction': {
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
    }
});

client.login(Config.token);
