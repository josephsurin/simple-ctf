const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String },
    maxAttempts: { type: Number, default: 0 },
    files: [String],
    solves: { _id: false, type: [{ user: String, time: Date }], default: [] },
    flag: { type: String, required: true }
})

module.exports = mongoose.model('Challenge', challengeSchema)
