const mongoose = require('mongoose');

const handshakeSchema = new mongoose.Schema({
    hsApName: String,
    hsApMac: String,
    hsUserMac: String,
    hsUserName: String,
    hsBand: String,
    hsSsid: String,
    hsResult: String,
    hsAuthId: String,
    datetime: { type: Date, required: true }
}, { collection: 'handshake' });

module.exports = mongoose.model('Handshake', handshakeSchema);
