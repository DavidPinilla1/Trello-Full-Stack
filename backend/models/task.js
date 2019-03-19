const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    id: String,
    title: String,
    content: [{
        subTask: String,
        completed: Boolean
    }],
    color: String,
    status: String,
    completed: Boolean
})
module.exports = mongoose.model('task', taskSchema)