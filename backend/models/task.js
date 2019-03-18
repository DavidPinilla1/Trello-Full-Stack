const mongoose=require('mongoose');

const taskSchema=mongoose.Schema({
    id:String,
    title:{
        type:String,
    },
    content:[{ body: String, date: Date }],
    color:{
        type:String,
    },
    completed:{
        type:Boolean,
    }
})
module.exports=mongoose.model('task',taskSchema)