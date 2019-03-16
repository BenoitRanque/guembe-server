const express = require('express')

const app = express()
const port = 3000

const apollo = require('./apollo')
apollo.applyMiddleware({ app, path: '/graphql' })

const upload = require('./upload')
app.use('/upload', upload)

app.listen({ port }, () => {
  console.log(`Listening on port ${port}`);
})