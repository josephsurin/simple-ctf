const mongoose = require('mongoose')

const submissionsSchema = new mongoose.Schema({
    user: { type: String, required: true },
    chall: { type: String, required: true },
    submission: { type: String, required: true },
    time: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Submission', submissionsSchema)
