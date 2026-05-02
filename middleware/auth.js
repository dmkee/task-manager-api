let jwt = require('jsonwebtoken');
let User = require('../models/user')

let authenticate = async(req, res, next) => {
   // console.log('Authenication is running');
    try{

        let token = req.header('Authorization').replace('Bearer ','');
        let decoded = jwt.verify(token, 'abracadabra');

        let user = await User.findOne({_id: decoded._id, 'tokens.token': token});

        // If user was not found
        if(!user){
            throw new Error();
        }
        else {

            req.token = token;
            req.user = user;
            next();
        }

    }
    catch(error){
        res.status(401).send({error: 'Please authenicate the user'})
    }
}

module.exports = authenticate;