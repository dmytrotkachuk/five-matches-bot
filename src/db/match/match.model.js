const { Schema, model } = require('mongoose')

const MatchModel = new Schema({
  matchId: {
    type: String,
    require: true,
  },
  startedAt: Date,
  opponent: {
    type: String,
    require: true,
  },
  opponentCount: {
    type: Number,
    default: 0,
  },
  player: {
    type: String,
    require: true,
  },
  playerCount: {
    type: Number,
    default: 0,
  },
})

module.exports = model('Matches', MatchModel)
