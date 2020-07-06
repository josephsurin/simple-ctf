const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, index: true },
    password: { type: String },
    email: { type: String, unique: true },
    registered: { type: Date, default: Date.now }
})

userSchema.plugin(passportLocalMongoose, {
    usernameLowerCase: true,
    session: false
})

module.exports = mongoose.model('User', userSchema)
