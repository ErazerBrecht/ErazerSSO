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
const error = require('./error');

module.exports = new Promise(async (resolve, reject) => {
    // Add config
    config(app);
    ssr(app);
    
    app.use(bodyParser.json());
    app.use(morgan('dev'));
    app.use(compression());

    // Add auth
    try {
        await auth(app);
    }
    catch (error) {
        reject(error);
    }

    app.use(csrf);
    app.use(redirectMiddleware);
    app.use(staticfiles(app.get('config').wwwroot));
    app.use('/api', await apiProxy(app.get('config').api));
    
    app.use(error);

    resolve(app);
});

