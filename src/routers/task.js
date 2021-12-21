const express = require('express')
const router = new express.Router();
const Task = require("../models/task");
const auth = require('../middlewares/auth');
var moment = require('moment');

router.post("/tasks", auth, async (req, res) => {
    // return res.send(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id,
        // createdAt: moment().format('MMMM Do YYYY, h:mm:ss a')
    });

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

// GET /tasks?
// skip, limit
// GET /tasks?limit=10&skip=0
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id })
        await req.user.populate({
            path: 'tasks',
            match,
            options : {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate(); 
        res.status(200).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(error)
    }
})

router.get("/task/:id", auth,  async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            res.status(404).send("No task found.")
        } else {
            res.status(200).send(task)
        }
    } catch (e) {
        res.status(500).send(e.message)
    }

})

router.patch("/task/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ["description","completed"];
    const isValidOperation = updates.every((update) => allowUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates." })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        // const task = await Task.findById(req.params.id);
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!task) {
            return res.status(404).send("No task with that ID Found.")
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();

        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})


router.delete("/task/:id", auth, async (req, res) => {
    try {
        const task =   await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send("No task found.")
        }

        res.status(200).send(task)
    } catch (e) {
         res.status(500).send(e)
    }
})


module.exports = router