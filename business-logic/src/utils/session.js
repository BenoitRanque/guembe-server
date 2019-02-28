const jwt = require('jsonwebtoken')

function getSession (request) {
  // get session from header
  const Authorization = request.get('Authorization')
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '')
    const session = jwt.verify(token, process.env.AUTH_JWT_SECRET)
    return session
  }
  return null
}

function requireSession (ctx) {
  // throw error if no session is found
  if (ctx.session === null) throw new Error ('Authentication Required!')
}

function getRoles(ctx) {
  requireSession(ctx)

  return ctx.session['x-hasura']['x-hasura-allowed-roles']
}

function getAccountId(ctx) {
  requireSession(ctx)

  return ctx.session['x-hasura']['x-hasura-account-id']
}

function getUsername(ctx) {
  requireSession(ctx)

  return ctx.session['x-hasura']['x-hasura-username']
}

function requireRole (roles, ctx) {
  // throw error if current session does not have at least onf of the roles specified
  requireSession(ctx)
  const sessionRoles = getRoles(ctx)

  if ((Array.isArray(roles) && roles.some(role => sessionRoles.includes(role))) || sessionRoles.includes(roles)) {
    return true
  }
  throw new Error ('Authorization Required!')
}

module.exports = {
  getSession,
  getAccountId,
  getRoles,
  getUsername,
  requireSession,
  requireRole
}
