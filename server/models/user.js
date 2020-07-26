const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, index: true },
    password: { type: String },
    email: { type: String, unique: true },
    memberEmails: { _id: false, type: [{ email: String, time: Date }], default: [] },
    registered: { type: Date, default: Date.now },
    solves: { _id: false, type: [{ chall: String, time: Date  }], default: [] },
    eligible: { type: Boolean, default: false },
    submissions: { _id: false, type: [{ chall: String, submission: String, time: Date }], default: [] },
    visits: { _id: false, type: [{ ip: String, time: Date }], default: []},
    admin: { type: Boolean, default: false }
})

userSchema.plugin(passportLocalMongoose, {
    usernameLowerCase: true,
    session: false
})

module.exports = mongoose.model('User', userSchema)
