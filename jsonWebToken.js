let jwt = require('jsonwebtoken');

let myFunction = async() => {

    let token = jwt.sign({_id: 'abc123'}, 'abracadabra', {expiresIn: '1 Day'});

    console.log(token);

    let data = jwt.verify(token, 'abracadabra');
    console.log(data);
};

myFunction();