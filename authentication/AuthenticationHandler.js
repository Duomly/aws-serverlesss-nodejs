const db = require('../database');
const bcrypt = require('bcryptjs-then');
const { success, errResponse, signJWT, validRegistration, verifyPassword } = require('./AuthenticationHelpers');
const User = require('../user/User');

module.exports.register = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => register(JSON.parse(r.body)))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

module.exports.login = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => login(JSON.parse(r.body)))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

function register(body) {
  return validRegistration(body)
    .then(() => User.findOne({ email: body.email }))
    .then(exists => exists ? Promise.reject(new Error('User exists')) : bcrypt.hash(body.password, 8))
    .then(hashedPass => User.create({ name: body.name, email: body.email, password: hashedPass, premium: false, createdAt: new Date()}))
    .then(user => ({ auth: true, token: signJWT(user._id) })); 
}

function login(body) {
  return User.findOne({ email: body.email })
    .then(user => !user ? Promise.reject(new Error('Incorrect password or username')) : verifyPassword(body.password, user.password, user._id))
    .then(signedJWT => ({ auth: true, token: signedJWT }));
}