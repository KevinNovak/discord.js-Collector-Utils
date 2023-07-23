# discord.js-Collector-Utils

[![NPM Version](https://img.shields.io/npm/v/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)
[![discord.js Version](https://img.shields.io/npm/dependency-version/discord.js-collector-utils/peer/discord.js)](https://discord.js.org/)
[![Downloads](https://img.shields.io/npm/dt/discord.js-collector-utils.svg?maxAge=3600)](https://www.npmjs.com/package/discord.js-collector-utils)

**Npm package** - Collector utilities for [discord.js](https://github.com/discordjs/discord.js/).

## Table of Contents

-   [Installation](#installation)
-   [Importing](#importing)
-   [`collectByButton` Example](#collectbybutton-example)
-   [`collectByStringSelectMenu` Example](#collectbystringselectmenu-example)
-   [`collectByUserSelectMenu` Example](#collectbyuserselectmenu-example)
-   [`collectByRoleSelectMenu` Example](#collectbyroleselectmenu-example)
-   [`collectByChannelSelectMenu` Example](#collectbychannelselectmenu-example)
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

```javascript
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
```
## `collectByButton` Example

![](https://i.imgur.com/tILSNFD.png)

```javascript
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
```

## `collectByButton` Example

![](https://i.imgur.com/tILSNFD.png)

```javascript
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
```

## `collectByStringSelectMenu` Example

![](https://i.imgur.com/fS1UQzo.png)

```javascript
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
```


## `collectByUser` Example

![](https://i.imgur.com/mYDhkef.png)

```javascript
let prompt = await channel.send({
    content: 'Please select your favorite user!',
    components: [
        {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.UserSelect,
                customId: 'select_user',
            }],
        },
    ],
});

let result = await CollectorUtils.CollectorUtils.collectByUserSelectMenu(
    prompt,
    // Retrieve Result
    async buttonInteraction => {
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

await result.intr.reply(`You selected **<@#${result.value}>**. Nice choice!`);
```

## `collectByRole` Example

![](https://i.imgur.com/mYDhkef.png)

```javascript
let prompt = await channel.send({
    content: 'Please select your favorite role!',
    components: [
        {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.roleSelect,
                customId: 'select_role',
            }],
        },
    ],
});

let result = await CollectorUtils.CollectorUtils.collectByRoleSelectMenu(
    prompt,
    // Retrieve Result
    async buttonInteraction => {
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

await result.intr.reply(`You selected **<@&${result.value}>**. Nice choice!`);
```

## `collectByChannel` Example

![](https://i.imgur.com/mYDhkef.png)

```javascript
let prompt = await channel.send({
    content: 'Please select your favorite channel!',
    components: [
        {
            type: ComponentType.ActionRow,
            components: [{
                type: ComponentType.ChannelSelect,
                customId: 'select_channel',
            }],
        },
    ],
});

let result = await CollectorUtils.CollectorUtils.collectByChannelSelectMenu(
    prompt,
    // Retrieve Result
    async buttonInteraction => {
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

await result.intr.reply(`You selected **<#${result.value}>**. Nice choice!`);
```

## `collectByModal` Example

![](https://i.imgur.com/OO9U7Kq.png)

```javascript
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
            await modalSubmitInteraction.reply(`We don't talk about fight club. Try again.`);
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
```

## `collectByReaction` Example

![](https://i.imgur.com/Vo9kXeI.png)

```javascript
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
```

## `collectByMessage` Example

![](https://i.imgur.com/AOFApbY.png)

```javascript
await channel.send('What is your favorite color?');

let favoriteColor = await CollectorUtils.collectByMessage(
    channel,
    // Retrieve Result
    async message => {
        let colorOptions = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

        let favoriteColor = colorOptions.find(
            colorOption => colorOption === message.content.toLowerCase()
        );

        if (!favoriteColor) {
            await channel.send(`Sorry, that color is not an option.`);
            return;
        }

        if (favoriteColor === 'yellow') {
            await channel.send(`Ew, **yellow**?! Please choose a better color.`);
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
```
