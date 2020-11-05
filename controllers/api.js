const apiRouter = require('express').Router()

apiRouter.get('/', (req, res) => {
  res.send(`<p>all server calls will come to api/something.
  For example try <a href="/api/users">api/users</a></p>`)
})

module.exports = apiRouter