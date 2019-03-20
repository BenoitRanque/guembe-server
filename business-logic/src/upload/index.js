const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const throttle = require('express-throttle-bandwidth')
const { requireSessionMiddleware, requireRoleMiddleware, getAccountId, getRoles} = require('../utils/session')

const app = express()

// roles that can read or write own file
const FILE_OWNER_ROLES = ['']
// roles that can read or write any file
const FILE_ADMIN_ROLES = ['']

app.use(requireSessionMiddleware)

app.use(throttle(1024 * 128)) // throttling bandwidth

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(requireRoleMiddleware([...FILE_OWNER_ROLES, ...FILE_ADMIN_ROLES]))

app.post('/', (req, res) => {
  const owner_id = getAccountId(req)
  const form = new formidable.IncomingForm()
  const folder = '/usr/app/files'
  // const folder = path.join(__dirname, 'uploads')

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  form.uploadDir = folder

  form.on('error', function(err) {
      throw err;
  })

  form.on('field', function(field, value) {
      //receive form fields here
  })

  /* this is where the renaming happens */
  form.on ('fileBegin', async function(name, file){
    //rename the incoming file to the file's name
    // either gen uuid and go on wth pload (better performance?) or create registry in postgres first?
    file.path = form.uploadDir + "/" + uuid()
  })

  form.on('file', async function(field, file) {
    //On file received
    // update stored file size

  })

  form.on('progress', function(bytesReceived, bytesExpected) {
      //self.emit('progess', bytesReceived, bytesExpected)

      var percent = (bytesReceived / bytesExpected * 100) | 0;
      process.stdout.write('Uploading: %' + percent + '\r');
  })

  form.on('end', function() {


  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).send(err)
    }

    // map files to promise array
    try {
      const result = await Promise.all(files.map(file => async () => {
        const queryString = `INSERT INTO support.file (path, name, type, size, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`
        const { path, name, type, size } = file

        const { rows: [ { file_id } ] } = await db.query(queryString, [ path, name, type, size, owner_id ])

        // move/rename file?

        return { file_id, name }
      }))

      res.status(200).json(result)
    } catch (error) {
      // handle error
    } finally {

    }
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

  // query fails if file id argument not provided
  if (!req.query.id) {
    return res.status(400).send('Malformed Query: id query parameter is required') // TODO: send propper error code (bad request)
  }
  // if user is file admin, do not check ownership
  const queryString = getRoles(req).some(role => FILE_ADMIN_ROLES.includes(role))
      ? `SELECT * FROM support.file WHERE file_id = $1`
      : `SELECT * FROM support.file WHERE file_id = $1 AND owner_id = $2`

  const { rows: [ file ] } = await db.query(queryString, [ req.query.id, getAccountId(req) ])

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
