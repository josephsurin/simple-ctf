const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const Mustache = require('mustache')
const http = require('http')
const https = require('https')

// build client template html
const clientConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config/client.yml')))

var templateHtml = Mustache.render(
    fs.readFileSync(path.join(__dirname, '../client/template.html')).toString(),
    { config: clientConfig, configJSON: JSON.stringify(clientConfig) }
)
fs.writeFileSync(path.join(__dirname, '../client/index.html'), templateHtml)

// get favicon and save to server/favicon
const { iconUrl } = require('../server/config')
const r = iconUrl.startsWith('https') ? https : http
const faviconFile = fs.createWriteStream(path.join(__dirname, '../server/favicon'))
r.get(iconUrl, res => res.pipe(faviconFile)).on('error', e => console.log('error retrieving favicon', e))
