const csrf = require('csurf');

module.exports = (req, res, next) => {
    if (req.session && req.session.cookie && Object.keys(req.session).length > 1) {
        return csrf({
            cookie: false,
        })(req, res, next);
    } else {
        return next();
    }
}