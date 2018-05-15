const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	month: {type: Number, required: true},
	year: {type: Number, required: true},
	numberNotified: {type: Number, required: true, default: 0}
}, {timestamps: true});

module.exports = mongoose.model('HealthNotification', schema);
