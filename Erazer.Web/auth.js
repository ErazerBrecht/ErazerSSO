const session = require('express-session');
const Redis = require("ioredis");
const redisStore = require('connect-redis')(session);
const url = require('url');
const passport = require('passport');
const { Issuer, Strategy, custom } = require('openid-client');
const { random } = require('openid-client/lib/helpers/generators');
const base64url = require('base64url');
const crypto = require('@trust/webcrypto');
const csrf = require('csurf');
const fetch = require('node-fetch');

// Initialize passport/auth settings
module.exports = async (app) => {
    const config = app.get('config');
    const host = config.host;
    const isSecure = !host.startsWith('http://');
    const localLoginEnabled = config.localLoginEnabled;
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
        cookie: { sameSite: 'Lax', secure: isSecure, httpOnly: true },
        name: isSecure ? '__Host-Erazer.Web' : 'Erazer.Web',
        resave: false,
        saveUninitialized: false,

    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Destroys the user session and redirects to the authorization server to destroy their 'SSO' session
    app.get('/auth/logout', (req, res) => {
        const logoutUrl = oidc.issuer.end_session_endpoint;

        if (req.user) {
            const idToken = req.user.id_token;

            req.logout();
            req.session.destroy(() => {
                res.redirect(url.format(Object.assign(url.parse(logoutUrl), {
                    search: null,
                    query: {
                        id_token_hint: idToken,
                        post_logout_redirect_uri: host
                    },
                })));
            });
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

        if (req.headers?.cookie?.includes('Erazer.Web')) {
            // Kill previous session
            req.session.regenerate(err => {
                if (err)
                    next(err);
                fn(req, res, next)
            });
        } else
            fn(req, res, next);
    });


    if (localLoginEnabled) {
        app.use('*', (req, res, next) => {
            // TODO Convert localLoginEnabled in string array of allowed local host
            res.header("Access-Control-Allow-Origin", "http://localhost:4201");
            res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
            res.header("Access-Control-Allow-Credentials", "true");

            if (req.session.user)
                req.user = req.session.user;

            next();
        })

        app.post('/auth/login/local', async (req, res) => {
            const tokenRequest = new URLSearchParams();
            const username = req.body.username;
            const password = req.body.password;

            if (!username || !password) {
                res.status(400).json({ error: 'Missing credentials' });
            }

            tokenRequest.set('grant_type', "password");
            tokenRequest.set('username', username);
            tokenRequest.set('password', password);
            tokenRequest.set('client_id', 'nodejs_dev');
            tokenRequest.set('client_secret', '425A4639-4079-49E1-9F86-E832F246F5FB');

            try {
                var response = await fetch(issuer.token_endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: tokenRequest
                });

                if (!response.ok) {
                    throw new Error();
                }

                const json = await response.json();
                const access_token = json.access_token;

                const userInfo = await client.userinfo(access_token);

                req.session.user = Object.assign(userInfo, { isLocal: true, access_token });
                req.session.cookie.maxAge = 14 * 24 * 3600 * 1000;
                res.sendStatus(200);
            } catch (err) {
                res.status(500).json({ error: "Couldn't retrieve an access_token for local development" });
            }
        });
    }


    // Callback (the authorization server redirects to this endpoint if the authorization succeeded)
    // Will redirect the user to portal application
    // Uses the 'state' property to redirect the user to a 'angular' route.
    app.get('/auth/signin-oidc', (req, res) => {
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

    app.post('/auth/key', csrf(), async (req, res) => {
        // Signed in?
        if (req.user) {
            // Is this request coming from the same IP / user agent as when the session is created
            if (req.user.ip === req.ip && req.user.userAgent === req.get('User-Agent')) {
                
                // This session isn't already binded with another public key?
                if (!req.user.publicKey) {
                    const epoch = req.headers["x-epoch"];
                    const signature = req.headers["x-signature"];

                    // Argument check
                    if (epoch && signature) {

                        // Epoch check
                        const epochNumber = +epoch;
                        const now = Date.now();
                        if (epochNumber >= now - 5000 && epochNumber <= now + 5000) {

                            const body = (req.body || {});
                            const publicKey = body.publicKey;

                            // Import key
                            try {
                                const key = await crypto.subtle.importKey(
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

                                // Sign check
                                try {
                                    const decodedSignature = new Uint8Array(Buffer.from(signature, 'base64'));
                                    const plain = epoch + req.originalUrl.toLowerCase() + JSON.stringify(body);
                                    const encoded = new TextEncoder().encode(plain);
                                    const result = await crypto.subtle.verify(
                                        {
                                            name: "RSA-PSS",
                                            saltLength: 32,
                                            hash: {
                                                name: "SHA-256"
                                            }
                                        },
                                        key,
                                        decodedSignature,
                                        encoded
                                    );

                                    if (result === true) {
                                        req.user.publicKey = publicKey;
                                        return res.sendStatus(204);
                                    }

                                    throw new Error('Sign check failed');
                                }
                                catch (e) {
                                    return res.status(400).json({ error: 'Invalid signature' });
                                }
                            }
                            catch (e) {
                                return res.status(400).json({ error: 'Incorrect public key format' });
                            }
                        }
                    }
                    return res.status(400).json({ error: 'Bad request' });
                } else {
                    return res.status(403).json({ error: 'Already provided a public key in this session' });
                }
            }
            else {
                return res.status(401).json({ error: 'Incorrect session parameters' });
            }
        }
        else {
            return res.status(401).json({ error: 'Not signed in' });
        }
    });
}