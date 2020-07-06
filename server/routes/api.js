const path = require('path')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('email-validator')
const User = require('../models/user')
const JWT = require('jsonwebtoken')
const { ensureAuthenticated } = require('../util')

const staticPath = path.join(__dirname, '../../build/')

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
    console.log(req.user)
    res.json({ msg: 'got challenges' })
})

module.exports = router
