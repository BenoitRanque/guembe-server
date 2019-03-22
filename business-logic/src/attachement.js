const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')
const corser = require('corser')
const uuid = require('uuid/v4')
const throttle = require('express-throttle-bandwidth')
const { requireSessionMiddleware, requireRoleMiddleware, getAccountId, getRoles} = require('./utils/session')

const app = express()

// roles that can read or write own file
const FILE_OWNER_ROLES = ['admin']
// roles that can read or write any file
const FILE_ADMIN_ROLES = ['admin']

app.use(corser.create({
  requestHeaders: corser.simpleRequestHeaders.concat(['Authorization'])
}))

app.use(requireSessionMiddleware)

app.use(requireRoleMiddleware([...FILE_OWNER_ROLES, ...FILE_ADMIN_ROLES]))

app.use(throttle(1024 * 128)) // throttling bandwidth

app.post('/', (req, res) => {
  const owner_id = getAccountId(req)
  const form = new formidable.IncomingForm()
  const folder = '/usr/app/files'
  // const folder = path.join(__dirname, 'uploads')
  console.log('uploading...')

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder)
  }

  form.uploadDir = folder

  form.on('error', function(err) {
    throw err;
  })

  form.on('field', function(field, value) {

  })

  form.on ('fileBegin', function(name, file){
  })

  form.on('file', function(field, file) {
  })

  form.on('progress', function(bytesReceived, bytesExpected) {
  })

  form.on('end', function() {
  })

  try {

    form.parse(req, async (err, fields, files) => {
      if (err) {
        throw err
      }
      // map files to promise array
      const result = await Promise.all(Object.values(files).map(async file => {
        const attachement_id = uuid()
        const path = `${form.uploadDir}/${attachement_id}`

        fs.renameSync(file.path, path);

        const queryString = `INSERT INTO support.attachement (attachement_id, path, name, type, size, owner_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`
        const { name, type, size } = file

        await req.db.query(queryString, [ attachement_id, path, name, type, size, owner_id ])
        // const { rows: [ { created_at } ] } = await req.db.query(queryString, [ file_id, path, name, type, size, owner_id ])

        return { id: attachement_id, name }
      }))

      res.status(200).json(result)
    })
  } catch (error) {
    return res.status(500).send(error)
  }
})

app.get('/', async (req, res) => {

  // query fails if file id argument not provided
  if (!req.query.id) {
    return res.status(400).send('Malformed Query: id query parameter is required') // TODO: send propper error code (bad request)
  }

  // if user is file admin, do not check ownership
  const isFileAdmin = getRoles(req).some(role => FILE_ADMIN_ROLES.includes(role))
  const queryString = isFileAdmin
    ? `SELECT * FROM support.attachement WHERE attachement_id = $1`
    : `SELECT * FROM support.attachement WHERE attachement_id = $1 AND owner_id = $2`
  const parameters = isFileAdmin
    ? [ req.query.id ]
    : [ req.query.id, isFileAdmin ? null : getAccountId(req) ]

  const { rows: [ file ] } = await req.db.query(queryString, parameters)

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
