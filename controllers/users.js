//Logic for all calls to api/user will be handled here
const usersRouter = require('express').Router()
const users = require('./testUsers')
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();

// add new user
usersRouter.post('/', function (req,res) {
  //hashing of password with bcrypt happens at the database point. in CWKcheckr\DB_interaction\db-accessor.js
  const body = req.body
  if(body.registerPassword !== body.confirm) {
    var nomatch = encodeURIComponent(false);
    res.redirect('/register?passmatch=' +nomatch);
    return;
  }
  var fullname = body.registerName;
  var username = body.registerUsername;
  var password = body.registerPassword;
  dao.add_student(fullname, username, password).then(outcome => {
    //When the outcome = 0, this represents a user already existing in the DB with the entered username. 
    //The user is then redirected to the register page to try again.
    if(outcome == 0){
      var userexists = encodeURIComponent(true);
      res.redirect('/register?userexists=' + userexists);
      return;
    }
    //When outcome = false, this shows that a backend/DB error has occurred. This results in the user being redirected to an error page
    if(outcome == false) {
      var dberror = encodeURIComponent(true);
      res.redirect('/register?dberror=' + dberror);
      return;
    }
    //When outcome = true, the registration process completed successfully and the user is redirected to the login page.
    if(outcome == true) {
      res.redirect('/reg-success');
      return;
    }
  })
  .catch(err =>{
    console.log(err);
    res.redirect('/register');
  });
})
usersRouter.get('/students', (request, response) => { 
  dao.get_model_items(db_accessor.models.Student).then(
    students => {
      //console.log(student)
      console.log('all students -----------------',students)
     response.send(students)
    }
  )
 });

module.exports = usersRouter;