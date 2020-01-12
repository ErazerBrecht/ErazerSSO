module.exports = (req, res, next) => {
    const wwwroot = req.app.get('config').wwwroot;

    if (req.url === '/') {
        if (req.user)
            return res.redirect('/portal/');
        return angularRouter(req, res);
    }

    if (req.url.startsWith('/portal')) {
        if (!req.user)
            return res.redirect('/');
        if (!req.url.includes('.'))
            return res.sendFile('portal/index.html', { root: wwwroot });
    }

    // Execute 'normal' express code if url is auth endpoint or a static file
    if (req.url.startsWith('/auth') || req.url.includes('.'))
        return next();

    return angularRouter(req, res);
}

function angularRouter(req, res) {
    /* Server-side rendering */
    res.set('Cache-Control', 'public, max-age=3600');
    res.render('index', { req, res });
}