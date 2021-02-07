const { Schema, Types, model } = require('mongoose')

const UserModel = new Schema({
  telegramId: Number,
  username: String,
  matches: [String],
})

module.exports = model('Users', UserModel)
