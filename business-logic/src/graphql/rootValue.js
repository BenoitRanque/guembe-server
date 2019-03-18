const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const rootValue = {
  auth_credentials: async function ({ username, password }, { db }) {
    const { rows: [ account ] } = await db.query(`SELECT account_id, username, password FROM auth.account WHERE username = $1`, [ username ])

    if (account) {
      const valid = await bcrypt.compare(password, account.password)
      if (valid) {
        const { account_id } = account
        const { rows: roleRows } = await db.query(`SELECT role_name AS role FROM auth.account_role WHERE account_id = $1`, [account_id])

        const roles = roleRows.length ? roleRows.map(({ role }) => role) : ['anonymous'] // default to anonymous role
        const credentials = {
          username,
          account_id: account_id,
          roles
        }
        const claims = {
          'x-hasura-default-role': roles[0], // default to first role
          'x-hasura-allowed-roles': roles,
          'x-hasura-account-id': account_id,
          'x-hasura-username': username
        }
        return {
          account: credentials,
          token: jwt.sign({ 'x-hasura': claims }, process.env.AUTH_JWT_SECRET)
        }
      }
    }
    throw new Error('No se pudo Iniciar Session')
  }
}

module.exports = rootValue
