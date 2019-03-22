const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    id: String,
    title: String,
    content: [{
        subTask: String,
        completed: Boolean
    }],
    color: String,
    list: String
})
module.exports = mongoose.model('task', taskSchema)