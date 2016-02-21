var validator = require('../public/javascripts/validator');
var bcrypt = require('bcrypt-as-promised');
var debug = require('debug')('signin:userController');

module.exports = function(db) {

	var users = db.collection('users');

	var userController = {
		signinUser: function(user) {
			debug('Signing in for user ' + user.name);
			return new Promise(function(resolve, reject) {
				userController.getUserByUserName(user.name).then(function(foundUser) {
					debug('foundUser: ', foundUser);
					bcrypt.compare(user.pwd, foundUser.pwd).then(function() {
						debug('signin user ' + user.name + ' succeed');
						resolve(foundUser);
					}).catch(function(error) {
						debug('Incorrect password');
						reject({message: "Incorrect password", position: 'pwd'});
					});
				}).catch(function(error) {
					debug(error);
					reject({message: "No such user exists", position: 'name'});
				})
			})
		},
		signupUser: function(user) {
			debug('Signing up for user ' + user.name);
			return checkUser(user).then(function() {
				debug("passed userCheck");
				return bcrypt.hash(user.pwd, 10).then(function(pwd) {
					user.pwd = pwd;
					if (user.rpwd) delete user.rpwd;
					if (user.submit) delete user.submit;
					return users.insert(user);
				});
			}).catch(function(error) {
				debug(error);
			});
		},
		showAllUsers: function() {
			debug('Showing users');
			return users.find().toArray().then(function(docs) {
				debug('current document in database: ', docs);
			}).catch(function(error) {
				debug("show users error:", error);
			});
		},
		getUserByUserName: function(username) {
			debug('getting document id');
			return new Promise(function(resolve, reject) {
				users.findOne({name: username}).then(function(foundUser) {
					foundUser ? resolve(foundUser) : reject('No such user exists');
				});
			});
		},
		checkIfDataUnique: function(checkData) {
			debug('Checking data unique');
			return users.findOne(checkData).then(function(foundUser) {
				return foundUser ? Promise.reject('Data is not unique'): Promise.resolve();
			});
		}
	}

	function checkUser(user) {
		debug('Checking for user ' + user.name);
		return new Promise(function(resolve, reject) {
			debug('Checking validator');
			for (var i in validator.finalCheck) {
				if (!validator.finalCheck[i](user[i])) {
					debug('failed at ' + i);
					reject('invalid ' + i);
				}
			}
			debug('Checking repeat in database');
			users.findOne({ $or: [
				{ name: user.name },
				{ sid: user.sid },
				{ tel: user.tel },
				{ email: user.email }
				]}).then(function(foundUser) {
					debug('found repeat users: ', foundUser);
					foundUser ? reject('some attributes has been taken by others') : resolve(foundUser);
				});
			})
	}

	return userController;
}