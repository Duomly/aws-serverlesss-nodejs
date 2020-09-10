const request = require('superagent');
const qs = require('qs');
const db = require('../database');
const Order = require('./Order');
const { success, errResponse } = require('../authentication/AuthenticationHelpers');
const { verifyPaymentKey } = require('../authentication/VerifyPaymentKey');
const { updateUser } = require('../user/UserHandler');

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

module.exports.webhook = (r, cb) => {
  cb.callbackWaitsForEmptyEventLoop = false;
  const body = qs.parse(r.body);
  return db()
    .then(() => webhook(body))
    .then(res => success(res))
    .catch(err => errResponse(err));
};

function create(body, id) {
  return Order.create({userId: id, status: 'pending', type: body.type, amount: body.amount, createdAt: new Date()})
    .then(order => createPaymentLink(order))
}

function update(body) {
  return Order.findByIdAndUpdate(body.id, {status: 'paid'}, { new: true })
}

function myOrders(id) {
  return Order.find({userId: id})
    .then(orders => !orders.length ? Promise.reject('Orders not found.') : orders)
    .catch(err => Promise.reject(new Error(err)));
}

function createPaymentLink(order) {
  const body = {
    vendor_id: process.env.PAYMENT_VENDOR,
    vendor_auth_code: process.env.PAYMENT_AUTH,
    product_id: order.type === 'yearly' ? process.env.PAYMENT_YEARLY : process.env.PAYMENT_MONTHLY,
    return_url: process.env.PAYMENT_RETURN,
    passthrough: JSON.stringify({saasOrderId: order.id, subscription: order.type, userId: order.userId}),
};

  return request
  .post('https://vendors.paddle.com/api/2.0/product/generate_pay_link')
  .send(body)
  .set('Accept', 'application/json')
  .then(response => response)
  .catch(err => Promise.reject(new Error(err)));
}

function webhook(body) {
  return verifyPaymentKey(body)
    .then(()=>{
      if(body.alert_name === 'payment_succeeded') {
        const passthrough = JSON.parse(body.passthrough);
        if(passthrough && passthrough.saasOrderId && passthrough.subscription && passthrough.userId) {
          update({id: passthrough.saasOrderId, status: 'paid'})
            .then(()=> updateUser({id: passthrough.userId, days: passthrough.subscription === 'yearly' ? 365 : 30}))
            .catch(err => Promise.reject(new Error(err)));
        }
      }
    })
    .catch(err => Promise.reject(new Error(err)));
}