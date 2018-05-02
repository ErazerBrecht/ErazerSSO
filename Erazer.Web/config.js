const nconf = require('nconf');
nconf.argv().env().file({ file: 'appsettings.json' });

const wwwroot = __dirname + '/wwwroot';

module.exports = function (app) {
    const host = nconf.get('host');
    app.set('config', { host, wwwroot });
}