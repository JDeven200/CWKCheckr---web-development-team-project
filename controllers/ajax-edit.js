const ajaxEditRouter = require('express').Router()
const db_accessor = require('../DB_interaction/db-accessor')
dao = new db_accessor.DAO();

//This class is only ever requested through ajax callbacks. It is used to retrieve a list of courseworks based on the selected 
//coursework ID.

ajaxEditRouter.get('/', function(request, response) {
    var coursework = request.query.coursework;
    var resultArray = [];
     var get_student_id = 
     {
         "studentNo" : request.session.passport.user
     }
     console.log(coursework);
    dao.get_model_items(db_accessor.models.Student, get_student_id).then(students => {
        //TODO: Implement functionality which adds the retrieved coursework description to the first array index of 'resultArray',
        //      adds coursework milestones to the second index, and coursework completion date to the third index.
        var cwkArray = students[0].courseworks;
        console.log(cwkArray);
        console.log(cwkArray.length);
        for(var i = 0; i < cwkArray.length; i++) {
            console.log(cwkArray[i].courseworkId + " " + coursework)
            if(cwkArray[i].courseworkId == coursework) {
                resultArray.push('<input type="text" class="form-control" id="courseworkName" name="courseworkName" value="'+cwkArray[i].courseworkName+'"/>');
                resultArray.push('<input type="text" class="form-control" id="courseworkDescription" name="courseworkDescription" value="'+cwkArray[i].courseworkDescription+'"/>');
                resultArray.push(cwkArray[i].milestones);
                resultArray.push(cwkArray[i].dueDate);
                cwkArray[i].completionDate == null ? resultArray.push('') : resultArray.push(cwkArray[i].completionDate);
            }
        }


    }).catch(error => {
        console.log(error);
    }).finally(()=> {
        console.log(resultArray);
        response.send(resultArray);
    });
});

module.exports = ajaxEditRouter;