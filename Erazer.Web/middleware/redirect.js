const CleanCSS = require('clean-css');
const Purgecss = require('purgecss');
const globToRegExp = require('glob-to-regexp');

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

        // CSS inlining
        const criticalCss = generateCriticalCss(html);
        const startIndexEndOfHead = html.indexOf('</head>');
        const htmlWithCss = `${html.slice(0, startIndexEndOfHead)}<style>${criticalCss}</style>${html.slice(startIndexEndOfHead)}`;

        // Server push
        const cssRegex = globToRegExp('href="*.css', { flags: 'g' });
        const cssLinks = htmlWithCss.match(cssRegex).map(x => `</${x.replace('href="', '')}>; rel=preload as=style`);
        const jsRegex = globToRegExp('src="*.js', { flags: 'g' });
        const jsLinks = htmlWithCss.match(jsRegex).filter(x => x.includes('es2015')).map(x => `</${x.replace('src="', '')}>; rel=preload as=script`);
        const imgRegex = new RegExp('<img[^>]+src="([^">]+)"', 'g');
        const imgLinks = [...htmlWithCss.matchAll(imgRegex)].map(x => x[1]).map(x => `<${x}>; rel=preload as=image`);
        const bgImgRegex = /url\('.*\.webp'/g;
        const bgImgLinks = htmlWithCss.match(bgImgRegex).map(x => x.replace("'", "").replace("url(", "")).map(x => `<${x}>; rel=preload as=image`);
        const fontRegex =  /url\(.[^,]*?\.woff2/g;
        const fontLinks = htmlWithCss.match(fontRegex).map(x => x.replace("url(", "/")).map(x => `<${x}>; rel=preload as=font`);

        console.log(cssLinks);
        console.log(jsLinks);
        console.log(imgLinks);
        console.log(bgImgLinks);

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