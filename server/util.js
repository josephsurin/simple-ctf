const path = require('path')
const fs = require('fs').promises
const { timingSafeEqual } = require('crypto')
const { existsSync } = require('fs')
const yaml = require('js-yaml')
const passport = require('passport')
const User = require('./models/user')
const Challenge = require('./models/challenge')
const filesDir = path.join(__dirname, './data/files/')

const ensureAuthenticated = passport.authenticate('jwt', { session: false })

const ensureAdmin = (req, res, next) => {
    if(req.user.admin === true) {
        next(null, req.user)
    } else {
        res.status(401).end('Unauthorized')
    }
}

const saveChall = (challPath, category) => {
    return new Promise(async (res, rej) => {
        try {
            const rawChallData = await fs.readFile(path.join(challPath, 'challenge.yml'))
            const parsedData = yaml.safeLoad(rawChallData)
            const challData = Object.assign(parsedData, { category, solves: [] })
            // save files to public files static directory
            if(challData.files.length > 0) {
                if(!existsSync(filesDir)) await fs.mkdir(path.join(filesDir))
                if(!existsSync(path.join(filesDir, challData.id))) await fs.mkdir(path.join(filesDir, challData.id))
                await Promise.all(challData.files.map(file => fs.rename(path.join(challPath, file), path.join(filesDir, challData.id, file))))
            }
            // update the current document if exists, or create new one
            await Challenge.findOneAndUpdate({ id: challData.id }, challData, { upsert: true, useFindAndModify: false })
            return res(challData)
        } catch(e) {
            console.log('saveChall err', e)
            return rej(e)
        }
    })
}

const saveChallData = (challDataDir) => {
    // challs are grouped by category in directories
    // each category directory has challenge directories
    // each challenge directory contains a challenge.yml file
    return new Promise(async (res, rej) => {
        const categories = await fs.readdir(challDataDir)
        Promise.all(categories.map(category => {
            return new Promise(async (res, rej) => {
                const challs = await fs.readdir(path.join(challDataDir, category))
                Promise.all(challs.map(challDir => saveChall(path.join(challDataDir, category, challDir), category)))
                    .then(res)
                    .catch(rej)
            })
        }))
            .then(res)
            .catch(rej)
    })
}

const submitFlag = (user, challid, submission) => {
    return new Promise(async (res, rej) => {
        try {
            // check that the flag is correct
            const challenge = await Challenge.findOne({ id: challid })
            const submissionBuf = Buffer.from(submission)
            const flagBuf = Buffer.from(challenge.flag)
            if(submissionBuf.length == flagBuf.length && timingSafeEqual(submissionBuf, flagBuf)) {
                const time = new Date()

                // update the user's solves
                const numchanged = await User.findOneAndUpdate(
                    { username: user.username, 'solves.chall': { $ne: challid } },
                    { $push: { solves: { chall: challid, time } } },
                    { useFindAndModify: false })

                // $ne: challid fails if user has already solved
                if(numchanged == null) {
                    return res({ msg: 'already solved'})
                }

                // update the chall's solves
                challenge.solves.push({ user: user.username, time })
                await challenge.save()

                return res({ msg: 'correct' })
            }

            return res({ msg: 'incorrect' })
        } catch(e) {
            rej(e)
        }
    })
}

const hasSolved = (user, challid) => {
    return user.solves.findIndex(solve => solve.chall == challid) >= 0
}

module.exports = { ensureAuthenticated, ensureAdmin, saveChallData, submitFlag, hasSolved }
