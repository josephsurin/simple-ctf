const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const dbURI = process.env.DB_URI || 'mongodb://localhost:27017/simple-ctf'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`Connected to DB`)
        initApp()
    })
    .catch((err) => console.log(err))

function initApp() {
    const app = express()

    app.use(cors())
    app.use(cookieParser())
    app.use(bodyParser.json())
    app.use(require('express-session')({
        secret: 'sup3r d00p3r S3creT S3cR37!11!',
        resave: false,
        saveUninitialized: false
    }))
    app.use(passport.initialize())
    app.use(passport.session())

    app.use('/api', require('./routes/api'))

    app.use('/', express.static(path.join(__dirname, '../build'), { extensions: ['html', 'js', 'css'] }))

    const User = require('./models/user')
    passport.use(new LocalStrategy(User.authenticate()))
    passport.serializeUser(User.serializeUser())
    passport.deserializeUser(User.deserializeUser())

    app.use((_, res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'))
    })

    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log('listening on port ' + port)
    })
}
