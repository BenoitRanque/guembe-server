const { ApolloServer, gql } = require('apollo-server')
const { getSession } = require('./utils/session')
const db = require('./utils/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  scalar UUID

  type Credentials {
    token: String!
    account: CredentialsAccount!
  }

  type CredentialsAccount {
    user_id: UUID!
    username: String!
    roles: [CredentialsRole!]!
  }

  type CredentialsRole {
    role_name: String
  }

  type Query {
    announcement: String
    credentials (username: String! password: String!): Credentials!
  }
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    announcement: () =>
      `Say hello to the new Apollo Server! A production ready GraphQL server with an incredible getting started experience.`,
    credentials: async (root, { username, password }, { db }) => {
      const { rows: [ account ] } = await db.query(`SELECT account_id, username, password FROM auth.account WHERE username = $1`, [ username ])

      if (account) {
        const valid = await bcrypt.compare(password, account.password)
        if (valid) {

          // TODO build propper JWT per hasura spec
          const credentials = {
            username,
            account_id: account.account_id
          }
          return {
            credentials,
            token: jwt.sign({ credentials }, process.env.AUTH_JWT_SECRET)
          }
        }
      }
      throw new Error('No se pudo Iniciar Session')
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    request: req,
    session: getSession(req),
    db
  })
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});