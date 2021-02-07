function computedDate(startedAt) {
  return `Match will start at \n ${new Date(startedAt).toUTCString()}`
}

module.exports = { computedDate }
