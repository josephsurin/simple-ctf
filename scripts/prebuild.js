const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const Mustache = require('mustache')

// build client template html
const clientConfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../config/client.yml')))

var templateHtml = Mustache.render(
    fs.readFileSync(path.join(__dirname, '../client/template.html')).toString(),
    { config: clientConfig, configJSON: JSON.stringify(clientConfig) }
)
fs.writeFileSync(path.join(__dirname, '../client/index.html'), templateHtml)
