//response handlers for all of frontend.
const viewsRouter = require('express').Router()
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();


viewsRouter.get("/login", function (request, response) {
    //console.log(request.session.passport.user);
    if(request.query.fail === 'true') {
        response.render("login", {
            "Title" : "Login Page",
            "page" : "CWKCheckr Login",
            "error" : "Incorrect Username/Password!"
        });
    }
    else {
        response.render("login", {
            "Title" : "Login Page",
            "page" : "CWKCheckr Login"
        });
    }
});

viewsRouter.get("/logout", function(request, response) {
    request.logout();
    request.session.destroy();
    response.redirect("/");
})

viewsRouter.get("/register", function (request, response) {
    if(request.query.passmatch === 'false') {
        response.render("register", {
            "Title" : "Sign Up Page",
            "page" : "CWKCheckr Register",
            "pass-match" : "Passwords do not match!"
        });
        return;
    }
    else if(request.query.userexists === 'true') {
        response.render("register", {
            "Title" : "Sign Up Page",
            "page" : "CWKCheckr Register",
            "user-exists" : "This username is already taken! Please try another."
        });
        return;
    }
    else if(request.query.dberror === 'true') {
        response.render("register", {
            "Title" : "Sign Up Page",
            "page" : "CWKCheckr Register",
            "db-error" : "Registration failed...contact James, Alex or Ohe!"
        });
        return;
    }
    else{
        response.render("register", {
            "Title" : "Sign Up Page",
            "page" : "CWKCheckr Register"
        });
    }
});

viewsRouter.get("/reg-success", function(request, response) {
    response.render("reg-success", {
        "Title" : "Successfully registered",
        "page" : "Login page"
    });
});

//viewsRouter.get('/', ensureLoggedIn('/login'), function (request, response) {
viewsRouter.get('/',  ensureLoggedIn('/login'), function (request, response) {
    var session_id = request.session.passport.user;
    var loggedInStudent = {
        "studentNo" : session_id
    };
    dao.get_model_items(db_accessor.models.Student, loggedInStudent).then(students => {
        console.log(students);
        console.log(session_id);
        var student_name = "";
        var student_courses = [];
        var student_courseworks = [];
        for(var i = 0; i < students.length; i++) {
            if(students[i].studentNo === session_id) {
                student_name = students[i].name;
                student_courses = students[i].courses;
                student_courseworks = students[i].courseworks;
                console.log(student_courseworks[0].dueDate);
                console.log(student_courseworks);
                break;
            }
        }
        response.render("home", {
            "Title" : "Home page",
            "page" : "CWKCheckr Home Page",
            "Student" : student_name,
            "Courses" : student_courses,
            "Coursework" : student_courseworks
        });
    }).catch(err => {
        console.log(err);
        console.log("Could not retrieve student, see error above.");
        response.render("home", {
            "Title" : "Home page",
            "page" : "CWKCheckr Home Page",
            "Student" : [],
            "Courses" : [],
            "Coursework" : []
        });
    });
});

viewsRouter.get("/view-coursework", ensureLoggedIn('/login'), function (request, response) {
    var session_id = request.session.passport.user;
    var loggedInStudent = {
        "studentNo" : session_id
    };

    if(request.query.shareStudent != undefined) {
        dao.get_model_items(db_accessor.models.Student).then(students => {
            for (var i = 0; i < students.length; i++){
                if(request.query.shareStudent == students[i].studentNo){
                    for(var j = 0; j < students[i].courseworks.length; j++) {
                        if(request.query.cwkId == students[i].courseworks[j].courseworkId){
                            coursework = students[i].courseworks[j];
                            studentName = students[i].username
                            break;
                        }
                    }
                }
            }

            base_url = request.get("host")
            response.render("view-shared-coursework", {
                "Title" : "Shared Coursework",
                "page" : "CWKCheckr Shared Coursework",
                "Coursework" : coursework,
                "OriginStudent" : studentName
            });
        });
        return;
    }
    else {
        dao.get_model_items(db_accessor.models.Student, loggedInStudent).then(students => {
            if(request.query.selected != undefined) {
                coursework = null;
                for(var i = 0; i < students.length; i++) {
                    for(var j = 0; j < students[i].courseworks.length; j++) {
                        if(request.query.selected == students[i].courseworks[j].courseworkId){
                            coursework  = students[i].courseworks[j];
                            // Exit loop on required coursework find.
                            break;
                        }
                    }
                }
                base_url = request.get("host")
                response.render("view-selected-coursework", {
                    "Title" : "Selected Coursework",
                    "page" : "CWKCheckr Selected Coursework",
                    "Coursework" : coursework,
                    "ShareableLink" : `${base_url}/view-coursework?shareStudent=${loggedInStudent.studentNo}&cwkId=${coursework.courseworkId}`
                });
                return;
            } else {
                complete_courseworks = [];
                incomplete_courseworks =[];
                for (var i = 0; i < students.length; i++) {
                    for(var j = 0; j < students[i].courseworks.length; j++) {
                        if(students[i].courseworks[j].completionDate != null) {
                            console.log(students[i].courseworks[j]);
                            complete_courseworks.push(students[i].courseworks[j]);
                        } else {
                            console.log(students[i].courseworks[j]);
                            incomplete_courseworks.push(students[i].courseworks[j]);
                        }
                    }
                }
                response.render("view-coursework", {
                    "Title" : "View Coursework",
                    "page" : "CWKCheckr View Coursework",
                    "Complete Coursework" : complete_courseworks,
                    "Incomplete Coursework" : incomplete_courseworks
                });
                return;
            }
        }).catch(error => {
            console.log(error);
            console.log("could not retrieve student, see error above");
            response.render("view-coursework", {
                "Title" : "View Coursework",
                "page" : "CWKCheckr View Coursework",
                "Complete Coursework" : [],
                "Incomplete Coursework" : []
            }); 
        });
    }
});

