const path = require('path')
const fs = require('fs').promises
const yaml = require('js-yaml')
const passport = require('passport')
const Challenge = require('./models/challenge')

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
            const challData = Object.assign(parsedData, { category })
            // update the current document if exists, or create new one
            const challenge = await Challenge.findOneAndUpdate({ id: challData.id }, challData, { upsert: true, useFindAndModify: false })
            return res(challenge)
        } catch(e) {
            console.log('saveChall err', e)
            return rej(e)
        }
    })
}

const loadChallData = (challDataDir) => {
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

module.exports = { ensureAuthenticated, ensureAdmin, loadChallData }
