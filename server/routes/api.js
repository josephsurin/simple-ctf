const path = require('path')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('email-validator')
const User = require('../models/user')
const JWT = require('jsonwebtoken')
const { ensureAuthenticated, submitFlag, hasSolved, getChallenges, getProfile, getLeaderboard } = require('../util')

router.post('/register', (req, res) => {
    if(!req.body.username) return res.json({ err: 'Username cannot be empty' })
    if(!req.body.email || !validator.validate(req.body.email)) return res.json({ err: 'Invalid email' })
    if(!req.body.password) return res.json({ err: 'Password cannot be empty' })
    User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, (err, user) => {
        if(err && err.toString().includes('username is already registered')) {
            return res.json({ err: 'A user has already registered with that username' })
        } else if(err) {
            return res.json({ err: 'A user has already registered with that email' })
        }

        return res.json({ msg: 'Registration Successful' })
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    const token = JWT.sign({ username: req.user.username }, 'TODOchangeme', { algorithm: 'HS256', expiresIn: '2d' })
    res.json({ msg: 'Login Successful', token })
})

router.get('/challenges', ensureAuthenticated, (req, res) => {
    getChallenges()
        .then(rawChalls => {
            const challenges = rawChalls.map(chall => Object.assign(chall.toJSON(), { solves: null, numSolves: chall.solves.length, solved: hasSolved(req.user, chall.id) }))
            res.json({ msg: 'got challenges', challenges })
        })
        .catch(err => res.json({ err }))
})

router.post('/submit', ensureAuthenticated, (req, res) => {
    submitFlag(req.user, req.body.challid, req.body.submission)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.get('/profile', ensureAuthenticated, (req, res) => {
    getProfile(req.user)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

router.get('/scoreboard', (req, res) => {
    getLeaderboard()
        .then(standings => {
            const perpage = 1
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
