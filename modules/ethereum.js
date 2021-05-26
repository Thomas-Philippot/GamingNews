const Discord = require('discord.js')
const { client } = require('./discord-app')
const Web3 = require('web3')

const winston = require('winston');
const path = require('path')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, '../log', 'ethereum.log'), }),
  ],
});

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.WS_URL));
const address = process.env.ETH_WALLET

const subscription = web3.eth.subscribe('logs', {}, (error, result) => {
  if (!error) {
    web3.eth.getTransaction(result.transactionHash).then((transaction) => {
      if (transaction.to === address || transaction.from === address) {
        logger.info(`New Eth transaction, hash : ${transaction.hash}`)
        sendTransaction(transaction)
      }
    })
  }
});

// unsubscribes the subscription
subscription.unsubscribe(function(error, success){
  if(success)
    console.log('Successfully unsubscribed!');
});

function sendTransaction (transaction) {
  client.users.fetch('365160130532081666').then((user) => {
    const message = new Discord.MessageEmbed()
        .setTitle('Nouvelle transaction')
        .setColor(0x36d44a)
        .addField('From', transaction.from)
        .addField('To', transaction.to)
        .addField('Gas', transaction.gas)
        .addField('GasPrice', transaction.gasPrice)
        .addField('Value', transaction.value)
        .setURL(`https://etherscan.io/tx/${transaction.hash}`)
    user.send(message).then(() => {})
  })
}
