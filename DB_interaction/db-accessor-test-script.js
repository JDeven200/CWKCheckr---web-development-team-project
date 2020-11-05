const db_accessor = require('./db-accessor');

dao = new db_accessor.DAO();

//This test should return an empty array named 'students' since 'doesn't exist' is not a real username. 
//The length of this array should be 0 as a result.
// var get_username_find_doc = 
// {
//     "username" : "doesn't exist"
// }
// dao.get_model_items(db_accessor.models.Student, get_username_find_doc).then(students => {
//     console.log(students.length)
// });


 dao.get_model_items(db_accessor.models.Student).then(students => {
    console.log(students)
 });

// dao.get_model_items(db_accessor.models.Student, {"courseworks":{$elemMatch: {"courseworkId": 4}}} ).then(students => {
//   //console.log(students)
//   console.log(students[0].courseworks.find(elem=> toString(elem.courseworkId) === toString(4)))
// });
//

dao.get_model_items(db_accessor.models.Course).then(courses => {
   console.log(courses)
});


//dao.get_model_items(db_accessor.models.Coursework).then(courseworks => {
//    console.log(courseworks)
//});

//add_student(name, username, passwordHash, courseworks, courses)
// dao.add_student(
//     1, 
//     "Bob", 
//     "Bobby", 
//     "1234"
//     );

//add_course(courseId, courseName, courseTeacher, courseDescription) 
/*dao.add_course(
    4,
    "Course Four",
    "teacher Four",
    "description Four"
)*/

//add_coursework(courseworkId, courseId, courseworkName, courseworkDescription, dueDate)
//should fail
// dao.add_coursework(
//     1,
//     2,
//     "Test coursework",
//     "A test coursework",
//     new Date(2020, 07, 04)
// )

// should pass
/*dao.add_coursework(
    2,
    1,
    "Test coursework",
    "A test coursework",
    new Date(2020, 07, 04)
)*/

//add_course_to_student(studentNo, courseId)
// // should fail
// dao.add_course_to_student(1, 2)
// dao.add_course_to_student(2, 1)


// should pass //add_course_to_student(studentNo, courseId)
 dao.add_course_to_student(26, 1)


//add_coursework_to_student(studentNo, courseId, courseworkId)
// should fail
//dao.add_coursework_to_student(2, 1, 1)
//dao.add_coursework_to_student(1, 2, 1)
//dao.add_coursework_to_student(1, 1, 2)

// should pass //add_coursework_to_student(studentNo, courseId, courseworkId)
//dao.add_coursework_to_student(22,2,2)


//edit_coursework_in_student(studentNo, courseworkId, courseworkName, completionDate, milestones, dueDate)
// dao.edit_coursework_in_student(1, 1, "Test coursework Uno", new Date(2021,10,30), [{milestoneTitle: "started!", complete: false}], new Date(2021,11,30))

//delete_coursework_from_student(studentNo, courseworkId)
//dao.delete_coursework_from_student(4, 1)
//dao.get_model_items(db_accessor.models.Student,{"courses":{$elemMatch: {"courseId": 1}}} ).then(students => {
    //console.log(students)
//});
