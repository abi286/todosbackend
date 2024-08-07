const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
    name: {type:String, require: true },
    email: {type:String, require: true },
    password: {type:String, require: true } 
})

const StudentModel = mongoose.model("student",StudentSchema)
module.exports = StudentModel