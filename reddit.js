const Reddit = require('reddit')
const Discord = require('discord.js')
const { client } = require('./discord-app')
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv').config();

const admin = 418426349934477332

const reddit = new Reddit({
    username: 'Adewale56',
    password: process.env.REDDIT_PASSWORD,
    appId: process.env.REDDIT_APP_ID,
    appSecret: process.env.REDDIT_APP_SECRET,
    userAgent: 'GamingNews/NodeJs:v1.0.0 (by u/Adewale56)'
})

client.on('message', (message) => {
    if (message.member.hasPermission("ADMINISTRATOR")) {
        if (message.content.toLowerCase().startsWith('reddit')) {
            const subreddit = message.content.split(' ')[1]
            let sent = false
            if (subreddit) {
                reddit.get(`/r/${subreddit}`).then((response) => {
                    console.log(response.data.children)
                    do {
                        const random = Math.floor(Math.random() * 25)
                        const post = response.data.children[random].data
                        sent = sendEmbed(post, message.channel)
                    } while (!sent)
                })
            }
        }
    } else {
        message.channel.send('You need admin permission')
    }
})

function sendEmbed(post, channel) {
    let sent = false
    const embed = new Discord.MessageEmbed()
        .setTitle(post.title)
        .setColor(0x36d44a)
        .setURL(post.url);

    if (post.post_hint == 'image') {
        const image = post.preview.images[0].source.url.replace('amp;', '')
        embed.setImage(post.url)
        sent = true
    }
    channel.send(embed)

    if (post.post_hint === 'hosted:video') {
        sendVideo(post).then((response) => {
            sent = response
        })
    }
    return sent
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