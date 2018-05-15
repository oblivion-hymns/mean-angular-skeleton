const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const phoneSchema = new mongoose.Schema({
	phoneNumber: {type: String, required: true},
	label: {type: String, required: true},
	extension: {type: String, required: false}
}, {_id: false});

const schema = new mongoose.Schema({
	agency: {type: ObjectId, ref: 'Agency', required: true},
	name: {type: String, required: true},
	email: {type: String, required: false},
	phones: [phoneSchema],
	notes: {type: String, required: false},
	lastEdited: {type: String, required: true}
});

module.exports = mongoose.model('Contact', schema);
