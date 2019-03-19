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
  const folder = '/usr/app/files'
  // const folder = path.join(__dirname, 'uploads')

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  form.uploadDir = folder
  form.parse(req, async (_, fields, files) => {
    console.log('\n-----------')
    console.log('Fields', fields)
    console.log('Received:', Object.keys(files))
    console.log(files)

    // TODO
    // handle file upload here
    // catalog files to db (file name, type, owner, public url, id)
    // verify file types and size
    // verify auth

    const response = await db.query('INSERT INTO support.file (path, name, type, size) VALUES ($1, $2, $3, $4) RETURNING *', [path, name, type, size])

    // store all files metadata including file type
    // res.json()// map file names to ids
    res.send('Thank you')
  })
})

app.get('/', async (req, res) => {
  // handle request for file based on file id.
  // be sure to set return headers properly
  // check permissions:
  // user must be authenticated
  // user must either have access to all files or be owner of file

  if (!req.query.id) {
    return res.status(400).send('Malformed Query: id query parameter is required') // TODO: send propper error code (bad request)
  }

  const { rows: [ file ] } = await db.query(`SELECT file_id, name, path, type, size FROM suport.file WHERE file_id = $1`, [ req.query.id ])

  if (!file) {
    return res.status(404).send(`File Not Found: Could not find file ${req.query.id}`) // TODO: send propper error code (bad request)
  }

  res.sendFile(file.path, {
    headers: {
      'Content-Type': file.type
    }
  })
})

module.exports = app
