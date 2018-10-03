const Discord = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');
const moment = require('moment');

const client = new Discord.Client();
let newsChannel = '';
let article = {};
let now = moment();

client.on('ready', () => {
    console.log('I am ready!');
    newsChannel = client.channels.get('496343700310458378');
    console.log(now);
    client.channels.get('489783382516039701').send('Bot Marrons Online')
});

let rule = new schedule.RecurrenceRule();
rule.hour = 15;
rule.minute = 20;
let j = schedule.scheduleJob(rule, function () {
    console.log('event pushed');
    axios.get('https://newsapi.org/v2/everything?q=Playstation&from=' + now.format("YYYY-MM-DD") +'&language=fr&sortBy=popularity&apiKey=' + process.env.API_Key)
        .then(response => {
            article = response.data.articles[0];
            const embed = new Discord.RichEmbed()
                .setTitle(article.title)
                .setColor(0x36d44a)
                .setImage(article.urlToImage)
                .setDescription(article.description)
                .setURL(article.url);
            newsChannel.send(embed);
            console.log('Article envoyé sur le serveur : ' + now.format("YYYY-MM-DD"));
            console.log(article.title)
        })
        .catch(e => {
            console.log("error", e);
        });
});

client.on('message', message => {

    if (message.content === 'ping') {
        message.channel.send('pong');
    }

    if (message.content.includes("à qui le dites-vous")) {
        const embed = new Discord.RichEmbed()
            .setTitle('A vous ! ')
            .setColor(0xFF0000)
            .setImage('https://thumbs.gfycat.com/DangerousPowerlessFinwhale-mobile.jpg');
        message.channel.send(embed)
    }

    if (message.content === 'logout') {
        message.channel.send('Bon ok je me casse...').then(() => {
            console.log('Bot logged out');
            client.destroy();
        })
    }

    if (message.content === 'help') {
        const embed = new Discord.RichEmbed()
            .setTitle('Voici la liste de mes commandes :')
            .addBlankField()
            .setDescription('Propose en d\'autres si tu veux, un préfixe sera ajouter plus tard')
            .setColor(0xFF0000)
            .setAuthor('Bot Marrons')
            .addField('hammer_pick: Modération', 'logout')
            .addField('😱 Fun', 'ping, à qui le dites-vous')
            .addField(':newspaper: News: Modération', 'Chaque jour à 17h20 une news gaming est envoyé');
        message.channel.send(embed);
    }
});

client.login(process.env.TOKEN);
