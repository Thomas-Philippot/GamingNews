const axios = require('axios')
const Discord = require('discord.js')
const { client } = require('./discord-app')
const dotenv = require('dotenv').config();
const cron = require('node-cron');

cron.schedule('30 17 * * *', () => {
    console.log('running every day');
    client.users.fetch('365160130532081666').then((user) => {
        sendBalance(user)
    })
});

const wallet = process.env.ETH_WALLET
client.on('message', async (message) => {
    if (message.content.toLowerCase() === 'eth balance') {
        const user = await client.users.fetch('365160130532081666');
        sendBalance(user)
    }
})

function sendBalance (user) {
    axios.get(`https://www.cruxpool.com/api/eth/miner/${wallet}/balance`).then((response) => {
        const balance = 0.000000001 * response.data.data.balance
        user.send(balance).catch((e) => {
            console.log(e)
        })
    })
}
