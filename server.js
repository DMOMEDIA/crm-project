const app = require('./app');
const https = require('https');
const fs = require('fs');

app.set('port', process.env.PORT || 8080);

if(process.env.HTTPS_ENABLED == 'true') {
	var cert, key;

	try {
		cert = fs.readFileSync('./config/certs/server.pem'),
		key = fs.readFileSync('./config/certs/server.key');
	} catch { }

	var httpsOptions = {
		cert: cert,
		key: key
	};

	if(cert == null || key == null) {
		console.log('Not found SSL certificate (server.pem) or private key (server.key).');
		console.log('Upload files to /config/certs folder and try again');
		console.log('Server stopped..');
	} else {
		const server = https.createServer(httpsOptions, app).listen(app.get('port'), () => {
			console.log(`Application status: ${ process.env.NODE_ENV }`);
			console.log(`Server started on HTTPS protocol`);
			console.log(`Listening on ${ server.address().port }`);
		});
	}
} else {
	const server = app.listen(app.get('port'), () => {
		console.log(`Application status: ${ process.env.NODE_ENV }`);
		console.log(`Listening on ${ server.address().port }`);
	});
}
