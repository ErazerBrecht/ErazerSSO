const appPromise = require('./app');

appPromise.then(app => {
	app.set('port', (process.env.PORT || 8888));
	app.listen(app.get('port'), () => {
		console.log('Node app is running on port', app.get('port'));
	});
});



