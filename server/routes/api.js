const path = require('path')
const express = require('express')
const router = express.Router()
const passport = require('passport')
const validator = require('email-validator')
const User = require('../models/user')
const JWT = require('jsonwebtoken')
const { ensureAuthenticated } = require('../util')

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

const testchalls = [
    { id: 0, sortWeight: -1, title: 'test chall 1', category: 'misc', description: 'helo this is the first challenge in the series of challenge tests this should also spuport markdown, take a look at next couple of chall descriptions to see !!', files: [], points: 1, solves: 4 },
    { id: 1, sortWeight: 1, title: 'test chall 2', category: 'cryptography', description: 
        `challenge 2!!! checkout the *markdown* **in this one** ooo \`fancy!\` even \`\`\`python
code blocks are supported with "syntax highlighting" 3+4 in for\`\`\``, files: [], points: 99, solves: 0 },
    { id: 2, sortWeight: 4, title: 'test chllenge 3 this one has a pretty long title ohpefuly thats ok', category: 'binary exploitation', description: 'yes gogogo. source code with this chall! take a look at the FIlesssss `nc helo.com 123`', files: ['/files/1234.c'], points: 1337, solves: 1  }
]
router.get('/challenges', ensureAuthenticated, (req, res) => {
    console.log(req.user)
    res.json({ msg: 'got challenges', challenges: testchalls })
})

module.exports = router
