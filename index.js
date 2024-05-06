const { Client, MessageEmbed, Intents, MessageButton } = require('discord.js');
const QuizletFetcher = require('quizlet-fetcher');
const fs = require('fs');
const { exit } = require('process');
const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_PRESENCES] });
const token = 'TOKEN';

let idx = 0;
const backId = 'back'
const forwardId = 'forward'
const flipId = 'flip'
const backButton = new MessageButton({
  style: 'SECONDARY',
  label: 'Back',
  emoji: '⬅️',
  customId: backId
})
const forwardButton = new MessageButton({
  style: 'SECONDARY',
  label: 'Forward',
  emoji: '➡️',
  customId: forwardId
})
const flipButton = new MessageButton({
    style: 'SECONDARY',
    label: 'Forward',
    emoji: '➡️',
    customId: flipId
})

bot.on('ready', () => {
    console.log('Bot Online');
})

//I'm going to prototype on the old command style just bc its easier an faster. Hopefully I refactor to use slash commands.
bot.on('messageCreate', message => {
    let args = message.content.substring(Prefix.length).split(" ");
    if (!message.content.startsWith(Prefix)) return;

    switch(args[0]) {
        case 'addCards':
            //args[1] is the quizlet link args[2] is the name. 
            if (args[1] && args[2]) {
                var valid = /^(http|https):\/\/quizlet.com\/[^ "]+$/.test(args[1]);
                if (valid) {
                    let cards = QuizletFetcher(args[1].substring(20));
                    let name = args[2];
                    let set = getSet(name);
                    if (set) {
                        updateSet(cards, name)
                    }
                    writeSet(cards, name, message);
                } else {
                    message.reply('Please post a valid Quizlet link and name the set.')
                }
            }
        break;
        
        case 'study':
            if (args[1]) {
                let set = getSet(args[1]);
                if (set) {

                } else {
                    message.reply('There are no sets with that name!')
                }
            }
        break;

        case 'showSets':
            let names = getSetNames();
            const Embed = new MessageEmbed()
                .setTitle('**Study Sets:**')
                .addField('Sets:');
                if (names[0] === undefined) {
                    Embed.addField('No sets yet.')
                } else {
                    names.forEach(name => {
                        Embed.addField(`${name}`);
                    })
                }
        break;
    }
})

function writeSet(c, name, message) {
    let temp = fs.readFileSync('./cards.json', 'utf8');
    sets = [];
    let s = {
        name: '',
        cards: []
    }
    if (temp) {
        sets = JSON.parse(temp);
    }
    s.name = name;
    c.forEach(element => {
        s.cards.push(element);
    });
    sets.push(s);
    let string = JSON.stringify(sets);
    fs.writeFileSync('./cards.json', string).then(
        message.reply(`Set saved as ${name}.`)
    )
}

function getSet(name, message) {
    let temp = fs.readFileSync('./cards.json', 'utf8');
    let sets = [];
    let f; 
    if (!temp) {
        message.reply('There are no sets in the database!');
    } else {
        sets = JSON.parse(temp);
        sets.forEach(set => {
            if (set.name === name) {
                f = set;
            }
        })
    }
    return f;
}

function getSetNames() {
    let temp = fs.readFileSync('./cards.json', 'utf8');
    let names = [];
    if (temp) {
        sets = JSON.parse(temp);
        sets.forEach(set => {
            names.push(set.name);
        })
    }
    return names;
}

function updateSet(newCards, name) {
    let sets = readJSON();
    let idx = getIDXbyName(name);
    sets[idx].cards = set[idx].cards.concat(newCards);
    fs.writeFileSync('./cards.json', sets);
}

function getIDXbyName(name) {
    let idx = -1;
    let sets = readJSON(name);
    let curIDX = 0;
    sets.forEach(set => {
        if (set.name === name) {
            idx = curIDX;
        }
        curIDX++;
    })
    return idx; 
}

function readJSON() {
    let sets = [];
    let temp = fs.readFileSync('./cards.json', 'utf8');
    if (temp) {
        sets = JSON.parse(temp);
    }
    return sets;
}

bot.login(token);
