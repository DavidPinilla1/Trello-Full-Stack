const express = require('express');
const app = express();
const port = Number(process.argv[2]) || 3000;
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const config = require('./config/config')
const Task = require('./models/task');
const User = require('./models/user');
app.use(express.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});
//----------------------------------------Database Conection--------------------------------------//
mongoose.connect(config.DB_CONECTION, {
        useNewUrlParser: true
    })
    .then(() => console.log('Connected to database')).catch((e) => console.log('Connection to MongoDB failed!:( \n' + e))
//-----------------------------------------------------------------------------------------------//

//---------------------TASKS ENDPOINTS-----------------------//
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
            message: 'Something went wrong. My apologies.',
            err
        })
    }
})
//-----------------USERS ENDPOINTS-----------------------//

app.post('/users/register', (req, res) => {
    const user = new User(req.body);

    user.save((err, user) => {
        console.log(err);
        if (err) return res.json({
            success: false,
            err
        });
        res.status(200).json({
            success: true,
            user
        });
    });
});

app.post('/users/login', (req, res) => {
    User.findOne({
        email: req.body.email
    }, (err, user) => {
        if (!user)
            return res.json({
                isAuth: false,
                message: `Auth failed, email: ${req.body.email} not found `
            });
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({
                    isAuth: false,
                    message: 'Wrong password'
                });
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('auth', user.token).json({
                    isAuth: true,
                    id: user._id,
                    email: user.email
                });
            });
        });
    });
});
app.listen(port, () => console.log('Servidor levantado en ' + port));