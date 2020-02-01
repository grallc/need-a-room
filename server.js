const cheerio = require('cheerio')
const fetch = require('fetch')
const TelegramBot = require('node-telegram-bot-api')

const dotenv = require('dotenv')
dotenv.config()

const token = process.env.TELEGRAM_TOKEN
const channel = process.env.CHANNEL

if (!token) {
  throw new Error('Missing Telegram Token. Please provid a valid in .env file.')
}

const bot = new TelegramBot(token, { polling: true })
bot.sendMessage(channel, "I'm still here and looking for an appartment!")

// Matches "/av"
bot.onText(/\/av/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Fetching avaibilities...')
})