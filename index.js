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
    newsChannel = client.channels.get('497308273532207118');
    client.channels.get('497307681195950081').send('Bot Marrons Online');
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

    if (message.content.toLowerCase() === 'ping') {
        message.channel.send('pong');
    }

    if (message.content.includes("à qui le dites-vous")) {
        const embed = new Discord.RichEmbed()
            .setTitle('A vous ! ')
            .setColor(0x36d44a)
            .setImage('https://thumbs.gfycat.com/DangerousPowerlessFinwhale-mobile.jpg');
        message.channel.send(embed)
    }

    if (message.content.toLowerCase() === 'logout') {
        message.channel.send('Bot Marrons logged out').then(() => {
            console.log('Bot logged out');
            client.destroy();
        })
    }

    if (message.content.toLowerCase() === 'help') {
        const embed = new Discord.RichEmbed()
            .setTitle('Voici la liste de mes commandes :')
            .addBlankField()
            .setDescription('Propose en d\'autres si tu veux, un préfixe sera ajouter plus tard')
            .setColor(0x36d44a)
            .addField(':hammer_pick: Modération', 'logout', true)
            .addField(':joy: Fun', 'ping, à qui le dites-vous', true)
            .addField(':newspaper: News', 'Chaque jour à 17h20\n une news gaming est envoyé', true);
        message.channel.send(embed);
    }

    if (message.content.toLowerCase().startsWith('pls') || message.content.startsWith('!')) {
        message.delete();
    }

    if (message.content.toLowerCase().startsWith('météo')) {
        let ville = message.content.split(' ');
        axios.get('http://api.openweathermap.org/data/2.5/weather?q=' + ville[1] + '&appid=863668499362fb4884ebd97229f3b26b&units=metric').then( response => {
            var meteo = response.data;
            const embed = new Discord.RichEmbed()
                .setTitle('Voici la Météo de' + ville[1])
                .setAuthor('Météo', 'http://openweathermap.org/img/w/' + meteo.weather[0].icon + '.png')
                .setDescription(meteo.weather[0].description)
                .setColor(0x36d44a)
                .addField(':thermometer: Temp.', meteo.main.temp + '°C', true)
                .addField(':fire: Max', meteo.main.temp_max + '°C', true)
                .addField(':snowflake: Min', meteo.main.temp_min + '°C', true);
            message.channel.send(embed);
        }).catch(e => {
            console.log(e);
            message.channel.send(e)
        })
    }
});

client.login(process.env.TOKEN);
