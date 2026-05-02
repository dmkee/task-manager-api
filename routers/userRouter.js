//Import Express
let express = require('express');

// Load our environment variables
require("dotenv").config();

//Import models
let User = require('../models/user');

let authenticate = require('../middleware/auth');

// Create a new router
let router = new express.Router();

// User Routes
/*
POST /users
GET /users
GET /users/:id
PATCH /users/:id
DELETE /users/:id
*/

// Create a new user - Signup Route
router.post('/users', async (req, res) => {
    
    try {
        let user = new User(req.body);
        await user.save();
        let token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('Email already exists');
        }
        res.status(400).send(error.message)
    }
});

// Login route
router.post('/users/login', async(req, res) => {
    try{
        // Try to test User's credentials
        let user = await User.findByCredentials(req.body.email, req.body.password);
        
        // Generate token
        let token = await user.generateAuthToken();
        res.send({user, token});

    }
    catch(error){
        res.status(400).send(error);
    }
})

// Display the user that is logged in
router.get('/users/me', authenticate, async(req, res) =>{
    res.send(req.user);
})

// Logout route
router.post('/users/logout', authenticate, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    }
    catch(error)
    {
        res.status(500).send();
    }
});

// Logout All - clear the array of tokens
router.post('/users/logoutAll', authenticate, async(req, res) => {
    try
    {
        req.user.tokens =[];
        await req.user.save();
        res.send();
    }
    catch(error)
    {
        res.status(500).send();
    }
});

// Retrieve all users
router.get('/users', authenticate, async(req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Retrieve a user by ID
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
})

// Update a User by ID
router.patch('/users/:id', async (req, res) => {
   
    // Extract the fields that user is trying to update
    const updates = Object.keys(req.body);

    // Define fields that are allowed to update
    const allowedUpdates = ['name', 'age', 'email', 'password'];

    // Check if every fields in a request is allowed
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));

    // If User tries to update, but failed
    if(!isValidOperation) {
        return res.status(400).send("Invalid updates! You cannot update _id or _v"); 
    }
    try{

        let user = await User.findById(req.params.id);

        // Use foreach  in order to check for and update the values in the DB
        updates.forEach((update) => {
            user[update] = req.body[update];

        });

        // Call Save
        await user.save();

        /*
        // Find User by ID and update the document
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,           // What we are updating
            {
                new: true,       // Return Update document
                runValidators: true        //Apply model validations
            }
        )
        */
        
        // If user was not found
        if(!user){
            return res.status(404).send('User not found');
        }
        // Send the updated user
        res.send(user);

    }
    catch(error){
        res.status(400).send(error.message);
    }

})

// Delete A User by ID
router.delete('/users/:id', async (req, res) => {

    try{
        // Find the user by ID and delete the user
        const user = await User.findByIdAndDelete(req.params.id);

        // If the user ID is not found
        if(!user){
            return res.status(404).send('User not found');
        }

        // Send deleted user
        res.send(user);
    }
    catch(error){
        res.status(500).send(error.message);
    }
})

module.exports = router;