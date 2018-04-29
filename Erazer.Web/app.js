'use strict';

require('zone.js/dist/zone-node');

const express = require('express');
const app = express();

const ngUniversal = require('@nguniversal/express-engine');
const appServer = require('./wwwroot/landing-server/main.bundle');

const compression = require('compression');
const morgan = require('morgan');
const mime = require('mime/lite');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');
const url = require('url');

const wwwroot = __dirname + '/wwwroot';

module.exports = new Promise(async (resolve, reject) => {
    app.use(morgan('dev'));
    app.use(compression());

    app.use(session({
        store: new redisStore({ host: 'localhost', port: '6380' }),
        secret: 'tutorialsecret',
        cookie: { maxAge: 3600000 },
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(redirectMiddleware);

    app.use(express.static(wwwroot, {
        setHeaders: function (res, path) {
            if (mime.getType(path) === 'text/html') {
                res.setHeader('Cache-Control', 'public, max-age=0');
            }
            else {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
        }
    }));

    /* Configure Angular Express engine */
    app.engine('html', ngUniversal.ngExpressEngine({
        bootstrap: appServer.AppServerModuleNgFactory
    }));
    app.set('view engine', 'html');
    app.set('views', 'wwwroot');

    try {
        addAuth(await addOidc());
    }
    catch (error) {
        reject(error);
    }

    resolve(app);
});


async function addOidc() {
    const issuer = await Issuer.discover('http://localhost:5000');
    const client = new issuer.Client({ client_id: 'nodejs', client_secret: 'C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C' });

    return { issuer, client };
}

function addAuth(oidc) {
    const params = {
        redirect_uri: 'http://localhost:8888/auth/signin-oidc',
        scope: 'openid profile api1'
    }

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use('oidc', new Strategy({ client: oidc.client, params }, (tokenset, userinfo, done) => {
        const user = { id: tokenset.claims.sub, name: userinfo.name, access_token: tokenset.access_token, id_token: tokenset.id_token };
        return done(null, user);
    }));

    app.get('/auth/logout', (req, res) => {
        const idToken = req.user.id_token;

        req.logout();
        res.redirect(url.format(Object.assign(url.parse(oidc.issuer.end_session_endpoint), {
            search: null,
            query: {
                id_token_hint: idToken,
                post_logout_redirect_uri: 'http://localhost:8888'
            },
        })));
    });

    app.get('/auth/dashboard', (req, res, next) => {
        if (req.user) {
            if (req.query.redirect)
                res.redirect(`/portal${req.query.redirect}`);            
            else 
                res.redirect('/portal/');
        }
        else {
            if (req.query.redirect)
                passport.authenticate('oidc', { state: req.query.redirect })(req, res, next);
            else
                passport.authenticate('oidc')(req, res, next);
        }
    });

    app.get('/auth/signin-oidc', (req, res) => {
        let successRedirect = '/auth/dashboard';

        // TODO ASK KIERAN IF SECURE
        if (req.query.state && !req.query.state.includes('-'))
            successRedirect += `?redirect=${req.query.state}`;

        passport.authenticate('oidc', { successRedirect, failureRedirect: '/' })(req, res);
    });

    app.get('/auth/token', (req, res) => {
        if (!req.user) {
            res.send(401);
        }
        res.json(req.user.access_token);
    });
}

function redirectMiddleware(req, res, next) {
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
    res.render('index', { req, res });
}