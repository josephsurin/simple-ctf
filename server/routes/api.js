const path = require('path')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('email-validator')
const User = require('../models/user')
const Challenge = require('../models/challenge')
const JWT = require('jsonwebtoken')
const { ensureAuthenticated, submitFlag } = require('../util')

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
    Challenge.find({}, { flag: 0, _id: 0 })
        .then(rawChalls => {
            const challenges = rawChalls.map(chall => Object.assign(chall.toJSON(), { solves: null, numSolves: chall.solves.length }))
            res.json({ msg: 'got challenges', challenges })
        })
})

router.post('/submit', ensureAuthenticated, (req, res) => {
    submitFlag(req.user, req.body.challid, req.body.submission)
        .then(r => res.json(r))
        .catch(err => res.json({ err }))
})

module.exports = router
