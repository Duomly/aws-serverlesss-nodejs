const moment = require('moment');
const db = require('../database');
const User = require('./User');
const { success, errResponse } = require('../authentication/AuthenticationHelpers');

module.exports.myProfile = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => myProfile(r.requestContext.authorizer.principalId))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

module.exports.updateUser = (body) => {
  return db()
    .then(()=>User.findByIdAndUpdate(body.id, {premium: true, premiumEnds: moment().add(body.days, 'days')}, { new: true }))
    .catch(err => Promise.reject(new Error(err)));
}

function myProfile(id) {
  return User.findById(id)
    .then(user => !user ? Promise.reject('User not found.') : user)
    .catch(err => Promise.reject(new Error(err)));
}
