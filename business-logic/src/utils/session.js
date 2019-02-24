


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

function requireRole (roles, ctx) {
  // throw error if current session does not have at least onf of the roles specified
  this.requireSession(ctx)

  if ((Array.isArray(roles) && roles.some(role => ctx.session.roles.includes(role))) || ctx.session.roles.includes(roles)) {
    return true
  }
  throw new Error ('Authorization Required!')
}

module.exports = {
  getSession,
  requireSession,
  requireRole
}
