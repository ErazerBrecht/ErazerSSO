const session = require('express-session');
const Redis = require("ioredis");
const redisStore = require('connect-redis')(session);
const url = require('url');
const passport = require('passport');
const { Issuer, Strategy, custom } = require('openid-client');
const { random } = require('openid-client/lib/helpers/generators');
const base64url = require('base64url');

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
    passport.use('oidc', new Strategy({ client, params: { redirect_uri: `${host}/auth/signin-oidc`, scope: 'openid profile role' } }, (tokenset, userinfo, done) => {
        const user = { id: userinfo.sub, name: userinfo.name, role: userinfo.role, id_token: tokenset.id_token };
        return done(null, user);
    }));

    if (isSecure) {
        app.set('trust proxy', 1) // trust first proxy
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

    // Destroys the user session
    app.get('/auth/logout/local', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    // Redirect the user to the 'authorized' app if signed in. If it's not the case start the 'authorization code flow' against the authorization server
    app.get('/auth/dashboard', (req, res, next) => {
        if (req.user) {
            if (req.query.redirect)
                res.redirect(`/portal${req.query.redirect}`);
            else
                res.redirect('/portal/');
        }
        else {
            if (req.query.redirect) {
                const state = { state_id: random(), redirect: req.query.redirect };
                const urlState = base64url(JSON.stringify(state));
                passport.authenticate('oidc', { state: urlState })(req, res, next);
            } else
                passport.authenticate('oidc')(req, res, next);
        }
    });

    // Callback (the authorization server redirects to this endpoint if the authorization succeeded)
    // Will redirect the user to the dashboard page 
    // Uses the 'state' property to redirect the user to a 'angular' route.
    app.get('/auth/signin-oidc', (req, res, next) => {
        let successRedirect = '/auth/dashboard';

        if (req.query.state && typeof (req.query.state) === 'string') {
            const decoded = base64url.decode(req.query.state);
            try {
                const obj = JSON.parse(decoded);
                if (obj.redirect && obj.redirect.includes('/')) {
                    successRedirect += `?redirect=${obj.redirect}`;
                }
            } catch { }
        }

        passport.authenticate('oidc', { successRedirect, failureRedirect: '/auth/logout/local' })(req, res);
    });
}