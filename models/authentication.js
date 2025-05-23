const mongoose = require('mongoose');

const authenticationSchema = new mongoose.Schema({
    authApMac: String,
    authApName: String,
    authSsid: String,
    authUserName: String,
    authUserMac: String,
    authIpAddress: String,
    authResult: String,
    authErrcode: String,
    authAuthId: String,
    datetime: String,
}, { collection: 'authentication' });

module.exports = mongoose.model('Authentication', authenticationSchema);
