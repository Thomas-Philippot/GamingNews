const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js')
const Reddit = require('reddit')
const Discord = require('discord.js')
const fs = require('fs')
const http = require('http')
const winston = require('winston')
const path = require('path')
require('dotenv').config()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../log', 'reddit.log'), }),
  ],
});

const reddit = new Reddit({
  username: 'adewale_bot',
  password: process.env.REDDIT_PASSWORD,
  appId: process.env.REDDIT_APP_ID,
  appSecret: process.env.REDDIT_APP_SECRET,
  userAgent: 'GamingNews/NodeJs:v1.0.0 (by u/Adewale56)'
})

module.exports = {
  data: new SlashCommandBuilder()
      .setName('reddit')
      .setDescription('cherche du contenue sur reddit')
      .addStringOption(option =>
          option.setName('subreddit')
              .setDescription("Le subreddit ou chercher du contenur")
              .setRequired(true)
      ),
  async execute(interaction) {
    const subreddit = interaction.options.getString('subreddit')
    reddit.get(`/r/${subreddit}`).then(async (response) => {
      if (response.data.dist > 0) {
        await loop(response, interaction).catch((e) => {
          logger.error(e.message)
        })
      } else {
        interaction.reply('Subreddit introuvable')
      }
    })
  },
};

async function loop(response, interaction) {
  const embeds = []
  const files = []
  const random = Math.floor(Math.random() * 25)
  const post = response.data.children[random].data
  const embed = await getEmbed(post, embeds)
  if (embed) {
    embeds.push(embed)
    interaction.reply({ embeds })
  }
  if (embed === false) {
    interaction.reply('Chargement de la vidéo...')
    sendVideo(post).then(async (attachement) => {
      files.push(attachement)
      console.log(attachement)
      await interaction.editReply({ files })
    }).catch(async (e) => {
      console.log(e)
      await interaction.editReply('App crashed')
    })
  }
}

function getEmbed(post, embeds) {
  return new Promise((resolve, reject) => {
    const embed = new MessageEmbed()
        .setTitle(post.title)
        .setColor(0x36d44a)
        .setURL(post.url);

    if (post.post_hint === 'image' || post.post_hint === 'link') {
      embed.setImage(post.url)
      resolve(embed)
    }

    if (post.post_hint === 'hosted:video') {
      resolve(false)
    } else {
      reject(new Error('Format inconnue'))
    }
  })
}

function sendVideo(post) {
  return new Promise((resolve, reject) => {
    const url = post.secure_media.reddit_video.fallback_url.replace('https', 'http').replace('?source=fallback', '')
    const file = fs.createWriteStream("./files/file.mp4");
    const request = http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        const attachement = new MessageAttachment(url)
        resolve(attachement)
      });
      request.setTimeout(60000, function() {
        reject(new Error('Request took to long'))
      });
    });
  })
}
