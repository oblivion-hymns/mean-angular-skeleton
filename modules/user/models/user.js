const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const passwordResetSchema = new mongoose.Schema({
	token: {type: String},
	expirationTime: {type: String}
}, {_id: false});

const schema = new mongoose.Schema({
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	email: {type: String, required: true, lowercase: true, unique: true},
	password: {type: String, required: true},
	passwordReset: passwordResetSchema,
	roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}]
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('User', schema);
