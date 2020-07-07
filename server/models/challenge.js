const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String },
    files: [String],
    solves: { type: Number, default: 0 },
    flag: { type: String, required: true }
})

module.exports = mongoose.model('Challenge', challengeSchema)
