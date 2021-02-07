const { request, gql } = require('graphql-request')

async function fetchMatches() {
  const query = gql`
    query getMatchesList($id: ID!, $status: MatchStatus) {
      project(id: $id, isPublic: true) {
        matches(status: $status) {
          items {
            id
            startedAt
            opponent {
              name
            }
            player {
              name
            }
            status
          }
        }
      }
    }
  `
  const endpoint = 'https://uwatch.live/graphql'
  const variables = {
    id: '1',
  }

  try {
    const data = await request(endpoint, query, variables)
    const matches = data.project.matches.items.slice(0, 5)
    return matches
  } catch (error) {
    console.log(error)
  }
}

module.exports = fetchMatches()
