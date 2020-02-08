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

const sendAvailabilities = async (chatId = defaultChannel, shouldForce = false) => {
  const day = new Date().getDay()
  if (day > 4 && !shouldForce) return
  const message = await bot.sendMessage(chatId, 'Fetching availabilities...')
  const messageId = message.message_id
  const ravel = await getRavel()
  const amstelHome = await getAmstelHome()
  const fizz = await getTheFizz()
  const messageContent =
    '🏢   [Student Experience - AmstelHome](http://roomselector.studentexperience.nl/index.php?language=en)' +
    `\n▪ ${amstelHome.reduce((a, b) => a + b, 0)} appartment(s) available` +
    '\n\n🏢   [Student Experience - Ravel Residence](http://ravelresidence.studentexperience.nl/?language=en)' +
    `\n▪ ${ravel.reduce((a, b) => a + b, 0)} appartment(s) available` +
    '\n\n🏢   [The Fizz](https://www.the-fizz.nl/store/c3/Apartments.html)' +
    `\n▪ ${fizz ? 'Some' : '0'} appartment(s) available`
  bot.editMessageText(messageContent + '\n\n*Please notice that the availabilities will not be updated today, since were are not in a working day.*', { chat_id: chatId, message_id: messageId, parse_mode: 'Markdown' })
}

const startAutoMessages = () => {
  sendAvailabilities()
  setTimeout(sendAvailabilities, 60 * 60 * 1000)
}

startAutoMessages()

// Matches "/av"
bot.onText(/\/av/, async (msg) => {
  const chatId = msg.chat.id
  sendAvailabilities(chatId, true)
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

const getTheFizz = async () => {
  const fetched = await fetch('https://www.the-fizz.nl/store/c3/Apartments.html')
  const body = await fetched.text()
  const $ = cheerio.load(body)
  return $($('.paragraph')[0]).text().indexOf("We don't have") === -1
}
