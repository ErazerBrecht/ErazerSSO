const nconf = require('nconf');
nconf.argv().env().file({ file: 'appsettings.json' });

const wwwroot = __dirname + '/wwwroot';

module.exports = function (app) {
    const host = nconf.get('host');
    const idsrv = nconf.get('idsrv');
    const api = nconf.get('api');
    const redis = nconf.get('redis');
    const localLoginEnabled = nconf.get('localLoginEnabled') === true;
    const config = { host, idsrv, api, redis, wwwroot, localLoginEnabled };
    console.log(`Config: ${JSON.stringify(config)}`);

    app.set('config', config);
}