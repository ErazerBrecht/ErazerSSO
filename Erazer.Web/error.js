module.exports = function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({ error: 'Invalid CSRF' })
    }

    return next(err)

}