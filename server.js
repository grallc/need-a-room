process.env.NTBA_FIX_319 = 1

const cheerio = require('cheerio')
const fetch = require('node-fetch')
const TelegramBot = require('node-telegram-bot-api')

const dotenv = require('dotenv')
dotenv.config()

const token = process.env.TELEGRAM_TOKEN
const channel = process.env.CHANNEL

if (!token) {
  throw new Error('Missing Telegram Token. Please provid a valid in .env file.')
}

const bot = new TelegramBot(token)
bot.sendMessage(channel, "I'm still here and looking for an appartment!")

// Matches "/av"
bot.onText(/\/av/, (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Fetching availability...')
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

getRavel().then((ravel) => console.log(ravel))

const getAmstelHome = async () => {
  const fetched = await fetch('http://roomselector.studentexperience.nl/index.php?language=en')
  const body = await fetched.text()
  const $ = cheerio.load(body)
  const availabilities = []
  const grounds = $('.home_available_element')
  grounds.each((index, object) => {
    console.log($(object).html())
    availabilities.push($(object).text().replace(/(\r\n|\n|\r)/gm, '').trim().indexOf('No appartment'))
  })
  return availabilities
}

getAmstelHome().then((amstelHome) => console.log(amstelHome))
