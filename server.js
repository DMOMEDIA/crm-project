const app = require('./app');

app.set('port', process.env.PORT || 8080);

const server = app.listen(app.get('port'), () => {
  console.log(`Application status: ${ process.env.NODE_ENV }`);
  console.log(`Listening on ${ server.address().port }`);
});
