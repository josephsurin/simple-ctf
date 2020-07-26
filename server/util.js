const path = require('path')
const fs = require('fs').promises
const { timingSafeEqual } = require('crypto')
const { existsSync } = require('fs')
const yaml = require('js-yaml')
const passport = require('passport')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 5, useClones: false })
const { maxTeamSize, startTime, endTime } = require('./config')

const User = require('./models/user')
const Challenge = require('./models/challenge')
// const Submission = require('./models/submission')
const filesDir = path.join(__dirname, './data/files/')

const ensureAuthenticated = passport.authenticate('jwt', { session: false })

const disallowBefore = (req, res, next) => {
    if(req.user.admin === true) return next(null, req.user)
    const now = Date.now()
    if(now < startTime) {
        res.status(401).json({ err: 'Game has not started yet.' })
    } else {
        next()
    }
}

const disallowAfter = (req, res, next) => {
    if(req.user.admin === true) return next(null, req.user)
    const now = Date.now()
    if(now > endTime) {
        res.status(401).json({ err: 'The game has ended.' })
    } else {
        next()
    }
}

const ensureAdmin = (req, res, next) => {
    if(req.user.admin === true) {
        next(null, req.user)
    } else {
        res.status(401).end('Unauthorized')
    }
}

const createDefaultAdminUser = () => {
    return new Promise(async (res, rej) => {
        var admin = await User.findOne({ username: 'admin', admin: true })
        if(admin) return res('admin user already exists')
        admin = new User({ username: 'admin', email: 'admin', admin: true })
        User.register(admin, 'admin', (err, user) => {
            if(err) return rej('admin account already exists')
            else return res('Default admin user created with creds admin:admin, don\'t forget to change this at /api/changepassword')
        })
    }) 
}

