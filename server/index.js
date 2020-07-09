const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const User = require('./models/user')
const { jwtSecret, mongodb_url } = require('./config')
const { createDefaultAdminUser } = require('./util')

mongoose.connect(mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`Connected to DB`)
        initApp()
    })
    .catch((err) => console.log(err))

function initApp() {
    createDefaultAdminUser()
        .then(console.log)
        .catch(console.log)

    const app = express()

    app.set('trust proxy', true)

    app.use(cors())
    app.use(cookieParser())
    app.use(bodyParser.json())
    app.use(morgan('combined'))

    // PASSPORT AUTH
    app.use(passport.initialize())
    passport.use(new LocalStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    const jwtOpts = {
        secretOrKey: jwtSecret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        algorithms: ['HS256']
    }
    passport.use(new JwtStrategy(jwtOpts, (payload, next) => {
        User.findOne({ username: payload.username })
            .then(user => next(null, user || false))
            .catch(_ => next(null, false))
    }))

    // ROUTING
    app.use('/api', require('./routes/api'))
    app.use('/admin', require('./routes/admin'))

    app.use('/', express.static(path.join(__dirname, '../build'), { extensions: ['html', 'js', 'css'] }))

    app.use('/files', express.static(path.join(__dirname, './data/files/')))

    app.use((_, res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'))
    })

    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log('listening on port ' + port)
    })
}
