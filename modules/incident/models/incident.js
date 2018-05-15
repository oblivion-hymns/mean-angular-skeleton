const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
	active: {type: Boolean, required: true, default: true},
	name: {type: String, required: true, unique: true},
	description: {type: String, required: false},
	published: {type: Boolean, required: true, default: false},
	fields: [{type: ObjectId, ref: 'IncidentField'}]
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('Incident', schema);
