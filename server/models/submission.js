const mongoose = require('mongoose')

const submissionsSchema = new mongoose.Schema({
    user: { type: String, required: true },
    chall: { type: String, required: true },
    submission: { type: String, required: true }
})

module.exports = mongoose.model('Submission', submissionsSchema)
