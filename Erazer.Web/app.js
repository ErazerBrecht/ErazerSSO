const express = require('express')
const app = express();

const compression = require('compression');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const config = require('./config');
const auth = require('./auth');

const redirectMiddleware = require('./middleware/redirect');
const ssr = require('./ssr');
const staticfiles = require('./staticfiles');
const apiProxy = require('./api');
const csrf = require('./csrf');

module.exports = new Promise(async (resolve, reject) => {
    // Add config
    config(app);
    ssr(app);
    
    // Add auth
    try {
        app.use(bodyParser.json());
        await auth(app);
    }
    catch (error) {
        reject(error);
    }

    app.use(morgan('dev'));
    app.use(compression());
    app.use(csrf);

    app.use(redirectMiddleware);
    app.use(staticfiles(app.get('config').wwwroot));
    app.use('/api', await apiProxy(app.get('config').api));
    

    resolve(app);
});

