const fetch = require('node-fetch')

async function main() {
    const argv = require('yargs')
        .option('origin', {
            alias: 'o',
            describe: 'Origin URL for the CTF instance'
        })
        .option('username', {
            alias: 'u',
            describe: 'Username of user to set eligibility'
        })
        .option('eligibility', {
            alias: 'e',
            describe: 'Eligibility to set',
            default: 'true'
        })
        .option('password', {
            alias: 'p',
            describe: 'Admin password',
        })
        .demandOption('username', 'Username must be specified')
        .demandOption('password', 'Admin password must be specified')
        .help()
        .argv

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

    // set eligibility
    const data = { username: argv['username'], eligibility: argv['eligibility'] }
    res = await fetch(argv['origin'] + '/admin/setEligibility', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(data)
    })
    body = await res.json()
    console.log(JSON.stringify(body, null, 2))
}

main()
