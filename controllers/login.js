const loginRouter = require('express').Router()
const auth = require('../auth/auth')

loginRouter.post('/', auth.authorize("/login?fail=" + encodeURIComponent(true)));

module.exports = loginRouter