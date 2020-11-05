//******************* For end point /api/edit-coursework
const editCourseworkRouter = require('express').Router()
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();

//TODO: Add functionality which updates an existing coursework object in the Student collection

editCourseworkRouter.post('/', function (request, response) {
  //find coursework in student Obj
  //make everything same except what is being changed
  //update the coursework
  //if successful, redirect them to a page where it shows that coursework updated or home
  const body = request.body
  const courseworkId = body.courseworkSelect
  const studentNo = request.session.passport.user


  if (!courseworkId || !studentNo) {//check request has courseworkId and studentNo (or sessionId)
    console.log(("----------------------courseworkId " + body.courseworkId + "studentNo " + studentNo+ "coursework option " + body.courseworkSelect))
    response.status(405)
    response.redirect('/edit-coursework?error='+true+'')
    return
  }

  function isUndefined (value) {
    var undefined = void(0);
    return value === undefined;
  }
  //since only the courseworks in the Students Obj is updated, I have to find
  //that student and make the update there. As opposed to doing it in the global 
  //coursework object. The global one upon initialising doesnt get updated 
  //anymore. 
  dao.get_model_items(db_accessor.models.Student, { "studentNo": studentNo })
    .then(students => {
      var cwk = "";
      for(var i = 0; i < students[0].courseworks.length; i++) {
        if(courseworkId == students[0].courseworks[i].courseworkId) {
          cwk = students[0].courseworks[i];
        }
      }
      console.log("the found cwk----------------------------",cwk)
      var courseworkName = cwk.courseworkName;
      console.log(cwk.courseworkName);
      isUndefined(courseworkName) ? courseworkName="": courseworkName;
      var courseworkDescription = cwk.courseworkDescription;
      isUndefined(courseworkDescription) ? courseworkDescription="": courseworkDescription;
      var dueDate = cwk.dueDate;
      isUndefined(dueDate) ? dueDate="": dueDate;
      var milestones = cwk.milestones;
      isUndefined(milestones) ? milestones=[]: milestones;
      var completionDate = cwk.completionDate;
      isUndefined(completionDate) ? completionDate="": completionDate;
      console.log("courseworkName " + courseworkName + " courseworkDescription " + courseworkDescription + 
      " dueDate " +dueDate+" milestones "+milestones+" completionDate "+completionDate)

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

      let update = {
        //if the request body has the new value use it, if not then use the original
        courseworkName : !isUndefined(body.courseworkName) ? body.courseworkName : courseworkName,
        courseworkDescription: !isUndefined(body.courseworkDescription) ? body.courseworkDescription : courseworkDescription,
        dueDate: !isUndefined(body.dueDate) ? body.dueDate : dueDate,
        milestones: !isUndefined(milestonesList) ? milestonesList : milestones,
        completionDate: !isUndefined(body.completionDate) ? body.completionDate : completionDate,
        //title, description, completionDate and milestones can be changed. Due date cannot be changed.
      }
      console.log('------------------------------the new coursework', update)
      //edit_coursework_in_student(studentNo, courseworkId, courseworkName, completionDate, milestones, dueDate)
      dao.edit_coursework_in_student(studentNo, courseworkId, update.courseworkName, update.courseworkDescription, 
        update.completionDate, update.milestones, update.dueDate)
    })

  //TODO: Redirect to page that shows the updated cwk or all cwks
  response.status(202)
  console.log(`successfully update coursework ${courseworkId} within student ${studentNo} courseworks collection.`)
  response.redirect("/edit-coursework-success")
});

module.exports = editCourseworkRouter;