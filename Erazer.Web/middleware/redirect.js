const CleanCSS = require('clean-css');
const Purgecss = require('purgecss');

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
    res.render('index', { req, res }, (err, html) => {
        // TODO err handling...
        console.log(html);
        const criticalCss = generateCriticalCss(html);

        const startIndexEndOfHead = html.indexOf('</head>');
        const htmlWithCss = `${html.slice(0, startIndexEndOfHead)}<style>${criticalCss}</style>${html.slice(startIndexEndOfHead)}`;
        res.send(htmlWithCss);
    });
}

function generateCriticalCss(html) {
    const content = {
        raw: html,
        extension: 'html'
    }

    const purgeCss = new Purgecss({
        content: [content],
        css: ['./wwwroot/styles.*.css']
    });

    const result = purgeCss.purge()[0];
    const minified = new CleanCSS({ level: { 1: { specialComments: false } } }).minify(result.css);

    return minified.styles;
}