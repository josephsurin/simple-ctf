const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('email-validator')
const rateLimit = require('express-rate-limit')
const User = require('../models/user')
const JWT = require('jsonwebtoken')
const { jwtSecret } = require('../config')
const { disallowBefore, disallowAfter, ensureAuthenticated, getNumAttempts, submitFlag, hasSolved, getChallenges, addMember, removeMember, getProfile, getLeaderboard, changeUsername } = require('../util')

const limiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 7,
    headers: false,
    message: { msg: 'rate limited' }
})

const namechangeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1,
    headers: false,
    message: { msg: 'rate limited' }
})

router.post('/register', (req, res) => {
    if(!req.body.username) return res.json({ err: 'Username cannot be empty' })
    if(!req.body.email || !validator.validate(req.body.email)) return res.json({ err: 'Invalid email' })
    if(!req.body.password) return res.json({ err: 'Password cannot be empty' })
    if(req.body.username && req.body.username.length > 35) return res.json({ err: 'Username too long' })
    User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, (err, user) => {
        if(err && err.toString().includes('username is already registered')) {
            return res.json({ err: 'A user has already registered with that username' })
        } else if(err) {
            console.log('registration err', err)
            return res.json({ err: 'A user has already registered with that email' })
        }

        return res.json({ msg: 'Registration Successful' })
    })
})

router.post('/login', [limiter, passport.authenticate('local')], (req, res) => {
    const token = JWT.sign({ username: req.user.username }, jwtSecret, { algorithm: 'HS256', expiresIn: '2d' })
    req.user.visits.push({ ip: req.ip, time: new Date() })
    req.user.save()
        .then(() => console.log('Logged in user', req.user.username, 'from', req.ip))
        .catch(console.log)
    res.json({ msg: 'Login Successful', token })
})

router.get('/getdetails', ensureAuthenticated, (req, res) => {
    return res.json({ username: req.user.username, email: req.user.email, members: req.user.memberEmails.map(v => v.email) })
})

router.post('/changepassword', [limiter, ensureAuthenticated], (req, res) => {
    if(!req.body.oldpassword) return res.json({ err: 'Missing field "oldpassword"' })
    if(!req.body.newpassword) return res.json({ err: 'Missing field "newpassword"' })
    req.user.changePassword(req.body.oldpassword, req.body.newpassword)
        .then(() => res.json({ msg: 'Password changed successfully' }))
        .catch(err => res.json({ err: 'Incorrect Password' }))
})

router.post('/changeemail', [limiter, ensureAuthenticated], async (req, res) => {
    if(!req.body.email) return res.json({ err: 'Missing field "email"' })
    if(!validator.validate(req.body.email)) return res.json({ err: 'Invalid email' })
    const other = await User.findOne({ email: req.body.email })
    if(other) return res.json({ err: 'Account exists with that email' })
    req.user.email = req.body.email
    req.user.save()
        .then(() => res.json({ msg: 'Email changed successfully' }))
        .catch(err => res.json({ err }))
})

router.get('/challenges', [ensureAuthenticated, disallowBefore], (req, res) => {
    getChallenges()
        .then(rawChalls => {
            const challenges = rawChalls.map(chall => Object.assign(chall.toJSON(), { solves: null, maxAttempts: chall.maxAttempts, attempts: getNumAttempts(req.user, chall.id), numSolves: chall.solves.length, solved: hasSolved(req.user, chall.id) }))
            res.json({ msg: 'got challenges', challenges })
        })
        .catch(err => res.json({ err }))
})

router.post('/submit', [limiter, ensureAuthenticated, disallowBefore, disallowAfter], (req, res) => {
    submitFlag(req.user, req.body.challid, req.body.submission)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.post('/addmember', [ensureAuthenticated, disallowAfter], (req, res) => {
    if(!req.body.memberEmail) return res.json({ err: 'Missing field "memberEmail"' })
    addMember(req.user, req.body.memberEmail)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.post('/removemember', [ensureAuthenticated, disallowAfter], (req, res) => {
    if(!req.body.memberEmail) return res.json({ err: 'Missing field "memberEmail"' })
    removeMember(req.user, req.body.memberEmail)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.post('/changeusername', [ensureAuthenticated, disallowAfter, namechangeLimiter], async (req, res) => {
    if(!req.body.newUsername) return res.json({ err: 'Missing field "newUsername"' })
    if(req.body.newUsername.length > 35) return res.json({ err: 'Username too long' })
    const alreadyExists = await User.findOne({ username: req.body.newUsername })
    if(alreadyExists) return res.json({ err: 'A user has already registered with that username' })
    await changeUsername(req.user, req.body.newUsername)
        .catch(err => res.json({ err: 'Something went wrong' }))
    console.log('[+]', req.user.username, 'changed their username to', req.body.newUsername)
    return res.json({ msg: 'Successfully changed username, you will need to relog.' })
})

router.get('/profile', ensureAuthenticated, (req, res) => {
    getProfile(req.user)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.get('/profile/:username', ensureAuthenticated, (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            getProfile(user) 
                .then(r => res.json(r))
                .catch(err => res.json({ err }))
        })
        .catch(err => res.json({ err: 'not found' }))
})

router.get('/scoreboard', (req, res) => {
    getLeaderboard()
        .then(standings => {
            const perpage = 100
            var page = req.query.page || 0
            var count = standings.length
            var numPages = Math.ceil(count/perpage)
            page = Math.min(page, numPages)
            res.json({
                offset: perpage*page,
                numPages,
                page,
                standings: standings.slice(page*perpage, (page+1)*perpage)
            })
        })
        .catch(err => res.json({ err }))
})

module.exports = router
