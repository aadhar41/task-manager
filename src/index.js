const express = require('express')
const mongoose  = require('./db/mongoose');
var moment = require('moment');
const app = express()

const User = require('./models/user');
const Task = require('./models/task')

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const port = process.env.PORT
// const environment = process.env.NODE_ENV;


app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log("Server is up on port " + port);
})
