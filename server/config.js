const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const serverConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config/server.yml')).toString())

module.exports = Object.assign(serverConfig, {
    mongodb_url: process.env.MONGODB_URL || 'mongodb://localhost:27017/simple-ctf'
})
