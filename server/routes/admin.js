const path = require('path')
const fs = require('fs')
const express = require('express')
const router = express.Router()
const tar = require('tar')
const multer = require('multer')
const rimraf = require('rimraf')
const { ensureAuthenticated, ensureAdmin, saveChallData, setEligibility } = require('../util')

const dataDir = path.join(__dirname, '../data')
const upload = multer({ dest: dataDir })

router.use(ensureAuthenticated)
router.use(ensureAdmin)

router.post('/addChalls', upload.single('data'), (req, res) => {
    tar.x({
        file: req.file.path,
        cwd: dataDir
    }, ['challenges']).then(() => {
        // clean up downloaded file
        fs.unlinkSync(req.file.path)
        var challDataDir = path.join(dataDir, '/challenges')
        saveChallData(challDataDir)
            .then(d => {
                rimraf.sync(challDataDir)
                return res.json({ msg: 'Success', d })
            })
            .catch(err => res.json({ err }))
    })
})

router.post('/setEligibility', (req, res) => {
    if(!req.body.username) return res.json({ err: 'Missing field "username"' })
    if(!req.body.eligibility) return res.json({ err: 'Missing field "eligibility"' })
    setEligibility(req.body.username, req.body.eligibility)
        .then(msg => res.json({ msg }))
        .catch(err => res.json({ err }))
})

module.exports = router
