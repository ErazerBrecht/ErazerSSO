const express = require('express');
const app = express();

const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const { Issuer, Strategy } = require('openid-client');
const url = require('url');

module.exports = new Promise(async (resolve, reject) => {
    app.use(morgan('dev'));
    app.use(cookieParser());

    app.use(express.static(__dirname + '/public'));

    app.use(session({ secret: 'tutorialsecret', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());

    try {
        const oidc = await addOidc();
        addAuth(oidc);
    }
    catch (error) {
        reject(error);
    }


    // TODO Routing
    app.get('/', (req, res) => {
        console.log(req.user);
        if (req.user)
            res.send(`Hello ${req.user.name}`);
        else
            res.send('Hello World')
    });

    resolve(app);
});


async function addOidc() {
    const erazerSSO = await Issuer.discover('http://localhost:5000');
    const client = new erazerSSO.Client({ client_id: 'nodejs', client_secret: 'C1C47B06-7E3B-41D6-BB2D-F4DF245DBF7C' });

    return {issuer: erazerSSO, client: client};
}

function addAuth(oidc){
    const params = {
        redirect_uri: 'http://localhost:8888/signin-oidc',
        scope: 'openid profile'
    }

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use('oidc', new Strategy({ client: oidc.client, params }, (tokenset, userinfo, done) => {
        console.log('tokenset', tokenset);
        console.log('access_token', tokenset.access_token);
        console.log('id_token', tokenset.id_token);
        console.log('claims', tokenset.claims);
        console.log('userinfo', userinfo);
        console.log('sub', tokenset.claims.sub);

        const user = { id: tokenset.claims.sub, name: userinfo.name, access_token: tokenset.access_token, id_token: tokenset.id_token };
        return done(null, user);
    }));

    app.get('/logout', (req, res) => {
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

    app.get('/auth', passport.authenticate('oidc'));
    app.get('/signin-oidc', passport.authenticate('oidc', { successRedirect: '/', failureRedirect: '/login' }));

}