const https = require('https')
const fs = require('fs')
const path = require('path')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const favicon = require('serve-favicon')
const morgan = require('morgan')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const User = require('./models/user')
const { jwtSecret, mongodb_url } = require('./config')
const { createDefaultAdminUser } = require('./util')

console.log('attempting to connect to database')
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

    if(fs.existsSync(path.join(__dirname, './favicon'))) {
        app.use(favicon(path.join(__dirname, './favicon')))
    }

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

    if(!fs.existsSync(path.join(__dirname, './data'))) fs.mkdirSync(path.join(__dirname, './data'))
    if(!fs.existsSync(path.join(__dirname, './data/files'))) fs.mkdirSync(path.join(__dirname, './data/files'))
    app.use('/files', express.static(path.join(__dirname, './data/files/')))

    app.use((_, res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'))
    })

    const port = process.env.PORT || 3000

    if(process.env.NODE_ENV == 'production') {
        const https_options = {
            key: fs.readFileSync(path.join(__dirname, '../.ssl/privkey.pem')),
            cert: fs.readFileSync(path.join(__dirname, '../.ssl/cert.pem')),
            ca: fs.readFileSync(path.join(__dirname, '../.ssl/chain.pem'))
        }
        https.createServer(https_options, app).listen(port, () => {
            console.log('listening on port', port)
        })
    } else {
        app.listen(port, () => {
            console.log('listening on port ' + port)
        })
    }
}
