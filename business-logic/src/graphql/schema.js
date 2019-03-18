const { buildSchema } = require('graphql')

// Construct a schema, using GraphQL schema language
const schema = buildSchema(/* GraphQL */`
  scalar UUID

  type Credentials {
    token: String!
    account: CredentialsAccount!
  }

  type CredentialsAccount {
    account_id: UUID!
    username: String!
    roles: [String!]!
  }

  type Query {
    auth_credentials (username: String! password: String!): Credentials!
  }
`)

module.exports = schema
