const mongoose = require('mongoose');

let connection;

module.exports = db = () => {
  if(connection) {
    return Promise.resolve();
  }

  return mongoose.connect(process.env.DB)
    .then(database=>{
      connection = database.connections[0].readyState;
    });
}