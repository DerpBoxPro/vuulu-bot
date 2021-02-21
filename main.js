const Discord = require('discord.js');
const Random = require('random');
const fs = require('fs')
const jsonfile = require('jsonfile')

const client = new Discord.Client()

const prefix = '-';

var expNeeded = 100

var stats = {}
if (fs.existsSync('stats.json')) {
    stats = jsonfile.readFileSync('stats.json')
}

client.once('ready', () => {
    console.log('online')
})

client.on('message', message => {

    if(message.author.bot) return

    // leveling

    if (message.guild.id in stats === false) {
        stats[message.guild.id] = {}
    }

    const guildStats = stats[message.guild.id]
    if (message.author.id in guildStats === false) {
        guildStats[message.author.id] = {
            experience: 0,
            level: 0,
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id]

    if (Date.now() - userStats.last_message > 60000) {
        userStats.experience += Random.int(15,25)
        userStats.last_message = Date.now();
    
        expNeeded = 5 * Math.pow(userStats.level,2) + 50 * userStats.level + 100

        if (userStats.experience >= expNeeded) {
            userStats.experience =  userStats.experience - expNeeded
            userStats.level++
            message.channel.send('Congratulations to ' + message.author.username + ' for reaching level ' + userStats.level + '! 🤩')
        }

        jsonfile.writeFileSync('stats.json', stats)
    }

    //commands

    if(!message.content.startsWith(prefix)) return

    const args1 = message.content.slice(1)
    const args = args1.split(" ")
    const command = args.shift().toLowerCase()

    if (command === 'twitch') {
        message.channel.send('https://www.twitch.tv/vqlo31')
    }
    if (command === 'level') {
        const newEmbed = new Discord.MessageEmbed()
        .setColor('#324860')
        .addFields(
            { name: 'Level', value: userStats.level, inline: true },
            { name: 'Experience', value: userStats.experience, inline: true },
            { name: 'Exp to next level', value: expNeeded, inline: true }
        )
        .setAuthor(message.author.username)
        .setThumbnail(message.author.avatarURL())
        .setDescription(Math.round((60000 - (Date.now() - userStats.last_message))/1000) + ' seconds until exp gained from messages')
        console.log(Date.now() - userStats.last_message)
        message.channel.send(newEmbed)
    }
})

// needs to be last line
fs.readFile('key.txt', 'utf8', function(err, data) {
    if (err) throw err;
    client.login(data)
});

