const removeCourseworkRouter = require('express').Router()
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();

//TODO: Add functionality which removes a coursework object from the Student collection.

removeCourseworkRouter.post('/', function(request, response) {
  //find coursework in student obj
  //delete the coursework
  //if successful, redirect them to a page where it shows that coursework deleted or home or just say it is deleted
  const body = request.body
  const courseworkId= body.courseworkSelect
  //TODO change all body.studentNo to the appopriate thing
  const studentNo = body.studentNo || request.session.passport.user


  //check request has courseworkId and studentNo or sessionId
  if (!courseworkId ||!studentNo) {
  console.log(("----------------------courseworkId " + body.courseworkSelect + "studentNo " +studentNo))
  response.status(405)
  response.redirect('/remove-coursework?error='+true+'')
  return
  }

  dao.delete_coursework_from_student(studentNo,courseworkId)

  response.status(202)
  response.redirect("/remove-coursework-success")
});



module.exports = removeCourseworkRouter;