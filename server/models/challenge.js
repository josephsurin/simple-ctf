const mongoose = require('mongoose')

const challengeSchema = new mongoose.Schema({
    id: { type: String, index: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    points: { type: Number, required: true },
    description: { type: String },
    files: [String],
    solves: [{ user: String, time: Date }],
    flag: { type: String, required: true }
})

challengeSchema.virtual('numSolves').get(() => {
    return this.solves.length
})

module.exports = mongoose.model('Challenge', challengeSchema)
