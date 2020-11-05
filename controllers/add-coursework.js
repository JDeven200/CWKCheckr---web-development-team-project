//**************for the endpoints /api/add-coursework
const addCourseworkRouter = require('express').Router()
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();

//TODO: Add functionality which adds a new coursework object to the Student collection

addCourseworkRouter.post('/', function(request, response) {// add coursework and add it to a course and attach it to a student
  const body = request.body

  const studentNo = request.session.passport.user

  //initialise the parameters necessary to create a coursework
  const courseId= body.courseSelect,  courseworkId= body.courseworkSelect

  //check coursework has name, course and courseworkDescription //add the coursework // if successful, redirect them to a page where it shows that coursework added or home
  if (!courseworkId ||!courseId ||!studentNo) {
    console.log(("----------------------studentNo " + studentNo + "courseworkId " +courseworkId + "courseId " +courseId))
    response.status(405)
    response.redirect('/add-coursework?error='+true+'')
    return
  }

  function isUndefined (value) {
    var undefined = void(0);
    return value === undefined;
  }

  dao.get_model_items(db_accessor.models.Student, {"studentNo" : studentNo}).then(students => {
    for(var i = 0; i < students[0].courseworks.length; i++) {
      if(courseworkId == students[0].courseworks[i].courseworkId && 
        courseId == students[0].courseworks[i].courseId) {
          console.log("worked");
          throw "Duplicate coursework"
      }
    }

    //Since the number of milestones will be unknown, this value has to be retrieved and the values of each milestone must be found
    var milestonesList = [];
    var bodyLength = Object.keys(body).length; //number of keys within the body object
    console.log(bodyLength);
    for(var i = 0; i < bodyLength; i++) {
      var milestoneNo = "milestone"+i; //current milestone number
      var milestoneCheck = "complete"+i; //current milestone complete number

      //executes if the current milestone number is a key within the body object
      if(milestoneNo in body && milestoneNo in body) {
        var value = body[milestoneNo]; //milestone title value for current body key
        var completeVal = body[milestoneCheck]; //milestone complete value for current body key
        var milestoneObj = {};

        //executes if the milestone is marked as completed
        if(!isUndefined(completeVal)) {
          milestoneObj = {
            milestoneTitle : value,
            complete : true
          }
        } 
        
        //executes if the milestone is marked as incomplete
        else if(isUndefined(completeVal)){  
          milestoneObj = {
            milestoneTitle : value
          }
        }
        milestonesList.push(milestoneObj); //pushes milestone object to milestone list
      }
    }
    console.log(milestonesList)

    //add that the coursework to the student
    console.log(`add_coursework_to_student(${studentNo}, ${courseId}, ${courseworkId}, ${milestonesList})`)
    dao.add_coursework_to_student(studentNo, courseId, courseworkId, milestonesList)
    response.status(201)
    response.redirect('/add-coursework-success')
  }).catch(error => {
    console.log(error);
    response.status(405)
    response.redirect('/add-coursework?dupe='+true+'')
    return;
  })
    
});


module.exports = addCourseworkRouter;