require('zone.js/dist/zone-node');
const { AppServerModule, ngExpressEngine } = require('./wwwroot/landing-ssr/main');

module.exports = (app) => {
    const wwwroot = app.get('config').wwwroot;
    /* Configure Angular Express engine */
    app.engine('html', ngExpressEngine({
        bootstrap: AppServerModule,
    }));
    app.set('view engine', 'html');
    app.set('views', wwwroot);
}