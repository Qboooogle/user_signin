var express = require('express');
var router = express.Router();
var debug = require('debug')('signin:router');


module.exports = function(db) {
	var userController = require('../controllers/userController')(db);

	router.get('/', function(req, res, next) {
		res.redirect('/signin');
	})

	router.get('/signin', function(req, res, next) {
		if (req.session.username) {
			res.redirect('/detail');
		} else {
			res.render('signin', { title: 'signin'});
		}
	});

	router.post('/signin', function(req, res, next) {
		var user = req.body;
		userController.signinUser(user).then(function(user){
			req.session.username = user.name;
			res.redirect('/detail');
		}).catch(function(error) {
			debug(error);
			res.render('signin', { title: 'signin', user: user, error: error});
		})
	});
	
	router.get('/signup', function(req, res, next) {
		res.render('signup', { title: 'signup', signedIn: !!req.session.username });
	});

	router.post('/signup', function(req, res, next) {
		var user = req.body;
		userController.signupUser(user).then(function() {
			userController.showAllUsers();
			debug('jumping to detail');
			req.session.username = user.name;
			res.redirect('/detail');
		}).catch(function(error) {
			debug('signup failed');
			res.render('signup', { title: 'signup', signedIn: !!req.session.username });
		});
	});

	router.post('/dataCheck', function(req, res, next) {
		var checkData = req.body;
		debug('data check with data:', checkData);
		userController.checkIfDataUnique(checkData).then(function() {
			res.end();
		}).catch(function() {
			res.end('Has been token by others');
		});
	});

	router.all('*', function(req, res, next) {
		req.session.username ? next() : res.redirect('/signin');
	});

	router.get('/detail', function(req, res, next) {
		debug('Shwing detail for user: ' + req.session.username);
		userController.getUserByUserName(req.session.username).then(function(user) {
			res.render('detail', { title : 'detail', user: user});
		}).catch(function(error) {
			debug(error);
			res.redirect('/logout');
		});
	});

	router.get('/logout', function(req, res, next) {
		delete req.session.username;
		res.redirect('/signin');
	});

	return router;
}