const db_accessor = require('../DB_interaction/db-accessor')
const passport = require('passport')
const Strategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

dao = new db_accessor.DAO();

exports.init = function(app) {
    passport.use(new Strategy(
        function(username, password, callback) {
            var get_username_find_doc = 
            {
                "username" : username
            }
            dao.get_model_items(db_accessor.models.Student, get_username_find_doc).then(student => {
                console.log('lookup ', username);
                bcrypt.compare(password, student[0].passwordHash, function(err, result) {
                    if (result) {
                        return callback(null, student[0]);
                    } else {
                        return callback(null, false);
                    }
                });
            })
            .catch(err =>{
                console.log(err);
                console.log(`Could not match username ${username} with any student in database...`)
                return callback(null, false); 
            });
    }));

    passport.serializeUser(function(user, callback) {
        callback(null, user.studentNo);
      });
      
    passport.deserializeUser(function(id, callback) {
        var get_student_no_doc =
        {
            "studentNo" : {$in : [id]}
        }
        dao.get_model_items(db_accessor.models.Student, get_student_no_doc).then(student => {
            callback(null, student[0])
        })
        .catch(err => {
            return callback(err);
        });
    });

    app.use(passport.initialize());
    app.use(passport.session());
};

exports.authorize = function(redirect) {
    return passport.authenticate('local', {successReturnToOrRedirect: '/',  failureRedirect: redirect});
};
