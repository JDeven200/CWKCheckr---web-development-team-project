const express = require('express');
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const ajaxAddRouter = require('./controllers/ajax-add')
const ajaxEditRouter = require('./controllers/ajax-edit')
const addCourseworkRouter = require('./controllers/add-coursework')
const editCourseworkRouter = require('./controllers/edit-coursework')
const removeCourseworkRouter = require('./controllers/remove-coursework')
const viewsRouter = require('./controllers/views')
const courseRouter = require('./controllers/course')
const courseworkRouter = require('./controllers/coursework')
const apiRouter = require('./controllers/api')
const middleware = require('./utils/middleware')
const passport = require('passport');
const auth = require('./auth/auth');
const session = require('express-session');

var mustache = require('mustache-express') 
path = require('path');
const app = express();

/********* Needed for viewsRouter to work****************/
app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.resolve(__dirname, 'Views'));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/Resources'));

app.use(session({ secret: "It's a secret to everyone!", resave: false, saveUninitialized: false }));

auth.init(app);

app.use(middleware.requestLogger)//log requests
app.use(middleware.sessionLogger)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use('/api/cwk', courseworkRouter)
app.use('/api/course', courseRouter)
app.use('/api/ajax-add', ajaxAddRouter)
app.use('/api/ajax-edit', ajaxEditRouter)
app.use('/api/add-coursework', addCourseworkRouter)
app.use('/api/edit-coursework', editCourseworkRouter)
app.use('/api/remove-coursework', removeCourseworkRouter)
app.use('/api', apiRouter)
app.use('/', viewsRouter)

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> {
  console.log(`Server is running on port ${PORT}`)
})