let express = require('express');

require("dotenv").config();
require('./db/mongoose');

const path = require('path');

//Import The Routers
const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

let app = express();

/*
// Use app.use to use a middleware function
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
   if(req.method == 'GET'){
        res.send('GET requests are disabled');
   }
   else {
    next();
   }
})

// app.use to display maintenance message
 app.use((req, res, next) => {
     res..status(503).send('Site is currently down for maintenance');
})
*/

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

//Use the Routers
app.use(userRouter);
app.use(taskRouter);

//Home path for starting the localhost server
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public'))
})

// Create a Router Instance
// Use the Router Instance to call our routes

// let router = new express.Router();
// router.get('/test', (req, res) => {
    // res.send('This is from my Router.');
// })

// app.use(router);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})