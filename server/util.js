function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    return res.end('Unauthorized')
}

module.exports = { ensureAuthenticated }
