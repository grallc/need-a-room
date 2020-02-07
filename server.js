process.env.NTBA_FIX_319 = 1

const cheerio = require('cheerio')
const fetch = require('node-fetch')
const TelegramBot = require('node-telegram-bot-api')

const dotenv = require('dotenv')
dotenv.config()

const token = process.env.TELEGRAM_TOKEN
const defaultChannel = process.env.CHANNEL_ID

if (!token) {
  throw new Error('Missing Telegram Token. Please provid a valid in .env file.')
}

const bot = new TelegramBot(token, { polling: true })

const sendAvailabilities = async (chatId = defaultChannel) => {
  const message = await bot.sendMessage(chatId, 'Fetching availabilities...')
  const messageId = message.message_id
  const ravel = await getRavel()
  const amstelHome = await getAmstelHome()
  const messageContent =
    '🏢   *Student Experience - AmstelHome*' +
    `\n▪ ${amstelHome.reduce((a, b) => a + b, 0)} appartment(s) available` +
    '\n\n🏢   *Student Experience - Ravel Residence*' +
    `\n▪ ${ravel.reduce((a, b) => a + b, 0)} appartment(s) available`
  bot.editMessageText(messageContent, { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' })
  setTimeout(sendAvailabilities, 3600 * 1000)
}

sendAvailabilities()

// Matches "/av"
bot.onText(/\/av/, async (msg) => {
  const chatId = msg.chat.id
  sendAvailabilities(chatId)
})

const getRavel = async () => {
  const fetched = await fetch('http://ravelresidence.studentexperience.nl/?language=en')
  const body = await fetched.text()
  const $ = cheerio.load(body)
  const availabilities = []
  const grounds = $('.home_available_element')
  grounds.each((index, object) => {
    availabilities.push($(object).text().replace(/(\r\n|\n|\r)/gm, '').trim().indexOf('No appartment'))
  })
  return availabilities
}

const getAmstelHome = async () => {
  const fetched = await fetch('http://roomselector.studentexperience.nl/index.php?language=en')
  const body = await fetched.text()
  const $ = cheerio.load(body)
  const availabilities = []
  const grounds = $('.home_available_element')
  grounds.each((index, object) => {
    availabilities.push($(object).text().replace(/(\r\n|\n|\r)/gm, '').trim().indexOf('No appartment'))
  })
  return availabilities
}
