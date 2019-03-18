const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const throttle = require('express-throttle-bandwidth')

const app = express()

app.use(throttle(1024 * 128)) // throttling bandwidth

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/', (req, res) => {
  console.log('uploading file...')
  const form = new formidable.IncomingForm()
  const folder = '/usr/app/uploads'
  // const folder = path.join(__dirname, 'uploads')

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  form.uploadDir = folder
  form.parse(req, (_, fields, files) => {
    console.log('\n-----------')
    console.log('Fields', fields)
    console.log('Received:', Object.keys(files))

    // TODO
    // handle file upload here
    // catalog files to db (file name, type, owner, public url, id)
    // verify file types and size
    // verify auth

    res.send('Thank you')
  })
})

module.exports = app
