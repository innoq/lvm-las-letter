const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const compression = require('compression')
const inProduction = (process.env.NODE_ENV === 'production')
const letterController = require('./lib/controllers/letter')

// Set up Mustache as the view engine
app.engine('mustache', require('./lib/mustache'))
app.set('views', './views')
app.set('view engine', 'mustache')
app.set('layout', 'layout')

app.use(bodyParser.urlencoded({ extended: false }))

// BasicAuth
if (inProduction) {
  const passport = require('passport')
  const BasicStrategy = require('passport-http').BasicStrategy
  passport.use(new BasicStrategy((userid, password, done) => {
    if (userid === 'lvm' && password === 'roca-prototype') {
      done(null, {})
    } else {
      done('Unauthorized')
    }
  }))
  app.use(passport.authenticate('basic', { session: false }))
}

app.locals.postbox_url = process.env.POSTBOX_URL || 'http://localhost:9000'
app.locals.roca_url = process.env.ROCA_URL

app.use(require('./lib/render_without_layout'))

app.use(compression())

// Mount the assets
app.use('/assets', express.static('public'))

app.get('/', letterController.index)
app.get('/template', letterController.getTemplates)
app.get('/recipients', letterController.getRecipients)
app.post('/send', letterController.send)

module.exports = app

// Only run the application if it was invoked directly (e.g. not required by a test)
if (module.parent === null) {
  const backend = require('lasrest')

  Promise.all([
    backend.listen(5100),
    app.listen(process.env.PORT || 8080)
  ]).then(() => console.log(`Listening on port ${process.env.PORT || 8080}!`))
}
