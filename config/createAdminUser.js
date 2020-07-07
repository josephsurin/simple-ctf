const { stdin, stdout } = process
const mongoose = require('mongoose')

const User = require('../server/models/user')

function prompt(p) {
    return new Promise((res, rej) => {
        stdin.resume()
        stdout.write(p)

        stdin.on('data', data => res(data.toString().trim()))
        stdin.on('error', err => reject(err))
    })
}

const dbURI = process.env.DB_URI || 'mongodb://localhost:27017/simple-ctf'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to DB')
        const password = await prompt('Choose admin password: ')    
        const u = new User({ username: 'admin', email: 'admin@admin.com', admin: true })
        User.register(u, password, (err, user) => {
            console.log('registerd')
            if(err) {
                console.log(err)
            } else {
                console.log('Admin registration successful: ', user)
            }
        })
    })
    .catch(console.log)
