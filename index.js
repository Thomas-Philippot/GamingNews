const Discord = require('discord.js');
const keys = require('./config');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment');

const client = new Discord.Client();
const token = keys.Discord_Key;
let newsChannel = '';
let article = {};
let now = moment();

client.on('ready', () => {
    console.log('I am ready!');
    newsChannel = client.channels.get('496343700310458378');
});

let rule = new schedule.RecurrenceRule();
rule.hour = 16;
rule.minute = 52;
let j = schedule.scheduleJob(rule, function () {
    axios.get('https://newsapi.org/v2/everything?q=Playstation&from=' + now.format() +'&language=fr&sortBy=popularity&apiKey=' + keys.API_Key)
        .then(response => {
            article = response.data.articles[0];
            const embed = new Discord.RichEmbed()
                .setTitle(article.title)
                .setColor(0x36d44a)
                .setImage(article.urlToImage)
                .setDescription(article.description)
                .setURL(article.url);
            newsChannel.send(embed);
            console.log('Article envoyé sur le serveur : ' + new Date());
        })
        .catch(e => {
            console.log("error", e);
        });
});

client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'ping') {
        // Send "pong" to the same channel
        message.channel.send('pong');
    }
    if (message.content.includes("à qui le dites-vous")) {
        const embed = new Discord.RichEmbed()
            .setTitle('A vous ! ')
            .setColor(0xFF0000)
            .setImage('https://thumbs.gfycat.com/DangerousPowerlessFinwhale-mobile.jpg');
        message.channel.send(embed)
    }
});

client.login(token);
