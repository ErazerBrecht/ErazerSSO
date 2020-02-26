const nconf = require('nconf');
nconf.argv().env().file({ file: 'appsettings.json' });

const wwwroot = __dirname + '/wwwroot';

module.exports = function (app) {
    const host = nconf.get('host');
    const idsrv = nconf.get('idsrv');
    const redis = nconf.get('redis');
    const config = { host, idsrv, redis, wwwroot };
    console.log(`Config: ${JSON.stringify(config)}`);

    app.set('config', config);
}