# discord.js-Collector-Utils

Collector utilities for discord.js.

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
        nextMsg.author.id === msg.author.id && nextMsg.content.toLowerCase() === '!test',
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
    { time: 10000, resetInvalid: true }
);

if (favoriteColor === undefined) {
    return;
}

await msg.channel.send(`You selected **${favoriteColor}**. Nice choice!`);
```