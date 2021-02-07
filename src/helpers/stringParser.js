//parse string from callback_data of "vote button" to obj: matchId and team
function extendDataFromString(string) {
  const arr = string.split(',')
  const callbackData = {
    matchId: arr[0],
    vote: arr[1],
  }
  return callbackData
}

module.exports = { extendDataFromString }
