const express = require('express')
const { sessionMiddleware } = require('./utils/session')
const db = require('./utils/db')

express.request.db = db

const app = express()
const port = 3000

app.use(sessionMiddleware)
app.use('/graphql', require('./graphql'))
app.use('/upload', require('./upload'))

app.listen({ port }, () => {
  console.log(`Listening on port ${port}`);
})
