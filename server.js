const cheerio = require('cheerio')
const fetch = require('fetch')
const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TELEGRAM_TOKEN

if (!token) {
  throw new Error('Missing Telegram Token. Please provid a valid in .env file.')
}