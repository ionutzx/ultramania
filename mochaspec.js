const request = require('supertest');
const path = require('path');
const favicon = require('serve-favicon');
const express = require('express');
const handlebars = require('express-handlebars');

const app = express();
const router = require('./routes/index');
app.use(router);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', handlebars({defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

describe('GET /', function() {
	it('respond with 200', function(done) {
		request(app)
		.get('/')
		.expect(200)
		.end(function(err, res) {
			if (err) {
				return done(err);
            }
			done();
		});
	});
});

describe('GET /map', function() {
	it('respond with 200', function(done) {
		request(app)
		.get('/')
		.expect(200)
		.end(function(err, res) {
			if (err) {
			    return done(err);
            }
			done();
		});
	});
});