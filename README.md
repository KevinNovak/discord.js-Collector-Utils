# discord.js-Collector-Utils

[![NPM Version](https://img.shields.io/npm/v/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)
[![discord.js Version](https://img.shields.io/npm/dependency-version/discord.js-collector-utils/peer/discord.js)](https://discord.js.org/)
[![Downloads](https://img.shields.io/npm/dt/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)

**Npm package** - Collector utilities for [discord.js](https://github.com/discordjs/discord.js/).

## Installation

`npm install discord.js-collector-utils`

## Importing

```typescript
import { CollectorUtils } from 'discord.js-collector-utils';
```

## `collectByMessage` Example

![](https://i.imgur.com/BrOic5W.png)

```typescript
await msg.channel.send('What is your favorite color?');

let favoriteColor = await CollectorUtils.collectByMessage(
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
            await nextMsg.channel.send(`Ew, **yellow**?! Please choose a better color.`);
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
```

## `collectByReaction` Example

![](https://i.imgur.com/SWJdQJc.png)

```typescript
let prompt = await msg.channel.send('Please select your favorite fruit!');

prompt.react('🍉');
prompt.react('🍎');
prompt.react('🍌');

let favoriteFruit = await CollectorUtils.collectByReaction(
    prompt,
    // Collect Filter
    (msgReaction: MessageReaction, reactor: User) => reactor.id === msg.author.id,
    // Stop Filter
    (nextMsg: Message) => nextMsg.author.id === msg.author.id && nextMsg.content === 'stop',
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
```
