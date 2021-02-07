const UserModel = require('./user.model')

class UserController {
  async getUser(telegramId) {
    try {
      const user = await UserModel.findOne({ telegramId })
      return user
    } catch (error) {
      console.log(error)
    }
  }

  async createUser(telegramId, username) {
    try {
      //check if a user exists in DB
      const existedUser = await UserModel.findOne({ telegramId })
      if (existedUser) {
        console.log('This user is already exists')
        return
      }
      //create a new user
      const user = await UserModel.create({
        telegramId,
        username,
        matches: [],
      })
      return user
    } catch (error) {
      console.log(error)
    }
  }

  async updateVotedStatus(telegramId, matchId) {
    try {
      let isVoted
      await UserModel.findOne({ telegramId }, async (err, user) => {
        if (err) throw err
        //check if this match exists in user's array
        const existed = user.matches.includes(matchId)
        if (!existed) {
          //add match to user and vote
          isVoted = false
          user.matches.push(matchId)
          await user.save()
          return
        }
        //already voted
        isVoted = true
        return
      })
      return isVoted
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = new UserController()
