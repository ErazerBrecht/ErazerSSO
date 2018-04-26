const fs = require('fs');
const spdy = require('spdy');
const appPromise = require('./app');

const options = {
	key: fs.readFileSync(__dirname + '/server.key'),
	cert: fs.readFileSync(__dirname + '/server.crt')
}

appPromise.then(app => {
	const port = process.env.PORT || 8888;
	
	// HTTP 1
	app.set('port', (process.env.PORT || 8888));
	app.listen(app.get('port'), () => {
		console.log('Node app is running on port', app.get('port'));
	});
	
	// HTTP2
	// spdy.createServer(options, app).listen(port, (error) => {
	// 	console.log('Node app is running on port', port);
	// });
}, (error) => {
	console.error('Something went wrong');
	console.error(error);
});



