require('zone.js/dist/zone-node');
const { AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap } = require('./wwwroot/landing-ssr/main');


module.exports = (app) => {
    const wwwroot = app.get('config').wwwroot;

    /* Configure Angular Express engine */
    app.engine('html', ngExpressEngine({
        bootstrap: AppServerModuleNgFactory,
        providers: [
            provideModuleMap(LAZY_MODULE_MAP)
        ]
    }));
    app.set('view engine', 'html');
    app.set('views', wwwroot);
}