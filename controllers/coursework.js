//**************for the endpoints /api/cwk


const courseworkRouter = require('express').Router();
const db_accessor = require('../DB_interaction/db-accessor');
const dao = new db_accessor.DAO

const createCourseWorkId = () => {
  //find the id of the last coursework and add 1
  let id = dao.get_model_items(db_accessor.models.Coursework).then(
    cwk => {
      let lastOne = cwk.slice(-1)[0]
      console.log('last coursework number -----------------', lastOne.courseworkId)
      //console.log(lastOne.courseworkId + 1)
      return lastOne.courseworkId + 1
    }
  )
  return id
}

courseworkRouter.post('/add', (request, response) => {// add coursework and ad it to a course and attach it to a student
  const body = request.body
  //TODO change all body.studentNo to the appopriate thing
  const studentNo = body.studentNo || request.session.passport.user

  //initialise the parameters necessary to create a coursework
  const courseId= body.courseId, courseworkName= body.courseworkName,
   courseworkDescription= body.courseworkDescription, dueDate = body.dueDate
   let courseworkId = null

  //check coursework has name, course and courseworkDescription //add the coursework // if successful, redirect them to a page where it shows that coursework added or home
  if (!body.courseworkName || !courseworkDescription || !courseId ||!studentNo) {
    console.log(("----------------------courseworkName " + body.courseworkName + "courseworkDescription " +courseworkDescription + "courseId " +courseId))
    response.status(405)
    response.send("Name, description and due date are required.")
    return
  }
  
  //generate a courseworkId for the coursework and create the coursework
  createCourseWorkId()
  .then(cwkId => {
    courseworkId = cwkId
    dao.add_coursework(cwkId, courseId, courseworkName, courseworkDescription, dueDate)
  })
  .catch(err => {
    console.log(err)
    response.status(405)
    response.send("------------Failure occured in add coursework to db")
  })
  .then(() => {
    //add that the coursework to the student who made it
    //add_coursework_to_student(studentNo, courseId, courseworkId) 
     
    console.log(`add_coursework_to_student(${studentNo}, ${courseId}, ${courseworkId})`)
    dao.add_coursework_to_student(studentNo, courseId, courseworkId)
 })
 .catch(err => {
    console.log(err)
    response.status(405)
    response.send("------------Failure occured in ----adding the coursework to the student")
  })
 
  response.status(201)
  response.redirect('/')
});


courseworkRouter.post('/update', (request, response) => {
  //find coursework
  //make everything same except what is being changed
  //update the coursework
  //if successful, redirect them to a page where it shows that coursework updated or home
  const body = request.body
  const courseworkId= body.courseworkId
  //TODO change all body.studentNo to the appopriate thing
  const studentNo = body.studentNo || request.session.passport.user

   //check request has courseworkId and studentNo (or sessionId)

   if (!courseworkId ||!studentNo) {
    console.log(("----------------------courseworkId " + body.courseworkId + "studentNo " +studentNo))
    response.status(405)
    response.send("courseworkId or sessionId missing.")
    return
  }

  //since only the courseworks in the Students Obj is updted, I have to find
  //that student and make the update there. As opposed to doing it in the global 
  //coursework object. The global one upon initialising doesnt get updated 
  //anymore. 
  dao.get_model_items(db_accessor.models.Student, {"courseworks":{$elemMatch: {"courseworkId": courseworkId}}} )
  .then(students =>{
    let cwk = students[0].courseworks.find(elem=> toString(elem.courseworkName) === toString(courseworkId))
    console.log("the found cwk----------------------------",cwk)
    
    let update = {
      //if the request body has the new value use it, if not then use the original
      courseworkName: body.courseworkName ? body.courseworkName : cwk.courseworkName,
      courseworkDescription: body.courseworkDescription ? body.courseworkDescription : cwk.courseworkDescription,
      dueDate :  body.dueDate ? body.dueDate : cwk.dueDate,
      //we add new milestones to existing milestones if the request has them or keep the originals
      milestones: body.milestones ? cwk.milestones.concat(body.milestones) : cwk.milestones,
      completionDate: body.completionDate ? body.completionDate : cwk.completionDate,
      //only completionDate, milestones, dueDate can be changed 
    }
    console.log('------------------------------new coursework', update)
    //dao.edit_coursework_in_student(studentNo, courseworkId, update.courseworkName, update.completionDate, update.milestones, update.dueDate)
  })

  //TODO: Redirect to page that shows the updated cwk or all cwks
  response.status(202)
});

courseworkRouter.delete('/remove', (request, response) => {
  //find coursework in student obj
  //delete the coursework
  //if successful, redirect them to a page where it shows that coursework deleted or home or just say it is deleted
  const body = request.body
  const courseworkId= body.courseworkId
  //TODO change all body.studentNo to the appopriate thing
  const studentNo = body.studentNo || request.session.passport.user


  //check request has courseworkId and studentNo or sessionId
  if (!courseworkId ||!studentNo) {
  console.log(("----------------------courseworkId " + body.courseworkId + "studentNo " +studentNo))
  response.status(405)
  response.send("courseworkId or sessionId missing.")
  return
  }

  dao.delete_coursework_from_student(studentNo,courseworkId)

  response.status(202)
  response.send(
    `<html>
    <body>
      <h1>coursework deleted.</h1> 
    </body>
  </html>`)
  //delete_coursework_from_student(studentNo, courseworkId)
});


courseworkRouter.get('/', (request, response) => {
  dao.get_model_items(db_accessor.models.Coursework).then(
    cwk => {
      //console.log('last coursework number -----------------',cwk.slice(-1)[0].courseworkId)
      //console.log(cwk.slice(-1)[0].courseworkId + 1)
      response.send(cwk)
    }
  )
});

module.exports = courseworkRouter