viewsRouter.get("/add-coursework", ensureLoggedIn('/login'), function(request, response) {
    var session_id = request.session.passport.user;
    var loggedInStudent = {
        "studentNo" : session_id
    };
    dao.get_model_items(db_accessor.models.Student, loggedInStudent).then(students => {
        courses = [];
        for (var i = 0; i < students.length; i++) {
            console.log(students[i].courses);
            courses = students[i].courses;
        }
        if(request.query.error === 'true') {
            response.render("add-coursework", {
                "Title" : "Add Coursework",
                "page" : "Add Coursework",
                "courses" : courses,
                "error" : "Failed to add coursework to student. Contact the devs for help!"
            });
            return;
        }
        else if(request.query.dupe === 'true'){
            response.render("add-coursework", {
                "Title" : "Add Coursework",
                "page" : "Add Coursework",
                "courses" : courses,
                "error" : "Can't add the same coursework twice."
            });
        } else {
            response.render("add-coursework", {
                "Title" : "Add Coursework",
                "page" : "Add Coursework",
                "courses" : courses
            });
        }
    }).catch(error => {
        console.log(error);
        console.log("could not retrieve student, see error above");
        response.render("add-coursework", {
            "Title" : "Add Coursework",
            "page" : "Add Coursework",
            "courses" : [],
            "error" : "Could not access server. Contact the devs for help!"
        }); 
    });
});

viewsRouter.get("/add-coursework-success", function(request, response) {
    response.render("add-coursework-success", {
        "Title" : "Successfully added coursework",
        "page" : "homepage"
    });
});

viewsRouter.get("/edit-coursework", ensureLoggedIn('/login'), function(request, response) {
    var session_id = request.session.passport.user;
    var loggedInStudent = {
        "studentNo" : session_id
    };
    dao.get_model_items(db_accessor.models.Student, loggedInStudent).then(students => {
        courseworks = [];
        for (var i = 0; i < students.length; i++) {
            console.log(students[i].courseworks);
            courseworks = students[i].courseworks;
        }
        if(request.query.error === 'true') {
            response.render("edit-coursework", {
                "Title" : "Edit Coursework",
                "page" : "Edit Coursework",
                "error" : "Failed to edit coursework. Contact the devs for help!",
                "courseworks" : courseworks
            });
            return;
        }  
        response.render("edit-coursework", {
            "Title" : "Edit Coursework",
            "page" : "Edit Coursework",
            "courseworks" : courseworks
        });
    }).catch(error => {
        console.log(error);
        console.log("could not retrieve student, see error above");
        response.render("edit-coursework", {
            "Title" : "Edit Coursework",
            "page" : "Edit Coursework",
            "error" : "Could not access server. Contact the devs for help!",
            "courseworks" : []
        }); 
    });
});

viewsRouter.get("/edit-coursework-success", function(request, response) {
    response.render("edit-coursework-success", {
        "Title" : "Successfully Edited Coursework",
        "page" : "homepage"
    });
})

viewsRouter.get("/remove-coursework", ensureLoggedIn('/login'), function(request, response) {
    var session_id = request.session.passport.user;
    var loggedInStudent = {
        "studentNo" : session_id
    };
    dao.get_model_items(db_accessor.models.Student, loggedInStudent).then(students => {
        courseworks = [];
        for (var i = 0; i < students.length; i++) {
            console.log(students[i].courseworks);
            courseworks = students[i].courseworks;
        }
        if(request.query.error === 'true') {
            response.render("remove-coursework", {
                "Title" : "Remove Coursework",
                "page" : "Remove Coursework",
                "error" : "Failed to remove coursework from student. Contact the devs for help!",
                "courseworks" : courseworks
            });
            return;
        }  
        response.render("remove-coursework", {
            "Title" : "Remove Coursework",
            "page" : "Remove Coursework",
            "courseworks" : courseworks
        });
    }).catch(error => {
        console.log(error);
        console.log("could not retrieve student, see error above");
        response.render("remove-coursework", {
            "Title" : "Remove Coursework",
            "page" : "Remove Coursework",
            "error" : "Could not access server. Contact the devs for help!",
            "courseworks" : []
        }); 
    });;
});

viewsRouter.get("/remove-coursework-success", function(request, response) {
    response.render("remove-coursework-success", {
        "location" : "/",
        "page" : "homepage"
    });
})

// 404 catch-all handler (bad request)
viewsRouter.use(function (req, res, next) {
    res.type('text/plain');
    res.status(404);
    res.send(`404, Content not found.
    \nAlso Hi from Ohe, Alexander and James`);
});

// 500 error handler (server/db error)
viewsRouter.use(function (err, req, res, next) {
    console.error(err.stack); 
    res.status(500); 
    res.send('500 Internal server error');
})



module.exports = viewsRouter