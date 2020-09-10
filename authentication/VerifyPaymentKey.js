const crypto = require('crypto');
const Serialize = require('php-serialize');

const public_key = `
Your public key
`;

module.exports.verifyPaymentKey = (sentKey) => {
  const mySignature = Buffer.from(sentKey.p_signature, 'base64');
  delete sentKey.p_signature;
  sentKey = sortKeys(sentKey);
  for (const prop in sentKey) {
    if (sentKey.hasOwnProperty(prop) && typeof sentKey[prop] !== 'string') {
      if (Array.isArray(sentKey[prop])) {
        sentKey[prop] = sentKey[prop].toString();
      } else {
        sentKey[prop] = JSON.stringify(sentKey[prop]);
      }
    }
  }
  const serialized = Serialize.serialize(sentKey);
  const verifier = crypto.createVerify('sha1');
  verifier.update(serialized);
  verifier.end();

  const verification = verifier.verify(public_key, mySignature);
  if (verification) {
    return Promise.resolve('All is fine');
  } else {
    return Promise.reject('Permission denied');
  }
};

const sortKeys = (object) => {
  const keys = Object.keys(object).sort();
  const sorted = {};

  for (const i in keys) {
    sorted[keys[i]] = object[keys[i]];
  }

  return sorted;
};