const saveChall = (challPath, category, sortIndexMap) => {
    return new Promise(async (res, rej) => {
        try {
            const rawChallData = await fs.readFile(path.join(challPath, 'challenge.yml'))
            const parsedData = yaml.safeLoad(rawChallData)
            const challData = Object.assign(parsedData, { category, sortIndex: sortIndexMap[parsedData.id] || 0 })
            // save files to public files static directory
            if(challData.files.length > 0) {
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
        // get meta.yml file from challDataDir root
        const metaFile = await fs.readFile(path.join(challDataDir, '/meta.yml'))
        const { sortIndexMap } = yaml.safeLoad(metaFile)

        var categories = await fs.readdir(challDataDir)
        categories = categories.filter(c => c != 'meta.yml')
        Promise.all(categories.map(category => {
            return new Promise(async (res, rej) => {
                const challs = await fs.readdir(path.join(challDataDir, category))
                Promise.all(challs.map(challDir => saveChall(path.join(challDataDir, category, challDir), category, sortIndexMap)))
                    .then(res)
                    .catch(rej)
            })
        }))
            .then(res)
            .catch(rej)
    })
}

const getChallenges = async () => {
    var rawChalls = cache.get('challenges')
    if(rawChalls != undefined) return rawChalls
    rawChalls = await Challenge.find({}, { _id: 0, flag: 0 })
    cache.set('challenges', rawChalls)
    return rawChalls
}

const getNumAttempts = (user, challid) => {
    return user.submissions.filter(c => c.chall == challid).length
}

const submitFlag = (user, challid, submission) => {
    return new Promise(async (res, rej) => {
        try {
            const time = new Date()

            const challenge = await Challenge.findOne({ id: challid })
            if(!challenge) return res({ msg: 'invalid challid' })

            // const s = new Submission({ user: user.username, chall: challid, submission, time })
            // s.save()
            //     .then(() => console.log('[SUBMISSION]', user.username, 'submitted', '"' + submission + '"', 'for chall', challid))
            //     .catch(console.log)

            user = await User.findOneAndUpdate(
                { username: user.username },
                { $push: { submissions: { chall: challid, submission, time } } },
                { useFindAndModify: false }
            )
                .catch(console.log)

            const numAttemptsLeft = challenge.maxAttempts > 0 ? challenge.maxAttempts - getNumAttempts(user, challid) - 1 : null
            if(challenge.maxAttempts > 0 && numAttemptsLeft < 0) {
                return res({ msg: 'max attempts', numAttemptsLeft })
            }

            // check that the flag is correct
            const submissionBuf = Buffer.from(submission)
            const flagBuf = Buffer.from(challenge.flag)
            if(submissionBuf.length == flagBuf.length && timingSafeEqual(submissionBuf, flagBuf)) {
                // update the user's solves
                const numchanged = await User.findOneAndUpdate(
                    { username: user.username, 'solves.chall': { $ne: challid } },
                    { $push: { solves: { chall: challid, time } }},
                    { useFindAndModify: false })

                // $ne: challid fails if user has already solved
                if(numchanged == null) {
                    return res({ msg: 'already solved',  numAttemptsLeft })
                }

                // update the chall's solves
                challenge.solves.push({ user: user.username, time })
                await challenge.save()

                return res({ msg: 'correct', numAttemptsLeft })
            }

            return res({ msg: 'incorrect', numAttemptsLeft })
        } catch(e) {
            rej(e)
        }
    })
}

const hasSolved = (user, challid) => {
    return user.solves.findIndex(solve => solve.chall == challid) >= 0
}

const getTotalPoints = (user, challMap) => {
    return user.solves.reduce((a, v) => a + challMap[v.chall].points, 0)
}

const getLeaderboard = () => {
    return new Promise(async (res, rej) => {
            var leaderboard = cache.get('leaderboard')
            if(leaderboard != undefined) return res(leaderboard)
            const challData = await Challenge.find({}, { _id: 0, id: 1, points: 1 })
            const challMap = {}
            challData.forEach(c => challMap[c.id] = c)
            var allUserSolves = await User.find({}, { _id: 0, username: 1, solves: 1, eligible: 1 })
            allUserSolves = allUserSolves.map(u => {
                return {
                    username: u.username,
                    eligible: u.eligible,
                    points: getTotalPoints(u, challMap),
                    lastSolve: Math.max(...u.solves.map(({ time }) => new Date(time).getTime()))
                }
            })
            allUserSolves.sort((a, b) => {
                if(b.points > a.points) return 1
                if(b.points < a.points) return -1
                // points are equal, so compare the latest completion time
                return a.lastSolve - b.lastSolve
            })
            cache.set('leaderboard', allUserSolves)
            return res(allUserSolves)
    })
}

const addMember = (user, memberEmail) => {
    return new Promise(async (res, rej) => {
        try {
            if(user.memberEmails.length + 1 >= maxTeamSize) {
                return res({ err: 'Max team size reached (' + maxTeamSize + ')' })
            }

            if(memberEmail == user.email) {
                return res({ err: 'Member already in team' })
            }

            const time = new Date()
            const numchanged = await User.findOneAndUpdate(
                { username: user.username, 'memberEmails.email': { $ne: memberEmail } },
                { $push: { memberEmails: { email: memberEmail, time } } } ,
                { useFindAndModify: false })

            if(numchanged == null) {
                return res({ err: 'Member already in team' })
            }

            return res({ msg: 'Added member to team' })
        } catch(e) {
            rej(e)
        }
    })
}

const removeMember = (user, memberEmail) => {
    return new Promise(async (res, rej) => {
        try {
            const numchanged = await User.findOneAndUpdate(
                { username: user.username },
                { $pull: { memberEmails: { email: memberEmail } } },
                { useFindAndModify: false }
            )

            if(numchanged == null) {
                return res({ err: 'Unexpected Error' })
            }

            return res({ msg: 'Member removed from team' })
        } catch(e) {
            rej(e)
        }
    })
}

const getProfile = (user) => {
    return new Promise(async (res, rej) => {
        try {
            const leaderboard = await getLeaderboard()
            var position = leaderboard.findIndex(({ username }) => username == user.username) + 1
            var challenges = await getChallenges()
            challenges = challenges.map(({ id, title, points, category }) => { return { id, title, points, category } })
            var userData = { username: user.username, email: user.email, eligible: user.eligible }
            return res({ userData, position, solves: user.solves, challenges })
        } catch(e) {
            rej(e)
        }
    })
}

const changeUsername = (user, newUsername) => {
    return new Promise(async (res, rej) => {
        const numchanged = await Challenge.updateMany(
            { "solves.user": user.username },
            { $set: { "solves.$[].user": newUsername } },
        ).catch(err => rej(err))
        console.log('[+] CHANGED USERNAME CHALL RECORDS', numchanged)
        user.username = newUsername
        await user.save().catch(err => rej(err))
        return res('good')
    })
}

const setEligibility = (username, eligibility) => {
    return new Promise(async (res, rej) => {
        const numchanged = await User.findOneAndUpdate(
            { username },
            { $set: { eligible: eligibility } },
            { useFindAndModify: false }
        ).catch(err => rej('Invalid argument ' + err))
        if(!numchanged) return rej('Invalid User, numchanged: ' + JSON.stringify(numchanged))
        res('Success')
    })
}

module.exports = { disallowBefore, disallowAfter, ensureAuthenticated, ensureAdmin, createDefaultAdminUser, saveChallData, getChallenges, getNumAttempts, submitFlag, hasSolved, addMember, removeMember, getProfile, getLeaderboard, changeUsername, setEligibility }
