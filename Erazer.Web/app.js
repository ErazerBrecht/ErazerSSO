const express = require('express')
const app = express();

const compression = require('compression');
const morgan = require('morgan');

const config = require('./config');
const auth = require('./auth');

const redirectMiddleware = require('./middleware/redirect');
const ssr = require('./ssr');
const staticfiles = require('./staticfiles');

module.exports = new Promise(async (resolve, reject) => {
    //#region Setup (ConfigureServices)
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
    //#endregion

    app.use(morgan('dev'));
    app.use(compression());

    app.use(redirectMiddleware);
    staticfiles(app);

    resolve(app);
});

