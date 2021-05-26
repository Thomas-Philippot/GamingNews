const axios = require('axios')
const Discord = require('discord.js')
const { client } = require('./discord-app')
const dotenv = require('dotenv').config();
const cron = require('node-cron');

cron.schedule('30 17 * * *', () => {
    console.log('running every day');
    client.users.fetch('365160130532081666').then((user) => {
        fetchBalance(user)
    })
});

const wallet = process.env.ETH_WALLET
client.on('message', async (message) => {
    if (message.content.toLowerCase() === 'eth balance') {
        const user = await client.users.fetch('365160130532081666');
        fetchBalance(user)
    }
})

function fetchBalance (user) {
    axios.get(`https://www.cruxpool.com/api/eth/miner/${wallet}/balance`).then((response) => {
        const balance = 0.000000001 * response.data.data.balance
        axios.get('https://pro-api.coinmarketcap.com/v1/tools/price-conversion', {
            headers: {
                'X-CMC_PRO_API_KEY': process.env.ETH_API_KEY
            },
            params: {
                amount: balance,
                symbol: "ETH",
                convert: "EUR"
            }
        }).then((response) => {
            const eur = response.data.data.quote.EUR.price
            sendBalance(balance, eur, user)
        })
    })
}

function sendBalance(balance, eur, user) {
    // send message with ETH amount and EUR real time price
    const message = new Discord.MessageEmbed()
        .setTitle('Voici le montant de ton portefeuille sur la pool de minage')
        .setColor(0x36d44a)
        .addField('Ethereum', `${balance} ETH`)
        .addField('Euro', `${eur} €`)
    user.send(message)
}
