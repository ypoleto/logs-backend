const mongoose = require('mongoose');

const associationSchema = new mongoose.Schema({
    assocApMac: String,
    assocApName: String,
    assocUserMac: String,
    assocSsid: String,
    assocOfflineReason: String,
    assocUpinkRate: String,
    assocDownlinkRate: String,
    datetime: String,
}, { collection: 'association' });

module.exports = mongoose.model('Association', associationSchema);
