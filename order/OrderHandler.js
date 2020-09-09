const db = require('../database');
const Order = require('./Order');
const { success, errResponse } = require('../authentication/AuthenticationHelpers');

module.exports.create = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => create(JSON.parse(r.body), r.requestContext.authorizer.principalId))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

module.exports.update = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => update(JSON.parse(r.body)))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

module.exports.myOrders = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  return db()
    .then(() => myOrders(r.requestContext.authorizer.principalId))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

function create(body, id) {
  return Order.create({userId: id, status: 'pending', amount: body.amount, createdAt: new Date()});
}

function update(body) {
  return Order.findByIdAndUpdate(body.id, body, { new: true })
}

function myOrders(id) {
  return Order.find({userId: id})
    .then(orders => !orders.length ? Promise.reject('Orders not found.') : orders)
    .catch(err => Promise.reject(new Error(err)));
}