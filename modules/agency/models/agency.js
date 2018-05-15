const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = new mongoose.Schema({
	sequoiaId: {type: String, required: true, unique: true},
	primaryRep: {type: ObjectId, ref: 'User'},
	reps: [{type: ObjectId, ref: 'User'}]
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('Agency', schema);
