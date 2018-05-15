const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const fieldSchema = new mongoose.Schema({
	fieldId: {type: String, required: true},
	value: {type: mongoose.Schema.Types.Mixed}
}, {_id: false});

const incidentSchema = new mongoose.Schema({
	incidentId: {type: String, required: true},
	fields: [fieldSchema],
	contacts: [{type: ObjectId, ref: 'Contact'}]
}, {_id: false});

const schema = new mongoose.Schema({
	buildingId: {type: String, required: true},
	agencyId: {type: String, required: true},
	health: {type: Number, min: 0.0, max: 1.0, required: true, default: 0.0},
	incidents: [incidentSchema],
	reps: [{type: ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('BuildingAgency', schema);
