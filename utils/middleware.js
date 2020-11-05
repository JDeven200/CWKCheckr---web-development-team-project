//Any middleware that we make will be here

//This is middleware that logs each request when it is received
const requestLogger = (request, response, next) => {
  console.log('------------------------------------------------')
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---------------------------------------------')

  next()
}

const sessionLogger = (request, response, next) => {
  console.log(request.session);
  next();
}

module.exports = {
  requestLogger,
  sessionLogger
}