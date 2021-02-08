require('dotenv').config()
const fetchMatches = require('./helpers/fetchMatches')
const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const { computedDate } = require('./helpers/computedDate.js')
const { extendDataFromString } = require('./helpers/stringParser')

//DB controllers
const UserController = require('./db/user/user.controller')
const MatchController = require('./db/match/match.controller')

//init DB connection
async function initDbConnection() {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
    await mongoose.connect(process.env.CONNECT_DB_STRING, options)
    console.log('Database connected successful')
  } catch (error) {
    console.log('Database connection failed', error)
    process.exit(1)
  }
}
initDbConnection()

//extend bot token from env
const token = process.env.API_TOKEN

//init Bot
const bot = new TelegramBot(token, { polling: true })
bot.on('polling_error', (m) => console.log(m))

//Set commands list to the client's menu
bot.setMyCommands([
  {
    command: '/start',
    description: 'Start the bot',
  },
  {
    command: '/matches',
    description: 'Get the nearest 5 matches',
  },
  {
    command: '/votes',
    description: 'Get votes of the nearest 5 matches',
  },
])

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id
  const url =
    'https://s3-eu-west-1.amazonaws.com/tpd/logos/5f7c475bacf3dd0001939790/0x0.png'
  //Create a new User after the bot had started
  await UserController.createUser(msg.from.id, msg.chat.username)
  bot.sendPhoto(chatId, url)
  bot.sendMessage(
    chatId,
    'Бот портала uwatch.live приветсвует тебя. Здесь ты сможешь получить информацию о ближайших 5 актуальных матчах, включая уже идущие',
  )
})

bot.onText(/\/matches/, async (msg) => {
  const chatId = msg.chat.id

  //get five the nearest matches
  const fiveMatches = await fetchMatches

  fiveMatches.map(async (match) => {
    const { id, startedAt, opponent, player, status } = match
    const opponentName = opponent.name
    const playerName = player.name

    //create match in DB if it is not exist there yet
    await MatchController.createMatch(
      id,
      startedAt,
      opponentName,
      playerName,
      status,
    )

    //options for votes button
    const options = {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: opponentName,
              callback_data: `${id},opponent`,
            },
          ],
          [{ text: playerName, callback_data: `${id},player` }],
        ],
      }),
    }
    //computed a match's date
    const matchStatus = status == 'live' ? 'Live' : computedDate(startedAt)

    const html = `<b>Status: </b>${matchStatus}<b>\n${opponentName}</b> vs <b>${playerName}</b>`

    bot.sendMessage(chatId, html, options)
  })
})

bot.onText(/\/votes/, async (msg) => {
  const fiveMatches = await MatchController.getVotes()

  fiveMatches.map(({ opponentCount, playerCount, opponent, player }) => {
    const html = `<b>${opponent}</b> : ${opponentCount} votes\n<b>${player}</b> : ${playerCount} votes`
    bot.sendMessage(msg.chat.id, html, { parse_mode: 'HTML' })
  })
})

//after press the button:
bot.on('callback_query', async ({ from: { id }, data }) => {
  //parse string from callback_data of "vote button" to obj: matchId and team
  const { matchId, vote } = extendDataFromString(data)
  if (vote === 'opponent') {
    //check if user already voted
    const isVoted = await UserController.updateVotedStatus(id, matchId)
    if (isVoted === true) {
      bot.sendMessage(id, 'Вы уже проголосовали в этом матче!')
      return
    }
    //can vote if user has not voted yet
    await MatchController.updateVoteCounter(matchId, vote)
    bot.sendMessage(id, 'Cпасибо, ваш голос учтен!')
    return
  }

  if (vote === 'player') {
    const isVoted = await UserController.updateVotedStatus(id, matchId)
    if (isVoted === true) {
      bot.sendMessage(id, 'Вы уже проголосовали в этом матче!')
      return
    }
    await MatchController.updateVoteCounter(matchId, vote)
    bot.sendMessage(id, 'Cпасибо, ваш голос учтен!')
    return
  }
})
