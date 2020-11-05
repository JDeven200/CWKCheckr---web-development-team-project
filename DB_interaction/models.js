const mongoose = require("mongoose");
const schemas = require("./schemas")

// define the models used to store schema conforming data

// Student model define
var model_name = "Student"
var collection_name = "Students"
var Student = mongoose.model(model_name, schemas.student_schema, collection_name)


// Course model define
var model_name = "Course"
var collection_name = "Courses"
var Course = mongoose.model(model_name, schemas.course_schema, collection_name)

// Coursework model define
var model_name = "Coursework"
var collection_name = "Courseworks"
var Coursework = mongoose.model(model_name, schemas.coursework_schema, collection_name)

module.exports = {Student : Student, Course : Course, Coursework : Coursework}