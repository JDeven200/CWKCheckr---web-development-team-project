const mongoose = require("mongoose");
const models = require("./models")
require("dotenv").config()
const bcrypt = require('bcrypt')
const saltrounds = 10;

class DAO {

    constructor(){    
        // Mongo server used to host the applications MongoDB.
        this.db_url = process.env.MONGODB_URI

        // Indicate the number of running db processes, 
        // used to indicate when to start and stop processes.
        // Means we don't initalise the db connection when it's already running,
        // or delete the db connection when a process still needs to finish.
        this.process_queue = []
    }
   

    /* Functional methods - expose the classes concrete functionality */

    add_student(name, username, passwordHash, courseworks, courses) {
        // Add new students to the database
        
        var add_student_run_indicator = "add_student"
        var hash = bcrypt.hashSync(passwordHash, saltrounds);
        this.process_queue.push(add_student_run_indicator)
        this._init_db();

        // Returns a promise object containing the outcome of the whole 'add student' operation
        // This will be used by the controller to determine which page the user should be redirected to.
        return new Promise((resolve, reject) => {
            var outcome = ""; // Initially defines the outcome as a blank String.
            this.get_model_items(models.Student).then(students => {
                var studentNum = students.length + 1
                for(var i = 0; i < students.length; i++) {
                    if(students[i].username === username) {
                        outcome = 0; // Outcome = 0 represents a user already exists under the specified username.
                        resolve(outcome);
                        return outcome; // Outcome returns as well as resolving to stop the rest of the code from running: 
                                        // Don't want duplicate users to be added to the database!
                    }
                }
                var student_to_add = new models.Student
                ({
                    studentNo : studentNum,
                    name : name,
                    username : username,
                    passwordHash : hash,
                    courseworks : courseworks,
                    courses : courses
                });
                student_to_add.save()
                .then(() => 
                {
                    console.log(`student ${student_to_add.studentNo}, ${student_to_add.username} saved to students collection.`);
                    outcome = true;
                    resolve(outcome);
                })
                .catch(err => 
                {
                    console.log(err)
                    console.log(`student ${student_to_add.studentNo} failed to save to students collection, see error above.`);
                    outcome = false;
                    resolve(outcome);
                });
            }).catch(err => {
                console.log(err);
                console.log("Failed to get students, see error above.");
                outcome = false;
                resolve(outcome);
            })
        });
    }

    add_course(courseId, courseName, courseTeacher, courseDescription) {
        // Add new students to the database
        
        this._init_db();

        // Indicate we've started running the get model items process. 
        var add_course_run_indicator = "add_course"

        this.process_queue.push(add_course_run_indicator)

        var course_to_add = new models.Course
        ({
            courseId : courseId,
            courseName : courseName,
            courseTeacher : courseTeacher,
            courseDescription : courseDescription
        });

        course_to_add.save()
        .then(() => 
        {
            console.log(`course ${course_to_add.courseId} saved to courses collection.`);
        })
        .catch(err => 
        {
            console.log(err)
            console.log(`course ${course_to_add.courseId} failed to save to courses collection, see error above.`);
        })
        .then(() => 
        {
            // Always close the database connection, 
            // regardless as to the success or failure of the operation
            
            // Indicate we've stopped running the add course process.
            this.process_queue.shift()
            this._close_db_connection();
        });
    }

    add_coursework(courseworkId, courseId, courseworkName, courseworkDescription, dueDate) {
        // Add new courseworks to the database

        // Indicate we've started running the add coursework process. 
        var add_coursework_run_indicator = "add_coursework"

        this.process_queue.push(add_coursework_run_indicator)

        this._init_db()

        // Yet to complete coursework, so we set completion date
        // to null to indicate this.
        var coursework_to_add = new models.Coursework
        ({
            courseworkId : courseworkId,
            courseId : courseId,
            courseworkName : courseworkName,
            courseworkDescription : courseworkDescription,
            dueDate : dueDate
        });
        
        var get_course_ids_find_doc = 
        {
            "courseId" : {$in : [courseId]}
        };

        var get_course_ids_projection_doc = {_id : 0, courseId : 1}

        this.get_model_items(models.Course, get_course_ids_find_doc, get_course_ids_projection_doc)
        .then(courseIds => {
            if (courseIds.length == 0)
            {
                throw "Attempted to add a coursework not linked to an existing course!";
            }
            else
            {
                models.Coursework.collection.save(coursework_to_add);
                console.log(`coursework ${coursework_to_add.courseId} saved to courseworks collection.`);
            }
        })
        .catch(err => 
        {
            console.log(err)
            console.log(`coursework ${coursework_to_add.courseId} failed to save to courseworks collection, see error above.`);
        })
        .then(() => 
        {
            // Always close the database connection, 
            // regardless as to the success or failure of the operation
            
            // Indicate we've stopped running the add coursework process. 
            this.process_queue.shift()
            this._close_db_connection();
        });
    }
    
