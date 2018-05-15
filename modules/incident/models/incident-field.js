const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	incident: {type: mongoose.Schema.Types.ObjectId, ref: 'Incident'},
	label: {type: String, required: true},
	identifier: {type: String, required: true, lowercase: true},
	type: {type: mongoose.Schema.Types.ObjectId, ref: 'IncidentFieldType'},
	properties: {type: mongoose.Schema.Types.Mixed},
	order: {type: Number, required: true},
});

module.exports = mongoose.model('IncidentField', schema);
