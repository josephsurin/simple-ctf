const path = require('path')
const fs = require('fs')
const express = require('express')
const router = express.Router()
const tar = require('tar')
const multer = require('multer')
const { ensureAuthenticated, ensureAdmin, loadChallData } = require('../util')

const dataDir = path.join(__dirname, '../data')
const upload = multer({ dest: dataDir })

router.use(ensureAuthenticated)
router.use(ensureAdmin)

router.post('/add', (req, res) => {
    res.end(JSON.stringify(req.user))
})

router.post('/addBuilk', upload.single('data'), (req, res) => {
    tar.x({
        file: req.file.path,
        cwd: dataDir
    }, ['challenges']).then(() => {
        // clean up downloaded file
        fs.unlinkSync(req.file.path)
        loadChallData(path.join(dataDir, '/challenges'))
            .then((d) => res.json({ msg: 'Success', d }))
            .catch(err => res.json({ err }))
    })
})

module.exports = router
