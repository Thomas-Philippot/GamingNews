const Reddit = require('reddit')
const Discord = require('discord.js')
const { client } = require('./discord-app')
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv').config();
const winston = require('winston');
const path = require('path')

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../log', 'reddit.log'), }),
    ],
});

const reddit = new Reddit({
    username: 'Adewale56',
    password: process.env.REDDIT_PASSWORD,
    appId: process.env.REDDIT_APP_ID,
    appSecret: process.env.REDDIT_APP_SECRET,
    userAgent: 'GamingNews/NodeJs:v1.0.0 (by u/Adewale56)'
})

client.on('message', (message) => {
    if (message.content.toLowerCase().startsWith('reddit')) {
        if (message.member.hasPermission("ADMINISTRATOR")) {
            const subreddit = message.content.split(' ')[1]
            if (subreddit) {
                reddit.get(`/r/${subreddit}`).then((response) => {
                    if (response.data.dist > 0) {
                        loop(response, message).catch((e) => {
                            logger.error(e.message)
                        })
                    } else {
                        message.channel.send('Subreddit introuvable')
                    }
                })
            }
        } else {
            message.channel.send('You need admin permission')
        }
    }
})

async function loop(response, message) {
    let sent = false
    do {
        const random = Math.floor(Math.random() * 25)
        const post = response.data.children[random].data
        sent = await sendEmbed(post, message.channel)
    } while (!sent)
}

function sendEmbed(post, channel) {
    return new Promise((resolve => {
        const embed = new Discord.MessageEmbed()
            .setTitle(post.title)
            .setColor(0x36d44a)
            .setURL(post.url);

        if (post.post_hint === 'image' || post.post_hint === 'link') {
            embed.setImage(post.url)
            channel.send(embed)
            resolve(true)
        }

        if (post.post_hint === 'hosted:video') {
            sendVideo(post).then((response) => {
                channel.send(embed)
                resolve(response)
            })
        } else {
            resolve(false)
        }
    }))
}

function sendVideo(post) {
    return new Promise(((resolve) => {
        const url = post.secure_media.reddit_video.fallback_url.replace('https', 'http').replace('?source=fallback', '')
        const file = fs.createWriteStream("./files/file.mp4");
        const request = http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                const attachement = new Discord.MessageAttachment(url)
                channel.send(attachement);
                resolve(true)
            });
            request.setTimeout(60000, function() {
                channel.send('Fichier trop lourd')
                request.abort()
                resolve(false)
            });
        });
    }))
}
