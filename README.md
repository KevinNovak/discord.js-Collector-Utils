# discord.js-Collector-Utils

[![NPM Version](https://img.shields.io/npm/v/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)
[![discord.js Version](https://img.shields.io/npm/dependency-version/discord.js-collector-utils/peer/discord.js)](https://discord.js.org/)
[![Downloads](https://img.shields.io/npm/dt/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)

**Npm package** - Collector utilities for [discord.js](https://github.com/discordjs/discord.js/).

## Table of Contents

-   [Installation](#installation)
-   [Importing](#importing)
-   [`collectByButton` Example](#collectbybutton-example)
-   [`collectBySelectMenu` Example](#collectbyselectmenu-example)
-   [`collectByModal` Example](#collectByModal-example)
-   [`collectByReaction` Example](#collectbyreaction-example)
-   [`collectByMessage` Example](#collectbymessage-example)

## Installation

`npm install discord.js-collector-utils`

## Importing

```javascript
const { CollectorUtils } = require('discord.js-collector-utils');
// OR
import { CollectorUtils } from 'discord.js-collector-utils';
```

## `collectByButton` Example

![](https://i.imgur.com/tILSNFD.png)

```typescript
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
        nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === 'stop',
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
```

## `collectBySelectMenu` Example

![](https://i.imgur.com/fS1UQzo.png)

```typescript
let prompt = await msg.channel.send({
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
    // Collect Filter
    (intr: SelectMenuInteraction) => intr.user.id === msg.author.id,
    // Stop Filter
    (nextMsg: Message) =>
        nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === 'stop',
    // Retrieve Result
    async (intr: SelectMenuInteraction) => {
        return { intr, value: intr.values[0] };
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
```

## `collectByModal` Example

![](https://i.imgur.com/OO9U7Kq.png)

```typescript
let prompt = await msg.channel.send({
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
        title: msg.client.user.username,
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
    // Collect Filter
    (intr: ButtonInteraction) => intr.user.id === msg.author.id,
    // Stop Filter
    (nextMsg: Message) =>
        nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === 'stop',
    // Retrieve Result
    async (intr: ModalSubmitInteraction) => {
        let input = intr.components[0].components[0];

        if (input.value.toLowerCase().includes('fight club')) {
            await intr.reply(`We don't talk about fight club. Try again.`);
            return;
        }

        return { intr, value: input.value };
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

await result.intr.reply(`Oh, **${result.value}**? That one's hilarious!`);
```

## `collectByReaction` Example

![](https://i.imgur.com/Vo9kXeI.png)

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
    (nextMsg: Message) =>
        nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === 'stop',
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

## `collectByMessage` Example

![](https://i.imgur.com/AOFApbY.png)

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
