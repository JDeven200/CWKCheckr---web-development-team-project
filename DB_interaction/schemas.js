const mongoose = require("mongoose");

// Define the schemas used to persist different application document types within the database.

var student_schema = new mongoose.Schema({
    studentNo: Number,
    name: String,
    username: String,
    passwordHash: String,
    courseworks: [{
                    courseworkId: Number, 
                    courseworkName: String, 
                    courseworkDescription: String, 
                    courseId: Number, 
                    courseName: String, 
                    dueDate: Date, 
                    completionDate: Date, 
                    milestones : [
                        {
                            milestoneTitle : String,
                            complete : Boolean
                        }
                    ]
                }],
    courses: [{
                courseId: Number, courseName: String
            }]
});

var course_schema = new mongoose.Schema({
    courseId: Number,
    courseName: String,
    courseTeacher: String,
    courseDescription: String
});

var coursework_schema = new mongoose.Schema({
    courseworkId: Number,
    courseId: Number,
    courseworkName: String,
    courseworkDescription: String,
    dueDate: Date
});

module.exports = {
    student_schema : student_schema, 
    course_schema : course_schema, 
    coursework_schema : coursework_schema
}