    add_course_to_student(studentNo, courseId) {
        // Add a student to a course

        // Indicate we've started running the add add course to student process. 
        var add_coursework_run_indicator = "add_course_to_student"

        this.process_queue.push(add_coursework_run_indicator)

        this._init_db()
        
        var get_course_ids_find_doc = 
        {
            "courseId" : {$in : [courseId]}
        };

        var get_course_ids_projection_doc = {_id : 0, courseId : 1, courseName : 1}

        this.get_model_items(models.Course, get_course_ids_find_doc, get_course_ids_projection_doc)
        .then(courseIds => {
            if (courseIds.length == 0)
            {
                throw "Attempted to link a non-existent course to a student!";
            }
            else
            {
                var courseName = courseIds[0].courseName

                var get_student_no_find_doc = 
                {
                    "studentNo" : {$in : [studentNo]}
                }
                this.get_model_items(models.Student, get_student_no_find_doc)
                .then(students => 
                {
                    if (students.length == 0)
                    {
                        throw "Attempted to link a course to a non-existent student!"
                    }
                    else
                    {
                        var student_no_get_doc = {"studentNo" : studentNo}
                        var student_courses_update_doc = {$push : {"courses" : 
                        {courseId : courseId, courseName: courseName} }};
                        models.Student.collection.findOneAndUpdate(student_no_get_doc, student_courses_update_doc);
                        console.log(`course ${courseId} saved to student ${studentNo} courses collection.`);
                    }
                })
                .catch(err => 
                {
                    // return error to outer promise scope, which will then move onto closing db connection.
                    // Would prefer to rethrow to avoid duplicate code but seems to be causing issues with outer catch.
                    console.log(err);
                    console.log(`course ${courseId} failed to link to student ${studentNo} within students collection, see error above.`);
                    return err
                });
            }
        })
        .catch(err => 
        {
            console.log(err);
            console.log(`course ${courseId} failed to link to student ${studentNo} within students collection, see error above.`);
        })
        .then(() => 
        {
            // Always close the database connection, 
            // regardless as to the success or failure of the operation
            
            // Indicate we've stopped running the add coursework process. 
            this.process_queue.shift();
            this._close_db_connection();
        });
    }

