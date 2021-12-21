const mongoose = require('mongoose');
var validator = require('validator');
var moment = require('moment');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Task = require('../models/task');

const time = moment().format('MMMM Do YYYY, h:mm:ss a');

const userSchema = new mongoose.Schema(
    { 
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email is not valid.")    
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
            validate(value) {
                if (value.toLowerCase().includes("password")) {
                    throw new Error("Password can not contain `password`")
                }
            }
        },
        age: {
            type: Number,
            required: true,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("Age must be a positive number.");
                }
            }
        },
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer
        }
    }, {
        timestamps: true
})


userSchema.virtual('tasks', {
    ref: 'Task',
    localField: "_id",
    foreignField: "owner"
})

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    return userObject;
}

userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({  _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7 days' });
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token;
}

//  
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error("Unable to login.")
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Unable to login")
    }

    return user;
}

// Hash the plain text password before saving.
userSchema.pre("save", async  function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)        
    }
   
    next()
})

// Deletes user tasks when user is removed
userSchema.pre("remove", async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id })
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User
