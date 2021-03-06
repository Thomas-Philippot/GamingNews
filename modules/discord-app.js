const Discord = require('discord.js')
const axios = require('axios')
const schedule = require('node-schedule')
const moment = require('moment')
const dotenv = require('dotenv').config()

const client = new Discord.Client()
let newsChannel = ''
let newsTechChannel = ''
let article = {}
let lastArticle = {}
let now = moment()
let guild = {}

client.on('ready', async () => {
    guild = client.guilds.cache.first()
    console.log('I am ready!');
    newsChannel = await client.channels.fetch('497308273532207118');
    newsTechChannel = await client.channels.fetch('497308200832466955');
});

let rule = new schedule.RecurrenceRule()
rule.hour = 16
rule.minute = 20
let j = schedule.scheduleJob(rule, function () {
    console.log('event pushed');
    axios.get('https://newsapi.org/v2/top-headlines',{
        params: {
            'category': 'technology',
            'country': 'fr',
            'apiKey': process.env.API_KEY
        }
    }).then(response => {
        article = response.data.articles[0];
        if (article === lastArticle) {
            article = response.data.articles[1]
        }
        const embed = new Discord.MessageEmbed()
            .setTitle(article.title)
            .setColor(0x36d44a)
            .setImage(article.urlToImage)
            .setDescription(article.description)
            .setURL(article.url);
        newsChannel.send(embed);
        lastArticle = article
        console.log('Article envoyé sur le serveur : ' + now.format("YYYY-MM-DD"));
        console.log(article.title)
    })
        .catch(e => {
            newsChannel.send(e.message)
            console.log("error", e);
        });
});

client.on('message', message => {

    if (message.content.toLowerCase() === 'ping') {
        message.channel.send('pong');
    }

    if (message.content.toLowerCase().startsWith('news ')) {
        axios.get('https://newsapi.org/v2/everything', {
            params: {
                'q': message.content.substring(5),
                'from': now.format("YYYY-MM-DD"),
                'language': 'fr',
                'sortBy': 'popularity',
                'apiKey': process.env.API_KEY
            }
        }).then(response => {
            article = response.data.articles[0];
            const embed = new Discord.MessageEmbed()
                .setTitle(article.title)
                .setColor(0x36d44a)
                .setImage(article.urlToImage)
                .setDescription(article.description)
                .setURL(article.url);
            newsTechChannel.send(embed);
            console.log('Article envoyé sur le serveur : ' + now.format("YYYY-MM-DD"));
            console.log(article.title)
        }).catch(e => {
            newsTechChannel.send(e.message)
        })
        message.delete().catch(e => console.log(e));
    }

    if (message.content.includes("à qui le dites-vous")) {
        const embed = new Discord.MessageEmbed()
            .setTitle('A vous ! ')
            .setColor(0x36d44a)
            .setImage('https://thumbs.gfycat.com/DangerousPowerlessFinwhale-mobile.jpg');
        message.channel.send(embed).catch(e => console.log(e));
        message.delete().catch(e => console.log(e));
    }

    if (message.content.toLowerCase() === 'logout') {
        message.channel.send('Bot Marrons logged out').then(() => {
            console.log('Bot logged out');
            client.destroy();
        })
    }

    if (message.content.toLowerCase() === 'help') {
        const embed = new Discord.MessageEmbed()
            .setTitle('Voici la liste de mes commandes :')
            .setDescription('Propose en d\'autres si tu veux, un préfixe sera ajouter plus tard')
            .setColor(0x36d44a)
            .addField(':hammer_pick: Modération', 'logout', true)
            .addField('Avoir le rôle Minecraft', 'give minecraft', true)
            .addField(':joy: Fun', 'ping, à qui le dites-vous', true)
            .addField(':newspaper: News', 'Chaque jour à 17h20\n une news gaming est envoyé', true)
            .addField(':white_sun_small_cloud: Météo', 'Météo <nom de la ville>', true)
            .addField(':newspaper: News', 'News <Recherche>', true);
        message.channel.send(embed).catch(e => console.log(e));;
        message.delete().catch(e => console.log(e));
    }

    if (message.content.toLowerCase().startsWith('pls') || message.content.startsWith('!')) {
        message.delete().catch(e => console.log(e));
    }

    if (message.content.toLowerCase().startsWith('météo')) {
        let ville = message.content.split(' ');
        axios.get('http://api.openweathermap.org/data/2.5/weather?q=' + ville[1] + '&appid=863668499362fb4884ebd97229f3b26b&units=metric').then( response => {
            const meteo = response.data;
            const embed = new Discord.MessageEmbed()
                .setTitle(meteo.weather[0].description)
                .setAuthor(ville[1], 'http://openweathermap.org/img/w/' + meteo.weather[0].icon + '.png')
                .setColor(0x36d44a)
                .addField(':thermometer: Temp.', meteo.main.temp + '°C', true)
                .addField(':fire: Max', meteo.main.temp_max + '°C', true)
                .addField(':snowflake: Min', meteo.main.temp_min + '°C', true);
            message.channel.send(embed).catch(e => console.log(e));
        }).catch(e => {
            console.log(e);
            message.channel.send(e).catch(e => console.log(e));
        })
        message.delete().catch(e => console.log(e));
    }

});

client.login(process.env.TOKEN).catch(e => console.log(e));

module.exports = { client }