    add_coursework_to_student(studentNo, courseId, courseworkId, milestonesList) {
        // Add a student to a course

        // Indicate we've started running the add add course to student process. 
        var add_coursework_run_indicator = "add_coursework_to_student"

        this.process_queue.push(add_coursework_run_indicator)

        this._init_db()
        
        var get_course_ids_find_doc = 
        {
            "courseId" : {$in : [courseId]}
        };

        var get_course_ids_projection_doc = {_id : 0, courseId : 1}

        // In retrospect, these DB calls should have probably used findOne here, however functionally this works ok.
        // TODO: Refactor if we have time in the end.
        this.get_model_items(models.Course, get_course_ids_find_doc, get_course_ids_projection_doc)
        .then(courseIds => {
            if (courseIds.length == 0)
            {
                throw "Attempted to link a non-existent course coursework to a student!";
            }
            var get_coursework_ids_find_doc = 
            {
                "courseworkId" : {$in : [courseworkId]},
                "courseId" : {$in : [courseId]}
            };
    
            var get_courseworks_projection_doc = {_id : 0, courseworkId : 1, courseworkName : 1, courseworkDescription : 1, dueDate : 1}

            this.get_model_items(models.Coursework, get_coursework_ids_find_doc, get_courseworks_projection_doc)
            .then(courseworks => {
                if (courseworks.length == 0)
                {
                    throw "Attempted to link a non-existent coursework to a student!";
                }
                var courseworkName = courseworks[0].courseworkName
                var courseworkDescription = courseworks[0].courseworkDescription;
                var dueDate = courseworks[0].dueDate
                var get_student_no_find_doc = 
                {
                    "studentNo" : {$in : [studentNo]}
                }
                this.get_model_items(models.Student, get_student_no_find_doc)
                    .then(students => 
                    {
                        if (students.length == 0)
                        {
                            throw "Attempted to link a coursework to a non-existent student!"
                        }
                        else
                        {
                            var student_no_get_doc = {"studentNo" : studentNo}
                            // Student has yet to complete the coursework, so set a null on inital set. 
                            // Indicates the coursework has yet to be completed.
                            var completion_date_inital_set = null
                            var milestones_inital_set = []
                            this.isUndefined(milestonesList) ? milestones_inital_set = [] : milestones_inital_set=milestonesList;
                            console.log(milestones_inital_set);
                            var courseName = "";
                            for (var i = 0; i < students[0].courses.length; i++) {
                                if(courseId == students[0].courses[i].courseId) {
                                    console.log("poo");
                                    courseName = students[0].courses[i].courseName;
                                    break;
                                }
                            }

                            var student_courses_update_doc = {$push : {
                                    "courseworks" : {
                                        courseworkId: courseworkId, 
                                        courseworkName: courseworkName, 
                                        courseworkDescription: courseworkDescription,
                                        courseId: courseId,
                                        courseName: courseName,
                                        completionDate: completion_date_inital_set, 
                                        milestones: milestones_inital_set,
                                        dueDate : dueDate
                                    } 
                                }
                            };
                            for(var j = 0; j < students[0].courseworks.length; j++) {
                                if(courseworkId == students[0].courseworks[j].courseworkId && 
                                    courseId == students[0].courseworks[j].courseId) {
                                        throw "Attempted to add duplicate coursework!"
                                }
                            }
                            models.Student.collection.findOneAndUpdate(student_no_get_doc, student_courses_update_doc);
                            console.log(`coursework ${courseworkId} saved to student ${studentNo} courseworks collection.`);
                        }
                    })
                    .catch(err => 
                    {
                        // return error to outer promise scope, which will then move onto closing db connection.
                        // Would prefer to rethrow to avoid duplicate code but seems to be causing issues with outer catch.
                        console.log(err);
                        console.log(`coursework ${courseworkId} failed to link to student ${studentNo} within students collection, see error above.`);
                        return err
                    });
            })
            .catch(err => 
            {
                 // return error to outer promise scope, which will then move onto closing db connection.
                // Would prefer to rethrow to avoid duplicate code but seems to be causing issues with outer catch.
                console.log(err);
                console.log(`coursework ${courseworkId} failed to link to student ${studentNo} within students collection, see error above.`);
                return err
            });
        })
        .catch(err => 
        {
            console.log(err);
            console.log(`coursework ${courseworkId} failed to link to student ${studentNo} within students collection, see error above.`);
            return err
        })
        .then(() => 
        {
            // Always close the database connection, 
            // regardless as to the success or failure of the operation
            
            // Indicate we've stopped running the add coursework process. 
            this.process_queue.shift();
            this._close_db_connection();
        });
    }

    edit_coursework_in_student(studentNo, courseworkId, courseworkName, courseworkDescription, completionDate, milestones, dueDate){
        // Edit a coursework within a student document

        // Indicate we've started running the edit coursework in student process. 
        var edit_coursework_run_indicator = "edit_student_coursework"

        this.process_queue.push(edit_coursework_run_indicator)

        this._init_db()

        var get_student_no_find_doc = 
        {
            "studentNo" : {$in : [studentNo]}
        }
        this.get_model_items(models.Student, get_student_no_find_doc)
            .then(students => 
            {
                if (students.length == 0)
                {
                    throw "Attempted to update a coursework of a non-existent student!"
                }
                else
                {

                    var student_no_get_doc = {
                        "studentNo" : studentNo
                    }

                    models.Student.collection.findOne(student_no_get_doc).then(student => 
                        {
                            var courseworks = student.courseworks
                            for ( var i=0; i < courseworks.length; i++ ) {
                                if (courseworks[i].courseworkId == courseworkId) {
                                    courseworks[i].courseworkName = courseworkName
                                    courseworks[i].courseworkDescription = courseworkDescription
                                    courseworks[i].completionDate = completionDate
                                    courseworks[i].milestones = milestones
                                    courseworks[i].dueDate = dueDate

                                }
                            }
                            models.Student.collection.save(student)
                            .then(() => 
                                {
                                    console.log(`updated coursework ${courseworkId} within student ${studentNo} courseworks collection.`);
                                })
                            .catch(err =>
                            {
                                // return error to outer promise scope, which will then move onto closing db connection.
                                // Would prefer to rethrow to avoid duplicate code but seems to be causing issues with outer catch.
                                console.log(err);
                                console.log(`coursework ${courseworkId} not found in student ${studentNo} within students collection, see error above.`);
                                return err
                            })
                            .then(() => 
                            {
                                // Always close the database connection, 
                                // regardless as to the success or failure of the operation
                                
                                // Indicate we've stopped running the add coursework process. 
                                this.process_queue.shift();
                                this._close_db_connection();
                            });
                        });
                }
            })
            .catch(err => 
            {
                console.log(err);
                console.log(`coursework ${courseworkId} not found in student ${studentNo} within students collection, see error above.`);
                return err
            });
    }

