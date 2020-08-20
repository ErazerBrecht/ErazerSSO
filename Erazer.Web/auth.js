const session = require('express-session');
const Redis = require("ioredis");
const redisStore = require('connect-redis')(session);
const url = require('url');
const passport = require('passport');
const { Issuer, Strategy, custom } = require('openid-client');
const { random } = require('openid-client/lib/helpers/generators');
const base64url = require('base64url');
const crypto = require('@trust/webcrypto');

// Initialize passport/auth settings
module.exports = async (app) => {
    const config = app.get('config');
    const host = config.host;
    const isSecure = !host.startsWith('http://');
    const redisClient = new Redis(config.redis);

    // Get oidc information from authorization server (like the token endpoint, ...)
    // Setup client with client_id & client_secret => TODO move client_secret out of vcs!
    const issuer = await Issuer.discover(config.idsrv);
    const client = new issuer.Client({ client_id: 'nodejs', client_secret: 'C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C' });
    client[custom.clock_tolerance] = 5;
    client[custom.http_options] = function (options) {
        options.timeout = 15000;
        return options;
    };

    const oidc = { issuer, client };
    app.set('config', Object.assign(config, oidc));

    // We don't store any user infomation in a seperate db...
    // But these functions are mandatory
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    // Use oidc strategy, when user is authenticated retrieve information from user (id, username, role) and store it in the session!
    passport.use('oidc', new Strategy({ client, params: { redirect_uri: `${host}/auth/signin-oidc`, scope: 'openid profile role api' }, passReqToCallback: true }, (req, tokenset, userinfo, done) => {
        const user = { id: userinfo.sub, name: userinfo.name, role: userinfo.role, access_token: tokenset.access_token, id_token: tokenset.id_token, ip: req.ip, userAgent: req.get('User-Agent') };
        return done(null, user);
    }));

    if (isSecure) {
        app.set('trust proxy', true)
    }

    app.use(session({
        store: new redisStore({ client: redisClient }),
        secret: '8tJbS2kGdzFCLHtMujnkM94fPA7A9t33MqAcJCMbapmTLPVcDJ86WJr9kBHCFQ3FbV2p',
        cookie: { sameSite: 'lax', secure: isSecure },
        name: 'Erazer.Web',
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Destroys the user session and redirects to the authorization server to destroy their 'SSO' session
    app.get('/auth/logout', (req, res) => {
        const logoutUrl = oidc.issuer.end_session_endpoint;

        if (req.user) {
            const idToken = req.user.id_token;

            req.logout();
            res.redirect(url.format(Object.assign(url.parse(logoutUrl), {
                search: null,
                query: {
                    id_token_hint: idToken,
                    post_logout_redirect_uri: host
                },
            })));
        } else {
            res.redirect(logoutUrl);
        }
    });

    // Redirect the user to the 'authorized' app if signed in. If it's not the case start the 'authorization code flow' against the authorization server
    app.get('/auth/login', (req, res, next) => {
        const fn = function (_req, _res, _next) {
            if (_req.query.redirect) {
                const state = { state_id: random(), redirect: _req.query.redirect };
                const urlState = base64url(JSON.stringify(state));
                passport.authenticate('oidc', { state: urlState })(_req, _res, _next);
            } else
                passport.authenticate('oidc')(_req, _res, _next);
        };

        if (req.user) {
            // Kill previous session
            req.session.regenerate(err => {
                if (err)
                    next(err);
                fn(req, res, next)
            });
        } else
            fn(req, res, next);
    });

    // Callback (the authorization server redirects to this endpoint if the authorization succeeded)
    // Will redirect the user to portal application
    // Uses the 'state' property to redirect the user to a 'angular' route.
    app.get('/auth/signin-oidc', (req, res, next) => {
        let successRedirect = '/portal';

        if (req.query.state && typeof (req.query.state) === 'string') {
            const decoded = base64url.decode(req.query.state);
            try {
                const obj = JSON.parse(decoded);
                if (obj.redirect && obj.redirect.includes('/')) {
                    successRedirect += `${obj.redirect}`;
                }
            } catch { }
        }

        passport.authenticate('oidc', { successRedirect, failureRedirect: '/' })(req, res);
    });

    app.post('/auth/key', async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not signed in' });
        }

        if (req.user.ip !== req.ip || req.user.userAgent !== req.get('User-Agent')) {
            return res.status(401).json({ error: 'Incorrect session parameters' });
        }

        if (req.user.publicKey) {
            return res.status(403).json({ error: 'Already provided a public key in this session' });
        }

        const publicKey = (req.body || {}).publicKey;

        if (!publicKey) {
            return res.status(400).json({ error: 'Missing public key' });
        }

        try {
            await crypto.subtle.importKey(
                "jwk",
                publicKey,
                {
                    name: "RSA-PSS",
                    modulusLength: 4096,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256"
                },
                false, 
                ["verify"]);

            req.user.publicKey = publicKey;
            res.sendStatus(204);
        }
        catch (e) {
            return res.status(400).json({ error: 'Incorrect public key format' });
        }





    });
}