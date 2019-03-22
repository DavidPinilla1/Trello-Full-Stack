const express = require('express');
const app = express();
const fs = require('fs');
const port = Number(process.argv[2]) || 3000;
const mongoose = require('mongoose');
const morgan = require('morgan')
const Task = require('./models/task');
app.use(express.json());
app.use(morgan('tiny'))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});
//----------------------------------------Database Conection--------------------------------------//
mongoose.connect('mongodb+srv://Metroid_300:7hvPxpKlucU8hvLN@fullstack-nxov4.mongodb.net/Tasks?retryWrites=true', {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to database')).catch((e) => console.log('Connection to MongoDB failed!:( \n' + e))
//-----------------------------------------------------------------------------------------------//
app.get('/tasks', (req, res) => {
    Task.find().then(tasks => res.status(200).json(tasks));
});

app.post('/tasks', (req, res) => {
    const task = new Task({
        title: req.body.title,
        list: 'porductBackLog'
    })
    task.save((err, task) => {
        if (err) res.status(500).json(err)
        res.status(201).json({
            success: true,
            task,
            message: "Task added successfully"
        })
    })
});
//
app.delete('/tasks/:id', (req, res) => {
    try {
        Task.findByIdAndDelete(req.params.id, (err, task) => {
            if (err) res.status(500).send(err)
            res.status(200).json({
                message: 'item successfully deleted.',
                task
            })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Something went wrong. My apologies.'
        })
    }
});
app.put('/tasks/:id', (req, res) => {
    try {
        Task.findByIdAndUpdate(req.params.id, req.body, (err, task) => {
            if (err) console.error(err)
            res.status(200).json({
                message: 'item uccessfully updated.',
                task
            })
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Something went wrong. My apologies.'
        })
    }
})
app.listen(port, () => console.log('Servidor levantado en ' + port));