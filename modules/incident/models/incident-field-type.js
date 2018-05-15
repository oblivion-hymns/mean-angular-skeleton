const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
	name: {type: String, required: true, unique: true},
	identifier: {type: String, required: true, unique: true, lowercase: true},
	contributesToHealth: {type: Boolean, required: true, default: true},
	options: {type: mongoose.Schema.Types.Mixed}
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('IncidentFieldType', schema);
