// Import Express
let express = require('express');

// Import models
let Task = require('../models/task');
const { LEGAL_TCP_SOCKET_OPTIONS } = require('mongodb');

// Create a new router
let router = new express.Router();

// Task Routes
/*
POST /tasks
GET /tasks
GET /tasks/:id
PATCH /tasks/:id
DELETE /tasks/:id
*/

// Create a new task
router.post('/tasks', async (req, res) => {
    
    // Create a New Task from JSON body on Postman
    let task = new Task(req.body);

    try {
        
        await task.save();

        res.status(201).send(task);
    }
    catch (error) {
        res.staus(400).send(error.message);
    }
})

// Retrieve all tasks
router.get('/tasks', async (req, res) => {
    try {
        let tasks = await Task.find({});
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Retrieve a task by ID
router.get('/tasks/:id', async (req, res) => {
    let _id = req.params.id;
    try {
        let task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Update a task by ID
router.patch('/tasks/:id', async (req, res) => {
   
    // Extract the fields that user is trying to update
    const updates = Object.keys(req.body);

    // Define fields that are allowed to update
    const allowedUpdates = ['title', 'completed'];

    // Check if every fields in a request is allowed
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));

    // If User tries to update, but failed
    if(!isValidOperation) {
        return res.status(400).send("Invalid updates! You cannot update _id or _v"); 
    }
    try{

        // Find User by ID and update the document
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,           // What we are updating
            {
                returnDocument: 'after',       // Return Update document
                runValidators: true         //Apply model validations
            }
        )
        // If user was not found
        if(!task){
            return res.status(404).send('Task not found');
        }
        // Send the updated user
        res.send(task);

    }
    catch(error){
        res.status(400).send(error.message);
    }

})

// Delete A Task by ID
router.delete('/tasks/:id', async (req, res) => {

    try{
        // Find the task by ID and delete the user
        const task = await Task.findByIdAndDelete(req.params.id);

        // If the task ID is not found
        if(!Task){
            return res.status(404).send('Task not found');
        }

        // Send deleted user
        res.send(task);
    }
    catch(error){
        res.status(500).send(error.message);
    }
})

module.exports = router;