require('zone.js/dist/zone-node');

const ngUniversal = require('@nguniversal/express-engine');
const appServer = require('./wwwroot/landing-server/main');

module.exports = (app) => {
    const wwwroot = app.get('config').wwwroot;
    
    /* Configure Angular Express engine */
    app.engine('html', ngUniversal.ngExpressEngine({
        bootstrap: appServer.AppServerModuleNgFactory
    }));
    app.set('view engine', 'html');
    app.set('views', wwwroot);
}