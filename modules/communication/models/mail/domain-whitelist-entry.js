const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const schema = new mongoose.Schema({
	domain: {type: String, required: true, unique: true}
});
schema.plugin(uniqueValidator);

module.exports = mongoose.model('DomainWhitelistEntry', schema);
