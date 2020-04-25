const express = require('express')
const app = express();

const compression = require('compression');
const netjet = require('netjet');
const morgan = require('morgan');

const config = require('./config');
const auth = require('./auth');

const redirectMiddleware = require('./middleware/redirect');
const ssr = require('./ssr');
const staticfiles = require('./staticfiles');

module.exports = new Promise(async (resolve, reject) => {
    // Add config
    config(app);
    ssr(app);

    // Add auth
    try {
        await auth(app);
    }
    catch (error) {
        reject(error);
    }

    app.use(morgan('dev'));
    app.use(compression());

    app.use(netjet());
    app.use(redirectMiddleware);
    app.use(staticfiles(app.get('config').wwwroot));

    resolve(app);
});

