const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    passwordHash: {
        type: String,
        required: true,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /.+\@.+\..+/,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthday: {
        type: Date,
        required: true
    },
    biography: {
        type: String,
        default: ''
    },
    favoriteNumber: {
        type: Number,
        required: true
    },
    profilePicture: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});
const User = mongoose.model('User', userSchema);
module.exports = User;