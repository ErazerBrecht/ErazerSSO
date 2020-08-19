const csrf = require('csurf');

module.exports = (req, res, next) => {
    if (req.session && req.session.cookie && Object.keys(req.session).length > 1) {
        return csrf({
            cookie: false,
        })(req, res, function (err) {
            if (err) {
                if (err.code !== 'EBADCSRFTOKEN') {
                    return next(err);
                }
                return res.status(403).json({error: "Invalid CSRF"});
            } else {
                next();
            }
        });
    } else {
        return next();
    }
}