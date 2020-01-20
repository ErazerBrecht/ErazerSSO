const session = require('express-session');
const redisStore = require('connect-redis')(session);
const url = require('url');
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');

// Initialize passport/auth settings
module.exports = async (app) => {
    const config = app.get('config');
    const host = config.host;

    // Get oidc information from authorization server (like the token endpoint, ...)
    // Setup client with client_id & client_secret => TODO move client_secret out of vcs!
    const issuer = await Issuer.discover(`http://${host}:5000`);
    const client = new issuer.Client({ client_id: 'nodejs', client_secret: 'C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C' });
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
    passport.use('oidc', new Strategy({ client, params: { redirect_uri: `http://${host}:8888/auth/signin-oidc`, scope: 'openid profile role' } }, (tokenset, userinfo, done) => {
        const user = { id: userinfo.sub, name: userinfo.name, role: userinfo.role, id_token: tokenset.id_token };
        return done(null, user);
    }));

    app.use(session({
        store: new redisStore({ host, port: '6380' }),
        secret: 'tutorialsecret',
        cookie: { sameSite: 'strict' },
        name: 'Erazer.Web',
        resave: false,
        saveUninitialized: false
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Destroys the user session and redirects to the authorization server to destroy their 'SSO' session
    // TODO Check if user is logged in!
    app.get('/auth/logout', (req, res) => {
        const idToken = req.user.id_token;
        const logoutUrl = oidc.issuer.end_session_endpoint;

        req.logout();
        res.redirect(url.format(Object.assign(url.parse(logoutUrl), {
            search: null,
            query: {
                id_token_hint: idToken,
                post_logout_redirect_uri: `http://${host}:8888`
            },
        })));
    });

    // Destroys the user session
    app.get('/auth/logout/local', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    // Start the 'authorization code flow' against the authorization server
    app.get('/auth/login', (req, res, next) => {
        if (req.query.redirect)
            passport.authenticate('oidc', { state: req.query.redirect })(req, res, next);
        else
            passport.authenticate('oidc')(req, res, next);

    });

    // Redirect the user to the 'authorized' app if signed in. If it's not the case start the 'authorization code flow' against the authorization server
    app.get('/auth/dashboard', (req, res) => {
        if (req.user) {
            if (req.query.redirect)
                res.redirect(`/portal${req.query.redirect}`);
            else
                res.redirect('/portal/');
        }
        else {
            res.redirect('/auth/login');
        }
    });

    // Callback (the authorization server redirects to this endpoint if the authorization succeeded)
    // Will redirect the user to the dashboard page 
    // Uses the 'state' property to redirec the user to a 'angular' route.
    app.get('/auth/signin-oidc', (req, res) => {
        let successRedirect = '/auth/dashboard';

        // TODO ASK KIERAN IF SECURE
        if (req.query.state && !req.query.state.includes('-'))
            successRedirect += `?redirect=${req.query.state}`;

        passport.authenticate('oidc', { successRedirect, failureRedirect: '/auth/logout/local' })(req, res);
    });
}