const express = require('express')
const { sessionMiddleware } = require('./utils/session')
const db = require('./utils/db')

express.request.prototype.db = db

const app = express()
const port = 3000

app.use((req, res, next) => {
  console.log('request made')
  next()
})

app.use(sessionMiddleware)
app.use('/graphql', require('./graphql'))
app.use('/upload', require('./upload'))

app.listen({ port }, () => {
  console.log(`Listening on port ${port}`);
})
