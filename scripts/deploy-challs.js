const fetch = require('node-fetch')
const FormData = require('form-data')
const path = require('path')
const os = require('os')
const fs = require('fs/promises')
const { createReadStream } = require('fs')
const tar = require('tar')

async function main() {
    const argv = require('yargs')
        .option('origin', {
            alias: 'o',
            describe: 'Origin URL for the CTF instance'
        })
        .option('chall-dir', {
            alias: 'd',
            describe: 'Path to directory containing challenge data'
        })
        .option('password', {
            alias: 'p',
            describe: 'Admin password'
        })
        .demandOption('origin', 'Origin must be specified')
        .demandOption('chall-dir', 'Challenge directory must be specified')
        .help()
        .argv

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), '/ctf-'))
    const challsTGZ = path.join(tempDir, '/challs.tgz')
    await tar.c({
        gzip: true,
        file: challsTGZ,
        cwd: argv['challDir'].split('/challenges')[0]
    }, ['challenges/'])
    
    // login as admin
    var res = await fetch(argv['origin'] + '/api/login', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            username: 'admin',
            password: argv['password']
        })
    })
    var body = await res.json()
    const token = body.token

    // upload challenges
    const form = new FormData()
    form.append('data', createReadStream(path.join(tempDir, '/challs.tgz')))
    res = await fetch(argv['origin'] + '/admin/addChalls', {
        method: 'post',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        body: form
    })
    body = await res.json()
    console.log(JSON.stringify(body, null, 2))
}

main()
