const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
	name: {type: String, required: true, unique: true},
	permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}],
	osgsAssignable: {type: Boolean, required: true, default: false},
	isRemovable: {type: Boolean, required: true, default: true}
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('Role', schema);
