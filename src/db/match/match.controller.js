const MatchModel = require('./match.model')
const UserController = require('../user/user.controller')

class MatchController {
  async getMatch(matchId) {
    try {
      const match = await MatchModel.findOne({ matchId })
      if (!match) {
        console.log('This match does not exists in database ')
        return
      }
      return match
    } catch (error) {
      console.log(error)
    }
  }

  async getVotes() {
    try {
      //get all matches and select necessary fields
      const allMatches = await MatchModel.find(
        {},
        ' opponentCount playerCount opponent player ',
      )
      //get last 5 matches
      return allMatches.slice(-5)
    } catch (error) {
      console.log(error)
    }
  }

  async createMatch(matchId, startedAt, opponent, player, status) {
    try {
      //check if this match already exists
      const existedMatch = await MatchModel.findOne({ matchId })
      if (existedMatch) {
        return existedMatch
      }
      //if match doesn't exists, create it
      const match = await MatchModel.create({
        matchId,
        startedAt,
        opponent,
        player,
        status,
      })
      return match
    } catch (error) {
      console.log(error)
    }
  }

  async updateVoteCounter(matchId, vote) {
    try {
      //check if match exists
      const match = await MatchModel.findOne({ matchId })
      //chooses the votion option and increments a counter
      if (vote === 'opponent') {
        await MatchModel.findOneAndUpdate(
          { matchId },
          { opponentCount: (match.opponentCount += 1) },
        )
      }
      if (vote === 'player') {
        await MatchModel.findOneAndUpdate(
          { matchId },
          { playerCount: (match.playerCount += 1) },
        )
      }
    } catch (error) {
      console.log(error)
    }
  }
}
module.exports = new MatchController()