    delete_coursework_from_student(studentNo, courseworkId){
        // Remove a coursework from a student document

        // Indicate we've started running the remove coursework from student process. 
        var delete_coursework_run_indicator = "delete_student_coursework"

        this.process_queue.push(delete_coursework_run_indicator)

        this._init_db()

        var get_student_no_find_doc = 
        {
            "studentNo" : {$in : [studentNo]}
        }
        this.get_model_items(models.Student, get_student_no_find_doc)
            .then(students => 
            {
                if (students.length == 0)
                {
                    throw "Attempted to delete a coursework of a non-existent student!"
                }
                else
                {

                    var student_no_get_doc = {
                        "studentNo" : studentNo
                    }

                    models.Student.collection.findOne(student_no_get_doc).then(student => 
                        {
                            var courseworks = student.courseworks
                            for ( var i=0; i < courseworks.length; i++ ) {
                                if (courseworks[i].courseworkId == courseworkId) {
                                    courseworks.splice(i,1)
                                }
                            }
                            models.Student.collection.save(student)
                            .then(() => 
                                {
                                    console.log(`deleted coursework ${courseworkId} within student ${studentNo} courseworks collection.`);
                                })
                            .catch(err =>
                            {
                                // return error to outer promise scope, which will then move onto closing db connection.
                                // Would prefer to rethrow to avoid duplicate code but seems to be causing issues with outer catch.
                                console.log(err);
                                console.log(`coursework ${courseworkId} not found in student ${studentNo} within students collection, see error above.`);
                                return err
                            })
                            .then(() => 
                            {
                                // Always close the database connection, 
                                // regardless as to the success or failure of the operation
                                
                                // Indicate we've stopped running the add coursework process. 
                                this.process_queue.shift();
                                this._close_db_connection();
                            });
                        });
                }
            })
            .catch(err => 
            {
                console.log(err);
                console.log(`coursework ${courseworkId} not found in student ${studentNo} within students collection, see error above.`);
                return err
            });
    }

    get_model_items(model, query_doc={}, projection_doc=null) {
        // Gets all the entries for the passed in model.
        // e.g. if the student model is passed in gets the student entries.
        
        // query_doc == mongo query used to find objects containing specific field values.
        // {} == don't apply a query.

        // projection_doc == mongo query used to find specific fields of model
        // db entries found. Null == find every item with every field.
        
        // Indicate we've started running the get model items process. 
        var get_model_items_run_indicator = "get_model_items";

        this.process_queue.push(get_model_items_run_indicator);
        this._init_db();

        return new Promise((resolve, reject) => 
        {
            model.find(query_doc, projection_doc)
            .then(function(entries) 
            {
                resolve(entries);
            })
            .catch(function(err) 
            {
                console.log(err);
                console.log(`Failed to list model entries, see error above.`);
                reject(null);
            })
            .then(() => 
            {
                // Always close the database connection, 
                // regardless as to the success or failure of the operation
                
                // Indicate we've stopped running the get model items process. 
                this.process_queue.shift()
                this._close_db_connection()
            });
        });
    }

    /* Utility methods - Methods to be used privately within the class, denoted by _ */

    _init_db(){
        // Initalise the connection to the application mongoDB database
        // Check we're on the first init db connection call, otherwise don't open a new connection.
        if (this.process_queue.length > 1)
        {
            return
        }
        mongoose.connect(this.db_url, {useNewUrlParser: true, useUnifiedTopology: true})
        .then(() => 
        {
            // Database connection success
            console.log("Application database connection success!");
        })
        .catch((err) => 
        {
            // Database connection failure
            console.log(console.log(err));
            console.log("Application database connection failure! See error details above.");
        });
    }

    _close_db_connection() {
        // Close the connection to the applications MongoDB database.

        // Check we're on the last close db connection call, otherwise don't close the connection.
        if (this.process_queue.length > 0)
        {
            return
        }
        // Close the mongo db connection
        mongoose.connection.close()
        .then(() => 
        {
            // Disconnect success
            console.log("Application database disconnect success!");
        })
        .catch((err) => 
        {
            // Disconnect failure
            console.log(console.log(err));
            console.log("Application database disconnect failure! See error details above.");
        });
    }

    isUndefined (value) {
        var undefined = void(0);
        return value === undefined;
      }
     
}

// Export data models from the DAO so app data interaction 
// can be managed within a single centralised class.
module.exports = {
    DAO : DAO, 
    models : models
}