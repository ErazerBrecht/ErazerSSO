const appPromise = require('./app');

appPromise.then(app => {
	const port = process.env.PORT || 8888;
	
	// HTTP 1
	app.set('port', port);
	app.listen(app.get('port'), () => {
		console.log('Node app is running on port', app.get('port'));
	});

}, (error) => {
	console.error('Something went wrong');
	console.error(error);
	process.exit();
});



