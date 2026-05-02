let mongoose = require('mongoose');

let bcrypt = require('bcryptjs');
let validator = require('validator');

let jwt = require('jsonwebtoken');

require('dotenv').config();

let userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,

        // Validator for email
        validate(value) {
            // Use validator package to check email format
            if (!validator.isEmail(value)) {
                throw new Error('Invalid Email')
            }
        }
    },
    age: {
        type: Number,
        default: 0,

        // Validation
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number');
            }
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,

        validate(value) {
            // Reject passwords that contains the word "password"
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }

            //Reject passwords that contain a weak numeric pattern
            if (value.includes('1234567')) {
                throw new Error('Password cannot contain "1234567"');
            }
        }
    },
    tokens: [
        {
            token: {
                type:String,
                required:true
            }
        }
    ]
})

// Methods that allows for us to make instance functions
userSchema.methods.generateAuthToken = async function(){

    let user = this; // Grab the current user instance of the user mofrl

    // Use .sign() in order to generate token
    let token = jwt.sign({_id: user.id.toString()}, process.env.JWT_SECRET || 'abracadabra');

    // Update the token login
    user.tokens = user.tokens.concat({token:token});

    //Save the user with the new authication token
    await user.save();

    return token;
}

// Statics allow for us to make model function
userSchema.statics.findByCredentials = async(email, password) => {
    
    // Call find one function - unqiue search for user's email
    let user = await User.findOne({email});

    // If there is no match for a User, throw an error
    if(!user) {
        throw new Error('Unable to login');
    }

    // Verify the password
    let isMatch = await bcrypt.compare(password, user.password);

    // If the password is not a match
    if(!isMatch) {
        throw new Error('Unable to login');
    }

    return user;

}

// Use Middleware to do something to the Schema
    // Use pre() -> to do something before the schema is saved
    // Use post() -> to do somethign after the schema is saved
        // Action - validate, save, remove, one init -> we will use save
        // An inline function that tells what the results will be

userSchema.pre('save', async function() {
    // Use this as a reference to the current document that is beingg saved

    let user = this;

    // console.log('Testing before saving')

    // Hash for passwords
    // Check to see if the password has been changed or hashed already
    if(user.isModified('password')){

        user.password = await bcrypt.hash(user.password, 8);
    }
})

let User = mongoose.model('User', userSchema);

module.exports = User;